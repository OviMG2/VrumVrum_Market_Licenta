from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, real_name=None, **extra_fields):
        if not email:
            raise ValueError('Adresa de email este obligatorie')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, real_name=real_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, real_name=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True)
        
        return self.create_user(username, email, password, real_name, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    phone_validator = RegexValidator(
        regex=r'^\+?07\d{8}$', 
        message="Introduceți un număr de telefon valid românesc."
    )

    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    real_name = models.CharField(max_length=100)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    bio = models.TextField(blank=True, null=True)
    is_superuser = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Adăugăm field pentru ultima activitate
    last_activity = models.DateTimeField(default=timezone.now)
    
    # Noile câmpuri adăugate
    phone_number = models.CharField(
        max_length=15, 
        blank=True, 
        null=True, 
        validators=[phone_validator]
    )
    display_name = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    county = models.CharField(max_length=100, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    show_email = models.BooleanField(default=True)
    show_phone = models.BooleanField(default=True)
    
    # Adăugare related_name pentru a rezolva conflictele
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='user_custom_set',  # Nume personalizat
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='user_custom_set',  # Nume personalizat
        related_query_name='user',
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'real_name']

    def __str__(self):
        return self.username
    
    def update_activity(self):
        """Actualizează timestamp-ul ultimei activități"""
        self.last_activity = timezone.now()
        self.save(update_fields=['last_activity'])
    
    @property
    def is_online(self):
        """Verifică dacă utilizatorul este online (activitate în ultimele 2 minute)"""
        if not self.last_activity:
            return False
        
        now = timezone.now()
        two_minutes_ago = now - timezone.timedelta(minutes=2)
        return self.last_activity > two_minutes_ago
    
    class Meta:
        db_table = 'users'