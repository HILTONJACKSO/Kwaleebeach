'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (allowedRoles && user) {
                const userRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role];
                const hasPermission = allowedRoles.some(role => userRoles.includes(role));

                if (!hasPermission) {
                    // Redirect to a default page for their first role if they try to access unauthorized path
                    const roleRedirects: Record<string, string> = {
                        'ADMIN': '/staff/dashboard',
                        'FRONT_DESK': '/staff/rooms',
                        'WAITER': '/staff/waiter',
                        'KITCHEN': '/staff/kitchen',
                        'BAR': '/staff/bar',
                        'CASHIER': '/staff/cashier',
                        'RECREATION': '/staff/pool',
                    };
                    const primaryRole = userRoles[0] || 'GUEST';
                    router.push(roleRedirects[primaryRole] || '/staff/rooms');
                }
            }
        }
    }, [isAuthenticated, loading, user, router, allowedRoles]);

    if (loading || !isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
