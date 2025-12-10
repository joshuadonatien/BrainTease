from django.contrib import admin
from .models import UserScore, GameSession, MultiplayerSession

@admin.register(UserScore)
class UserScoreAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'display_name', 'score', 'difficulty', 'created_at']
    list_filter = ['difficulty', 'created_at']
    search_fields = ['user_id', 'display_name']

@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'display_name', 'score', 'difficulty', 'total_questions', 'created_at']
    list_filter = ['difficulty', 'created_at']
    search_fields = ['user_id', 'display_name']

@admin.register(MultiplayerSession)
class MultiplayerSessionAdmin(admin.ModelAdmin):
    list_display = ['join_code', 'session_id', 'status', 'difficulty', 'number_of_players', 'current_players_count', 'created_at', 'start_time']
    list_filter = ['status', 'difficulty', 'created_at']
    search_fields = ['join_code', 'session_id', 'players']
    readonly_fields = ['session_id', 'join_code', 'created_at', 'finished_at']
    
    def current_players_count(self, obj):
        return f"{len(obj.players)}/{obj.number_of_players}"
    current_players_count.short_description = 'Players'