from django.urls import path
from .views import categories_view

urlpatterns = [
    # Note: questions/ endpoint is in api.urls (QuestionsView), not here
    # categories/ endpoint is here because it's part of the questions app
    path('categories/', categories_view, name='categories'),
]