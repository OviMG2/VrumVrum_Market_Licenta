from rest_framework import permissions

class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    
    
    def has_object_permission(self, request, view, obj):
  
        if request.method in permissions.SAFE_METHODS:
            return True
        
      
        if obj.user == request.user:
            return True
        
  
        return request.user.is_authenticated and request.user.is_admin
