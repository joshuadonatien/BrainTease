from rest_framework import serializers
from .models import MultiplayerSession

class SubmitScoreSerializer(serializers.Serializer):
	score = serializers.IntegerField()
	difficulty = serializers.ChoiceField(choices=[("easy", "Easy"), ("medium", "Medium"), ("hard", "Hard")])
	correct_count = serializers.IntegerField(required=False, allow_null=True)
	total_questions = serializers.IntegerField(required=False, allow_null=True)
	time_taken_seconds = serializers.IntegerField(required=False, allow_null=True)
	categories = serializers.ListField(child=serializers.CharField(), required=False)


class UpdateDisplayNameSerializer(serializers.Serializer):
	display_name = serializers.CharField(max_length=255, required=True, allow_blank=False)


class CreateMultiplayerSerializer(serializers.Serializer):
    number_of_players = serializers.IntegerField(min_value=2, max_value=10, default=2)
    difficulty = serializers.ChoiceField(
        choices=[("easy", "Easy"), ("medium", "Medium"), ("hard", "Hard")], 
        default="easy"
    )
    total_questions = serializers.IntegerField(min_value=1, max_value=50, default=10)
    board_seed = serializers.CharField(required=False, max_length=64)


class JoinMultiplayerSerializer(serializers.Serializer):
    join_code = serializers.CharField(max_length=8, min_length=6)


class SubmitMultiplayerScoreSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    score = serializers.IntegerField(min_value=0)
    correct_count = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    time_taken_seconds = serializers.IntegerField(required=False, allow_null=True, min_value=0)