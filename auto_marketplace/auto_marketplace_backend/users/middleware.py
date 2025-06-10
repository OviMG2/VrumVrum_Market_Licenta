from django.utils import timezone

class UserActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Cod executat pentru fiecare request înainte de view
        response = self.get_response(request)
        # Cod executat pentru fiecare request după view

        # Actualizează timestamp-ul de activitate pentru utilizatorii autentificați
        if request.user.is_authenticated:
            user = request.user
            # Excludem cererile pentru fișiere statice și media, adica pentru cele pe care browserul le incarca, ca sa nu incarce mai multe cand e necesar una doar
            path = request.path
            if not (path.startswith('/static/') or path.startswith('/media/')):
                # Eliminăm și cererile pentru update_activity pentru a evita recursivitatea
                if 'update_activity' not in path:
                    user.last_activity = timezone.now()
                    user.save(update_fields=['last_activity'])

        return response