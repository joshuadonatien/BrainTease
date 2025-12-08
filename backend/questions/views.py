from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated  # optional, or your Firebase auth
from .models import Question
from .serializers import QuestionSerializer
import random

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
