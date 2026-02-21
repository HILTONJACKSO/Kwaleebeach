from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        print(f"DEBUG: Checking permission for {request.user}", flush=True)
        if request.user.is_authenticated:
            print(f"DEBUG: User role: {request.user.role}", flush=True)
        else:
            print("DEBUG: User is NOT authenticated", flush=True)
        return request.user.is_authenticated and request.user.role == 'ADMIN'

class IsFrontDesk(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'FRONT_DESK']

class IsWaiter(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'WAITER']

class IsKitchenStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'KITCHEN']

class IsBarStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'BAR']

class IsCashier(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'CASHIER']

class IsRecreationStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'RECREATION']
