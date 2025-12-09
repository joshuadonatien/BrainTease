from django.db import models
from django.contrib.auth.models import User


class Puzzle(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)


def __str__(self):
    return self.title


class UserScore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    puzzle = models.ForeignKey(Puzzle, on_delete=models.CASCADE)
    score = models.IntegerField()
    completed_at = models.DateTimeField(auto_now_add=True)