'use client';
import { useState, useEffect } from 'react';
import {
    Banknote,
    Plus,
    Search,
    Users,
    FileText,
    Filter,
    CheckCircle2,
    Clock,
    DollarSign,
    Receipt
} from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PayrollDashboard() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <PayrollDashboardContent />
        </ProtectedRoute>
    );
}

function PayrollDashboardContent() {
    const [salaries, setSalaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const salRes = await fetch('/api/finance/salaries/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                    }
                });
                if (!salRes.ok) {
                    console.warn(`Failed to fetch salaries (Status: ${salRes.status}).`);
                    setSalaries([]);
                } else {
                    const salData = await salRes.json();
                    setSalaries(Array.isArray(salData) ? salData : []);
                }
            } catch (error) {
                console.error("Error fetching payroll data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        {
            name: 'Monthly Payroll',
            value: '$' + (Array.isArray(salaries) ? salaries.reduce((sum, s) => sum + parseFloat(s.net_pay || 0), 0) : 0).toFixed(2),
            icon: <Users className="text-blue-600" />,
            sub: `${Array.isArray(salaries) ? salaries.length : 0} Employees`,
            color: 'bg-blue-50'
        },
        {
            name: 'Total Paid',
            value: '$' + (Array.isArray(salaries) ? salaries.filter(s => s.is_paid).reduce((sum, s) => sum + parseFloat(s.net_pay || 0), 0) : 0).toFixed(2),
            icon: <CheckCircle2 className="text-emerald-600" />,
            sub: 'Processed',
            color: 'bg-emerald-50'
        },
        {
            name: 'Total Pending',
            value: '$' + (Array.isArray(salaries) ? salaries.filter(s => !s.is_paid).reduce((sum, s) => sum + parseFloat(s.net_pay || 0), 0) : 0).toFixed(2),
            icon: <Clock className="text-orange-600" />,
            sub: 'Awaiting Payment',
            color: 'bg-orange-50'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Payroll <Banknote className="text-blue-600" size={32} />
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight text-sm">Manage employee compensation and salary processing.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                    <button className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl shadow-lg shadow-gray-200 hover:bg-[var(--color-primary)] transition-all text-xs font-black uppercase tracking-widest">
                        <Banknote size={18} /> Process Payroll
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">{stat.name}</div>
                        <div className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">{stat.sub}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Staff Salaries</h2>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Filter size={18} />
                    </button>
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Pay</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {salaries.length > 0 ? salaries.map((sal) => (
                                <tr key={sal.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-black text-xs">
                                                {sal.employee_name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="text-sm font-bold text-gray-900">{sal.employee_name}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-bold text-gray-500">
                                        {sal.month}/{sal.year}
                                    </td>
                                    <td className="px-8 py-5 text-sm font-black text-gray-900">
                                        ${parseFloat(sal.net_pay).toFixed(2)}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sal.is_paid ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {sal.is_paid ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No payroll records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
