from rest_framework import serializers
from datetime import date, timedelta
from django.db import transaction
from django.contrib.auth import get_user_model
from apps.schools.models import School
from apps.subscriptions.models import SchoolSubscription, SubscriptionPlan
from apps.common.constants import UserRole

User = get_user_model()

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = [
            'id', 'name', 'subdomain', 'email', 'phone', 'address', 'logo', 
            'state', 'city', 'pincode', 'registration_document', 'is_active', 'created_at'
        ]

class SubdomainCheckSerializer(serializers.Serializer):
    subdomain = serializers.SlugField(max_length=100)

    def validate_subdomain(self, value):
        value = value.lower().strip()
        reserved = ['admin', 'api', 'www', 'mail', 'app', 'localhost', 'dashboard']
        if value in reserved:
            raise serializers.ValidationError("This subdomain is reserved.")
        if School.objects.filter(subdomain=value).exists():
            raise serializers.ValidationError("This subdomain is already taken.")
        return value

class SchoolRegistrationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    subdomain = serializers.SlugField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    
    # State, City, Pincode Address fields
    state = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    city = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    pincode = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    
    # Registration Verification Documents File
    registration_document = serializers.FileField(required=False, allow_null=True)

    admin_name = serializers.CharField(max_length=255)
    admin_email = serializers.EmailField()
    admin_password = serializers.CharField(write_only=True, min_length=8)

    def validate_admin_name(self, value):
        from apps.common.utils import clean_name
        return clean_name(value, "Admin Name")

    def validate_subdomain(self, value):
        value = value.lower().strip()
        reserved = ['admin', 'api', 'www', 'mail', 'app', 'localhost', 'dashboard']
        if value in reserved:
            raise serializers.ValidationError("This subdomain is reserved.")
        if School.objects.filter(subdomain=value).exists():
            raise serializers.ValidationError("This subdomain is already taken.")
        return value

    def validate_phone(self, value):
        val = (value or '').strip()
        if val:
            import re
            digits = re.sub(r'[\s\-\(\)\+]', '', val)
            if not re.match(r'^[6-9]\d{9}$', digits):
                raise serializers.ValidationError("Phone number must be a valid 10-digit mobile number starting with 6, 7, 8, or 9.")
            if User.objects.filter(phone=digits).exists():
                raise serializers.ValidationError("A user with this phone number already exists.")
        return val

    def validate_email(self, value):
        if School.objects.filter(email=value).exists():
            raise serializers.ValidationError("A school with this email already exists.")
        return value

    def validate_admin_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        # 1. Create School
        school = School.objects.create(
            name=validated_data['name'],
            subdomain=validated_data['subdomain'].lower(),
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
            state=validated_data.get('state', ''),
            city=validated_data.get('city', ''),
            pincode=validated_data.get('pincode', ''),
            registration_document=validated_data.get('registration_document', None),
            is_active=True
        )

        # 2. Create School Admin User
        admin_name_parts = validated_data['admin_name'].split(' ', 1)
        first_name = admin_name_parts[0]
        last_name = admin_name_parts[1] if len(admin_name_parts) > 1 else ''

        admin_user = User.objects.create_user(
            username=validated_data['admin_email'],
            email=validated_data['admin_email'],
            password=validated_data['admin_password'],
            first_name=first_name,
            last_name=last_name,
            role=UserRole.SCHOOL_ADMIN,
            school=school
        )

        # 3. Create Trial Subscription
        free_plan = SubscriptionPlan.objects.filter(code='starter').first()
        trial_end = date.today() + timedelta(days=14)
        SchoolSubscription.objects.create(
            school=school,
            plan=free_plan,
            status='TRIAL',
            end_date=trial_end
        )

        # 4. Dispatch Welcome Email with Password to Admin
        from django.core.mail import send_mail
        from django.conf import settings

        raw_password = validated_data['admin_password']
        admin_email = validated_data['admin_email']
        admin_full_name = validated_data['admin_name']
        school_name = school.name
        subdomain = school.subdomain

        portal_login_url = f"http://{subdomain}.campus.acharyaworks.in/login"
        local_dev_url = f"http://{subdomain}.localhost:5173/login"

        welcome_email_body = f"""
Welcome to AcharyaCampus Multi-Tenant School OS Platform!

Dear {admin_full_name},

Congratulations! Your school management portal for "{school_name}" has been successfully created and activated.

----------------------------------------------------------------------
🔑 YOUR ADMINISTRATOR LOGIN CREDENTIALS
----------------------------------------------------------------------
School Name       : {school_name}
Subdomain Portal  : {subdomain}.campus.acharyaworks.in
Portal Login URL  : {portal_login_url}
Dev Local URL     : {local_dev_url}

Admin Email       : {admin_email}
Password          : {raw_password}
Role              : School Administrator
Trial Access      : 14-Day Free Trial (Active until {trial_end.strftime('%B %d, %Y')})
----------------------------------------------------------------------

Quick Setup Guide:
1. Open your portal login URL: {local_dev_url}
2. Sign in using your Admin Email and Password shown above.
3. Setup Class Sections, Assign Subjects, and Add Teachers & Students.

For support or custom setup help, contact support.acharyacampus@gmail.com.

Best regards,
AcharyaCampus Systems Team
https://campus.acharyaworks.in
"""

        try:
            send_mail(
                subject=f"🚀 Welcome to AcharyaCampus — Portal Credentials for {school_name}",
                message=welcome_email_body,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', '"AcharyaCampus Platform" <support.acharyacampus@gmail.com>'),
                recipient_list=[admin_email],
                fail_silently=False,
            )

            print(f"[REGISTRATION WELCOME EMAIL] Sent credentials successfully to {admin_email}")
        except Exception as e:
            print(f"[REGISTRATION WELCOME EMAIL SMTP WARNING]: {e}")
            print(f"[CREDENTIALS MESSAGE BODY]:\n{welcome_email_body}")

        return {
            'school': school,
            'admin_user': admin_user
        }

