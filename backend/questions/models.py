from django.db import models

class Question(models.Model):
    text = models.TextField()
    answer = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=20)
    category = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.text[:50]} ({self.difficulty})"