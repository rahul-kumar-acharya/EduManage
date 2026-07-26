from django.urls import path
from apps.schools.views import (
    CheckSubdomainView,
    SchoolRegisterView,
    TenantInfoView,
    SchoolListView,
    PublicPlatformStatsView
)

urlpatterns = [
    path('check-subdomain/', CheckSubdomainView.as_view(), name='check-subdomain'),
    path('register/', SchoolRegisterView.as_view(), name='school-register'),
    path('tenant-info/', TenantInfoView.as_view(), name='tenant-info'),
    path('all/', SchoolListView.as_view(), name='school-list'),
    path('public-stats/', PublicPlatformStatsView.as_view(), name='public-stats'),
]
