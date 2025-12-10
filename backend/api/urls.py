# from django.urls import path
# from .views import SubmitScoreView, LeaderboardView, QuestionsView, StartGameView, UseHintView

# urlpatterns = [
# 	path("questions/", QuestionsView.as_view(), name="questions"),
# 	path("submit-score/", SubmitScoreView.as_view(), name="submit-score"),
# 	path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
# 	path("start-game/", StartGameView.as_view(), name="start-game"),
#     path("use-hint/<uuid:session_id>/", UseHintView.as_view(), name="use-hint"),
# ]

from django.urls import path
from . import views

urlpatterns = [
    path("auth/signup/", views.signup),
    path("auth/login/", views.login),
    path("auth/google/", views.google_auth),
    path("auth/logout/", views.logout),

    path("users/me/", views.user_me),
    path("users/stats/", views.user_stats),

    path("leaderboard/", views.leaderboard),
]
