'use client';
import { useState, useEffect } from 'react';
import StaffSidebar from '@/components/StaffSidebar';
import { useAuth } from '@/context/AuthContext';
import { Bell, User as UserIcon, Search, TrendingUp, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    const initials = user
        ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}` || user.username.substring(0, 2).toUpperCase()
        : '??';

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Debounced Search Logic
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults(null);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/pms/search/?q=${searchQuery}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    setSearchResults(await res.json());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <StaffSidebar />

            <main className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-50">
                    <div className="flex items-center gap-4 text-gray-400 flex-1 max-w-xl relative">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search for rooms, orders, or guests..."
                            className="text-sm font-medium w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder:text-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        {/* Search Results Dropdown */}
                        {searchResults && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                                {searchResults.rooms.length > 0 && (
                                    <div className="p-4 border-b border-gray-50">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Rooms</div>
                                        <div className="space-y-2">
                                            {searchResults.rooms.map((r: any) => (
                                                <Link key={r.id} href={`/staff/rooms/edit/${r.id}`} onClick={() => setSearchResults(null)} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-xl transition-all">
                                                    <span className="font-bold text-sm text-gray-900">Room {r.room_number}</span>
                                                    <span className="text-xs text-gray-500">{r.room_type}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {searchResults.bookings.length > 0 && (
                                    <div className="p-4 border-b border-gray-50">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Guests/Bookings</div>
                                        <div className="space-y-2">
                                            {searchResults.bookings.map((b: any) => (
                                                <Link key={b.id} href={`/staff/pms`} onClick={() => setSearchResults(null)} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-xl transition-all">
                                                    <span className="font-bold text-sm text-gray-900">{b.guest_name}</span>
                                                    <span className="text-xs text-emerald-600 font-bold uppercase tracking-tighter">{b.status}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {searchResults.orders.length > 0 && (
                                    <div className="p-4">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recent Orders</div>
                                        <div className="space-y-2">
                                            {searchResults.orders.map((o: any) => (
                                                <Link key={o.id} href={`/staff/kitchen`} onClick={() => setSearchResults(null)} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-xl transition-all">
                                                    <span className="font-bold text-sm text-gray-900">Order #{o.id}</span>
                                                    <span className="text-xs text-gray-500">{o.room} • ${o.total_amount}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {searchResults.rooms.length === 0 && searchResults.bookings.length === 0 && searchResults.orders.length === 0 && (
                                    <div className="p-8 text-center text-gray-400 text-sm font-medium">No results found for "{searchQuery}"</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-primary)] rounded-full border-2 border-white"></span>
                            </button>

                            {showNotifications && (
                                <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
                                    <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                                        <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">Notifications</h3>
                                        <span className="text-[10px] font-black text-[var(--color-primary)] cursor-pointer">Mark all read</span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        <div className="p-10 text-center">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Bell size={20} className="text-gray-300" />
                                            </div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No new notifications</p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 text-center">
                                        <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">View All Activity</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                            <div className="text-right">
                                <div className="text-sm font-bold text-gray-900">{user ? `${user.first_name} ${user.last_name}` : 'Staff Member'}</div>
                                <div className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest leading-none">{user?.role || 'Guest'}</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-black shadow-lg shadow-orange-200 uppercase">
                                {initials}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
