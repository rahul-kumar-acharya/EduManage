from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.students.views import StudentProfileViewSet

router = DefaultRouter()
router.register('profiles', StudentProfileViewSet, basename='student-profile')

urlpatterns = [
    path('', include(router.urls)),
]
