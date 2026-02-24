'use client';
import { useEffect, useState } from 'react';
import {
    Users,
    ShoppingCart,
    Bed,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import RevenueCharts from '@/components/RevenueCharts';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Order {
    id: number;
    room: string;
    location_type: string;
    status: string;
    total_amount: string;
    created_at: string;
}

interface Room {
    id: number;
    room_number: string;
    room_type: string;
    status: string;
}

export default function StaffDashboard() {
    const [stats, setStats] = useState({
        activeGuests: 12,
        pendingOrders: 0,
        availableRooms: 0,
        todayRevenue: "$1,240.00"
    });

    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    const fetchData = () => {
        // Fetch real dashboard stats
        fetch('/api/inventory/reports/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setStats({
                    activeGuests: data.active_guests || 0,
                    pendingOrders: data.recent_log ? data.recent_log.filter((o: any) => o.status === 'PENDING').length : 0,
                    availableRooms: data.rooms ? data.rooms.available : 0,
                    todayRevenue: `$${parseFloat(data.revenue?.today?.total || 0).toLocaleString()}`
                });
                if (data.recent_log) {
                    setRecentOrders(data.recent_log.slice(0, 5));
                }
            })
            .catch(err => console.error('Fetch stats error:', err));
    };

    useEffect(() => {
        fetchData(); // Initial load
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const kpis: { label: string; value: string | number; isUp: boolean; icon: any; cardColor: string; iconColor: string; change?: string }[] = [
        { label: 'Today\'s Revenue', value: stats.todayRevenue, isUp: true, icon: <TrendingUp size={24} />, cardColor: 'bg-emerald-100', iconColor: 'text-emerald-700' },
        { label: 'Active Guests', value: stats.activeGuests, isUp: true, icon: <Users size={24} />, cardColor: 'bg-blue-100', iconColor: 'text-blue-700' },
        { label: 'Pending Orders', value: stats.pendingOrders, isUp: false, icon: <ShoppingCart size={24} />, cardColor: 'bg-orange-100', iconColor: 'text-orange-700' },
        { label: 'Available Rooms', value: stats.availableRooms, isUp: true, icon: <Bed size={24} />, cardColor: 'bg-indigo-100', iconColor: 'text-indigo-700' },
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Main Dashboard</h1>
                <p className="text-gray-500 font-medium tracking-tight">Welcome back, Admin. Here's what's happening at Kwalee Beach Resort today.</p>
            </div>

            {/* 1. KPI Overview (Top Priority) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className={`${kpi.cardColor} p-6 rounded-[2rem] border border-gray-100/50 shadow-sm hover:shadow-md transition-all`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm">
                                <span className={kpi.iconColor}>{kpi.icon}</span>
                            </div>
                            {kpi.change && (
                                <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-widest ${kpi.isUp ? 'text-emerald-700' : 'text-rose-600'}`}>
                                    {kpi.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {kpi.change}
                                </div>
                            )}
                        </div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{kpi.label}</div>
                        <div className="text-3xl font-black text-gray-900">{kpi.value}</div>
                    </div>
                ))}
            </div>

            {/* 2. Revenue Charts */}
            <RevenueCharts />

            {/* 3. Main Operational Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3a. Live Orders (Left - 2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Live Orders Table */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 flex justify-between items-center border-b border-gray-50">
                            <h2 className="text-xl font-black text-gray-900">Live Orders</h2>
                            <button className="text-xs font-black text-[var(--color-primary)] uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-8 py-5 font-bold text-sm text-gray-900">#{order.id}</td>
                                            <td className="px-8 py-5 text-sm font-medium text-gray-500">{order.room}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.status === 'READY' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    order.status === 'PREPARING' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        'bg-gray-50 text-gray-400 border-gray-200'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 font-bold text-sm text-gray-900">${parseFloat(order.total_amount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {recentOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-10 text-center text-gray-400 font-medium">No active orders found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>


                </div>

                {/* 3b. Right Sidebar (1/3) */}
                <div className="space-y-6">
                    {/* Operational Health */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute -right-10 -bottom-10 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                            <TrendingUp size={200} />
                        </div>
                        <h2 className="text-xl font-black mb-2">Operational Health</h2>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">System status: All services operational. Internet latency: 12ms.</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs font-bold bg-white/5 p-3 rounded-xl border border-white/10">
                                <span className="text-gray-400 tracking-widest">PMS SERVER</span>
                                <span className="text-emerald-400">ONLINE</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold bg-white/5 p-3 rounded-xl border border-white/10">
                                <span className="text-gray-400 tracking-widest">KDS SERVER</span>
                                <span className="text-emerald-400">ONLINE</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold bg-white/5 p-3 rounded-xl border border-white/10">
                                <span className="text-gray-400 tracking-widest">GATEWAY</span>
                                <span className="text-emerald-400">SECURE</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-[var(--color-primary)] rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-900/20">
                        <h2 className="text-xl font-black mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                                <Users size={20} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">New Guest</span>
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                                <Bed size={20} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Clean Room</span>
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                                <ShoppingCart size={20} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Manual Order</span>
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                                <TrendingUp size={20} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Reports</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
