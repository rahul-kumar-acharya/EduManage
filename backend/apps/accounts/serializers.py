from rest_framework import serializers, exceptions
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from apps.schools.models import School
from apps.common.constants import UserRole

User = get_user_model()

class SchoolMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['id', 'name', 'subdomain', 'logo', 'email']

class UserSerializer(serializers.ModelSerializer):
    school = SchoolMinimalSerializer(read_only=True)
    permissions = serializers.SerializerMethodField()
    class_teacher_sections = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'school', 'phone', 'profile_picture', 'is_active', 'date_joined', 'permissions', 'class_teacher_sections']
        read_only_fields = ['id', 'date_joined']

    def get_permissions(self, obj):
        from apps.common.permissions import get_user_permissions
        return get_user_permissions(obj)

    def get_class_teacher_sections(self, obj):
        if obj.role == 'TEACHER' and hasattr(obj, 'teacher_profile'):
            return [
                {
                    "id": sec.id,
                    "class_level_id": sec.class_level.id,
                    "class_level_name": sec.class_level.name,
                    "section_name": sec.name
                }
                for sec in obj.teacher_profile.assigned_sections.all()
            ]
        return []

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email', '').strip()
        password = attrs.get('password', '')
        
        request = self.context.get('request')
        portal_type = request.data.get('portal_type', 'school') if request else 'school'
        selected_role = request.data.get('selected_role', 'ADMIN') if request else 'ADMIN'

        # 1. Authenticate user & check password
        user = User.objects.filter(email__iexact=email).first()
        if not user or not user.check_password(password):
            raise exceptions.AuthenticationFailed('Invalid email address or password. Please verify your credentials and try again.')

        if not user.is_active:
            raise exceptions.AuthenticationFailed('This user account is inactive. Please contact support.')

        # 2. Portal & Role Validation (Backend Driven)
        if portal_type == 'super_admin':
            if user.role != UserRole.SUPER_ADMIN:
                raise exceptions.PermissionDenied('Access Denied: School users must sign in via the School Login portal.')
        else: # School Portal
            if user.role == UserRole.SUPER_ADMIN:
                raise exceptions.PermissionDenied('Please use the Super Admin portal to sign in.')

            # Role alignment check
            if selected_role == 'ADMIN' and user.role != UserRole.SCHOOL_ADMIN:
                raise exceptions.PermissionDenied('Access Denied: This account does not have School Admin privileges.')
            elif selected_role == 'TEACHER' and user.role != UserRole.TEACHER:
                raise exceptions.PermissionDenied('Access Denied: This account does not have Faculty privileges.')
            elif selected_role == 'ACCOUNTANT' and user.role != UserRole.ACCOUNTANT:
                raise exceptions.PermissionDenied('Access Denied: This account does not have Accountant privileges.')
            elif selected_role == 'STUDENT' and user.role not in [UserRole.STUDENT, UserRole.PARENT]:
                raise exceptions.PermissionDenied('Access Denied: This account is not registered as a Student or Parent.')

        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

