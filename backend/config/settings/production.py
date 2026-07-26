from .base import *

DEBUG = False

ALLOWED_HOSTS = [os.getenv('MAIN_DOMAIN', 'edumanage.acharyaworks.in'), f".{os.getenv('MAIN_DOMAIN', 'edumanage.acharyaworks.in')}"]

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    f"https://{os.getenv('MAIN_DOMAIN', 'edumanage.acharyaworks.in')}",
]
