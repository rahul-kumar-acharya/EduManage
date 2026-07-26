from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.homework.views import HomeworkAssignmentViewSet

router = DefaultRouter()
router.register('assignments', HomeworkAssignmentViewSet, basename='homework-assignment')

urlpatterns = [
    path('', include(router.urls)),
]
