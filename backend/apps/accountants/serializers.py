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

class AccountantCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    employee_id = serializers.CharField(max_length=50)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        school = self.context['request'].school
        employee_id = attrs.get('employee_id')
        if AccountantProfile.objects.filter(school=school, employee_id=employee_id).exists():
            raise serializers.ValidationError({"employee_id": "An accountant with this Employee ID already exists in your school."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        school = self.context['request'].school

        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
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

        return profile
