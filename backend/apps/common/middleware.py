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

        response = self.get_response(request)
        return response
