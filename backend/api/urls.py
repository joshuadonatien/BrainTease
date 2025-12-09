from django.urls import path
from .views import SubmitScoreView, LeaderboardView, QuestionsView, StartGameView, UseHintView

urlpatterns = [
	path("questions/", QuestionsView.as_view(), name="questions"),
	path("submit-score/", SubmitScoreView.as_view(), name="submit-score"),
	path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
	path("start-game/", StartGameView.as_view(), name="start-game"),
    path("use-hint/<uuid:session_id>/", UseHintView.as_view(), name="use-hint"),
]
