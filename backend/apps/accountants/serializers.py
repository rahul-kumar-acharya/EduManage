from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import get_user_model
from apps.accountants.models import AccountantProfile
from apps.accounts.serializers import UserSerializer
from apps.common.constants import UserRole

User = get_user_model()

class AccountantProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    phone = serializers.CharField(source='user.phone', required=False, allow_blank=True)
    is_active = serializers.BooleanField(source='user.is_active', required=False)

    class Meta:
        model = AccountantProfile
        fields = ['id', 'user', 'employee_id', 'first_name', 'last_name', 'phone', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        employee_id = attrs.get('employee_id')
        if employee_id:
            school = self.instance.school if self.instance else self.context['request'].school
            qs = AccountantProfile.objects.filter(school=school, employee_id=employee_id)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"employee_id": "An accountant with this Employee ID already exists in your school."})
        return attrs

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        if user_data:
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

import secrets
import string
import re
import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

class AccountantCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    employee_id = serializers.CharField(max_length=50)

    def validate_email(self, value):
        email_clean = value.strip().lower()
        if User.objects.filter(email=email_clean).exists():
            raise serializers.ValidationError("A user with this official email already exists.")
        return email_clean

    def validate_phone(self, value):
        if value:
            digits = re.sub(r'[\s\-\(\)\+]', '', value)
            if not re.match(r'^[6-9]\d{9}$', digits):
                raise serializers.ValidationError("Phone number must be a valid 10-digit mobile number starting with 6, 7, 8, or 9.")
        return value

    def validate_employee_id(self, value):
        clean = re.sub(r'^act-?\s*', '', value, flags=re.IGNORECASE).strip()
        if not clean.isdigit():
            raise serializers.ValidationError("Employee ID must contain valid numbers (e.g. ACT-101).")
        return f"ACT-{clean}"

    def validate(self, attrs):
        school = self.context['request'].school
        employee_id = attrs.get('employee_id')
        if AccountantProfile.objects.filter(school=school, employee_id=employee_id).exists():
            raise serializers.ValidationError({"employee_id": f"Accountant with Employee ID '{employee_id}' already exists in your school."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        school = self.context['request'].school
        raw_password = validated_data.get('password')
        if not raw_password:
            raw_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))

        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=raw_password,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data.get('phone', ''),
            role=UserRole.ACCOUNTANT,
            school=school
        )

        profile = AccountantProfile.objects.create(
            school=school,
            user=user,
            employee_id=validated_data['employee_id']
        )

        # Dispatch welcome email with temporary password & login URL
        try:
            school_name = school.name if school else "EduManage School"
            login_url = f"http://{school.subdomain}.localhost:5173/login" if (school and school.subdomain) else "http://localhost:5173/login"
            
            subject = f"Welcome to {school_name} — Your Accountant Login Credentials"
            message = (
                f"Dear {user.first_name} {user.last_name},\n\n"
                f"Welcome to {school_name}! Your school accountant account has been registered successfully.\n\n"
                f"ACCOUNT CREDENTIALS:\n"
                f"• Official Email: {user.email}\n"
                f"• Employee ID: {profile.employee_id}\n"
                f"• Temporary Password: {raw_password}\n\n"
                f"LOGIN PORTAL LINK:\n"
                f"{login_url}\n\n"
                f"INSTRUCTIONS:\n"
                f"1. Open the login portal link above.\n"
                f"2. Log in using your official email and temporary password.\n"
                f"3. Go to Profile Settings to update your password for security.\n\n"
                f"Best regards,\n"
                f"{school_name} Administration"
            )
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL or 'noreply@edumanage.com',
                recipient_list=[user.email],
                fail_silently=True
            )
        except Exception as e:
            logger.error(f"Failed to send accountant welcome email: {e}")

        return profile

