'use client';
import { useEffect, useState } from 'react';
import { useUI } from '@/context/UIContext';
import { Clock, CheckCircle, Play, Beer, MapPin, Hash, Sparkles, Utensils } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

interface OrderItem {
    id: number;
    menu_item_name: string;
    quantity: number;
    preparation_station: string;
}

interface Order {
    id: number;
    room: string;
    status: string;
    created_at: string;
    items: OrderItem[];
}

export default function BarPage() {
    const { showNotification } = useUI();
    const [orders, setOrders] = useState<Order[]>([]);
    const [pendingReturns, setPendingReturns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReturns = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/inventory/order-returns/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter for requested returns that have at least one BAR item
                const requested = data.filter((r: any) =>
                    r.status === 'REQUESTED' &&
                    r.order_details?.items?.some((i: any) => i.preparation_station === 'BAR')
                );
                setPendingReturns(requested);
            }
        } catch (e) { console.error(e); }
    };

    const fetchOrders = async () => {
        try {
            fetchReturns();
            const res = await fetch('http://127.0.0.1:8000/api/inventory/orders/active/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                const data: Order[] = await res.json();
                // Filter orders to only include those with BAR items
                const barOrders = data.filter(order =>
                    order.items.some(item => item.preparation_station === 'BAR')
                ).map(order => ({
                    ...order,
                    items: order.items.filter(item => item.preparation_station === 'BAR')
                }));
                setOrders(barOrders);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const approveReturn = async (id: number) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/inventory/order-returns/${id}/approve_station/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                showNotification("Return Approved by Bar", "success");
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
            const res = await fetch(`http://127.0.0.1:8000/api/inventory/orders/${id}/update-status/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            case 'PENDING': return 'border-blue-200 bg-white';
            case 'PREPARING': return 'border-blue-500 bg-blue-50';
            case 'READY': return 'border-emerald-200 bg-emerald-50';
            default: return 'border-gray-100 bg-white';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Bar Display (BDS) <Beer className="text-blue-500" size={24} />
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight">Drink orders and cocktail preparation queue.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/staff/bar/sell"
                        className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-gray-200"
                    >
                        <Sparkles size={18} /> New Bar Sale
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 px-3 py-1 text-xs font-bold text-blue-600">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            {orders.length} Drink Orders
                        </div>
                    </div>

                    {/* Bar Stats Card */}
                    <div className="bg-blue-50 px-6 py-4 rounded-2xl border border-blue-100 shadow-sm min-w-[240px] text-left">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Bar Revenue</h3>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-xl font-black text-gray-900">$2,180.00</div>
                                <div className="text-[10px] font-medium text-blue-600">+5% vs last week</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-gray-500">Mojito</div>
                                <div className="text-[10px] text-gray-400">89 Sold</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Returns (Urgent) */}
            {pendingReturns.length > 0 && (
                <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row justify-between items-center gap-6 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Clock size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-widest">Return Requests Pending</h2>
                            <p className="text-blue-100 font-medium">There are {pendingReturns.length} drink orders waiting for your return approval.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        {pendingReturns.map(ret => (
                            <div key={ret.id} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl min-w-[200px] border border-white/20">
                                <div className="text-[10px] font-black uppercase tracking-widest mb-1">Order #{ret.order}</div>
                                <div className="text-xs font-medium mb-3 line-clamp-1">"{ret.reason}"</div>
                                <button
                                    onClick={() => approveReturn(ret.id)}
                                    className="w-full bg-white text-blue-600 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors"
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
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Mixing Drinks...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Beer size={40} className="text-gray-200" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Bar is Clear</h2>
                    <p className="text-gray-400 max-w-sm mx-auto">No drink orders at the moment. Time to polish some glasses!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {orders.map(order => (
                        <div key={order.id} className={`flex flex-col h-full rounded-[2.5rem] border-2 shadow-sm transition-all duration-300 ${getStatusColor(order.status)}`}>
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
                                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                                    <MapPin size={16} className="text-blue-500" />
                                    <span>{order.room}</span>
                                </div>
                            </div>

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

                            <div className="p-6 pt-0 mt-auto">
                                <div className="flex gap-3">
                                    {order.status === 'PENDING' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'PREPARING')}
                                            className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-gray-200"
                                        >
                                            <Play size={16} /> Start Pouring
                                        </button>
                                    )}
                                    {order.status === 'PREPARING' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'READY')}
                                            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-blue-200"
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
