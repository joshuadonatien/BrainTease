from django.urls import path
from .views import get_questions, categories_view, questions_proxy_view

urlpatterns = [
    path('questions/', get_questions, name='get_questions'),
    path('questions-proxy/', questions_proxy_view, name='questions_proxy'),
    path('categories/', categories_view, name='categories'),
]