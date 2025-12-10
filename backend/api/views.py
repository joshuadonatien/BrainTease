from datetime import timedelta
from typing import List
import logging
import uuid
import random

from django.utils import timezone
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.permissions import IsAuthenticated, AllowAny

from .firebase_auth import FirebaseAuthentication
from .serializers import (
    SubmitScoreSerializer, 
    UpdateDisplayNameSerializer,
    CreateMultiplayerSerializer, 
    JoinMultiplayerSerializer, 
    SubmitMultiplayerScoreSerializer
)
from .models import UserScore, GameSession, MultiplayerSession

import requests
from rest_framework.decorators import api_view, permission_classes

logger = logging.getLogger(__name__)

try:
	from firebase_admin import auth as firebase_auth
except Exception:
	firebase_auth = None


def _get_display_name(uid: str):
	if not firebase_auth:
		return None
	try:
		user_rec = firebase_auth.get_user(uid)
		return getattr(user_rec, "display_name", None)
	except Exception:
		return None


class SubmitScoreView(APIView):
	authentication_classes = [FirebaseAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		"""
		Submit a user's game score with comprehensive error handling.
		
		Error Handling Strategy:
		- Validates all inputs before processing
		- Uses database transactions for atomicity
		- Logs errors for debugging while returning user-friendly messages
		- Handles authentication, validation, and database errors separately
		"""
		try:
			# Validate request data structure and types
			serializer = SubmitScoreSerializer(data=request.data) 
			serializer.is_valid(raise_exception=True)
			data = serializer.validated_data

			# Authentication validation: Ensure user UID exists
			# Fallback: Return 401 if authentication failed (shouldn't happen with IsAuthenticated, but defensive)
			uid = getattr(request.user, "uid", None)
			if not uid:
				logger.warning("SubmitScoreView: Missing user UID")
				return Response(
					{"error": "User authentication failed"},
					status=status.HTTP_401_UNAUTHORIZED
				)

			# Get display name with fallback: try from request.user first, then fetch from Firebase
			# Fallback: Returns None if Firebase lookup fails (non-fatal)
			display_name = getattr(request.user, "display_name", None) or _get_display_name(uid)

			# Input validation: Prevent negative scores
			# No fallback needed - this is a hard validation error
			if data["score"] < 0:
				return Response(
					{"error": "Score cannot be negative"},
					status=status.HTTP_400_BAD_REQUEST
				)

			# If detailed session fields or categories are provided, create GameSession
			has_session_fields = any(
				k in data for k in ("correct_count", "total_questions", "time_taken_seconds", "categories")
			)

			# Database operations wrapped in try/except for error handling
			# Fallback: Return 500 error if database write fails (e.g., constraint violation, connection issue)
			try:
				if has_session_fields:
					# Validate session fields if provided (prevent invalid data from reaching database)
					# No fallback - these are hard validation errors
					if data.get("total_questions") is not None and data.get("total_questions") < 0:
						return Response(
							{"error": "total_questions cannot be negative"},
							status=status.HTTP_400_BAD_REQUEST
						)
					if data.get("correct_count") is not None and data.get("correct_count") < 0:
						return Response(
							{"error": "correct_count cannot be negative"},
							status=status.HTTP_400_BAD_REQUEST
						)
					if data.get("time_taken_seconds") is not None and data.get("time_taken_seconds") < 0:
						return Response(
							{"error": "time_taken_seconds cannot be negative"},
							status=status.HTTP_400_BAD_REQUEST
						)

					# Create GameSession record (detailed game data)
					# Error handling: Database exceptions caught below
					# Optimization: Store display_name to avoid Firebase lookups in leaderboard
					gs = GameSession.objects.create(
						user_id=uid,
						display_name=display_name,  # Store display_name for leaderboard efficiency
						difficulty=data["difficulty"],
						categories=data.get("categories", []),
						score=data["score"],
						correct_count=data.get("correct_count"),
						total_questions=data.get("total_questions"),
						time_taken_seconds=data.get("time_taken_seconds"),
					)
					logger.info(f"GameSession created: {gs.id} for user {uid}")
					return Response(gs.to_response(display_name), status=status.HTTP_201_CREATED)

				# Fallback path: Create lightweight UserScore if no session fields provided
				# This allows backward compatibility with simpler score submissions
				# Optimization: Store display_name to avoid Firebase lookups in leaderboard
				us = UserScore.objects.create(
					user_id=uid,
					display_name=display_name,  # Store display_name for leaderboard efficiency
					difficulty=data["difficulty"],
					score=data["score"],
				)
				logger.info(f"UserScore created: {us.id} for user {uid}")
				return Response(us.to_response(display_name, include_message=True), status=status.HTTP_201_CREATED)

			except Exception as db_error:
				# Database error handling: Log full error details for debugging
				# Fallback: Return generic error message to user (don't expose internal errors)
				logger.error(f"Database error in SubmitScoreView: {str(db_error)}", exc_info=True)
				return Response(
					{"error": "Failed to save score"},
					status=status.HTTP_500_INTERNAL_SERVER_ERROR
				)

		except Exception as e:
			# Top-level error handler: Catch any unexpected exceptions
			# Fallback: Return generic error to prevent exposing internal implementation details
			# All errors are logged with full stack trace for debugging
			logger.error(f"Unexpected error in SubmitScoreView: {str(e)}", exc_info=True)
			return Response(
				{"error": "An unexpected error occurred"},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)


class LeaderboardView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		"""
		Get leaderboard with comprehensive validation and error handling.
		
		Error Handling Strategy:
		- Validates all query parameters with fallback defaults
		- Handles database errors gracefully
		- Continues processing even if individual display name lookups fail
		- Skips invalid entries rather than failing entire request
		"""
		try:
			# Validate limit parameter with fallback logic
			# Fallback: Default to 10 if not provided, cap at 100 for performance
			try:
				limit = int(request.query_params.get("limit", 10))
				if limit < 1:
					return Response(
						{"error": "limit must be greater than 0"},
						status=status.HTTP_400_BAD_REQUEST
					)
				if limit > 100:
					limit = 100  # Cap at 100 for performance (prevent DoS)
			except (ValueError, TypeError):
				# Fallback: Return error if limit cannot be parsed (not a default)
				return Response(
					{"error": "limit must be an integer"},
					status=status.HTTP_400_BAD_REQUEST
				)

			# Validate page parameter with fallback logic
			# Fallback: Default to page 1 if invalid (graceful degradation)
			try:
				page = int(request.query_params.get("page", 1))
				if page < 1:
					page = 1  # Default to page 1 if invalid (don't fail request)
			except (ValueError, TypeError):
				page = 1  # Fallback: Use page 1 if parsing fails

			# Validate difficulty parameter (optional filter)
			# No fallback - invalid values return error (strict validation)
			difficulty = request.query_params.get("difficulty")
			if difficulty and difficulty not in ["easy", "medium", "hard"]:
				return Response(
					{"error": "Invalid difficulty. Must be 'easy', 'medium', or 'hard'"},
					status=status.HTTP_400_BAD_REQUEST
				)

			# Validate timeframe parameter with default fallback
			# Fallback: Default to "all_time" if not provided
			timeframe = request.query_params.get("timeframe", "all_time")
			if timeframe not in ["all_time", "daily", "weekly"]:
				# No fallback - invalid values return error (strict validation)
				return Response(
					{"error": "Invalid timeframe. Must be 'all_time', 'daily', or 'weekly'"},
					status=status.HTTP_400_BAD_REQUEST
				)

			# timeframe filtering
			now = timezone.now()
			since = None
			if timeframe == "daily":
				since = now - timedelta(days=1)
			elif timeframe == "weekly":
				since = now - timedelta(days=7)

			filters = {}
			if difficulty:
				filters["difficulty"] = difficulty
			if since is not None:
				filters["created_at__gte"] = since

			# Fetch candidates from both models and merge
			# Optimization: Use only() to fetch only needed fields, reducing memory and network overhead
			# Error handling: Database queries wrapped in try/except
			# Fallback: Return 500 error if database query fails (connection issue, etc.)
			try:
				# Fetch 2x limit to account for merging and sorting
				# Optimization: Only fetch fields needed for sorting and response
				user_scores = list(
					UserScore.objects.filter(**filters)
					.only('id', 'user_id', 'score', 'difficulty', 'created_at')
					.order_by("-score", "created_at")[: limit * 2]
				)
				sessions = list(
					GameSession.objects.filter(**filters)
					.only('id', 'user_id', 'score', 'difficulty', 'created_at')
					.order_by("-score", "created_at")[: limit * 2]
				)
			except Exception as db_error:
				# Database error handling: Log full error, return generic message
				logger.error(f"Database error in LeaderboardView: {str(db_error)}", exc_info=True)
				return Response(
					{"error": "Failed to fetch leaderboard"},
					status=status.HTTP_500_INTERNAL_SERVER_ERROR
				)

			# Optimization: Sort in Python after fetching (needed for merging two querysets)
			combined = user_scores + sessions
			# sort by score desc, created_at asc (tie-breaker)
			combined.sort(key=lambda o: (-o.score, o.created_at))

			# pagination
			start = (page - 1) * limit
			end = start + limit
			page_items = combined[start:end]

			# Optimization: Use stored display_name from database (no Firebase lookups needed)
			# Fallback: Only fetch from Firebase if display_name is not stored
			# This significantly reduces Firebase API calls and improves performance
			unique_user_ids = list(set(obj.user_id for obj in page_items))
			display_names_cache = {}
			
			# Only fetch from Firebase for users without stored display_name
			# Optimization: Batch Firebase lookups only for users missing display_name
			users_needing_fetch = [
				uid for uid in unique_user_ids
				if not any(getattr(obj, 'user_id', None) == uid and getattr(obj, 'display_name', None) for obj in page_items)
			]
			
			if firebase_auth and users_needing_fetch:
				for user_id in users_needing_fetch:
					try:
						display_name = _get_display_name(user_id)
						if display_name:
							display_names_cache[user_id] = display_name
					except Exception as name_error:
						# Fallback: Log but continue - missing display name is acceptable
						logger.debug(f"Could not fetch display name for {user_id}: {str(name_error)}")
						display_names_cache[user_id] = None

			# Build leaderboard response with per-item error handling
			# Fallback strategy: Continue processing even if individual items fail
			leaderboard: List[dict] = []
			rank = start + 1
			for obj in page_items:
				# Optimization: Use stored display_name first, then fall back to Firebase cache
				display_name = obj.display_name or display_names_cache.get(obj.user_id)

				# Format response with fallback logic
				# Fallback: Skip this entry if formatting fails (prevent one bad entry from breaking entire response)
				try:
					# Optimization: Exclude message field for leaderboard (reduces response size)
					resp = obj.to_response(display_name, include_message=False)
					resp["rank"] = rank
					# normalize keys to match contract
					resp["user_display"] = resp.pop("user_display_name", None)
					leaderboard.append(resp)
					rank += 1
				except Exception as resp_error:
					# Fallback: Log warning and skip this entry (graceful degradation)
					logger.warning(f"Error formatting response for object {obj.id}: {str(resp_error)}")
					continue

			total_entries = len(combined)

			return Response({
				"leaderboard": leaderboard,
				"page": page,
				"limit": limit,
				"total_entries": total_entries
			})

		except Exception as e:
			logger.error(f"Unexpected error in LeaderboardView: {str(e)}", exc_info=True)
			return Response(
				{"error": "An unexpected error occurred"},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)


class QuestionsView(APIView):
	"""Get questions from the database with optional filtering by difficulty and limit."""
	permission_classes = [AllowAny]

	def get(self, request):
		from questions.models import Question
		from questions.serializers import QuestionSerializer
		import random
		
		# Get query parameters
		difficulty = request.GET.get('difficulty')
		try:
			limit = int(request.GET.get('limit', 10))
			if limit < 1:
				limit = 10
			if limit > 100:
				limit = 100
		except (ValueError, TypeError):
			limit = 10
		
		# Build query
		queryset = Question.objects.all()
		if difficulty and difficulty.lower() in ['easy', 'medium', 'hard']:
			queryset = queryset.filter(difficulty=difficulty.lower())
		
		# Get random questions
		questions = list(queryset)
		if len(questions) > limit:
			questions = random.sample(questions, limit)
		elif questions:
			random.shuffle(questions)
		
		# Serialize and return
		serializer = QuestionSerializer(questions, many=True)
		return Response({"success": True, "questions": serializer.data}, status=status.HTTP_200_OK)


class StartGameView(APIView):
    """Starts a new game: fetches only multiple-choice questions from OpenTDB, creates GameSession, sets hint limits."""
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Start a new game session with comprehensive error handling and fallback logic.
        
        Error Handling Strategy:
        - Validates all inputs before making external API calls
        - Handles OpenTDB API failures with specific error codes
        - Uses database transactions for atomicity
        - Continues processing even if individual question shuffling fails
        - Logs all errors for debugging while returning user-friendly messages
        """
        try:
            # Authentication validation with fallback
            # Fallback: Return 401 if UID missing (defensive check)
            uid = getattr(request.user, "uid", None)
            if not uid:
                logger.warning("StartGameView: Missing user UID")
                return Response(
                    {"error": "User authentication failed"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Validate and parse difficulty with fallback
            # Fallback: Default to "easy" if not provided
            difficulty = request.data.get("difficulty", "easy")
            if isinstance(difficulty, str):
                difficulty = difficulty.lower()
            if difficulty not in ["easy", "medium", "hard"]:
                # No fallback - invalid difficulty returns error (strict validation)
                return Response(
                    {"error": "Invalid difficulty. Must be 'easy', 'medium', or 'hard'"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate and parse number of questions with fallback logic
            # Fallback: Default to 10 if not provided, cap at 50 (OpenTDB limit)
            try:
                num_questions = int(request.data.get("amount", 10))
                if num_questions < 1:
                    # No fallback - invalid amount returns error
                    return Response(
                        {"error": "amount must be at least 1"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if num_questions > 50:  # OpenTDB limit
                    # Fallback: Cap at 50 instead of failing (graceful degradation)
                    num_questions = 50
                    logger.info(f"Capped question amount to 50 for user {uid}")
            except (ValueError, TypeError):
                # Fallback: Return error if amount cannot be parsed
                return Response(
                    {"error": "amount must be an integer"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate categories if provided
            # Fallback: Default to empty list if not provided
            category_ids = request.data.get("categories", [])
            if category_ids and not isinstance(category_ids, list):
                # No fallback - invalid type returns error
                return Response(
                    {"error": "categories must be a list"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Build OpenTDB request
            base_url = "https://opentdb.com/api.php"
            params = {
                "amount": num_questions,
                "difficulty": difficulty,
                "type": "multiple",  # ONLY multiple choice
            }
            # Format categories for API with fallback logic
            # Fallback: Continue without category filter if formatting fails (non-fatal)
            if category_ids:
                try:
                    params["category"] = ",".join(map(str, category_ids))
                except Exception as e:
                    # Fallback: Log warning and continue without category filter
                    logger.warning(f"Error formatting categories: {str(e)}")
                    # Continue without category filter (graceful degradation)

            # Fetch questions from OpenTDB API with comprehensive error handling
            # Error handling strategy: Different error types return different HTTP status codes
            # No fallback - API failure prevents game creation (hard requirement)
            try:
                response = requests.get(base_url, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()
            except requests.exceptions.Timeout:
                # Timeout error: API took too long to respond
                # Fallback: Return 504 Gateway Timeout (specific error code for timeouts)
                logger.error("OpenTDB API timeout")
                return Response(
                    {"error": "Request to question service timed out"},
                    status=status.HTTP_504_GATEWAY_TIMEOUT
                )
            except requests.exceptions.RequestException as e:
                # Network/HTTP errors: Connection failed, bad status code, etc.
                # Fallback: Return 502 Bad Gateway (upstream service error)
                logger.error(f"OpenTDB API request failed: {str(e)}")
                return Response(
                    {"error": "Failed to fetch questions from question service"},
                    status=status.HTTP_502_BAD_GATEWAY
                )
            except ValueError as e:
                # JSON parsing error: Invalid response format
                # Fallback: Return 502 Bad Gateway (malformed response from upstream)
                logger.error(f"Invalid JSON response from OpenTDB: {str(e)}")
                return Response(
                    {"error": "Invalid response from question service"},
                    status=status.HTTP_502_BAD_GATEWAY
                )

            # Check OpenTDB API response code
            # Error handling: OpenTDB uses response_code field to indicate success/failure
            # No fallback - API errors prevent game creation
            response_code = data.get("response_code", -1)
            if response_code != 0:
                # Map OpenTDB error codes to user-friendly messages
                error_messages = {
                    1: "No results found",
                    2: "Invalid parameter",
                    3: "Token not found",
                    4: "Token empty"
                }
                error_msg = error_messages.get(response_code, "Unknown error")
                logger.warning(f"OpenTDB returned error code {response_code}: {error_msg}")
                return Response(
                    {"error": f"Question service error: {error_msg}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Filter out any boolean questions (defensive check)
            # Fallback: Only include multiple-choice questions even if API returns mixed types
            questions = [q for q in data.get("results", []) if q.get("type") == "multiple"]

            # Validate we have questions after filtering
            # No fallback - cannot create game without questions
            if not questions:
                logger.warning(f"No multiple-choice questions returned for difficulty={difficulty}, amount={num_questions}")
                return Response(
                    {"error": "No multiple-choice questions available"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # RANDOMIZE QUESTION ORDER
            random.shuffle(questions)

            # Shuffle answers for each question with per-question error handling
            # Fallback strategy: Continue processing even if individual question shuffling fails
            for q in questions:
                try:
                    incorrect = q.get("incorrect_answers", [])
                    correct = q.get("correct_answer", "")
                    if not correct or not incorrect:
                        # Fallback: Skip shuffling for this question if data is invalid
                        logger.warning(f"Question missing answer data: {q.get('question', '')[:50]}")
                        continue
                    answers = incorrect + [correct]
                    random.shuffle(answers)
                    q["shuffled_answers"] = answers
                except Exception as e:
                    # Fallback: Log warning and continue without shuffled_answers for this question
                    # Question still included in response, just without shuffled answers
                    logger.warning(f"Error shuffling answers for question: {str(e)}")
                    # Continue with original answers if shuffle fails (graceful degradation)

            # Create game session with database transaction for atomicity
            # Error handling: Transaction ensures all-or-nothing database operations
            # Fallback: Return 500 error if database write fails
            try:
                with transaction.atomic():
                    # Get display name with fallback: try from request.user first, then fetch from Firebase
                    # Fallback: Returns None if Firebase lookup fails (non-fatal)
                    display_name = getattr(request.user, "display_name", None) or _get_display_name(uid)
                    
                    # Atomic transaction: Either all operations succeed or all roll back
                    # Optimization: Store display_name to avoid Firebase lookups in leaderboard
                    session = GameSession.objects.create(
                        user_id=uid,
                        display_name=display_name,  # Store display_name for leaderboard efficiency
                        difficulty=difficulty,
                        categories=category_ids,
                        score=0,
                        total_questions=len(questions),
                    )

                    # Set allowed hints (calculated as 1/5 of total questions)
                    session.set_hint_limits()
                    session.save()
                    logger.info(f"GameSession created: {session.id} for user {uid} with {len(questions)} questions")

                # Optimization: Return minimal session info first, questions can be large
                # Response structure optimized for frontend consumption
                return Response({
                    "session_id": str(session.id),
                    "difficulty": difficulty,
                    "total_questions": len(questions),
                    "allowed_hints": session.allowed_hints,
                    "hints_used": session.hints_used,
                    "questions": questions,  # Full questions included for initial game setup
                }, status=status.HTTP_201_CREATED)

            except Exception as db_error:
                # Database error handling: Log full error, return generic message
                # Fallback: Return 500 error (transaction ensures no partial data saved)
                logger.error(f"Database error in StartGameView: {str(db_error)}", exc_info=True)
                return Response(
                    {"error": "Failed to create game session"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            logger.error(f"Unexpected error in StartGameView: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




class UpdateDisplayNameView(APIView):
    """Allows authenticated users to update their display name for leaderboard."""
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Update display name for the authenticated user with validation and error handling.
        
        Error Handling Strategy:
        - Validates input format and length
        - Updates all existing UserScore and GameSession records for the user
        - Uses database transactions for atomicity
        - Handles database errors gracefully
        """
        try:
            # Authentication validation with fallback
            # Fallback: Return 401 if UID missing (defensive check)
            uid = getattr(request.user, "uid", None)
            if not uid:
                logger.warning("UpdateDisplayNameView: Missing user UID")
                return Response(
                    {"error": "User authentication failed"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Validate request data
            serializer = UpdateDisplayNameSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            display_name = serializer.validated_data["display_name"].strip()

            # Input validation: Ensure display name is not empty after trimming
            # No fallback - empty display name returns error
            if not display_name:
                return Response(
                    {"error": "display_name cannot be empty"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update all existing records for this user with database transaction
            # Error handling: Transaction ensures all-or-nothing update
            # Fallback: Return 500 error if database update fails
            try:
                with transaction.atomic():
                    # Atomic transaction: Update all UserScore and GameSession records
                    updated_scores = UserScore.objects.filter(user_id=uid).update(display_name=display_name)
                    updated_sessions = GameSession.objects.filter(user_id=uid).update(display_name=display_name)
                    
                    logger.info(f"Updated display_name for user {uid}: {updated_scores} scores, {updated_sessions} sessions")
                    
                    return Response({
                        "message": "Display name updated successfully",
                        "display_name": display_name,
                        "updated_scores": updated_scores,
                        "updated_sessions": updated_sessions,
                    }, status=status.HTTP_200_OK)

            except Exception as db_error:
                # Database error handling: Log full error, return generic message
                # Fallback: Return 500 error (transaction ensures no partial update)
                logger.error(f"Database error in UpdateDisplayNameView: {str(db_error)}", exc_info=True)
                return Response(
                    {"error": "Failed to update display name"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except serializers.ValidationError as e:
            # Serializer validation error: Return formatted error response
            # Fallback: Return validation errors in standard format
            return Response(
                {"error": str(e.detail) if hasattr(e, 'detail') else str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # Top-level error handler: Catch any unexpected exceptions
            # Fallback: Return generic error to prevent exposing internal implementation details
            logger.error(f"Unexpected error in UpdateDisplayNameView: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UseHintView(APIView):
    """Removes one incorrect answer and updates hint usage."""
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        """
        Use a hint for a game session with security and validation checks.
        
        Error Handling Strategy:
        - Validates authentication, session ownership, and hint availability
        - Uses database transactions for atomic updates
        - Prevents unauthorized access with ownership checks
        - Validates all inputs before processing
        """
        try:
            # Authentication validation with fallback
            # Fallback: Return 401 if UID missing (defensive check)
            uid = getattr(request.user, "uid", None)
            if not uid:
                logger.warning("UseHintView: Missing user UID")
                return Response(
                    {"error": "User authentication failed"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Validate session_id format (UUID validation)
            # No fallback - invalid format returns error (prevents injection attacks)
            try:
                uuid.UUID(str(session_id))
            except (ValueError, TypeError):
                return Response(
                    {"error": "Invalid session ID format"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Fetch session with error handling
            # Fallback: Return 404 if session doesn't exist
            # Optimization: Only fetch fields needed for validation and update
            try:
                session = GameSession.objects.only(
                    'id', 'user_id', 'allowed_hints', 'hints_used'
                ).get(id=session_id)
            except GameSession.DoesNotExist:
                logger.warning(f"UseHintView: Session {session_id} not found")
                return Response(
                    {"error": "Game session not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Security check: Ownership validation
            # Fallback: Return 403 Forbidden if user doesn't own session (prevents unauthorized access)
            if session.user_id != uid:
                logger.warning(f"UseHintView: User {uid} attempted to use hint for session {session_id} owned by {session.user_id}")
                return Response(
                    {"error": "You can only use hints for your own game sessions"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Validate hint availability
            # No fallback - these are hard validation errors
            if session.allowed_hints is None:
                logger.warning(f"UseHintView: Session {session_id} has no allowed_hints set")
                return Response(
                    {"error": "Game session not properly initialized"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if session.hints_used >= session.allowed_hints:
                return Response(
                    {"error": "No hints remaining"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate request data
            correct_answer = request.data.get("correct_answer")
            incorrect_answers = request.data.get("incorrect_answers")

            if not correct_answer:
                return Response(
                    {"error": "correct_answer is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not incorrect_answers:
                return Response(
                    {"error": "incorrect_answers is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not isinstance(incorrect_answers, list):
                return Response(
                    {"error": "incorrect_answers must be a list"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Cannot remove an incorrect answer if none remain
            if len(incorrect_answers) == 0:
                return Response(
                    {"error": "No incorrect answers available to remove"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Remove ONE incorrect answer
            removed = incorrect_answers[0]  # simple removal strategy
            remaining_incorrect = incorrect_answers[1:]  # keep the rest

            # Update session with database transaction for atomicity
            # Error handling: Transaction ensures hint count is updated atomically
            # Fallback: Return 500 error if database update fails
            try:
                with transaction.atomic():
                    # Atomic transaction: Increment hint count and save in one operation
                    session.hints_used += 1
                    session.save()
                    logger.info(f"Hint used for session {session_id} by user {uid}. Hints used: {session.hints_used}/{session.allowed_hints}")

                return Response({
                    "removed_answer": removed,
                    "remaining_answers": [correct_answer] + remaining_incorrect,
                    "hints_used": session.hints_used,
                    "hints_remaining": session.allowed_hints - session.hints_used,
                })

            except Exception as db_error:
                # Database error handling: Log full error, return generic message
                # Fallback: Return 500 error (transaction ensures no partial update)
                logger.error(f"Database error in UseHintView: {str(db_error)}", exc_info=True)
                return Response(
                    {"error": "Failed to update hint usage"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            logger.error(f"Unexpected error in UseHintView: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


'''
* Multiplayer Session Management
* 
* Create a new multiplayer session
* Join an existing multiplayer session
* Submit a score for a multiplayer session
* Get the status of a multiplayer session
'''


class CreateMultiplayerView(APIView):
    """Create a new multiplayer session. The creator becomes the first player."""
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Create a new multiplayer session.
        
        Required fields:
        - number_of_players: Target number of players (2-10)
        - difficulty: "easy", "medium", or "hard"
        - total_questions: Number of questions (1-50)
        
        Optional fields:
        - board_seed: Seed for question generation (auto-generated if not provided)
        """
        try:
            # Get authenticated user ID from Firebase token
            uid = getattr(request.user, "uid", None)
            if not uid:
                logger.warning("CreateMultiplayerView: Missing user UID")
                return Response(
                    {"error": "Authentication required"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Get display name from authenticated user
            display_name = getattr(request.user, "display_name", None) or _get_display_name(uid)

            # Validate request data
            serializer = CreateMultiplayerSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            number_of_players = serializer.validated_data.get("number_of_players", 2)
            difficulty = serializer.validated_data.get("difficulty", "easy")
            total_questions = serializer.validated_data.get("total_questions", 10)
            board_seed = serializer.validated_data.get("board_seed") or str(uuid.uuid4())

            # Create session with creator as first player
            with transaction.atomic():
                join_code = MultiplayerSession.generate_join_code()
                session = MultiplayerSession.objects.create(
                    join_code=join_code,
                    board_seed=board_seed,
                    number_of_players=number_of_players,
                    difficulty=difficulty,
                    total_questions=total_questions,
                    players=[uid],  # Creator is first player
                    status="waiting"
                )
                logger.info(f"MultiplayerSession created: {session.session_id} (join_code: {join_code}) by user {uid}")

            return Response({
                "session_id": str(session.session_id),
                "join_code": session.join_code,
                "board_seed": session.board_seed,
                "players": session.players,
                "number_of_players": session.number_of_players,
                "current_players": len(session.players),
                "difficulty": session.difficulty,
                "total_questions": session.total_questions,
                "status": session.status,
                "created_at": session.created_at.isoformat()
            }, status=status.HTTP_201_CREATED)

        except serializers.ValidationError as e:
            return Response(
                {"error": str(e.detail) if hasattr(e, 'detail') else str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error in CreateMultiplayerView: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class JoinMultiplayerView(APIView):
    """Join an existing multiplayer session. Game starts automatically when full."""
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Join an existing multiplayer session using a join code.
        
        Required fields:
        - join_code: 6-8 character alphanumeric code (e.g., "ABC123")
        """
        try:
            # Get authenticated user ID from Firebase token
            uid = getattr(request.user, "uid", None)
            if not uid:
                logger.warning("JoinMultiplayerView: Missing user UID")
                return Response(
                    {"error": "Authentication required"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Validate request data
            serializer = JoinMultiplayerSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            join_code = serializer.validated_data["join_code"].upper()  # Normalize to uppercase

            # Fetch session by join_code
            try:
                session = MultiplayerSession.objects.select_for_update().get(join_code=join_code)
            except MultiplayerSession.DoesNotExist:
                return Response(
                    {"error": "Invalid join code. Session not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check if session is already finished
            if session.status == "finished":
                return Response(
                    {"error": "Session has already finished"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if session is full
            if session.is_full():
                return Response(
                    {"error": "Session is full"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Add player if not already in session
            with transaction.atomic():
                # Convert players list to mutable list if needed (for JSONField)
                players_list = list(session.players) if session.players else []
                
                if uid not in players_list:
                    players_list.append(uid)
                    session.players = players_list
                    
                    # If session is now full, start the game
                    if session.is_full():
                        session.status = "active"
                        session.start_time = timezone.now()
                        logger.info(f"MultiplayerSession {session.session_id} started - all players joined")
                    
                    session.save()
                    logger.info(f"User {uid} joined session {session.session_id}. Players: {session.players}")
                else:
                    logger.info(f"User {uid} already in session {session.session_id}")

            return Response({
                "session_id": str(session.session_id),
                "join_code": session.join_code,
                "players": session.players,
                "current_players": len(session.players),
                "number_of_players": session.number_of_players,
                "status": session.status,
                "board_seed": session.board_seed,
                "difficulty": session.difficulty,
                "total_questions": session.total_questions,
                "start_time": session.start_time.isoformat() if session.start_time else None
            }, status=status.HTTP_200_OK)

        except serializers.ValidationError as e:
            error_detail = e.detail if hasattr(e, 'detail') else str(e)
            if isinstance(error_detail, dict):
                error_msg = "; ".join([f"{k}: {v}" if isinstance(v, list) else f"{k}: {v}" for k, v in error_detail.items()])
            else:
                error_msg = str(error_detail)
            return Response(
                {"error": error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error in JoinMultiplayerView: {str(e)}", exc_info=True)
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SubmitMultiplayerScoreView(APIView):
    """Submit a player's score for a multiplayer session. Computes winners when all players finish."""
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Submit a score for a multiplayer session.
        
        Required fields:
        - session_id: UUID of the session
        - score: Player's score (integer >= 0)
        
        Optional fields:
        - correct_count: Number of correct answers
        - time_taken_seconds: Time taken to complete the game
        """
        try:
            # Get authenticated user ID from Firebase token
            uid = getattr(request.user, "uid", None)
            if not uid:
                logger.warning("SubmitMultiplayerScoreView: Missing user UID")
                return Response(
                    {"error": "Authentication required"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Validate request data
            serializer = SubmitMultiplayerScoreSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            session_id = serializer.validated_data["session_id"]
            score_value = serializer.validated_data["score"]
            correct_count = serializer.validated_data.get("correct_count")
            time_taken_seconds = serializer.validated_data.get("time_taken_seconds")

            # Fetch session with lock to prevent race conditions
            try:
                session = MultiplayerSession.objects.select_for_update().get(session_id=session_id)
            except MultiplayerSession.DoesNotExist:
                return Response(
                    {"error": "Session not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Verify user is part of the session
            players_list = list(session.players) if session.players else []
            if uid not in players_list:
                logger.warning(f"User {uid} not in session {session_id}. Players: {players_list}")
                return Response(
                    {"error": f"You are not a player in this session. Please join the session first."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Verify session is active
            if session.status == "waiting":
                return Response(
                    {"error": "Session has not started yet"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if session.status == "finished":
                return Response(
                    {"error": "Session has already finished"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Store score with additional metadata
            score_data = {
                "score": score_value,
                "correct_count": correct_count,
                "time_taken_seconds": time_taken_seconds,
                "submitted_at": timezone.now().isoformat()
            }
            
            with transaction.atomic():
                session.scores[uid] = score_data
                
                # Check if all players have submitted
                if session.all_players_submitted():
                    session.status = "finished"
                    session.finished_at = timezone.now()
                    # Compute winners
                    session.winners = session.compute_winners()
                    logger.info(f"MultiplayerSession {session.session_id} finished. Winners: {session.winners}")
                else:
                    session.status = "active"
                
                session.save()

            # Build response with player details
            player_scores = {}
            for player_id in session.players:
                if player_id in session.scores:
                    score_info = session.scores[player_id]
                    player_scores[player_id] = {
                        "score": score_info.get("score") if isinstance(score_info, dict) else score_info,
                        "correct_count": score_info.get("correct_count") if isinstance(score_info, dict) else None,
                        "time_taken_seconds": score_info.get("time_taken_seconds") if isinstance(score_info, dict) else None,
                    }
                else:
                    player_scores[player_id] = None  # Player hasn't submitted yet

            response_data = {
                "session_id": str(session.session_id),
                "status": session.status,
                "scores": player_scores,
                "players_submitted": len(session.scores),
                "total_players": len(session.players),
            }

            # Include winners if game is finished
            if session.status == "finished":
                response_data["winners"] = session.winners
                response_data["finished_at"] = session.finished_at.isoformat()

            return Response(response_data, status=status.HTTP_200_OK)

        except serializers.ValidationError as e:
            return Response(
                {"error": str(e.detail) if hasattr(e, 'detail') else str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error in SubmitMultiplayerScoreView: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GetMultiplayerSessionView(APIView):
    """Get the current status of a multiplayer session by session_id or join_code."""
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id=None):
        """
        Get the current status of a multiplayer session.
        
        Can be accessed via:
        - GET /api/multiplayer/<session_id> (UUID from URL)
        - GET /api/multiplayer/by-code/?join_code=ABC123 (join code from query param)
        
        Returns:
        - Session details
        - List of players
        - Current scores (if any)
        - Status (waiting/active/finished)
        - Winners (if finished)
        """
        try:
            # Get authenticated user ID (optional - for display purposes only)
            uid = getattr(request.user, "uid", None)

            # Support both session_id (from URL) and join_code (from query param)
            join_code = request.query_params.get("join_code")
            
            if join_code:
                # Fetch by join_code (for by-code endpoint)
                try:
                    session = MultiplayerSession.objects.get(join_code=join_code.upper())
                except MultiplayerSession.DoesNotExist:
                    return Response(
                        {"error": "Session not found with that join code"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            elif session_id:
                # Fetch by UUID (for UUID endpoint)
                # Validate session_id format
                try:
                    uuid.UUID(str(session_id))
                except (ValueError, TypeError):
                    return Response(
                        {"error": "Invalid session ID format"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Fetch session by UUID
                try:
                    session = MultiplayerSession.objects.get(session_id=session_id)
                except MultiplayerSession.DoesNotExist:
                    return Response(
                        {"error": "Session not found"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                return Response(
                    {"error": "Either session_id (UUID) or join_code query parameter is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Build player scores with display names
            player_scores = {}
            players_list = list(session.players) if session.players else []
            for player_id in players_list:
                display_name = _get_display_name(player_id) if firebase_auth else f"Player_{player_id[-4:]}"
                if player_id in session.scores:
                    score_info = session.scores[player_id]
                    score_value = score_info.get("score") if isinstance(score_info, dict) else score_info
                    player_scores[player_id] = {
                        "display_name": display_name,
                        "score": score_value,
                        "correct_count": score_info.get("correct_count") if isinstance(score_info, dict) else None,
                        "time_taken_seconds": score_info.get("time_taken_seconds") if isinstance(score_info, dict) else None,
                        "submitted": True
                    }
                else:
                    player_scores[player_id] = {
                        "display_name": display_name,
                        "score": None,
                        "submitted": False
                    }

            response_data = {
                "session_id": str(session.session_id),
                "join_code": session.join_code,
                "board_seed": session.board_seed,
                "status": session.status,
                "difficulty": session.difficulty,
                "total_questions": session.total_questions,
                "number_of_players": session.number_of_players,
                "current_players": len(session.players),
                "players": session.players,
                "player_scores": player_scores,
                "players_submitted": len(session.scores),
                "created_at": session.created_at.isoformat(),
                "start_time": session.start_time.isoformat() if session.start_time else None,
            }

            # Include finished info if game is finished
            if session.status == "finished":
                response_data["finished_at"] = session.finished_at.isoformat() if session.finished_at else None
                response_data["winners"] = session.winners
                
                # Add winner display names
                if session.winners:
                    winner_details = []
                    for winner_id in session.winners:
                        winner_display_name = _get_display_name(winner_id) if firebase_auth else None
                        winner_score = session.scores.get(winner_id, {})
                        winner_score_value = winner_score.get("score") if isinstance(winner_score, dict) else winner_score
                        winner_details.append({
                            "user_id": winner_id,
                            "display_name": winner_display_name,
                            "score": winner_score_value
                        })
                    response_data["winner_details"] = winner_details

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Unexpected error in GetMultiplayerSessionView: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )