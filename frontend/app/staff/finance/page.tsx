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
    Activity,
    X,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
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
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [voucherSearch, setVoucherSearch] = useState('');
    const [isAddingEntry, setIsAddingEntry] = useState(false);
    const [entryLoading, setEntryLoading] = useState(false);
    const [entryForm, setEntryForm] = useState({
        description: '',
        increase_account: '',
        decrease_account: '',
        amount: ''
    });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('yarvo_token');
            const [accRes, txRes, vouRes] = await Promise.all([
                fetch('/api/finance/accounts/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/finance/transactions/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/finance/vouchers/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            if (accRes.ok) {
                const accData = await accRes.json();
                setAccounts(Array.isArray(accData) ? accData : []);
            }
            if (txRes.ok) {
                const txData = await txRes.json();
                setTransactions(Array.isArray(txData) ? txData : []);
            }
            if (vouRes.ok) {
                const vouData = await vouRes.json();
                setVouchers(Array.isArray(vouData) ? vouData : []);
            }
        } catch (error) {
            console.error("Error fetching financial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveVoucher = async (id: number) => {
        try {
            const res = await fetch(`/api/finance/vouchers/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({ is_approved: true }),
            });
            if (res.ok) {
                fetchData();
            } else {
                alert("Failed to approve voucher.");
            }
        } catch (error) {
            console.error("Approval error:", error);
        }
    };

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!entryForm.increase_account || !entryForm.decrease_account || !entryForm.amount) {
            alert("Please fill in all required fields.");
            return;
        }

        if (entryForm.increase_account === entryForm.decrease_account) {
            alert("Increase and Decrease accounts must be different.");
            return;
        }

        setEntryLoading(true);
        try {
            const incAcc = accounts.find((a: any) => a.id.toString() === entryForm.increase_account);
            const decAcc = accounts.find((a: any) => a.id.toString() === entryForm.decrease_account);
            const sysClear = accounts.find((a: any) => a.code === '9999');

            let finalDebit = null;
            let finalCredit = null;

            // Determine standard debit/credit needs
            if (['ASSET', 'EXPENSE'].includes(incAcc.account_type)) finalDebit = incAcc.id;
            else finalCredit = incAcc.id;

            let payloads = [];

            if (['ASSET', 'EXPENSE'].includes(decAcc.account_type)) {
                if (finalCredit) {
                    // Both require Credit. Route through System Clearing.
                    if (!sysClear) throw new Error("System Clearing account not found.");
                    payloads.push({ description: entryForm.description, debit_account: sysClear.id, credit_account: incAcc.id, amount: entryForm.amount });
                    payloads.push({ description: entryForm.description, debit_account: sysClear.id, credit_account: decAcc.id, amount: entryForm.amount });
                } else {
                    finalCredit = decAcc.id;
                    payloads.push({ description: entryForm.description, debit_account: finalDebit, credit_account: finalCredit, amount: entryForm.amount });
                }
            } else {
                if (finalDebit) {
                    // Both require Debit. Route through System Clearing.
                    if (!sysClear) throw new Error("System Clearing account not found.");
                    payloads.push({ description: entryForm.description, debit_account: incAcc.id, credit_account: sysClear.id, amount: entryForm.amount });
                    payloads.push({ description: entryForm.description, debit_account: decAcc.id, credit_account: sysClear.id, amount: entryForm.amount });
                } else {
                    finalDebit = decAcc.id;
                    payloads.push({ description: entryForm.description, debit_account: finalDebit, credit_account: finalCredit, amount: entryForm.amount });
                }
            }

            for (const payload of payloads) {
                const res = await fetch('/api/finance/transactions/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                    },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || "Failed to save transaction.");
                }
            }

            setIsAddingEntry(false);
            setEntryForm({ description: '', increase_account: '', decrease_account: '', amount: '' });
            fetchData();
        } catch (error: any) {
            console.error("Error creating entry:", error);
            alert(error.message || "Network error. Please try again.");
        } finally {
            setEntryLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const displayAccounts = Array.isArray(accounts) ? accounts.filter((a: any) => a.code !== '9999') : [];

    const stats = [
        {
            name: 'Total Assets',
            value: '$' + (displayAccounts.filter(a => a.account_type === 'ASSET').reduce((sum, a) => sum + parseFloat(a.balance || 0), 0)).toFixed(2),
            icon: <Landmark className="text-blue-600" />,
            trend: '+12.5%',
            color: 'bg-blue-50'
        },
        {
            name: 'Total Revenue',
            value: '$' + (displayAccounts.filter(a => a.account_type === 'REVENUE').reduce((sum, a) => sum + parseFloat(a.balance || 0), 0)).toFixed(2),
            icon: <TrendingUp className="text-emerald-600" />,
            trend: '+8.2%',
            color: 'bg-emerald-50'
        },
        {
            name: 'Total Expenses',
            value: '$' + (displayAccounts.filter(a => a.account_type === 'EXPENSE').reduce((sum, a) => sum + parseFloat(a.balance || 0), 0)).toFixed(2),
            icon: <TrendingDown className="text-red-600" />,
            trend: '+2.4%',
            color: 'bg-red-50'
        },
        {
            name: 'Net Position',
            value: '$' + (
                displayAccounts.filter(a => a.account_type === 'ASSET').reduce((sum, a) => sum + parseFloat(a.balance || 0), 0) +
                displayAccounts.filter(a => a.account_type === 'REVENUE').reduce((sum, a) => sum + parseFloat(a.balance || 0), 0) -
                displayAccounts.filter(a => a.account_type === 'EXPENSE').reduce((sum, a) => sum + parseFloat(a.balance || 0), 0) -
                displayAccounts.filter(a => a.account_type === 'LIABILITY').reduce((sum, a) => sum + parseFloat(a.balance || 0), 0)
            ).toFixed(2),
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
                    <Link href="/staff/payroll/new" className="flex items-center justify-center gap-2 px-6 py-4 bg-white rounded-2xl border-2 border-gray-100 text-xs font-black uppercase tracking-widest text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
                        <Plus size={18} /> New Voucher
                    </Link>
                    <Link href="/staff/reports" className="flex items-center justify-center gap-2 px-6 py-4 bg-white rounded-2xl border-2 border-gray-100 text-xs font-black uppercase tracking-widest text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
                        <FileText size={18} /> Generate Reports
                    </Link>
                    <button
                        onClick={() => setIsAddingEntry(true)}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl shadow-lg shadow-gray-200 hover:bg-[var(--color-primary)] transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <Plus size={18} /> New Entry
                    </button>
                </div>
            </div>

            {/* New Entry Modal */}
            {isAddingEntry && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Manual Ledger Entry</h2>
                            <button onClick={() => setIsAddingEntry(false)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddEntry} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                                <input
                                    type="text"
                                    required
                                    value={entryForm.description}
                                    onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                                    placeholder="e.g. Account adjustment, Petty cash replenishment"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Increase Account (+)</label>
                                    <select
                                        required
                                        value={entryForm.increase_account}
                                        onChange={(e) => setEntryForm({ ...entryForm, increase_account: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                                    >
                                        <option value="">Select Account</option>
                                        {displayAccounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Decrease Account (-)</label>
                                    <select
                                        required
                                        value={entryForm.decrease_account}
                                        onChange={(e) => setEntryForm({ ...entryForm, decrease_account: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                                    >
                                        <option value="">Select Account</option>
                                        {displayAccounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Amount ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={entryForm.amount}
                                    onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={entryLoading}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[var(--color-primary)] shadow-lg shadow-gray-200 transition-all disabled:opacity-50"
                                >
                                    {entryLoading ? 'Saving Entry...' : 'Create Entry'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingEntry(false)}
                                    className="w-full py-4 bg-white text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                            {displayAccounts.map((acc: any) => (
                                <div key={acc.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors shadow-sm">
                                            {getAccountIcon(acc.account_type)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{acc.name} <span className="text-xs text-gray-400 ml-1 font-medium">#{acc.code}</span></div>
                                            <div className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-1">{acc.account_type}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-black text-gray-900">
                                        ${parseFloat(acc.balance).toFixed(2)}
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

            {/* Expense Vouchers Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Expense Vouchers</h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search vouchers..."
                            value={voucherSearch}
                            onChange={(e) => setVoucherSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Voucher #</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payee</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Reference</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Approval</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {vouchers.filter(v =>
                                v.voucher_number.toLowerCase().includes(voucherSearch.toLowerCase()) ||
                                v.payee.toLowerCase().includes(voucherSearch.toLowerCase()) ||
                                v.voucher_type.toLowerCase().includes(voucherSearch.toLowerCase())
                            ).length > 0 ? vouchers.filter(v =>
                                v.voucher_number.toLowerCase().includes(voucherSearch.toLowerCase()) ||
                                v.payee.toLowerCase().includes(voucherSearch.toLowerCase()) ||
                                v.voucher_type.toLowerCase().includes(voucherSearch.toLowerCase())
                            ).map((vou) => (
                                <tr key={vou.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-black text-gray-900">{vou.voucher_number}</div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{vou.voucher_type}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-bold text-gray-500">{vou.payee}</div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">{vou.main_account || 'OTHER'}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-gray-900 text-sm">
                                        ${parseFloat(vou.total_amount).toFixed(2)}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {vou.is_approved ? (
                                            <div className="flex items-center justify-end gap-1 text-emerald-500">
                                                <CheckCircle2 size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Approved</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleApproveVoucher(vou.id)}
                                                className="px-4 py-1.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-primary)] transition-colors"
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No vouchers found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
