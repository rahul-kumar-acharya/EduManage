from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.teachers.views import TeacherProfileViewSet

router = DefaultRouter()
router.register('profiles', TeacherProfileViewSet, basename='teacher-profile')

urlpatterns = [
    path('', include(router.urls)),
]
