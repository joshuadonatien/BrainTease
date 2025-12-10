# backend/api/urls.py
from django.urls import path
from .views import (
    SubmitScoreView,
    LeaderboardView,
    QuestionsView,
    StartGameView,
    UseHintView,
    UpdateDisplayNameView,
)
from . import views

app_name = "api"  # Important for reverse("api:...") in tests

urlpatterns = [
    # Questions endpoints
    path("questions/", QuestionsView.as_view(), name="questions"),
    path("questions/", QuestionsView.as_view(), name="get_questions"),  # alias for tests

    # Game session endpoints
    path("start-game/", StartGameView.as_view(), name="start-game"),
    path("start-game/", StartGameView.as_view(), name="start_game"),  # alias for tests

    # Score endpoints
    path("submit-score/", SubmitScoreView.as_view(), name="submit-score"),
    path("submit-score/", SubmitScoreView.as_view(), name="submit_score"),  # alias for tests

    # Leaderboard endpoint
    path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),

    # Hint endpoint
    path("use-hint/<uuid:session_id>/", UseHintView.as_view(), name="use-hint"),
    path("use-hint/<uuid:session_id>/", UseHintView.as_view(), name="get_hint"),  # alias for tests

    # Display name update
    path("update-display-name/", UpdateDisplayNameView.as_view(), name="update-display-name"),

    # Stub login endpoint expected by tests
    path("login/", views.login_view, name="login"),

    # Stub answer-question endpoint expected by tests
    path("answer-question/", views.answer_question_view, name="answer_question"),
]
