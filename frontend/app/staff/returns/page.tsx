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
}

interface PassReturn {
    id: number;
    access_pass: number;
    reason: string;
    status: string;
    requested_at: string;
}

export default function ReturnsPage() {
    const { showNotification } = useUI();
    const [orderReturns, setOrderReturns] = useState<OrderReturn[]>([]);
    const [passReturns, setPassReturns] = useState<PassReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'passes'>('orders');

    const fetchData = async () => {
        try {
            const [orderRes, passRes] = await Promise.all([
                fetch('/api/inventory/returns/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }),
                fetch('/api/recreation/returns/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
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
    }, []);

    const handleApproveOrder = async (id: number, type: 'station' | 'admin') => {
        try {
            const endpoint = type === 'station' ? 'approve_station' : 'approve_admin';
            const res = await fetch(`/api/inventory/returns/${id}/${endpoint}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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

    return (
        <div className="space-y-8">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Returns & Approvals <RefreshCw className="text-[var(--color-primary)]" size={32} />
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight text-sm">Manage and authorize order cancellation/returns.</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-full xl:w-fit">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex-1 xl:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Food & Drink
                    </button>
                    <button
                        onClick={() => setActiveTab('passes')}
                        className={`flex-1 xl:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'passes' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Pool Passes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {activeTab === 'orders' ? (
                    orderReturns.filter(r => r.status === 'REQUESTED' || r.status === 'APPROVED_STATION').map(ret => (
                        <div key={ret.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-50 text-orange-600 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0">
                                <RefreshCw size={28} />
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                                    <div className="px-4 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                        Order #{ret.order}
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

                                <div className="flex gap-3 items-start">
                                    <MessageCircle className="text-gray-300 mt-1 shrink-0" size={18} />
                                    <p className="text-gray-700 font-medium italic text-sm md:text-base">"{ret.reason}"</p>
                                </div>
                            </div>

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
                                    className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
                                >
                                    <CheckCircle size={16} /> Final Approve
                                </button>
                                <button className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100">
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    passReturns.filter(r => r.status === 'REQUESTED').map(ret => (
                        <div key={ret.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shrink-0">
                                <Waves size={28} />
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="px-4 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                        Pass #{ret.access_pass}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                                        <Clock size={14} />
                                        {new Date(ret.requested_at).toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex gap-3 items-start">
                                    <MessageCircle className="text-gray-300 mt-1 shrink-0" size={18} />
                                    <p className="text-gray-700 font-medium italic">"{ret.reason}"</p>
                                </div>
                            </div>

                            <div className="flex gap-3 shrink-0">
                                <button
                                    onClick={() => handleApprovePass(ret.id)}
                                    className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
                                >
                                    <CheckCircle size={16} /> Approve Return
                                </button>
                                <button className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100">
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {((activeTab === 'orders' && orderReturns.length === 0) || (activeTab === 'passes' && passReturns.length === 0)) && !loading && (
                    <div className="bg-white p-20 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center text-center">
                        <div className="p-6 bg-gray-50 text-gray-300 rounded-full mb-6">
                            <RefreshCw size={48} className="opacity-20" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">No Pending Returns</h3>
                        <p className="text-gray-400 font-medium max-w-xs mt-2">All return requests have been processed successfully.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
