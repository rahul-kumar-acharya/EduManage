from django.db import models
from apps.common.models import TimeStampedModel

class School(TimeStampedModel):
    name = models.CharField(max_length=255)
    subdomain = models.SlugField(max_length=100, unique=True, db_index=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    logo = models.ImageField(upload_to='school_logos/', null=True, blank=True)
    
    # State, City, Pincode Address fields
    state = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=20, blank=True)
    
    # School Registration Verification Documents
    registration_document = models.FileField(upload_to='school_documents/', null=True, blank=True)
    
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.subdomain})"

class ContactInquiry(TimeStampedModel):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Inquiry from {self.name} ({self.email})"

