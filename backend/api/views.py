from datetime import timedelta
from typing import List

from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .firebase_auth import FirebaseAuthentication
from .serializers import SubmitScoreSerializer
from .models import UserScore, GameSession

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
		serializer = SubmitScoreSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		data = serializer.validated_data

		uid = getattr(request.user, "uid", None)
		display_name = getattr(request.user, "display_name", None) or _get_display_name(uid)

		# If detailed session fields or categories are provided, create GameSession
		has_session_fields = any(
			k in data for k in ("correct_count", "total_questions", "time_taken_seconds", "categories")
		)

		if has_session_fields:
			gs = GameSession.objects.create(
				user_id=uid,
				difficulty=data["difficulty"],
				categories=data.get("categories", []),
				score=data["score"],
				correct_count=data.get("correct_count"),
				total_questions=data.get("total_questions"),
				time_taken_seconds=data.get("time_taken_seconds"),
			)
			return Response(gs.to_response(display_name), status=status.HTTP_201_CREATED)

		# Otherwise create a lightweight UserScore record
		us = UserScore.objects.create(
			user_id=uid,
			difficulty=data["difficulty"],
			score=data["score"],
		)
		return Response(us.to_response(display_name), status=status.HTTP_201_CREATED)


class LeaderboardView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		try:
			limit = int(request.query_params.get("limit", 10))
		except ValueError:
			return Response({"error": "limit must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

		page = int(request.query_params.get("page", 1))
		difficulty = request.query_params.get("difficulty")
		timeframe = request.query_params.get("timeframe", "all_time")

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

		# fetch candidates from both models and merge
		user_scores = list(UserScore.objects.filter(**filters).order_by("-score", "created_at")[: limit * 2])
		sessions = list(GameSession.objects.filter(**filters).order_by("-score", "created_at")[: limit * 2])

		combined = user_scores + sessions
		# sort by score desc, created_at asc (tie-breaker)
		combined.sort(key=lambda o: (-o.score, o.created_at))

		# pagination
		start = (page - 1) * limit
		end = start + limit
		page_items = combined[start:end]

		leaderboard: List[dict] = []
		rank = start + 1
		for obj in page_items:
			# resolve display name if possible
			display_name = None
			try:
				display_name = _get_display_name(obj.user_id)
			except Exception:
				display_name = None

			resp = obj.to_response(display_name)
			resp["rank"] = rank
			# normalize keys to match contract
			resp["user_display"] = resp.pop("user_display_name", None)
			leaderboard.append(resp)
			rank += 1

		total_entries = len(combined)

		return Response({"leaderboard": leaderboard, "page": page, "limit": limit, "total_entries": total_entries})


class QuestionsView(APIView):
	"""Placeholder stub for GET /api/questions/.

	Returns an empty `questions` array for now. Implement question sourcing,
	filtering by `difficulty` and `categories`, and authentication logic later.
	"""
	permission_classes = [AllowAny]

	def get(self, request):
		# TODO: implement question retrieval and query params
		return Response({"questions": []}, status=status.HTTP_200_OK)

