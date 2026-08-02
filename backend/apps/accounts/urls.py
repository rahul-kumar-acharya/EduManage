from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.accounts.views import (
    CustomTokenObtainPairView,
    UserProfileView,
    LogoutView,
    SuperAdminListView,
    CreateSuperAdminView
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
    path('logout/', LogoutView.as_view(), name='user_logout'),
    path('super-admins/', SuperAdminListView.as_view(), name='super_admin_list'),
    path('create-super-admin/', CreateSuperAdminView.as_view(), name='create_super_admin'),
]

