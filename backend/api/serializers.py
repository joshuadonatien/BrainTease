from rest_framework import serializers

class SubmitScoreSerializer(serializers.Serializer):
	score = serializers.IntegerField()
	difficulty = serializers.ChoiceField(choices=[("easy", "Easy"), ("medium", "Medium"), ("hard", "Hard")])
	correct_count = serializers.IntegerField(required=False, allow_null=True)
	total_questions = serializers.IntegerField(required=False, allow_null=True)
	time_taken_seconds = serializers.IntegerField(required=False, allow_null=True)
	categories = serializers.ListField(child=serializers.CharField(), required=False)
