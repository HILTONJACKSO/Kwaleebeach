'use client';
import { useEffect, useState } from 'react';
import { useUI } from '@/context/UIContext';
import { Clock, CheckCircle, Play, Utensils, MapPin, Hash, Sparkles, ShieldAlert } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface OrderItem {
    id: number;
    menu_item_name: string;
    preparation_station: string;
    quantity: number;
}

interface Order {
    id: number;
    room: string;
    status: string;
    created_at: string;
    items: OrderItem[];
}

export default function KitchenPage() {
    const { showNotification } = useUI();
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [pendingReturns, setPendingReturns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = (): Record<string, string> => {
        const token = localStorage.getItem('yarvo_token');
        if (!token || token === 'undefined' || token === 'null') return {};
        return { 'Authorization': `Bearer ${token}` };
    };

    const handle401 = () => {
        localStorage.removeItem('yarvo_token');
        window.location.href = '/login';
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/inventory/reports/', {
                headers: getAuthHeaders()
            });
            if (res.status === 401) return handle401();
            if (res.ok) {
                const data = await res.json();
                setStats(data.kitchen_stats);
            }
        } catch (e: any) {
            console.error(e);
            setError(`Stats Sync Error: ${e.message}`);
        }
    };

    const fetchReturns = async () => {
        try {
            const res = await fetch('/api/inventory/order-returns/', {
                headers: getAuthHeaders()
            });
            if (res.status === 401) return handle401();
            if (res.ok) {
                const data = await res.json();
                // Filter for requested returns that have at least one kitchen item
                const requested = data.filter((r: any) =>
                    r.status === 'REQUESTED' &&
                    r.order_details?.items?.some((i: any) => i.preparation_station === 'KITCHEN')
                );
                setPendingReturns(requested);
            }
        } catch (e: any) {
            console.error(e);
            setError(`Returns Sync Error: ${e.message}`);
        }
    };

    const fetchOrders = async () => {
        try {
            fetchReturns();
            fetchStats();
            const res = await fetch('/api/inventory/orders/active/', {
                headers: getAuthHeaders()
            });
            if (res.status === 401) return handle401();
            if (res.ok) {
                const data: Order[] = await res.json();
                // Filter orders to only include those with KITCHEN items
                const kitchenOrders = data.filter(order =>
                    order.items.some((item: any) => item.preparation_station === 'KITCHEN')
                ).map(order => ({
                    ...order,
                    items: order.items.filter((item: any) => item.preparation_station === 'KITCHEN')
                }));
                setOrders(kitchenOrders);
                setError(null);
            } else {
                setError(`API Error: ${res.status} ${res.statusText}`);
            }
        } catch (e: any) {
            console.error(e);
            setError(`Network Error: ${e.message}`);
        }
        finally { setLoading(false); }
    };

    const approveReturn = async (id: number) => {
        try {
            const res = await fetch(`/api/inventory/order-returns/${id}/approve_station/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                }
            });
            if (res.ok) {
                showNotification("Return Approved by Kitchen", "success");
                fetchOrders();
            }
        } catch (e) {
            showNotification("Failed to approve return", "error");
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 2000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            const res = await fetch(`/api/inventory/orders/${id}/update-status/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                showNotification(`Order #${id} updated to ${status}`, 'success');
                fetchOrders();
            }
        } catch (e) {
            showNotification("Failed to update order status", "error");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'border-orange-200 bg-white';
            case 'PREPARING': return 'border-[var(--color-primary)] bg-orange-50';
            case 'READY': return 'border-emerald-200 bg-emerald-50';
            default: return 'border-gray-100 bg-white';
        }
    };

    return (
        <div className="space-y-8">
            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-4">
                    <ShieldAlert size={20} />
                    <p className="text-sm font-bold">System Sync Alert: {error}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 flex-wrap">
                        Kitchen Display (KDS) <Sparkles className="text-[var(--color-primary)]" size={24} />
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight text-sm">Real-time order management and kitchen coordination.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex-1 sm:flex-none">
                        <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                            {orders.length} Active Orders
                        </div>
                    </div>

                    {/* Kitchen Stats Card */}
                    <div className="bg-orange-50 px-6 py-4 rounded-2xl border border-orange-100 shadow-sm flex-1 sm:min-w-[280px]">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">Kitchen Performance</h3>
                        <div className="flex justify-between items-end gap-4">
                            <div>
                                <div className="text-xl font-black text-gray-900">${stats?.revenue_today.toFixed(2) || '0.00'}</div>
                                <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{stats?.served || 0} Served Today</div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-[10px] font-bold text-gray-500 truncate max-w-[120px]">{stats?.top_item || 'No Sales'}</div>
                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stats?.avg_time || 0}m Avg Prep</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Returns (Urgent) */}
            {pendingReturns.length > 0 && (
                <div className="bg-orange-600 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-xl shadow-orange-100 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                            <Clock size={24} className="md:w-7 md:h-7" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-black uppercase tracking-widest">Return Requests</h2>
                            <p className="text-orange-100 text-sm font-medium">There are {pendingReturns.length} orders waiting.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide lg:pb-0 w-full lg:max-w-xl">
                        {pendingReturns.map(ret => (
                            <div key={ret.id} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl min-w-[240px] border border-white/20 flex flex-col justify-between">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest mb-1">Order #{ret.order}</div>
                                    <div className="text-xs font-medium mb-3 line-clamp-2">"{ret.reason}"</div>
                                </div>
                                <button
                                    onClick={() => approveReturn(ret.id)}
                                    className="w-full bg-white text-orange-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 transition-colors mt-auto"
                                >
                                    Approve Return
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading && orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Fetching Orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Utensils size={40} className="text-gray-200" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Kitchen is Quiet</h2>
                    <p className="text-gray-400 max-w-sm mx-auto">No orders are currently in the queue. Take a moment to prep for the next rush!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {orders.map(order => (
                        <div key={order.id} className={`flex flex-col h-full rounded-[2.5rem] border-2 shadow-sm transition-all duration-300 ${getStatusColor(order.status)}`}>
                            {/* Card Header */}
                            <div className="p-6 border-b border-inherit bg-white/50 backdrop-blur-sm rounded-t-[2.5rem]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gray-900 text-white p-2 rounded-xl">
                                            <Hash size={16} />
                                        </div>
                                        <span className="text-xl font-black text-gray-900">{order.id}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-full">
                                        <Clock size={14} />
                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold truncate">
                                    <MapPin size={16} className="text-[var(--color-primary)]" />
                                    <span>{order.location_type === 'WALK_IN' ? 'Walk-in' : order.room}</span>
                                </div>
                            </div>

                            {/* Card Body (Items) */}
                            <div className="p-6 flex-1 space-y-3">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/40 border border-white/50">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-black">
                                                {item.quantity}
                                            </span>
                                            <span className="text-sm font-bold text-gray-800">{item.menu_item_name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Card Footer (Actions) */}
                            <div className="p-6 pt-0 mt-auto">
                                <div className="flex gap-3">
                                    {order.status === 'PENDING' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'PREPARING')}
                                            className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--color-primary)] transition-all shadow-lg shadow-gray-200"
                                        >
                                            <Play size={16} /> Start Prep
                                        </button>
                                    )}
                                    {order.status === 'PREPARING' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'READY')}
                                            className="flex-1 bg-[var(--color-primary)] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-orange-200"
                                        >
                                            <CheckCircle size={16} /> Mark Ready
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
