from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/accounts/', include('apps.accounts.urls')),
    path('api/v1/schools/', include('apps.schools.urls')),
    path('api/v1/subscriptions/', include('apps.subscriptions.urls')),
    path('api/v1/academics/', include('apps.academics.urls')),
    path('api/v1/students/', include('apps.students.urls')),
    path('api/v1/teachers/', include('apps.teachers.urls')),
    path('api/v1/accountants/', include('apps.accountants.urls')),
    path('api/v1/attendance/', include('apps.attendance.urls')),
    path('api/v1/homework/', include('apps.homework.urls')),
    path('api/v1/timetable/', include('apps.timetable.urls')),
    path('api/v1/exams/', include('apps.exams.urls')),
    path('api/v1/fees/', include('apps.fees.urls')),
    path('api/v1/notices/', include('apps.notices.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
