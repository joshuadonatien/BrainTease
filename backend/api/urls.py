from django.urls import path
<<<<<<< HEAD
from .views import question_list, score_submit

urlpatterns = [
    path("questions/", question_list, name="question_list"),
    path("score/", score_submit, name="score_submit"),
=======
from .views import SubmitScoreView, LeaderboardView, QuestionsView, StartGameView, UseHintView, UpdateDisplayNameView

urlpatterns = [
	path("questions/", QuestionsView.as_view(), name="questions"),
	path("submit-score/", SubmitScoreView.as_view(), name="submit-score"),
	path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
	path("start-game/", StartGameView.as_view(), name="start-game"),
    path("use-hint/<uuid:session_id>/", UseHintView.as_view(), name="use-hint"),
	path("update-display-name/", UpdateDisplayNameView.as_view(), name="update-display-name"),
>>>>>>> 522b9f8d42b32539e6fa5840eb824218ee72f164
]
