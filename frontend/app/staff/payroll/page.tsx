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
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [salRes, vouRes] = await Promise.all([
                    fetch('/api/finance/salaries/', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }),
                    fetch('/api/finance/vouchers/', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                ]);
                if (!salRes.ok) {
                    console.warn(`Failed to fetch salaries (Status: ${salRes.status}).`);
                    setSalaries([]);
                } else {
                    const salData = await salRes.json();
                    setSalaries(Array.isArray(salData) ? salData : []);
                }

                if (!vouRes.ok) {
                    console.warn(`Failed to fetch vouchers (Status: ${vouRes.status}).`);
                    setVouchers([]);
                } else {
                    const vouData = await vouRes.json();
                    setVouchers(Array.isArray(vouData) ? vouData : []);
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
            name: 'Pending Vouchers',
            value: '$' + (Array.isArray(vouchers) ? vouchers.filter(v => !v.is_approved).reduce((sum, v) => sum + parseFloat(v.total_amount || 0), 0) : 0).toFixed(2),
            icon: <Clock className="text-orange-600" />,
            sub: `${Array.isArray(vouchers) ? vouchers.filter(v => !v.is_approved).length : 0} Awaiting Approval`,
            color: 'bg-orange-50'
        },
        {
            name: 'Total Expenses',
            value: '$' + ((Array.isArray(salaries) ? salaries.reduce((sum, s) => sum + parseFloat(s.net_pay || 0), 0) : 0) + (Array.isArray(vouchers) ? vouchers.reduce((sum, v) => sum + parseFloat(v.total_amount || 0), 0) : 0)).toFixed(2),
            icon: <Receipt className="text-red-600" />,
            sub: 'This Month',
            color: 'bg-red-50'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Payroll & Vouchers</h1>
                    <p className="text-gray-500 font-medium">Manage employee compensation and company disbursements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/staff/payroll/new" className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-sm font-bold text-gray-700">
                        <Plus size={18} />
                        New Voucher
                    </Link>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-200 hover:bg-[var(--color-primary)] transition-all text-sm font-bold">
                        <Banknote size={18} />
                        Process Payroll
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-tight">{stat.name}</div>
                        <div className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.sub}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Employee Salary List */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Staff Salaries</h2>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
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

                {/* Expense Vouchers */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Expense Vouchers</h2>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                            <Search size={16} className="text-gray-400" />
                            <input type="text" placeholder="Search vouchers..." className="bg-transparent border-none text-xs font-bold focus:ring-0 w-32" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Voucher #</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payee</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Approval</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {vouchers.length > 0 ? vouchers.map((vou) => (
                                    <tr key={vou.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-black text-gray-900">{vou.voucher_number}</div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{vou.voucher_type}</div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-gray-500">
                                            {vou.payee}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-gray-900">
                                            ${parseFloat(vou.total_amount).toFixed(2)}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {vou.is_approved ? (
                                                <div className="flex items-center justify-end gap-1 text-emerald-500">
                                                    <CheckCircle2 size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Approved</span>
                                                </div>
                                            ) : (
                                                <button className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-primary)] transition-colors">
                                                    Approve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No disbursements recorded</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
