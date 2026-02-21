'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Layout,
    LayoutDashboard,
    BedDouble,
    UtensilsCrossed,
    Package,
    Calendar,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Users,
    Beer,
    Waves,
    Umbrella,
    Coffee,
    Wallet,
    RefreshCw,
    Landmark,
    Banknote,
    FileText,
    PieChart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function StaffSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, logout } = useAuth();

    const allNavItems = [
        { name: 'Dashboard', href: '/staff/dashboard', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'FRONT_DESK'] },
        { name: 'Room PMS', href: '/staff/rooms', icon: <BedDouble size={20} />, roles: ['ADMIN', 'FRONT_DESK'] },
        { name: 'Kitchen KDS', href: '/staff/kitchen', icon: <UtensilsCrossed size={20} />, roles: ['ADMIN', 'KITCHEN'] },
        { name: 'Bar BDS', href: '/staff/bar', icon: <Beer size={20} />, roles: ['ADMIN', 'BAR'] },
        { name: 'Waiter Station', href: '/staff/waiter', icon: <Coffee size={20} />, roles: ['ADMIN', 'WAITER'] },
        { name: 'Cashier', href: '/staff/cashier', icon: <Wallet size={20} />, roles: ['ADMIN', 'CASHIER'] },
        { name: 'Pool Access', href: '/staff/pool', icon: <Waves size={20} />, roles: ['ADMIN', 'RECREATION'] },
        { name: 'Beach Access', href: '/staff/beach', icon: <Umbrella size={20} />, roles: ['ADMIN', 'RECREATION'] },
        { name: 'Inventory', href: '/staff/inventory', icon: <Package size={20} />, roles: ['ADMIN', 'KITCHEN', 'BAR'] },
        { name: 'Events', href: '/staff/events', icon: <Calendar size={20} />, roles: ['ADMIN', 'FRONT_DESK'] },
        { name: 'Returns', href: '/staff/returns', icon: <RefreshCw size={20} />, roles: ['ADMIN', 'CASHIER', 'FRONT_DESK'] },
        { name: 'Finance', href: '/staff/finance', icon: <Landmark size={20} />, roles: ['ADMIN'] },
        { name: 'Payroll', href: '/staff/payroll', icon: <Banknote size={20} />, roles: ['ADMIN'] },
        { name: 'Reports', href: '/staff/reports', icon: <FileText size={20} />, roles: ['ADMIN'] },
        { name: 'Analytics', href: '/staff/analytics', icon: <PieChart size={20} />, roles: ['ADMIN'] },
        { name: 'Staff', href: '/staff/users', icon: <Users size={20} />, roles: ['ADMIN'] },
        { name: 'Menu Mgmt', href: '/staff/menu', icon: <UtensilsCrossed size={20} />, roles: ['ADMIN'] },
        { name: 'Website CMS', href: '/staff/cms', icon: <Layout size={20} />, roles: ['ADMIN'] },
    ];

    const navItems = allNavItems.filter(item =>
        !user || item.roles.includes(user.role)
    );

    return (
        <aside
            className={`bg-gray-900 text-white transition-all duration-300 flex flex-col h-screen sticky top-0 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between border-b border-gray-800">
                {!isCollapsed && (
                    <span className="text-2xl font-black tracking-tighter text-[var(--color-primary)]">
                        KWALEE<span className="text-white">.Staff</span>
                    </span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-orange-900/20'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                                {item.icon}
                            </span>
                            {!isCollapsed && (
                                <span className="text-sm font-bold tracking-tight">{item.name}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-800 space-y-2">
                <Link
                    href="/staff/settings"
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-white transition-colors"
                >
                    <Settings size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
                </Link>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
}
