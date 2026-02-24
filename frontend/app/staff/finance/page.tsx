'use client';
import { useState, useEffect } from 'react';
import {
    Landmark,
    TrendingUp,
    TrendingDown,
    Plus,
    Search,
    Filter,
    ArrowRightLeft,
    FileText,
    Activity
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function FinanceDashboard() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <FinanceDashboardContent />
        </ProtectedRoute>
    );
}

function FinanceDashboardContent() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accRes, txRes] = await Promise.all([
                    fetch('/api/finance/accounts/', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                        }
                    }),
                    fetch('/api/finance/transactions/', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                        }
                    })
                ]);
                if (!accRes.ok) {
                    console.warn(`Failed to fetch accounts (Status: ${accRes.status}). Please log in again if this persists.`);
                    setAccounts([]);
                } else {
                    const accData = await accRes.json();
                    setAccounts(Array.isArray(accData) ? accData : []);
                }

                if (!txRes.ok) {
                    console.warn(`Failed to fetch transactions (Status: ${txRes.status}).`);
                    setTransactions([]);
                } else {
                    const txData = await txRes.json();
                    setTransactions(Array.isArray(txData) ? txData : []);
                }
            } catch (error) {
                console.error("Error fetching financial data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        {
            name: 'Total Assets',
            value: '$' + (Array.isArray(accounts) ? accounts.filter(a => a.account_type === 'ASSET').reduce((sum, a) => sum + parseFloat(a.balance || 0), 0) : 0).toFixed(2),
            icon: <Landmark className="text-blue-600" />,
            trend: '+12.5%',
            color: 'bg-blue-50'
        },
        {
            name: 'Total Revenue',
            value: '$' + (Array.isArray(accounts) ? accounts.filter(a => a.account_type === 'REVENUE').reduce((sum, a) => sum + Math.abs(parseFloat(a.balance || 0)), 0) : 0).toFixed(2),
            icon: <TrendingUp className="text-emerald-600" />,
            trend: '+8.2%',
            color: 'bg-emerald-50'
        },
        {
            name: 'Total Expenses',
            value: '$' + (Array.isArray(accounts) ? accounts.filter(a => a.account_type === 'EXPENSE').reduce((sum, a) => sum + parseFloat(a.balance || 0), 0) : 0).toFixed(2),
            icon: <TrendingDown className="text-red-600" />,
            trend: '+2.4%',
            color: 'bg-red-50'
        },
        {
            name: 'Net Position',
            value: '$' + (Array.isArray(accounts) ? (accounts.filter(a => a.account_type === 'ASSET').reduce((sum, a) => sum + parseFloat(a.balance || 0), 0) - accounts.filter(a => a.account_type === 'LIABILITY').reduce((sum, a) => sum + Math.abs(parseFloat(a.balance || 0)), 0)) : 0).toFixed(2),
            icon: <Activity className="text-purple-600" />,
            trend: 'Stable',
            color: 'bg-purple-50'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Financial Intelligence <Landmark className="text-blue-600" size={32} />
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight text-sm">Manage Chart of Accounts and General Ledger transactions.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                    <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white rounded-2xl border-2 border-gray-100 text-xs font-black uppercase tracking-widest text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
                        <FileText size={18} /> Generate Reports
                    </button>
                    <button className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl shadow-lg shadow-gray-200 hover:bg-[var(--color-primary)] transition-all text-xs font-black uppercase tracking-widest">
                        <Plus size={18} /> New Entry
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-gray-400'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.name}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart of Accounts */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Chart of Accounts</h2>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[600px] p-2">
                        <div className="space-y-1">
                            {Array.isArray(accounts) && accounts.map((acc) => (
                                <div key={acc.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-xs">
                                            {acc.code}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{acc.name}</div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{acc.account_type}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-black text-gray-900">
                                        ${Math.abs(parseFloat(acc.balance)).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Recent Activity</h2>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search entries..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Reference</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.length > 0 ? transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5 text-xs font-bold text-gray-500 whitespace-nowrap">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-bold text-gray-900">{tx.description}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-emerald-500 uppercase">{tx.debit_account_name}</span>
                                                <ArrowRightLeft size={10} className="text-gray-300" />
                                                <span className="text-[10px] font-black text-red-500 uppercase">{tx.credit_account_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center whitespace-nowrap">
                                            <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">GL-{tx.id}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right whitespace-nowrap">
                                            <div className="text-sm font-black text-gray-900">${parseFloat(tx.amount).toFixed(2)}</div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                                    <Activity size={32} />
                                                </div>
                                                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">No recent ledger activity</div>
                                            </div>
                                        </td>
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
