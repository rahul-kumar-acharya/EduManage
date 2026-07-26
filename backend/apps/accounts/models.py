from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.common.constants import UserRole

class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=UserRole.CHOICES, default=UserRole.STUDENT)
    school = models.ForeignKey(
        'schools.School',
        on_delete=models.CASCADE,
        related_name='users',
        null=True,
        blank=True
    )
    phone = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.email} ({self.role})"
