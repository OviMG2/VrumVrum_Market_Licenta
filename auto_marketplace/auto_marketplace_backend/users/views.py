from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from django.db.models import Count
from django.utils import timezone
from .serializers import UserSerializer, RegisterSerializer, UserUpdateSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from django.utils import timezone
from listings.models import CarListing
from datetime import timedelta


class IsAdminUser(permissions.BasePermission):
   
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin



class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(email=email, password=password)
        
        if user:
            
            user.last_login = timezone.now()
            user.last_activity = timezone.now()
            user.save(update_fields=['last_login', 'last_activity'])
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        
        return Response({'error': 'Credențiale invalide'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)



class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserUpdateSerializer
    
    def get_object(self):
       
        user = self.request.user
        user.update_activity()
        return user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(UserSerializer(instance).data)


class UserDetailView(generics.RetrieveAPIView):
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
    
        return [permissions.AllowAny()]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
      
        is_owner = request.user.is_authenticated and request.user.id == instance.id
        
        if not is_owner and not (request.user.is_authenticated and request.user.is_admin):
           
            if not instance.show_email:
                data['email'] = None
            
            if not instance.show_phone:
                data['phone_number'] = None
        
        return Response(data)



class AdminUserEditView(generics.RetrieveUpdateDestroyAPIView):
    
    queryset = User.objects.all()
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAdminUser]
    
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)  
        instance = self.get_object()
        
       
        if instance.id == request.user.id:
            
            if 'is_admin' in request.data and not request.data.get('is_admin'):
                return Response(
                    {"detail": "Nu puteți retrage propriile drepturi de administrator."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
          
            if 'is_active' in request.data and not request.data.get('is_active'):
                return Response(
                    {"detail": "Nu puteți dezactiva propriul cont."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
       
        return Response(UserSerializer(instance).data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        
        if instance.id == request.user.id:
            return Response(
                {"detail": "Nu puteți șterge propriul cont."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        username = instance.username
        self.perform_destroy(instance)
        
        return Response({
            "status": "success",
            "detail": f"Utilizatorul {username} a fost șters cu succes."
        })



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    user.update_activity()  
    
    serializer = UserUpdateSerializer(user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_activity(request):

    user = request.user
    
    if not request.auth:
        return Response(
            {'detail': 'Token expirat', 'code': 'token_expired'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    user.last_activity = timezone.now()
    user.save(update_fields=['last_activity'])
    return Response({'status': 'success'}, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAdminUser])
def reset_user_password(request, pk):
    
    try:
        user = User.objects.get(pk=pk)
        password = request.data.get('password')
        
        if not password:
            return Response(
                {"detail": "Parola este obligatorie."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(password)
        user.save()
        
        return Response({
            "status": "success",
            "detail": f"Parola utilizatorului {user.username} a fost resetată cu succes."
        })
    except User.DoesNotExist:
        return Response(
            {"detail": "Utilizatorul nu a fost găsit."},
            status=status.HTTP_404_NOT_FOUND
        )



@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
  
  
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    admin_users = User.objects.filter(is_admin=True).count()
    
    
    week_ago = timezone.now() - timedelta(days=7)
    new_users = User.objects.filter(created_at__gte=week_ago).count()
    
    
    recently_active = User.objects.filter(last_activity__gte=week_ago).count()
    

    total_listings = CarListing.objects.count()
    
 
    listings_by_brand = list(CarListing.objects.values('brand').annotate(count=Count('brand')).order_by('-count'))
    

    price_ranges = [
        {'range': '0-5000', 'count': CarListing.objects.filter(price__lte=5000).count()},
        {'range': '5001-10000', 'count': CarListing.objects.filter(price__gt=5000, price__lte=10000).count()},
        {'range': '10001-20000', 'count': CarListing.objects.filter(price__gt=10000, price__lte=20000).count()},
        {'range': '20001-50000', 'count': CarListing.objects.filter(price__gt=20000, price__lte=50000).count()},
        {'range': '50001+', 'count': CarListing.objects.filter(price__gt=50000).count()},
    ]
    
  
    fuel_types = list(CarListing.objects.values('fuel_type').annotate(count=Count('fuel_type')).order_by('-count'))

    recent_listings = CarListing.objects.filter(created_at__gte=week_ago).count()
    
    return Response({
        'users': {
            'total': total_users,
            'active': active_users,
            'admins': admin_users,
            'new_last_week': new_users,
            'active_last_week': recently_active
        },
        'listings': {
            'total': total_listings,
            'recent': recent_listings,
            'by_brand': listings_by_brand,
            'by_price': price_ranges,
            'by_fuel': fuel_types
        },
        'timestamp': timezone.now()
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_list(request):
   
    users = User.objects.all().order_by('-created_at')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def toggle_admin_status(request, pk):
    
    try:
        user = User.objects.get(pk=pk)
        
       
        if user.id == request.user.id:
            return Response(
                {"detail": "Nu puteți modifica propriul statut de administrator."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_admin = not user.is_admin
        user.save()
        
        return Response({
            "status": "success",
            "is_admin": user.is_admin
        })
    except User.DoesNotExist:
        return Response(
            {"detail": "Utilizatorul nu a fost găsit."},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def toggle_active_status(request, pk):
    
    try:
        user = User.objects.get(pk=pk)
        

        if user.id == request.user.id:
            return Response(
                {"detail": "Nu puteți dezactiva propriul cont."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_active = not user.is_active
        user.save()
        
        return Response({
            "status": "success",
            "is_active": user.is_active
        })
    except User.DoesNotExist:
        return Response(
            {"detail": "Utilizatorul nu a fost găsit."},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, pk):
    
    try:
        user = User.objects.get(pk=pk)
        
        
        if user.id == request.user.id:
            return Response(
                {"detail": "Nu puteți șterge propriul cont."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        username = user.username
        
        
        
        
        from django.db import connection
        
    
        def safe_execute(cursor, table_name, sql):
         
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = %s
            """, [table_name])
            
            if cursor.fetchone()[0] == 1:
             
                cursor.execute(sql)
        
        with connection.cursor() as cursor:
           
            safe_execute(
                cursor, 
                "user_interactions", 
                f"DELETE FROM user_interactions WHERE user_id = {user.id}"
            )
            
         
            safe_execute(
                cursor, 
                "favorites", 
                f"DELETE FROM favorites WHERE user_id = {user.id}"
            )
            
          
            safe_execute(
                cursor, 
                "car_images", 
                f"""
                DELETE FROM car_images 
                WHERE car_listing_id IN (
                    SELECT id FROM car_listings WHERE user_id = {user.id}
                )
                """
            )
            
            
            safe_execute(
                cursor, 
                "car_features", 
                f"""
                DELETE FROM car_features 
                WHERE car_listing_id IN (
                    SELECT id FROM car_listings WHERE user_id = {user.id}
                )
                """
            )
            
            
            safe_execute(
                cursor, 
                "car_listings", 
                f"DELETE FROM car_listings WHERE user_id = {user.id}"
            )
            
    
            cursor.execute(f"DELETE FROM users WHERE id = {user.id}")
        
        
        
        return Response({
            "status": "success",
            "detail": f"Utilizatorul {username} a fost șters cu succes."
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {"detail": "Utilizatorul nu a fost găsit."},
            status=status.HTTP_404_NOT_FOUND
        )
