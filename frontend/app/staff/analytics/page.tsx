'use client';
import { TrendingUp, Users, DollarSign, Activity, PieChart, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AnalyticsPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <AnalyticsContent />
        </ProtectedRoute>
    );
}

function AnalyticsContent() {
    const keyMetrics = [
        { name: 'Total Revenue', value: '--', trend: '', isPositive: true, icon: <DollarSign size={24} /> },
        { name: 'Occupancy Rate', value: '--', trend: '', isPositive: true, icon: <Users size={24} /> },
        { name: 'RevPAR', value: '--', trend: '', isPositive: false, icon: <TrendingUp size={24} /> },
        { name: 'Active Sessions', value: '--', trend: '', isPositive: true, icon: <Activity size={24} /> }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    Analytics Dashboard <PieChart className="text-[var(--color-primary)]" size={32} />
                </h1>
                <p className="text-gray-500 font-medium tracking-tight text-sm">Real-time resort performance metrics and trends.</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {keyMetrics.map((metric, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gray-50 text-gray-900 rounded-2xl">
                                {metric.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${metric.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                {metric.trend}
                                {metric.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            </div>
                        </div>
                        <div className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{metric.value}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{metric.name}</div>
                    </div>
                ))}
            </div>

            {/* Charts View (Mockups for now) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart Placeholder */}
                <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Revenue Trends</h2>
                        <select className="w-full sm:w-auto bg-gray-50 border-none text-xs font-bold text-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none p-3">
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="text-center text-gray-400">
                            <BarChart3 size={48} className="mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-bold uppercase tracking-widest">Chart Visualization Pending API data</p>
                        </div>
                    </div>
                </div>

                {/* Popular Departments Placeholder */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight mb-8">Top Departments</h2>
                    <div className="space-y-6">
                        <div className="text-center text-gray-400 py-8">
                            <p className="text-sm font-bold uppercase tracking-widest">Pending API data</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
