from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models


class GameAccountManager(BaseUserManager):
    def create_user(self, email_address, username, birthdate, password=None):
        if not email_address:
            raise ValueError('Email is required')
        user = self.model(
            email_address=self.normalize_email(email_address),
            username=username,
            birthdate=birthdate,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    async def acreate_user(self, email_address, username, birthdate, password=None):
        if not email_address:
            raise ValueError('Email is required')
        user = self.model(
            email_address=self.normalize_email(email_address),
            username=username,
            birthdate=birthdate,
        )
        user.set_password(password)
        await user.asave(using=self._db)
        return user

    def create_superuser(self, email_address, username, birthdate, password=None):
        user = self.create_user(email_address, username, birthdate, password)
        user.is_active    = True
        user.is_staff     = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class GameAccount(AbstractBaseUser):
    username      = models.CharField(max_length=150, unique=True)
    email_address = models.EmailField(unique=True)
    birthdate     = models.DateField(null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    is_active     = models.BooleanField(default=True)
    is_staff      = models.BooleanField(default=False)
    is_superuser  = models.BooleanField(default=False)

    objects = GameAccountManager()

    USERNAME_FIELD  = 'email_address'
    REQUIRED_FIELDS = ['username', 'birthdate']

    class Meta:
        db_table = 'game_accounts'

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser