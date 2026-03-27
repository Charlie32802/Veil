from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('menu/', views.main_menu, name='main_menu'),
    path('auth/google/', views.google_auth_view, name='google_auth'),
]