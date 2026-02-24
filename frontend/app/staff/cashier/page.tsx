'use client';
import { useState, useEffect } from 'react';
import { useUI } from '@/context/UIContext';
import {
    DollarSign, Receipt, Clock, CheckCircle, Search,
    CreditCard, Banknote, RefreshCw, Package, Waves,
    Utensils, FileText, ArrowUpRight, Wallet, Smartphone
} from 'lucide-react';
import Link from 'next/link';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function CashierDashboard() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN', 'CASHIER']}>
            <CashierDashboardContent />
        </ProtectedRoute>
    );
}

function CashierDashboardContent() {
    const { showNotification } = useUI();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'invoices' | 'returns'>('invoices');
    const [filter, setFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('UNPAID');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [activePasses, setActivePasses] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const [invRes, orderRes, passRes] = await Promise.all([
                fetch('/api/finance/invoices/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                    }
                }),
                fetch('/api/inventory/orders/active/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                    }
                }),
                fetch('/api/recreation/passes/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                    }
                })
            ]);
            if (invRes.ok) setInvoices(await invRes.json());
            if (orderRes.ok) setActiveOrders(await orderRes.json());
            if (passRes.ok) setActivePasses(await passRes.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredInvoices = invoices.filter(inv => {
        const matchesFilter = filter === 'ALL' ? true : (filter === 'PAID' ? inv.is_paid : !inv.is_paid);
        const matchesSearch = inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (inv.guest_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (inv.room_number || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const pendingTotal = invoices.reduce((acc, inv) => !inv.is_paid ? acc + parseFloat(inv.total_ft) : acc, 0);
    const collectedToday = invoices.reduce((acc, inv) => {
        const payments = inv.payments?.filter((p: any) => new Date(p.date_paid).toDateString() === new Date().toDateString()) || [];
        return acc + payments.reduce((p_acc: any, p: any) => p_acc + parseFloat(p.amount), 0);
    }, 0);

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 flex-wrap">
                        Cashier Dashboard <Wallet className="text-emerald-500" size={32} />
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight text-sm">Consolidated financial hub for resort revenue.</p>
                </div>
            </div>

            {/* KPI Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-emerald-100 p-6 rounded-[2rem] md:rounded-[2.5rem] border border-emerald-200/50 shadow-sm transition-all md:hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm">
                            <Banknote className="text-emerald-700" size={24} />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-white/50 px-2 py-1 rounded-full">
                            <ArrowUpRight size={14} /> 15% Target
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-emerald-800/60 uppercase tracking-[0.2em] mb-1">Today's Collection</div>
                    <div className="text-2xl lg:text-3xl font-black text-gray-900">${collectedToday.toFixed(2)}</div>
                </div>

                <div className="bg-orange-100 p-6 rounded-[2rem] md:rounded-[2.5rem] border border-orange-200/50 shadow-sm transition-all md:hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm">
                            <Clock className="text-orange-700" size={24} />
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-orange-800/60 uppercase tracking-[0.2em] mb-1">Pending Invoices</div>
                    <div className="text-2xl lg:text-3xl font-black text-gray-900">${pendingTotal.toFixed(2)}</div>
                </div>

                <div className="bg-blue-100 p-6 rounded-[2rem] md:rounded-[2.5rem] border border-blue-200/50 shadow-sm transition-all md:hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm">
                            <CreditCard className="text-blue-700" size={24} />
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-blue-800/60 uppercase tracking-[0.2em] mb-1">Visa Processing</div>
                    <div className="text-2xl lg:text-3xl font-black text-gray-900">Active</div>
                </div>

                <div className="bg-indigo-100 p-6 rounded-[2rem] md:rounded-[2.5rem] border border-indigo-200/50 shadow-sm transition-all md:hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm">
                            <Smartphone className="text-indigo-700" size={24} />
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-indigo-800/60 uppercase tracking-[0.2em] mb-1">MOMO Status</div>
                    <div className="text-2xl lg:text-3xl font-black text-gray-900">Online</div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap bg-white p-1.5 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm w-full sm:w-fit">
                <button
                    onClick={() => setActiveTab('invoices')}
                    className={`flex-1 sm:flex-none px-6 md:px-8 py-3 rounded-xl md:rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'invoices' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Invoices
                </button>
                <button
                    onClick={() => setActiveTab('returns')}
                    className={`flex-1 sm:flex-none px-6 md:px-8 py-3 rounded-xl md:rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'returns' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Returns
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'invoices' ? (
                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <h2 className="text-xl font-black text-gray-900">All Invoices</h2>

                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-2xl w-full sm:w-auto">
                                {(['ALL', 'UNPAID', 'PAID'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setFilter(t)}
                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black transition-all ${filter === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Guest / Room</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right sm:text-left">Amount</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Status</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredInvoices.map(invoice => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 md:px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-gray-900 truncate">#{invoice.invoice_number}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium">{invoice.date_issued}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-sm truncate">{invoice.guest_name}</span>
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Room {invoice.room_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-6 text-right sm:text-left">
                                            <div className="text-lg font-black text-gray-900">${parseFloat(invoice.total_ft).toFixed(2)}</div>
                                            {!invoice.is_paid && <div className="sm:hidden text-[9px] font-bold text-orange-500 uppercase tracking-wider">Unpaid</div>}
                                        </td>
                                        <td className="px-6 md:px-8 py-6 hidden sm:table-cell">
                                            {invoice.is_paid ? (
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-1.5 w-fit">
                                                    <CheckCircle size={12} /> PAID
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-100 flex items-center gap-1.5 w-fit">
                                                    <Clock size={12} /> UNPAID
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 md:px-8 py-6 text-right">
                                            {invoice.is_paid ? (
                                                <button className="px-4 md:px-6 py-2 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-default">
                                                    Receipt
                                                </button>
                                            ) : (
                                                <Link
                                                    href={`/staff/cashier/payment/${invoice.id}`}
                                                    className="inline-flex px-4 md:px-6 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all items-center gap-2"
                                                >
                                                    Pay
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Orders List */}
                        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
                            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                <Utensils size={20} className="text-orange-500" /> Active Orders
                            </h3>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                                {activeOrders.map(order => (
                                    <div key={order.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group transition-all">
                                        <div className="min-w-0">
                                            <div className="font-bold text-gray-900">Order #{order.id}</div>
                                            <div className="text-[11px] text-gray-400 font-medium truncate">Room: {order.room} • {order.items?.length || 0} items</div>
                                        </div>
                                        <Link
                                            href={`/staff/cashier/return/order/${order.id}`}
                                            className="w-full sm:w-auto px-4 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-md"
                                        >
                                            <RefreshCw size={14} /> Return
                                        </Link>
                                    </div>
                                ))}
                                {activeOrders.length === 0 && <p className="text-gray-400 text-sm italic py-4">No active orders found.</p>}
                            </div>
                        </div>

                        {/* Passes List */}
                        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
                            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                <Waves size={20} className="text-blue-500" /> Recreation Passes
                            </h3>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                                {activePasses.map(p => (
                                    <div key={p.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group transition-all">
                                        <div className="min-w-0">
                                            <div className="font-bold text-gray-900 truncate">{p.pass_type_name}</div>
                                            <div className="text-[11px] text-gray-400 font-medium truncate">Guest: {p.guest_name || `Room ${p.room_number}`}</div>
                                        </div>
                                        <Link
                                            href={`/staff/cashier/return/pass/${p.id}`}
                                            className="w-full sm:w-auto px-4 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-md"
                                        >
                                            <RefreshCw size={14} /> Return
                                        </Link>
                                    </div>
                                ))}
                                {activePasses.length === 0 && <p className="text-gray-400 text-sm italic py-4">No active passes found.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
