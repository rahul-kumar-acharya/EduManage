from django.contrib import admin
from apps.teachers.models import TeacherProfile

@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'employee_id', 'department', 'qualification', 'school')
    list_filter = ('department', 'school')
    search_fields = ('employee_id', 'user__first_name', 'user__last_name', 'user__email')
