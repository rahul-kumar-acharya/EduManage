from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.attendance.views import StudentAttendanceViewSet

router = DefaultRouter()
router.register('records', StudentAttendanceViewSet, basename='attendance-record')

urlpatterns = [
    path('', include(router.urls)),
]
