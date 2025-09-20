from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.login, name="login"),
    path("callback/", views.callback, name="callback"),
    path("token/", views.get_token, name="get_token"),
    path("profile/", views.get_profile, name="get_profile"),
    path("logout/", views.logout, name="logout"),
    path("search/", views.search, name="search"),
    path("audio-analysis/<str:track_id>/", views.get_audio_analysis, name="get_audio_analysis"),
    path("artist/<str:artist_id>/", views.get_artist_details, name="get_artist_details"),
    path("currently-playing/", views.get_currently_playing, name="get_currently_playing"),
]