from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return 'ADMIN' in (request.user.roles or [request.user.role])

class IsFrontDesk(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        roles = request.user.roles or [request.user.role]
        return any(role in ['ADMIN', 'FRONT_DESK'] for role in roles)

class IsWaiter(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        roles = request.user.roles or [request.user.role]
        return any(role in ['ADMIN', 'WAITER'] for role in roles)

class IsKitchenStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        roles = request.user.roles or [request.user.role]
        return any(role in ['ADMIN', 'KITCHEN'] for role in roles)

class IsBarStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        roles = request.user.roles or [request.user.role]
        return any(role in ['ADMIN', 'BAR'] for role in roles)

class IsCashier(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        roles = request.user.roles or [request.user.role]
        return any(role in ['ADMIN', 'CASHIER'] for role in roles)

class IsRecreationStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        roles = request.user.roles or [request.user.role]
        return any(role in ['ADMIN', 'RECREATION'] for role in roles)
