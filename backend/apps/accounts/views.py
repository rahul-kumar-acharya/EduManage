from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.accounts.serializers import CustomTokenObtainPairSerializer, UserSerializer
from django.contrib.auth import get_user_model
from apps.common.permissions import IsSuperAdmin
import re

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        password = request.data.get('password')
        email = request.data.get('email')
        phone = request.data.get('phone')
        user = self.get_object()

        if email and email.lower() != user.email.lower():
            if User.objects.filter(email__iexact=email).exists():
                return Response({'email': ['A user with this email address already exists.']}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email
            user.username = email
            user.save()

        if phone:
            digits = re.sub(r'[\s\-\(\)\+]', '', phone)
            if not re.match(r'^[6-9]\d{9}$', digits):
                return Response({'phone': ['Phone number must be a valid 10-digit mobile number starting with 6, 7, 8, or 9.']}, status=status.HTTP_400_BAD_REQUEST)

        if password:
            if len(password) < 8:
                return Response({'password': ['Password must be at least 8 characters long.']}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(password)
            user.save()

        return super().update(request, *args, **kwargs)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        

class SuperAdminListView(generics.ListAPIView):
    queryset = User.objects.filter(role='SUPER_ADMIN').order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsSuperAdmin]

class CreateSuperAdminView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        email = request.data.get('email', '').strip()
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        password = request.data.get('password', '').strip()

        if not email or not password or not first_name:
            return Response({'error': 'First name, email, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email__iexact=email).exists():
            return Response({'error': 'A user account with this email address already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        admin = User.objects.create_superuser(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            username=email
        )
        return Response({
            'message': f"Super Admin '{admin.get_full_name()}' provisioned successfully.",
            'user': UserSerializer(admin).data
        }, status=status.HTTP_201_CREATED)

