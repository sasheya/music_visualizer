import time
from django.shortcuts import redirect
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import requests, base64
import json

SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"

# Define scopes for Spotify API access
SCOPES = "user-read-playback-state user-read-private user-read-currently-playing user-modify-playback-state streaming app-remote-control user-read-email user-read-playback-position user-top-read user-read-recently-played user-library-read user-library-modify"

def login(request):
    redirect_uri = settings.SPOTIFY_REDIRECT_URI
    state = base64.b64encode(str(time.time()).encode()).decode()
    
    # Initialize session if needed
    if not request.session.session_key:
        request.session.create()
    
    # Set the new state and session parameters
    request.session['spotify_auth_state'] = state
    request.session.set_expiry(86400)  # Set session to expire in 24 hours
    request.session.modified = True
    
    # Force save the session
    request.session.save()
    
    url = (
        f"{SPOTIFY_AUTH_URL}"
        f"?client_id={settings.SPOTIFY_CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={redirect_uri}"
        f"&scope={SCOPES}"
        f"&state={state}"
        f"&show_dialog=true"
    )
    return redirect(url)

def callback(request):
    code = request.GET.get("code")
    state = request.GET.get("state")
    
    if not request.session.session_key:
        request.session.create()
    
    stored_state = request.session.get('spotify_auth_state')
    
    if not code or not state or not stored_state or state != stored_state:
        return JsonResponse({"error": "State verification failed"}, status=400)

    auth_header = base64.b64encode(
        f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}".encode()
    ).decode("utf-8")

    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
    }

    res = requests.post(
        SPOTIFY_TOKEN_URL,
        data=payload,
        headers={"Authorization":f"Basic {auth_header}"}
    )

    if res.status_code != 200:
        return JsonResponse({"error": "Failed to obtain token", "details": res.text}, status=res.status_code)

    try:
        token_info = res.json()
    except requests.exceptions.JSONDecodeError:
        return JsonResponse({"error": "Failed to parse token response JSON"}, status=500)

    access_token = token_info.get("access_token")
    refresh_token = token_info.get("refresh_token")
    expires_in = token_info.get("expires_in")

    if not access_token or not refresh_token or not expires_in:
        return JsonResponse({"error": "Missing token information in response"}, status=400)

    request.session["access_token"] = access_token
    request.session["refresh_token"] = refresh_token
    request.session["token_expires"] = int(time.time()) + expires_in
    request.session["logged_in"] = True
    request.session["spotify_user"] = True
    
    request.session.set_expiry(86400)  # Set session to expire in 24 hours
    
    request.session.modified = True
    request.session.save()
    
    session_id = request.session.session_key
    redirect_url = f"/?session_id={session_id}"
    return redirect(redirect_url)

def refresh_token(request):
    refresh_token = request.session.get("refresh_token")
    if not refresh_token:
        return JsonResponse({"error": "User not logged in."}, status=401)

    access_token = request.session.get("access_token")
    expires_at = request.session.get("token_expires", 0)

    payload = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }

    auth_header = base64.b64encode(f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}".encode()).decode("utf-8")

    res = requests.post(
        SPOTIFY_TOKEN_URL,
        data=payload,
        headers={"Authorization": f"Basic {auth_header}"},
    )

    if res.status_code != 200:
        return JsonResponse({"error": "Failed to refresh token"}, status=400)
            
    token_info = res.json()

    access_token = token_info["access_token"]
    expires_in = token_info.get("expires_in", 3600)

    request.session["access_token"] = access_token
    request.session["token_expires"] = int(time.time()) + expires_in
    
    return JsonResponse({"access_token": access_token})

def get_token(request):
    print("Token request received")
    print(f"Session ID: {request.session.session_key}")
    print("Session keys available:", list(request.session.keys()))
    
    # First check for existing valid token
    access_token = request.session.get("access_token")
    token_expires = request.session.get("token_expires", 0)
    refresh_token = request.session.get("refresh_token")
    
    print(f"Current time: {int(time.time())}, Token expires: {token_expires}")
    print(f"Session contains access token: {'Yes' if access_token else 'No'}")
    print(f"Session contains refresh token: {'Yes' if refresh_token else 'No'}")
    
    # If we have a valid access token that hasn't expired
    current_time = int(time.time())
    if access_token and token_expires and current_time < token_expires:
        print("Returning existing valid token")
        return JsonResponse({
            "access_token": access_token,
            "expires_in": token_expires - current_time
        })
    
    # No valid token, try to refresh
    if not refresh_token:
        print("No refresh token found in session")
        return JsonResponse({"error": "No refresh token"}, status=401)
    
    print("Attempting to refresh token")
    auth_header = base64.b64encode(f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}".encode()).decode("utf-8")

    payload = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }

    res = requests.post(
        SPOTIFY_TOKEN_URL,
        data=payload,
        headers={"Authorization": f"Basic {auth_header}"}
    )

    if res.status_code != 200:
        print(f"Token refresh failed with status {res.status_code}")
        print(f"Response: {res.text}")
        return JsonResponse({"error": "Failed to refresh token"}, status=400)
    
    token_info = res.json()
    new_access_token = token_info["access_token"]
    expires_in = token_info.get("expires_in", 3600)
    new_expires_at = int(time.time()) + expires_in
    
    # Update session with new token info
    request.session["access_token"] = new_access_token
    request.session["token_expires"] = new_expires_at
    if "refresh_token" in token_info:
        request.session["refresh_token"] = token_info["refresh_token"]
    
    request.session.modified = True
    
    print("Token refreshed successfully")
    print(f"New token expires in {expires_in} seconds")
    print(f"Session ID after refresh: {request.session.session_key}")

    return JsonResponse({
        "access_token": new_access_token,
        "expires_in": expires_in
    })

@csrf_exempt
def get_profile(request):
    access_token = request.session.get("access_token")
    if not access_token:
        return JsonResponse({
            "error": "Not logged in",
        }, status=401)
    
    res = requests.get(
        "https://api.spotify.com/v1/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    if res.status_code == 401:
        refresh_response = refresh_token(request)
        if refresh_response.status_code == 200:
            new_token = json.loads(refresh_response.content).get('access_token')
            res = requests.get(
                "https://api.spotify.com/v1/me",
                headers={"Authorization": f"Bearer {new_token}"}
            )
    
    if res.status_code != 200:
        return JsonResponse({"error": f"Failed to fetch profile: {res.text}"}, status=res.status_code)
    
    return JsonResponse(res.json())

def logout(request):
    request.session.flush()
    return JsonResponse({"status" : "logged_out"})

import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def refresh_spotify_token(request):
    refresh_token = request.session.get("refresh_token")
    if not refresh_token:
        return None

    auth_header = base64.b64encode(
        f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}".encode()
    ).decode("utf-8")

    response = requests.post(
        SPOTIFY_TOKEN_URL,
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        },
        headers={"Authorization": f"Basic {auth_header}"},
    )

    if response.status_code == 200:
        tokens = response.json()
        request.session["access_token"] = tokens["access_token"]
        if "refresh_token" in tokens:
            request.session["refresh_token"] = tokens["refresh_token"]
        return tokens["access_token"]
    return None

def get_audio_analysis(request, track_id):
    access_token = request.session.get("access_token")
    if not access_token:
        return JsonResponse({"error": "Not logged in"}, status=401)
    
    try:
        res = requests.get(
            f"https://api.spotify.com/v1/audio-analysis/{track_id}",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if res.status_code != 200:
            return JsonResponse({
                "error": "Failed to get audio analysis",
                "details": res.text
            }, status=res.status_code)
            
        return JsonResponse(res.json())
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse(res.json())

@csrf_exempt
def search(request):
    query = request.GET.get("query")
    if not query:
        return JsonResponse({"error": "Query not provided"}, status=400)

    access_token = request.session.get("access_token")
    if not access_token:
        return JsonResponse({"error": "Not logged in"}, status=401)

    res = requests.get(
        "https://api.spotify.com/v1/search",
        headers={"Authorization": f"Bearer {access_token}"},
        params={"q": query, "type": "track"}
    )

    if res.status_code != 200:
        return JsonResponse({"error": "Failed to search songs"}, status=res.status_code)

    return JsonResponse(res.json()["tracks"])

def get_artist_details(request, artist_id):
    access_token = request.session.get("access_token")
    if not access_token:
        return JsonResponse({"error": "Not logged in"}, status=401)

    res = requests.get(
        f"https://api.spotify.com/v1/artists/{artist_id}",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    if res.status_code == 401:
        refresh_response = refresh_token(request)
        if refresh_response.status_code == 200:
            new_token = json.loads(refresh_response.content).get('access_token')
            res = requests.get(
                f"https://api.spotify.com/v1/artists/{artist_id}",
                headers={"Authorization": f"Bearer {new_token}"}
            )

    if res.status_code != 200:
        return JsonResponse({"error": "Failed to get artist details"}, status=res.status_code)

    return JsonResponse(res.json())

@csrf_exempt
def get_currently_playing(request):
    access_token = request.session.get("access_token")
    if not access_token:
        return JsonResponse({"error": "Not logged in"}, status=401)

    res = requests.get(
        "https://api.spotify.com/v1/me/player/currently-playing",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    if res.status_code != 200:
        return JsonResponse({"error": "Failed to get currently playing track"}, status=res.status_code)

    return JsonResponse(res.json())
