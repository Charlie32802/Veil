from django.urls import path
from .views import main_menu

urlpatterns = [
    path('', main_menu),
]