from django.contrib.sessions.backends.db import SessionStore

class SessionIDMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        session_id = request.headers.get('X-Session-Id')
        if session_id:
            request.session = SessionStore(session_key=session_id)
        response = self.get_response(request)
        return response
