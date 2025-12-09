from rest_framework import serializers
from .models import Puzzle, UserScore


class PuzzleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puzzle
        fields = "__all__"


class UserScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserScore
        fields = "__all__"