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

    def validate_subdomain(self, value):
        value = value.lower().strip()
        reserved = ['admin', 'api', 'www', 'mail', 'app', 'localhost', 'dashboard']
        if value in reserved:
            raise serializers.ValidationError("This subdomain is reserved.")
        if School.objects.filter(subdomain=value).exists():
            raise serializers.ValidationError("This subdomain is already taken.")
        return value

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
        SchoolSubscription.objects.create(
            school=school,
            plan=free_plan,
            status='TRIAL',
            end_date=date.today() + timedelta(days=14)
        )

        return {
            'school': school,
            'admin_user': admin_user
        }
