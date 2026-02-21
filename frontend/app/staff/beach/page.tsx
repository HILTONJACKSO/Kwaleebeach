'use client';
import { useState, useEffect } from 'react';
import { useUI } from '@/context/UIContext';
import { Umbrella, UserCheck, CreditCard, Search, CheckCircle, XCircle, Users, Sun, Ticket } from 'lucide-react';
import Link from 'next/link';
import PrintablePass from '@/components/PrintablePass';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PassType {
    id: number;
    name: string;
    price: string;
    location: string;
}

export default function BeachPage() {
    const { showNotification, showModal } = useUI();
    const [activeTab, setActiveTab] = useState<'verify' | 'sell'>('verify');
    const [roomNumber, setRoomNumber] = useState('');
    const [recentPasses, setRecentPasses] = useState<any[]>([]);
    const [verificationResult, setVerificationResult] = useState<{ valid: boolean; message: string; guest_name?: string } | null>(null);
    const [passTypes, setPassTypes] = useState<PassType[]>([]);
    const [stats, setStats] = useState({
        daily_revenue: 0,
        passes_sold: 0,
        month_revenue: 0,
        month_passes: 0
    });
    const [generatedPass, setGeneratedPass] = useState<any | null>(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/recreation/types/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPassTypes(data.filter((p: PassType) => p.location === 'BEACH'));
                }
            })
            .catch(err => console.error('Fetch pass types error:', err));

        fetchStats();
        fetchRecent();
    }, []);

    const fetchStats = () => {
        // In a real app we might filter stats by location, but for now we show global recreation stats or separate endpoints
        fetch('http://127.0.0.1:8000/api/recreation/passes/stats/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.today && data.month) {
                    setStats({
                        daily_revenue: data.today.beach?.revenue || 0,
                        passes_sold: data.today.beach?.passes || 0,
                        month_revenue: data.month.beach?.revenue || 0,
                        month_passes: data.month.beach?.passes || 0
                    });
                }
            })
            .catch(err => console.error('Fetch stats error:', err));
    };

    const fetchRecent = () => {
        fetch('http://127.0.0.1:8000/api/recreation/passes/recent/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setRecentPasses(data.filter((p: any) => p.location === 'BEACH' || p.location === undefined));
                }
            })
            .catch(err => console.error('Fetch recent error:', err));
        // Filtering in frontend for now
    };

    const handleVerify = async () => {
        if (!roomNumber) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/recreation/passes/checkin-resident/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ room_number: roomNumber, location: 'BEACH' })
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
            const res = await fetch('http://127.0.0.1:8000/api/recreation/passes/sell/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ pass_type_id: passType.id })
            });
            if (res.ok) {
                const data = await res.json();
                showNotification(`${passType.name} Sold!`, 'success');
                fetchStats();
                fetchRecent();
            }
        } catch (e) {
            showNotification('Sale failed', 'error');
        }
    };

    const markAsPrinted = async () => {
        if (!generatedPass) return;
        try {
            await fetch(`http://127.0.0.1:8000/api/recreation/passes/${generatedPass.id}/mark-printed/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Beach Access <Umbrella className="text-orange-500" size={32} />
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight">Private beach entry and lounger rentals.</p>
                </div>

                {/* KPI Cards */}
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm text-center min-w-[140px]">
                        <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Today's Revenue</div>
                        <div className="text-2xl font-black text-gray-900">${stats.daily_revenue || '0.00'}</div>
                        <div className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                            {stats.passes_sold || 0} Visitors
                        </div>
                    </div>
                    <div className="bg-orange-50 px-6 py-4 rounded-2xl border border-orange-100 shadow-sm text-center min-w-[140px]">
                        <div className="text-[10px] uppercase font-black text-orange-600 tracking-widest mb-1">Month Total</div>
                        <div className="text-2xl font-black text-gray-900">${stats.month_revenue || '0.00'}</div>
                        <div className="text-[10px] text-orange-600 font-bold bg-white px-2 py-0.5 rounded-full inline-block mt-1">
                            {stats.month_passes || 0} Total
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('verify')}
                    className={`pb-4 px-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'verify' ? 'border-b-4 border-orange-500 text-orange-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Guest Verification
                </button>
                <button
                    onClick={() => setActiveTab('sell')}
                    className={`pb-4 px-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'sell' ? 'border-b-4 border-emerald-500 text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Sell Access Pass
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {activeTab === 'verify' ? (
                    <div className="card bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <UserCheck className="text-orange-500" /> Verify Resident
                        </h2>
                        <div className="flex gap-3 mb-8">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="text"
                                    placeholder="Enter Room Number..."
                                    value={roomNumber}
                                    onChange={(e) => setRoomNumber(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={handleVerify}
                                className="bg-orange-500 text-white px-8 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
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
                ) : (
                    <div className="card bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center">
                        <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center mb-8">
                            <CreditCard className="text-orange-500" size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-4">Beach Sales Terminal</h2>
                        <p className="text-gray-400 max-w-xs mb-10">Authorize private beach access and lounger rentals. Secure digital ticketing for all walk-in visitors.</p>
                        <Link
                            href="/staff/beach/sell"
                            className="bg-gray-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-orange-600 transition-all shadow-xl shadow-gray-200 flex items-center gap-3"
                        >
                            <Ticket size={20} /> Open Sales Terminal
                        </Link>
                    </div>
                )}

                {/* Info Section */}
                <div className="bg-orange-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden flex flex-col justify-center">
                    <Umbrella className="absolute -right-10 -bottom-10 text-white/5" size={200} />
                    <h3 className="text-2xl font-black mb-4">Beach Safety</h3>
                    <ul className="space-y-3 text-orange-100 font-medium">
                        <li className="flex items-center gap-3"><CheckCircle size={16} /> Red Flag: Do not swim.</li>
                        <li className="flex items-center gap-3"><CheckCircle size={16} /> Yellow Flag: Caution.</li>
                        <li className="flex items-center gap-3"><CheckCircle size={16} /> Green Flag: Safe to swim.</li>
                    </ul>
                </div>
            </div>

            {/* Recent Headers */}
            <div className="pt-8 border-t border-gray-200">
                <h2 className="text-xl font-black text-gray-900 mb-6">Recent Activity</h2>
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Time</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Guest / Room</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Pass Type</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
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
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
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
                                                onClick={() => setGeneratedPass({ ...pass, location: 'BEACH' })}
                                                className="text-orange-600 hover:text-orange-800 font-bold text-sm underline decoration-2 underline-offset-4"
                                            >
                                                Print Ticket
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {recentPasses.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-400">No recent activity found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
