from django.urls import path
from .views import SubmitScoreView, LeaderboardView, QuestionsView, StartGameView, UseHintView, UpdateDisplayNameView
from .views import CreateMultiplayerView, JoinMultiplayerView, SubmitMultiplayerScoreView, GetMultiplayerSessionView

urlpatterns = [
	path("questions/", QuestionsView.as_view(), name="questions"),
	path("submit-score/", SubmitScoreView.as_view(), name="submit-score"),
	path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
	path("start-game/", StartGameView.as_view(), name="start-game"),
    path("use-hint/<uuid:session_id>/", UseHintView.as_view(), name="use-hint"),
	path("update-display-name/", UpdateDisplayNameView.as_view(), name="update-display-name"),
	path("multiplayer/create", CreateMultiplayerView.as_view(), name="create-multiplayer"),
    path("multiplayer/join", JoinMultiplayerView.as_view(), name="join-multiplayer"),
    path("multiplayer/submit", SubmitMultiplayerScoreView.as_view(), name="submit-multiplayer-score"),
    path("multiplayer/<uuid:session_id>", GetMultiplayerSessionView.as_view(), name="get-multiplayer-session"),
    path("multiplayer/by-code", GetMultiplayerSessionView.as_view(), name="get-multiplayer-session-by-code"),
]
