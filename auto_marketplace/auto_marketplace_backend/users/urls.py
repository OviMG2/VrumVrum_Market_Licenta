from django.urls import path
from . import views
from .views import RegisterView, LoginView, LogoutView, UserProfileView, update_profile, update_activity, UserDetailView

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('users/profile/', views.update_profile, name='update_profile'),
    path('update_profile/', update_profile, name='update_profile'),
    path('update_activity/', update_activity, name='update_activity'),
    
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    
    
    path('admin/users/<int:pk>/', views.AdminUserEditView.as_view(), name='admin-user-edit'),
    path('admin/users/<int:pk>/toggle-admin/', views.toggle_admin_status, name='toggle-admin-status'),
    path('admin/users/<int:pk>/toggle-active/', views.toggle_active_status, name='toggle-active-status'),
    path('admin/users/<int:pk>/delete/', views.delete_user, name='delete-user'),
    path('admin/users/<int:pk>/reset-password/', views.reset_user_password, name='reset-user-password'),

]
