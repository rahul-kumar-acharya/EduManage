import os
from .base import *

DEBUG = False

# Allowed Hosts for Production
# Allows campus.acharyarahul.in, api.campus.acharyarahul.in, all school subdomains (*.campus.acharyarahul.in),
# Render's internal health check domain (*.onrender.com), and localhost.
custom_hosts = [h.strip() for h in os.getenv('ALLOWED_HOSTS', '').split(',') if h.strip()]
ALLOWED_HOSTS = [
    'campus.acharyarahul.in',
    '.campus.acharyarahul.in',
    'api.campus.acharyarahul.in',
    '.onrender.com',
    'localhost',
    '127.0.0.1',
] + custom_hosts

# CORS Settings for Production
# Allows the main frontend, all tenant subdomains, and Vercel preview/deployment domains.
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "https://campus.acharyarahul.in",
    "https://api.campus.acharyarahul.in",
]
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://([a-zA-Z0-9-]+\.)*campus\.acharyarahul\.in$",
    r"^https://([a-zA-Z0-9-]+\.)*vercel\.app$",
]

# CSRF Trusted Origins for Django Admin on Render & Custom Domains
CSRF_TRUSTED_ORIGINS = [
    "https://campus.acharyarahul.in",
    "https://*.campus.acharyarahul.in",
    "https://api.campus.acharyarahul.in",
    "https://*.onrender.com",
    "https://*.vercel.app",
]

# Tell Django to trust the X-Forwarded-Proto header from Render's reverse proxy for HTTPS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
