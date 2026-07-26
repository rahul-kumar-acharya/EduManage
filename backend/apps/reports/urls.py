from django.urls import path
from apps.reports.views import OverviewReportView

urlpatterns = [
    path('overview/', OverviewReportView.as_view(), name='report-overview'),
]
