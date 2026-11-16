from apps.common.utils import extract_subdomain

class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.school = None
        subdomain = request.headers.get('X-Tenant-Subdomain') or extract_subdomain(request.get_host())

        if subdomain:
            try:
                from apps.schools.models import School
                request.school = School.objects.filter(subdomain=subdomain, is_active=True).first()
            except Exception:
                request.school = None

        # Fallback to authenticated user's school if header/subdomain was omitted
        if not request.school:
            auth_header = request.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                token_str = auth_header.split(' ')[1]
                try:
                    from rest_framework_simplejwt.tokens import AccessToken
                    from django.contrib.auth import get_user_model
                    token = AccessToken(token_str)
                    user_id = token.get('user_id')
                    if user_id:
                        User = get_user_model()
                        user = User.objects.select_related('school').filter(id=user_id).first()
                        if user and user.school and user.school.is_active:
                            request.school = user.school
                except Exception:
                    pass

        response = self.get_response(request)
        return response
