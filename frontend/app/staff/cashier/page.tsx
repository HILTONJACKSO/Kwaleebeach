'use client';
import { useState, useEffect } from 'react';
import { useUI } from '@/context/UIContext';
import {
    DollarSign, Receipt, Clock, CheckCircle, Search,
    CreditCard, Banknote, RefreshCw, Package, Waves,
    Utensils, FileText, ArrowUpRight, Wallet, Smartphone,
    Trash2, Edit, Lock
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

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
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'invoices' | 'returns'>('invoices');
    const [filter, setFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('UNPAID');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState<any>(null);
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [activePasses, setActivePasses] = useState<any[]>([]);
    const [returnHistory, setReturnHistory] = useState<any[]>([]);

    const getAuthHeaders = (): Record<string, string> => {
        const token = localStorage.getItem('yarvo_token');
        if (!token || token === 'undefined' || token === 'null') return {};
        return { 'Authorization': `Bearer ${token}` };
    };

    const handle401 = () => {
        localStorage.removeItem('yarvo_token');
        window.location.href = '/login';
    };

    const userRoles = user?.roles && user.roles.length > 0 ? user.roles : [user?.role];
    const isAdmin = userRoles.includes('ADMIN');

    const fetchData = async () => {
        try {
            const authHeaders = getAuthHeaders();
            const [invRes, orderRes, passRes, statRes, historyRes] = await Promise.all([
                fetch('/api/finance/invoices/', { headers: authHeaders }),
                fetch('/api/inventory/orders/active/', { headers: authHeaders }),
                fetch('/api/recreation/passes/', { headers: authHeaders }),
                fetch('/api/inventory/reports/', { headers: authHeaders }),
                fetch('/api/inventory/returns/history/', { headers: authHeaders })
            ]);

            if (invRes.status === 401 || orderRes.status === 401 || passRes.status === 401 || statRes.status === 401) {
                return handle401();
            }

            if (invRes.ok) setInvoices(await invRes.json());
            if (orderRes.ok) setActiveOrders(await orderRes.json());
            if (passRes.ok) setActivePasses(await passRes.json());
            if (historyRes.ok) setReturnHistory(await historyRes.json());
            if (statRes.ok) {
                const data = await statRes.json();
                setStats(data.finance_stats);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteInvoice = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/finance/invoices/${id}/`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                showNotification('Invoice deleted successfully', 'success');
                fetchData();
            } else {
                const data = await res.json();
                showNotification(data.error || 'Failed to delete invoice', 'error');
            }
        } catch (e) {
            showNotification('Connection error', 'error');
        }
    };

    const handleUpdateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/finance/invoices/${editingInvoice.id}/`, {
                method: 'PATCH',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reference_location: editingInvoice.reference_location,
                    discount_type: editingInvoice.discount_type,
                    discount_amount: editingInvoice.discount_amount,
                    discount_reason: editingInvoice.discount_reason
                })
            });
            if (res.ok) {
                showNotification('Invoice updated successfully', 'success');
                setIsEditModalOpen(false);
                fetchData();
            } else {
                const data = await res.json();
                showNotification(data.error || 'Failed to update invoice', 'error');
            }
        } catch (e) {
            showNotification('Connection error', 'error');
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
        const payments = inv.payments?.filter((p: any) => {
            const pDate = new Date(p.date_paid).toDateString();
            const today = new Date().toDateString();
            return pDate === today;
        }) || [];
        return acc + payments.reduce((p_acc: any, p: any) => p_acc + parseFloat(p.amount), 0);
    }, 0);

    // Local breakdown for immediate UI updates
    const localCollectionBreakdown = invoices.reduce((acc: any, inv) => {
        const payments = inv.payments?.filter((p: any) => {
            const pDate = new Date(p.date_paid).toDateString();
            const today = new Date().toDateString();
            return pDate === today;
        }) || [];

        payments.forEach((p: any) => {
            const m = p.mode;
            acc[m] = (acc[m] || 0) + parseFloat(p.amount);
        });
        return acc;
    }, {});

    const displayCollectionTotal = Math.max(collectedToday, stats?.today_collection || 0);
    const displayBreakdown = Object.keys(localCollectionBreakdown).length > 0 ? localCollectionBreakdown : (stats?.collection_breakdown || {});

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
                    </div>
                    <div className="text-[10px] font-black text-emerald-800/60 uppercase tracking-[0.2em] mb-1">Today's Collection</div>
                    <div className="text-2xl lg:text-3xl font-black text-gray-900">${displayCollectionTotal.toFixed(2)}</div>
                    {Object.entries(displayBreakdown).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(displayBreakdown).map(([mode, amount]: [any, any]) => (
                                <span key={mode} className="text-[9px] font-black text-emerald-700/70 uppercase">
                                    {mode.replace('_', ' ')}: ${amount.toFixed(2)}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-orange-100 p-6 rounded-[2rem] md:rounded-[2.5rem] border border-orange-200/50 shadow-sm transition-all md:hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm">
                            <Clock className="text-orange-700" size={24} />
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-orange-800/60 uppercase tracking-[0.2em] mb-1">Pending Invoices</div>
                    <div className="text-2xl lg:text-3xl font-black text-gray-900">${stats?.pending_invoices.toFixed(2) || '0.00'}</div>
                </div>

                <div className="bg-blue-100 p-6 rounded-[2rem] md:rounded-[2.5rem] border border-blue-200/50 shadow-sm transition-all md:hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm">
                            <CreditCard className="text-blue-700" size={24} />
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-blue-800/60 uppercase tracking-[0.2em] mb-1">Visa Collection (Today)</div>
                    <div className="text-2xl lg:text-3xl font-black text-gray-900">
                        ${(displayBreakdown?.['VISA'] || 0).toFixed(2)}
                    </div>
                </div>

                <div className="bg-indigo-100 p-6 rounded-[2rem] md:rounded-[2.5rem] border border-indigo-200/50 shadow-sm transition-all md:hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm">
                            <Smartphone className="text-indigo-700" size={24} />
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-indigo-800/60 uppercase tracking-[0.2em] mb-1">MOMO Collection (Today)</div>
                    <div className="text-2xl lg:text-3xl font-black text-gray-900">
                        ${((displayBreakdown?.MOMO_LONESTAR || 0) + (displayBreakdown?.MOMO_ORANGE || 0)).toFixed(2)}
                    </div>
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
                                    <>
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
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                                        {invoice.reference_location || `Room ${invoice.room_number}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-6 text-right sm:text-left">
                                                <div className="text-lg font-black text-gray-900">${parseFloat(invoice.total_ft).toFixed(2)}</div>
                                                {invoice.discount_amount > 0 && (
                                                    <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                                                        -${invoice.discount_type === 'FIXED' ? invoice.discount_amount : ((parseFloat(invoice.total_ht) * parseFloat(invoice.discount_amount)) / 100).toFixed(2)} Off
                                                    </div>
                                                )}
                                                {!invoice.is_paid && <div className="sm:hidden text-[9px] font-bold text-orange-500 uppercase tracking-wider">Unpaid</div>}
                                            </td>
                                            <td className="px-6 md:px-8 py-6 hidden sm:table-cell">
                                                {invoice.is_paid ? (
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-1.5 w-fit">
                                                        <CheckCircle size={12} /> PAID
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-100 flex items-center gap-1.5 w-fit">
                                                            <Clock size={12} /> UNPAID
                                                        </span>
                                                        {!invoice.is_service_ready && (
                                                            <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-100 flex items-center gap-1 w-fit animate-pulse">
                                                                <Utensils size={10} /> Service Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 md:px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (!invoice.is_service_ready) {
                                                                showNotification("Cannot print invoice: Food/drinks not yet served.", "error");
                                                                return;
                                                            }
                                                            const printWindow = window.open('', '', 'width=600,height=800');
                                                            if (printWindow) {
                                                                // ... (rest of print logic remains same)
                                                                const content = `
                                                                    <html>
                                                                        <head>
                                                                            <title>Invoice #${invoice.invoice_number}</title>
                                                                            <style>
                                                                                body { font-family: monospace; padding: 20px; }
                                                                                .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 20px; margin-bottom: 20px; }
                                                                                .item { display: flex; justify-content: space-between; margin: 10px 0; }
                                                                                .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px; }
                                                                            </style>
                                                                        </head>
                                                                        <body>
                                                                            <div class="header">
                                                                                <h2 style="margin:0;">KWALEE BEACH RESORT</h2>
                                                                                <p style="margin:5px 0;">Kpakpa Kon, Marshall Road, Lower Margibi</p>
                                                                                <p style="margin:5px 0;">kwaleebeachresort1@gmail.com</p>
                                                                                <p style="margin:5px 0;">Tell: +231 88 174 4350 WhatsApp: +231 77 434 0843</p>
                                                                                <div style="margin-top:20px; text-align:left;">
                                                                                    <p>Invoice #${invoice.invoice_number}</p>
                                                                                    <p>Date: ${invoice.date_issued}</p>
                                                                                    <p>Location: ${invoice.reference_location || `Room ${invoice.room_number}`}</p>
                                                                                </div>
                                                                            </div>
                                                                            ${invoice.items.map((item: any) => `
                                                                                <div class="item">
                                                                                    <span>${item.description} x${item.quantity}</span>
                                                                                    <span>$${item.unit_price}</span>
                                                                                </div>
                                                                            `).join('')}
                                                                            <div class="total">
                                                                                <div class="item"><span>Subtotal:</span> <span>$${invoice.total_ht}</span></div>
                                                                                ${invoice.discount_amount > 0 ? `
                                                                                    <div class="item"><span>Discount:</span> <span>-$${invoice.discount_type === 'FIXED' ? invoice.discount_amount : ((parseFloat(invoice.total_ht) * parseFloat(invoice.discount_amount)) / 100).toFixed(2)}</span></div>
                                                                                ` : ''}
                                                                                <div class="item"><span>TOTAL:</span> <span>$${invoice.total_ft}</span></div>
                                                                            </div>
                                                                            <p style="text-align:center; margin-top:40px; font-weight:bold;">Thanks for supporting KBR!</p>
                                                                        </body>
                                                                    </html>
                                                                `;
                                                                printWindow.document.write(content);
                                                                printWindow.document.close();
                                                                printWindow.print();
                                                            }
                                                        }}
                                                        disabled={!invoice.is_service_ready}
                                                        className={`p-2 rounded-xl transition-all border ${!invoice.is_service_ready ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200'}`}
                                                        title={invoice.is_service_ready ? "Print Invoice" : "Service Pending"}
                                                    >
                                                        <Receipt size={18} />
                                                    </button>
                                                    {isAdmin && (
                                                        <div className="flex items-center gap-2 mr-2 border-r border-gray-100 pr-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingInvoice({ ...invoice });
                                                                    setIsEditModalOpen(true);
                                                                }}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                                title="Edit Invoice (Admin Only)"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            {!invoice.is_paid ? (
                                                                <button
                                                                    onClick={() => handleDeleteInvoice(invoice.id)}
                                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                                    title="Delete Invoice (Admin Only)"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            ) : (
                                                                <div className="p-2 text-gray-300" title="Cannot delete paid invoice">
                                                                    <Lock size={18} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {invoice.is_paid ? (
                                                        <div className="px-4 md:px-6 py-2 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-default">
                                                            Receipt
                                                        </div>
                                                    ) : (
                                                        invoice.is_service_ready ? (
                                                            <Link
                                                                href={`/staff/cashier/payment/${invoice.id}`}
                                                                className="inline-flex px-4 md:px-6 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all items-center gap-2"
                                                            >
                                                                Pay
                                                            </Link>
                                                        ) : (
                                                            <button
                                                                disabled
                                                                className="px-4 md:px-6 py-2 bg-gray-200 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed flex items-center gap-2"
                                                            >
                                                                Pending
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Nested Item Details */}
                                        <tr className="bg-gray-50/30">
                                            <td colSpan={5} className="px-8 py-0">
                                                <div className="pl-14 pb-4 space-y-2 border-l-2 border-emerald-100 ml-5">
                                                    {invoice.items.map((item: any) => (
                                                        <div key={item.id} className="flex justify-between items-center max-w-md">
                                                            <div className="text-[11px] font-bold text-gray-500">
                                                                {item.description} <span className="text-gray-300 ml-1">x{item.quantity}</span>
                                                            </div>
                                                            <div className="text-[11px] font-black text-gray-400">${item.unit_price}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    </>
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

                    {/* Return History Section */}
                    <div className="mt-8 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-emerald-500" /> Recent Returns History
                        </h3>
                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order/Pass</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Items Returned</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Approved By</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {returnHistory.map((ret: any) => (
                                        <tr key={ret.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-[11px] font-bold text-gray-900">{new Date(ret.requested_at).toLocaleDateString()}</div>
                                                <div className="text-[9px] text-gray-400 uppercase">{new Date(ret.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[11px] font-black text-gray-900 uppercase">Order #{ret.order}</div>
                                                <div className="text-[9px] text-gray-400">Room: {ret.room}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[11px] font-medium text-gray-600 max-w-[200px] truncate" title={ret.items_summary}>
                                                    {ret.items_summary}
                                                </div>
                                                <div className="text-[9px] italic text-gray-400 truncate max-w-[200px]">"{ret.reason}"</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {ret.approver_name ? (
                                                    <div>
                                                        <div className="text-[11px] font-black text-gray-900 uppercase">{ret.approver_name}</div>
                                                        <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{ret.approver_department}</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] text-gray-400 font-bold italic">Auto-System</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${ret.status === 'APPROVED_ADMIN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    ret.status === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                        'bg-orange-50 text-orange-600 border border-orange-100'
                                                    }`}>
                                                    {ret.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {returnHistory.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm italic">
                                                No processed returns in the recent history.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Invoice Modal */}
            {isEditModalOpen && editingInvoice && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Edit Invoice</h3>
                                <p className="text-gray-400 text-sm font-medium tracking-tight mt-1">Modifying Invoice #{editingInvoice.invoice_number}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all">
                                <RefreshCw className="rotate-45" size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateInvoice} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Reference Location</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-300"
                                        placeholder="e.g. Table T5"
                                        value={editingInvoice.reference_location || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, reference_location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Discount Type</label>
                                    <select
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={editingInvoice.discount_type || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, discount_type: e.target.value || null })}
                                    >
                                        <option value="">No Discount</option>
                                        <option value="FIXED">Fixed Amount ($)</option>
                                        <option value="PERCENT">Percentage (%)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Discount Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-300"
                                        value={editingInvoice.discount_amount}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, discount_amount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Discount Reason</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-300 h-24 resize-none"
                                    placeholder="Enter reason for discount..."
                                    value={editingInvoice.discount_reason || ''}
                                    onChange={(e) => setEditingInvoice({ ...editingInvoice, discount_reason: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-900 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-3 px-8 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
