from django.urls import path
from .views import question_list, score_submit

urlpatterns = [
    path("questions/", question_list, name="question_list"),
    path("score/", score_submit, name="score_submit"),
]
