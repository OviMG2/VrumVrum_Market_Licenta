from django.utils import timezone

class UserActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
       
        response = self.get_response(request)
       

       
        if request.user.is_authenticated:
            user = request.user
           
            path = request.path
            if not (path.startswith('/static/') or path.startswith('/media/')):
               
                if 'update_activity' not in path:
                    user.last_activity = timezone.now()
                    user.save(update_fields=['last_activity'])

        return response
