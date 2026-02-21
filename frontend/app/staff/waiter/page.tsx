'use client';
import { useEffect, useState } from 'react';
import { useUI } from '@/context/UIContext';
import { Clock, CheckCircle, Utensils, MapPin, Hash, Coffee, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

interface OrderItem {
    id: number;
    menu_item_name: string;
    quantity: number;
    price_at_time: string;
}

interface Order {
    id: number;
    room: string;
    location_type: string;
    status: string;
    total_amount: string;
    created_at: string;
    items: OrderItem[];
    returns: any[]; // Added to track return status
}

export default function WaiterPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN', 'WAITER']}>
            <WaiterPageContent />
        </ProtectedRoute>
    );
}

function WaiterPageContent() {
    const { showNotification } = useUI();
    const [readyOrders, setReadyOrders] = useState<Order[]>([]);
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReturnOrder, setSelectedReturnOrder] = useState<number | null>(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [submittingReturn, setSubmittingReturn] = useState(false);

    const fetchOrders = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/inventory/orders/active/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                const data: Order[] = await res.json();

                // Partition orders into READY (High Priority) and OTHERS
                const ready = data.filter(o => o.status === 'READY');
                const others = data.filter(o => o.status === 'PENDING' || o.status === 'PREPARING' || o.status === 'SERVED');

                setReadyOrders(ready);
                setActiveOrders(others);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 2000);
        return () => clearInterval(interval);
    }, []);

    const markAsServed = async (id: number) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/inventory/orders/${id}/update-status/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: 'SERVED' })
            });
            if (res.ok) {
                showNotification(`Order #${id} Served!`, 'success');
                fetchOrders();
            }
        } catch (e) {
            showNotification("Failed to update status", "error");
        }
    };

    const handleReturnSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReturnOrder || !returnReason.trim()) return;

        setSubmittingReturn(true);
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/inventory/orders/${selectedReturnOrder}/request-return/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ reason: returnReason })
            });

            if (res.ok) {
                showNotification("Return request submitted to Kitchen/Bar", "success");
                setIsReturnModalOpen(false);
                setReturnReason('');
                fetchOrders();
            } else {
                showNotification("Failed to request return", "error");
            }
        } catch (error) {
            showNotification("Connection error", "error");
        } finally {
            setSubmittingReturn(false);
        }
    };

    const getLocationLabel = (type: string) => {
        switch (type) {
            case 'ROOM': return 'Room Service';
            case 'TABLE': return 'Restaurant Table';
            case 'POOL': return 'Poolside';
            case 'BEACH': return 'Beachside';
            default: return 'Location';
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Waiter Station <Coffee className="text-[var(--color-primary)]" size={32} />
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight">Manage service for ready orders across the resort.</p>
                </div>

                {/* Service Stats Card */}
                <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 shadow-sm min-w-[240px] text-left">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Service (Waiter)</h3>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-xl font-black text-gray-900">$6,430.00</div>
                            <div className="text-[10px] font-medium text-emerald-600">Total Processed</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-gray-500">231 Served</div>
                            <div className="text-[10px] text-gray-400">14 mins Avg</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ready Queue (High Priority) */}
            <div>
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                    Ready to Serve ({readyOrders.length})
                </h2>

                {readyOrders.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
                        <CheckCircle size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">All Caught Up!</h3>
                        <p className="text-gray-400">No orders are currently waiting to be served.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {readyOrders.map(order => (
                            <div key={order.id} className="bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-6">
                                    <span className="bg-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                        READY
                                    </span>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm">
                                            <Hash size={20} className="text-gray-900" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Order ID</div>
                                            <div className="text-2xl font-black text-gray-900">#{order.id}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600 font-bold mb-6">
                                        <MapPin size={18} className="text-emerald-600" />
                                        <span>{getLocationLabel(order.location_type)}: {order.room}</span>
                                    </div>

                                    <div className="space-y-2 mb-8">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex justify-between items-center text-sm font-medium border-b border-emerald-100/50 pb-2 last:border-0 text-gray-700">
                                                <span>{item.quantity}x {item.menu_item_name}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        {/* Check for active return requests */}
                                        {order.returns && order.returns.some((r: any) => r.status === 'REQUESTED') ? (
                                            <button
                                                disabled
                                                className="flex-1 bg-amber-100 text-amber-600 py-4 rounded-xl font-black text-sm uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                <RefreshCw size={18} /> Return Pending
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => markAsServed(order.id)}
                                                className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={18} /> Mark as Served
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { setSelectedReturnOrder(order.id); setIsReturnModalOpen(true); }}
                                            className="p-4 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                            title="Request Return"
                                        >
                                            <RefreshCw size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Queue (Info Only) */}
            <div className="pt-8 border-t border-gray-200">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 text-gray-400">
                    <Utensils size={20} /> In the Kitchen ({activeOrders.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {activeOrders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 opacity-70 hover:opacity-100 transition-opacity flex justify-between items-center group">
                            <div>
                                <div className="flex justify-between items-start mb-2 gap-4">
                                    <span className="font-bold text-gray-900">#{order.id}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${order.status === 'PREPARING' ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-xs font-medium text-gray-500 mb-2">
                                    {getLocationLabel(order.location_type)}: {order.room}
                                </div>
                                <div className="text-xs text-gray-400">
                                    <Link
                                        href={`/staff/waiter/return/${order.id}`}
                                        className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <RefreshCw size={14} /> Return
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {activeOrders.length === 0 && (
                        <div className="text-gray-400 text-sm font-medium italic">Kitchen is clear.</div>
                    )}
                </div>
            </div>
            {/* Return Request Modal */}
            {isReturnModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsReturnModalOpen(false)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 overflow-hidden shadow-2xl border border-gray-100">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Request Return</h3>
                                <p className="text-xs font-medium text-gray-400">Order #{selectedReturnOrder}</p>
                            </div>
                            <button onClick={() => setIsReturnModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleReturnSubmit} className="p-8 space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Reason for Return</label>
                                <textarea
                                    required
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    placeholder="e.g. Dish was cold, Guest changed mind, Wrong item..."
                                    className="w-full bg-white border-2 border-gray-300 rounded-3xl p-6 text-sm font-bold text-black focus:border-[var(--color-primary)] transition-all outline-none min-h-[150px] resize-none shadow-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submittingReturn || !returnReason.trim()}
                                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                            >
                                {submittingReturn ? "Submitting..." : <><RefreshCw size={16} /> Submit Return Request</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
