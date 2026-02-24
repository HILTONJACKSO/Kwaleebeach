'use client';
import { useState, useEffect } from 'react';
import { useUI } from '@/context/UIContext';
import { Waves, UserCheck, CreditCard, Search, CheckCircle, XCircle, Users, Ticket } from 'lucide-react';
import Link from 'next/link';
import PrintablePass from '@/components/PrintablePass';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PassType {
    id: number;
    name: string;
    price: string;
    location: string;
}

export default function PoolPage() {
    const { showNotification, showModal } = useUI();
    const [activeTab, setActiveTab] = useState<'verify' | 'sell' | 'special'>('verify');
    const [roomNumber, setRoomNumber] = useState('');
    const [customEventName, setCustomEventName] = useState('');
    const [customEventPrice, setCustomEventPrice] = useState('');
    const [verificationResult, setVerificationResult] = useState<{ valid: boolean; message: string; guest_name?: string } | null>(null);
    const [passTypes, setPassTypes] = useState<PassType[]>([]);
    const [stats, setStats] = useState({
        daily_revenue: 0,
        passes_sold: 0,
        month_revenue: 0,
        month_passes: 0
    });
    const [generatedPass, setGeneratedPass] = useState<any | null>(null);
    const [recentPasses, setRecentPasses] = useState<any[]>([]);

    useEffect(() => {
        const fetchPassTypes = async () => {
            try {
                const res = await fetch('/api/recreation/types/?t=' + new Date().getTime(), {
                    cache: 'no-store',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                    }
                });
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setPassTypes(data.filter((p: PassType) => p.location === 'POOL'));
                } else {
                    console.error('Invalid data format:', data);
                }
            } catch (e) {
                console.error('Fetch pass types error:', e);
                showNotification('Failed to fetch pass types', 'error');
            }
        };

        fetchPassTypes();
        fetchStats();
        fetchRecent();
    }, []);

    const fetchStats = () => {
        fetch('/api/recreation/passes/stats/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.today && data.month) {
                    setStats({
                        daily_revenue: data.today.pool?.revenue || 0,
                        passes_sold: data.today.pool?.passes || 0,
                        month_revenue: data.month.pool?.revenue || 0,
                        month_passes: data.month.pool?.passes || 0
                    });
                }
            })
            .catch(err => console.error('Fetch stats error:', err));
    };

    const fetchRecent = () => {
        fetch('/api/recreation/passes/recent/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setRecentPasses(data.filter((p: any) => p.location === 'POOL' || p.location === undefined));
                }
            })
            .catch(err => console.error('Fetch recent error:', err));
    };

    const handleVerify = async () => {
        if (!roomNumber) return;
        try {
            const res = await fetch(`/api/recreation/passes/checkin-resident/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({ room_number: roomNumber, location: 'POOL' })
            });

            const data = await res.json();

            if (res.ok) {
                setVerificationResult({ valid: true, message: 'Resident Verified', guest_name: data.guest_name });
                showNotification(`Welcome ${data.guest_name}! Access Generated.`, 'success');
                fetchStats();
                fetchRecent();
            } else {
                setVerificationResult({ valid: false, message: data.error || 'Access Denied' });
                showNotification(data.error || 'Access Denied', 'error');
            }
        } catch (e) {
            showNotification('Verification failed', 'error');
        }
    };

    const handleSell = async (passType: PassType) => {
        try {
            const res = await fetch('/api/recreation/passes/sell/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({ pass_type_id: passType.id })
            });
            if (res.ok) {
                const data = await res.json();
                showNotification(`${passType.name} Sold!`, 'success');
                setGeneratedPass(data);
                fetchStats();
                fetchRecent();
            }
        } catch (e) {
            showNotification('Sale failed', 'error');
        }
    };

    const handleSellCustom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customEventName || !customEventPrice) return;

        try {
            const res = await fetch('/api/recreation/passes/sell/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({
                    custom_name: customEventName,
                    custom_price: parseFloat(customEventPrice),
                    location: 'POOL'
                })
            });
            if (res.ok) {
                const data = await res.json();
                showNotification(`${customEventName} Pass Issued!`, 'success');
                setGeneratedPass(data);
                setCustomEventName('');
                setCustomEventPrice('');
                fetchStats();
                fetchRecent();
            } else {
                showNotification('Sale failed', 'error');
            }
        } catch (e) {
            showNotification('Connection error', 'error');
        }
    };

    const markAsPrinted = async () => {
        if (!generatedPass) return;
        try {
            await fetch(`/api/recreation/passes/${generatedPass.id}/mark-printed/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                }
            });
            fetchRecent();
        } catch (e) {
            console.error('Failed to mark as printed', e);
        }
    };

    return (
        <div className="space-y-8">
            {generatedPass && (
                <PrintablePass
                    details={generatedPass}
                    onClose={() => setGeneratedPass(null)}
                    onPrint={markAsPrinted}
                />
            )}

            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 flex-wrap">
                        Pool Management <Waves className="text-cyan-500" size={32} />
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight text-sm">Verify hotel guests or sell pool access passes.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 w-full xl:w-auto">
                    <div className="bg-white px-4 py-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Today Revenue</div>
                        <div className="text-xl sm:text-2xl font-black text-gray-900">${stats.daily_revenue || '0.00'}</div>
                        <div className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-3 py-1 rounded-full mt-2">
                            {stats.passes_sold || 0} Visitors
                        </div>
                    </div>
                    <div className="bg-cyan-50 px-4 py-4 rounded-2xl border border-cyan-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="text-[10px] uppercase font-black text-cyan-600 tracking-widest mb-1">Month Total</div>
                        <div className="text-xl sm:text-2xl font-black text-gray-900">${stats.month_revenue || '0.00'}</div>
                        <div className="text-[10px] text-cyan-600 font-bold bg-white px-3 py-1 rounded-full mt-2">
                            {stats.month_passes || 0} Total
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('verify')}
                    className={`pb-4 px-4 text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'verify' ? 'border-b-4 border-cyan-500 text-cyan-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Verification
                </button>
                <button
                    onClick={() => setActiveTab('sell')}
                    className={`pb-4 px-4 text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'sell' ? 'border-b-4 border-emerald-500 text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Pool Access
                </button>
                <button
                    onClick={() => setActiveTab('special')}
                    className={`pb-4 px-4 text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'special' ? 'border-b-4 border-purple-500 text-purple-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Special Event
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
                {activeTab === 'verify' ? (
                    <div className="card bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <UserCheck className="text-cyan-500" /> Verify Resident
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="text"
                                    placeholder="Room Number..."
                                    value={roomNumber}
                                    onChange={(e) => setRoomNumber(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-all border-none"
                                />
                            </div>
                            <button
                                onClick={handleVerify}
                                className="w-full sm:w-auto bg-cyan-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-200"
                            >
                                Verify
                            </button>
                        </div>

                        {verificationResult && (
                            <div className={`p-6 rounded-3xl border-2 ${verificationResult.valid ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} animate-in fade-in slide-in-from-bottom-4`}>
                                <div className="flex items-center gap-4 mb-2">
                                    {verificationResult.valid ? <CheckCircle className="text-emerald-500" size={32} /> : <XCircle className="text-red-500" size={32} />}
                                    <h3 className={`text-xl font-black ${verificationResult.valid ? 'text-emerald-700' : 'text-red-700'}`}>
                                        {verificationResult.valid ? 'Access Granted' : 'Access Denied'}
                                    </h3>
                                </div>
                                <p className={`text-sm font-medium ${verificationResult.valid ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {verificationResult.message}
                                </p>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'sell' ? (
                    <div className="card bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Ticket className="text-emerald-500" /> Issue Pool Access
                        </h2>
                        <div className="space-y-4">
                            {passTypes.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {passTypes.map(pass => (
                                        <div key={pass.id} className="p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-0 hover:border-emerald-500 hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                                                    <Ticket size={20} className="sm:hidden" />
                                                    <Ticket size={24} className="hidden sm:block" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-black text-gray-900 text-sm md:text-base">{pass.name}</div>
                                                    <div className="text-lg sm:text-xl font-black text-gray-500">${pass.price}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleSell(pass)}
                                                className="w-full sm:w-auto bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 hover:text-white transition-all shadow-sm group-hover:shadow-emerald-200"
                                            >
                                                Issue pass
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold">
                                    No Pool Passes Configured
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="card bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Ticket className="text-purple-500" /> Special Event Pass
                        </h2>
                        <form onSubmit={handleSellCustom} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Event Name / Pass Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Moonlight Swim"
                                    value={customEventName}
                                    onChange={(e) => setCustomEventName(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={customEventPrice}
                                    onChange={(e) => setCustomEventPrice(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-purple-600 text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                            >
                                Issue Custom Pass
                            </button>
                        </form>
                    </div>
                )}

                {/* Info Section */}
                <div className="bg-cyan-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                    <Waves className="absolute -right-10 -bottom-10 text-white/5" size={200} />
                    <h3 className="text-2xl font-black mb-4">Pool Rules</h3>
                    <ul className="space-y-3 text-cyan-100 font-medium">
                        <li className="flex items-center gap-3"><CheckCircle size={16} /> Hotel guests access is free.</li>
                        <li className="flex items-center gap-3"><CheckCircle size={16} /> Pool access passes expire at 8:00 PM.</li>
                        <li className="flex items-center gap-3"><CheckCircle size={16} /> Max capacity: 45 people.</li>
                    </ul>
                </div>
            </div>

            {/* Recent Headers */}
            <div className="pt-8 border-t border-gray-200">
                <h2 className="text-xl font-black text-gray-900 mb-6">Recent Activity</h2>
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Guest / Room</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pass Type</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentPasses.map(pass => (
                                    <tr key={pass.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6 font-medium text-gray-500">
                                            {new Date(pass.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-6 font-bold text-gray-900">
                                            {pass.guest_name || 'Walk-in'}
                                            {pass.room_number && <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-500">Room {pass.room_number}</span>}
                                        </td>
                                        <td className="p-6">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                {pass.pass_type_name}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            {pass.is_printed ? (
                                                <span className="text-gray-400 font-bold text-sm flex items-center gap-1 cursor-not-allowed">
                                                    <CheckCircle size={14} /> Printed
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setGeneratedPass({ ...pass, location: 'POOL' })}
                                                    className="text-cyan-600 hover:text-cyan-800 font-bold text-sm underline decoration-2 underline-offset-4"
                                                >
                                                    Print Ticket
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {
                                    recentPasses.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-medium bg-gray-50/30">No recent activity.</td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    );
}
