'use client';
import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, Utensils, Beer, Waves, User, MessageCircle } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface OrderReturn {
    id: number;
    order: number;
    reason: string;
    status: string;
    requested_at: string;
    order_total: string;
    room: string;
    items_summary: string;
}

interface PassReturn {
    id: number;
    access_pass: number;
    reason: string;
    status: string;
    requested_at: string;
    pass_type_name: string;
    guest_name: string;
    amount_paid: string;
}

export default function ReturnsPage() {
    const { showNotification } = useUI();
    const [orderReturns, setOrderReturns] = useState<OrderReturn[]>([]);
    const [passReturns, setPassReturns] = useState<PassReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'passes'>('orders');
    const [view, setView] = useState<'approvals' | 'history'>('approvals');
    const [filterDays, setFilterDays] = useState<number>(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('yarvo_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            let orderUrl = '/api/inventory/returns/';
            let passUrl = '/api/recreation/returns/';

            if (view === 'history') {
                orderUrl += `history/?days=${filterDays}`;
                passUrl += `history/?days=${filterDays}`;
            }

            const [orderRes, passRes] = await Promise.all([
                fetch(orderUrl, { headers }),
                fetch(passUrl, { headers })
            ]);

            if (orderRes.ok) setOrderReturns(await orderRes.json());
            if (passRes.ok) setPassReturns(await passRes.json());
        } catch (e) {
            console.error("Failed to fetch returns", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [view, filterDays]);

    const handleApproveOrder = async (id: number, type: 'station' | 'admin') => {
        try {
            const endpoint = type === 'station' ? 'approve_station' : 'approve_admin';
            const res = await fetch(`/api/inventory/returns/${id}/${endpoint}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                }
            });
            if (res.ok) {
                showNotification("Return Approved", "success");
                fetchData();
            }
        } catch (e) {
            showNotification("Action failed", "error");
        }
    };

    const handleApprovePass = async (id: number) => {
        try {
            const res = await fetch(`/api/recreation/returns/${id}/approve/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                }
            });
            if (res.ok) {
                showNotification("Pass Return Approved", "success");
                fetchData();
            }
        } catch (e) {
            showNotification("Action failed", "error");
        }
    };

    const filteredOrders = view === 'approvals'
        ? orderReturns.filter(r => r.status === 'REQUESTED' || r.status === 'APPROVED_STATION')
        : orderReturns;

    const filteredPasses = view === 'approvals'
        ? passReturns.filter(r => r.status === 'REQUESTED')
        : passReturns;

    return (
        <div className="space-y-8">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Returns & Approvals <RefreshCw className="text-[var(--color-primary)]" size={32} />
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight text-sm">Manage and authorize order cancellation/returns.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    {/* View Toggle */}
                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => setView('approvals')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'approvals' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Approvals
                        </button>
                        <button
                            onClick={() => setView('history')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            History
                        </button>
                    </div>

                    {/* Tab Toggle */}
                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Food & Drink
                        </button>
                        <button
                            onClick={() => setActiveTab('passes')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'passes' ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Pool Passes
                        </button>
                    </div>
                </div>
            </div>

            {view === 'history' && (
                <div className="flex justify-end gap-3 animated-in fade-in slide-in-from-top duration-500">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 self-center mr-2">Time record:</p>
                    {[
                        { label: 'Today', val: 1 },
                        { label: '7 Days', val: 7 },
                        { label: '30 Days', val: 30 }
                    ].map(f => (
                        <button
                            key={f.val}
                            onClick={() => setFilterDays(f.val)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filterDays === f.val ? 'bg-white border-gray-900 text-gray-900' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-white'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {activeTab === 'orders' ? (
                    filteredOrders.map(ret => (
                        <div key={ret.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center animate-in zoom-in duration-300">
                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 ${ret.status === 'APPROVED_ADMIN' ? 'bg-emerald-50 text-emerald-600' :
                                    ret.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600'
                                }`}>
                                <RefreshCw size={28} />
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                                    <div className="px-4 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                        Order #{ret.order} - {ret.room}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                                        <Clock size={14} />
                                        {new Date(ret.requested_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${ret.status === 'REQUESTED' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            ret.status.includes('APPROVE') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                        {ret.status.replace('_', ' ')}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex gap-3 items-start">
                                        <Utensils className="text-gray-300 mt-1 shrink-0" size={18} />
                                        <p className="text-gray-900 font-bold text-sm md:text-base">{ret.items_summary}</p>
                                    </div>
                                    <div className="flex gap-3 items-start opacity-70">
                                        <MessageCircle className="text-gray-300 mt-1 shrink-0" size={18} />
                                        <p className="text-gray-700 font-medium italic text-xs">Reason: "{ret.reason}"</p>
                                    </div>
                                </div>
                            </div>

                            {view === 'approvals' && (
                                <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full lg:w-auto">
                                    {ret.status === 'REQUESTED' && (
                                        <button
                                            onClick={() => handleApproveOrder(ret.id, 'station')}
                                            className="flex-1 lg:flex-none px-6 py-4 lg:py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Station Approve
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleApproveOrder(ret.id, 'admin')}
                                        className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
                                    >
                                        <CheckCircle size={16} /> Final Approve
                                    </button>
                                    <button className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100">
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            )}

                            {view === 'history' && (
                                <div className="shrink-0 text-right hidden lg:block">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Impact</p>
                                    <p className="text-lg font-black text-gray-900">-${ret.order_total}</p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    filteredPasses.map(ret => (
                        <div key={ret.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center animate-in zoom-in duration-300">
                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 ${ret.status.includes('APPROVE') ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                <Waves size={28} />
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                                    <div className="px-4 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                        Pass #{ret.access_pass} - {ret.guest_name || 'Guest'}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                                        <Clock size={14} />
                                        {new Date(ret.requested_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${ret.status === 'REQUESTED' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                        }`}>
                                        {ret.status.replace('_', ' ')}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-gray-900 font-bold text-sm md:text-base">{ret.pass_type_name}</p>
                                    <div className="flex gap-3 items-start opacity-70">
                                        <MessageCircle className="text-gray-300 mt-1 shrink-0" size={18} />
                                        <p className="text-gray-700 font-medium italic text-xs">Reason: "{ret.reason}"</p>
                                    </div>
                                </div>
                            </div>

                            {view === 'approvals' && (
                                <div className="flex gap-3 shrink-0 w-full lg:w-auto">
                                    <button
                                        onClick={() => handleApprovePass(ret.id)}
                                        className="flex-1 lg:flex-none px-8 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} /> Approve Return
                                    </button>
                                    <button className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100">
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            )}

                            {view === 'history' && (
                                <div className="shrink-0 text-right hidden lg:block">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Impact</p>
                                    <p className="text-lg font-black text-gray-900">-${ret.amount_paid}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}

                {((activeTab === 'orders' && filteredOrders.length === 0) || (activeTab === 'passes' && filteredPasses.length === 0)) && !loading && (
                    <div className="bg-white p-20 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center text-center animate-in fade-in duration-500">
                        <div className="p-6 bg-gray-50 text-gray-300 rounded-full mb-6">
                            <RefreshCw size={48} className="opacity-20" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">No {view === 'history' ? 'History' : 'Pending Returns'}</h3>
                        <p className="text-gray-400 font-medium max-w-xs mt-2">
                            {view === 'history'
                                ? "No returns recorded for this time period."
                                : "All return requests have been processed successfully."
                            }
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <RefreshCw className="text-gray-200 animate-spin mb-4" size={48} />
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Syncing Records...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
