import json
import datetime
import os

from asgiref.sync import sync_to_async
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.conf import settings

from .models import GameAccount

_authenticate = sync_to_async(authenticate, thread_sensitive=True)
_login        = sync_to_async(login,        thread_sensitive=True)
_logout       = sync_to_async(logout,       thread_sensitive=True)


@sync_to_async
def _get_username(request):
    if request.user.is_authenticated:
        return request.user.username
    return None


async def index(request):
    return render(request, 'index.html', {
        'GOOGLE_CLIENT_ID': settings.GOOGLE_CLIENT_ID,
    })


async def register_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data      = json.loads(request.body)
        username  = data.get('username', '').strip()
        email     = data.get('email', '').strip().lower()
        password  = data.get('password', '')
        confirm   = data.get('confirm', '')
        month     = data.get('month')
        day       = data.get('day')
        year      = data.get('year')

        if not all([username, email, password, confirm, month, day, year]):
            return JsonResponse({'error': 'All fields are required.'}, status=400)

        if password != confirm:
            return JsonResponse({'error': 'Passwords do not match.'}, status=400)

        if len(password) < 8:
            return JsonResponse({'error': 'Password must be at least 8 characters.'}, status=400)

        try:
            birthdate = datetime.date(int(year), int(month), int(day))
        except (ValueError, TypeError):
            return JsonResponse({'error': 'Invalid birthdate.'}, status=400)

        if await GameAccount.objects.filter(email_address=email).aexists():
            return JsonResponse({'error': 'Email is already registered.'}, status=400)

        if await GameAccount.objects.filter(username=username).aexists():
            return JsonResponse({'error': 'Username is already taken.'}, status=400)

        user = await GameAccount.objects.acreate_user(
            email_address=email,
            username=username,
            birthdate=birthdate,
            password=password,
        )
        await _login(request, user,
                     backend='django.contrib.auth.backends.ModelBackend')

        return JsonResponse({'success': True, 'username': user.username})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid request.'}, status=400)
    except Exception as exc:
        return JsonResponse({'error': str(exc)}, status=500)


async def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data     = json.loads(request.body)
        email    = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return JsonResponse({'error': 'Email and password are required.'}, status=400)

        user = await _authenticate(request, username=email, password=password)

        if user is None:
            return JsonResponse({'error': 'Invalid email or password.'}, status=401)

        await _login(request, user)
        return JsonResponse({'success': True, 'username': user.username})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid request.'}, status=400)
    except Exception as exc:
        return JsonResponse({'error': str(exc)}, status=500)


async def logout_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    await _logout(request)
    return JsonResponse({'success': True})


async def main_menu(request):
    username = await _get_username(request)
    if username is None:
        return redirect('/?modal=login')
    return render(request, 'main_menu.html', {'username': username})


async def google_auth_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data  = json.loads(request.body)
        token = data.get('access_token', '')
        action = data.get('action', 'signup')

        if not token:
            return JsonResponse({'error': 'Missing access token.'}, status=400)

        import urllib.request
        import json as stdjson

        req = urllib.request.Request(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {token}'}
        )
        try:
            with urllib.request.urlopen(req) as response:
                idinfo = stdjson.loads(response.read().decode())
        except Exception as e:
            return JsonResponse({'error': 'Invalid Google token or network error.'}, status=401)

        email      = idinfo.get('email', '').lower()
        given_name = idinfo.get('given_name', '')
        family_name = idinfo.get('family_name', '')
        google_name = f"{given_name} {family_name}".strip() or email.split('@')[0]

        if not email:
            return JsonResponse({'error': 'Could not retrieve email from Google.'}, status=400)

        existing = await GameAccount.objects.filter(email_address=email).afirst()

        if action == 'login':
            if not existing:
                return JsonResponse({'error': 'Account not found. Please sign up first.'}, status=404)
            await _login(request, existing, backend='django.contrib.auth.backends.ModelBackend')
            return JsonResponse({'success': True, 'username': existing.username, 'new': False})

        if existing:
            return JsonResponse({'error': 'Email is already registered. Please log in.'}, status=400)

        base_username = google_name[:20]
        username      = base_username
        counter       = 1
        while await GameAccount.objects.filter(username=username).aexists():
            username = f'{base_username}{counter}'
            counter += 1

        user = await GameAccount.objects.acreate_user(
            email_address=email,
            username=username,
            birthdate=None,
            password=None,
        )
        user.set_unusable_password()
        await sync_to_async(user.save, thread_sensitive=True)()

        return JsonResponse({'success': True, 'username': user.username, 'new': True})

    except ValueError as exc:
        return JsonResponse({'error': 'Invalid Google token.'}, status=401)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid request.'}, status=400)
    except Exception as exc:
        return JsonResponse({'error': str(exc)}, status=500)