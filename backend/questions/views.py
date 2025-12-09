from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated  # optional, or your Firebase auth

from .models import Question
from .serializers import QuestionSerializer
import random
from django.conf import settings

from .services.opentdb import fetch_questions, fetch_categories
from .utils.hints import eliminate_choices

@api_view(['GET'])
# @permission_classes([IsAuthenticated])  # optional
def get_questions(request):
    """
    GET /api/questions/?difficulty=easy&limit=10
    Returns filtered, randomized questions
    """
    difficulty = request.GET.get('difficulty')
    limit = int(request.GET.get('limit', 10))

    qs = Question.objects.all()
    if difficulty:
        qs = qs.filter(difficulty=difficulty.lower())

    question_list = list(qs)
    random.shuffle(question_list)  # randomize order

    # Limit results
    question_list = question_list[:limit]

    serializer = QuestionSerializer(question_list, many=True)
    return Response({"success": True, "questions": serializer.data})

@api_view(["GET"])
def categories_view(request):
    cats = fetch_categories()
    return Response({"categories": cats})

@api_view(["GET"])
def questions_proxy_view(request):
    """
    Local endpoint your frontend hits: /api/questions-proxy/
    Query params supported:
      - amount (int)
      - difficulty (easy|medium|hard)
      - category (int, OpenTDB category id)
      - type (multiple|boolean)
      - hints (boolean) -> whether to include hints object
    """
    try:
        # Get amount parameter with validation
        amount_str = request.query_params.get("amount", str(settings.OPEN_TDB_DEFAULT_AMOUNT))
        try:
            amount = int(amount_str)
            if amount < 1 or amount > 50:  # OpenTDB limit
                amount = settings.OPEN_TDB_DEFAULT_AMOUNT
        except (ValueError, TypeError):
            amount = settings.OPEN_TDB_DEFAULT_AMOUNT
        
        difficulty = request.query_params.get("difficulty")
        category = request.query_params.get("category")  # pass through as string/id
        qtype = request.query_params.get("type", "multiple")
        include_hints = request.query_params.get("hints", "true").lower() in ("1", "true", "yes")

        items = fetch_questions(amount=amount, difficulty=difficulty, category=category, qtype=qtype)

        results = []
        for i, it in enumerate(items):
            item = {
                "id": f"opentdb-{i}",
                "question": it.get("question", ""),
                "correct_answer": it.get("correct_answer", ""),
                "incorrect_answers": it.get("incorrect_answers", []),
                "difficulty": it.get("difficulty", ""),
                "category": it.get("category", ""),
                "type": it.get("type", "multiple")
            }
            if include_hints:
                correct = it.get("correct_answer", "")
                if correct:
                    item["hints"] = {
                        "reduced_choices": eliminate_choices(correct, it.get("incorrect_answers", []), remove_count=1)
                    }
            results.append(item)

        return Response({"results": results})
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in questions_proxy_view: {str(e)}", exc_info=True)
        return Response({"error": "Unable to fetch questions", "results": []}, status=500)