'use client';
import { useEffect, useState } from 'react';
import { useUI } from '@/context/UIContext';
import { Clock, CheckCircle, Utensils, MapPin, Hash, Coffee, RefreshCw, X, Plus, Minus, ShoppingBag, Search, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
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
    const [billSummary, setBillSummary] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Ordering State
    const { items: cartItems, addToCart, updateQuantity, clearCart, total: cartTotal } = useCart();
    const [isOrdering, setIsOrdering] = useState(false);
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [orderLocation, setOrderLocation] = useState<'ROOM' | 'TABLE' | 'POOL' | 'BEACH'>('TABLE');
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [submittingOrder, setSubmittingOrder] = useState(false);
    const [isAddingMore, setIsAddingMore] = useState(false);

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
                setStats(data.waiter_stats);
            }
        } catch (e) { console.error(e); }
    };
    const [selectedReturnOrder, setSelectedReturnOrder] = useState<number | null>(null);
    const [selectedReturnOrderItems, setSelectedReturnOrderItems] = useState<any[]>([]);
    const [selectedItemsForReturn, setSelectedItemsForReturn] = useState<{ [key: number]: number }>({});
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [submittingReturn, setSubmittingReturn] = useState(false);

    const fetchBillSummary = async () => {
        try {
            const res = await fetch('/api/inventory/orders/bill-summary/', {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setBillSummary(data);
            }
        } catch (e) { console.error(e); }
    };

    const fetchMenu = async () => {
        try {
            const [catRes, itemRes] = await Promise.all([
                fetch('/api/inventory/menu/categories/'),
                fetch('/api/inventory/menu/items/')
            ]);
            if (catRes.ok) setCategories(await catRes.json());
            if (itemRes.ok) setMenuItems(await itemRes.json());
        } catch (e) { console.error(e); }
    };

    const fetchOrders = async () => {
        try {
            fetchStats();
            fetchBillSummary();
            const res = await fetch('/api/inventory/orders/active/', {
                headers: getAuthHeaders()
            });
            if (res.status === 401) return handle401();
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
        fetchMenu();
        const interval = setInterval(fetchOrders, 3000);
        return () => clearInterval(interval);
    }, []);

    const markAsServed = async (id: number) => {
        try {
            const res = await fetch(`/api/inventory/orders/${id}/update-status/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
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

        const returnItems = Object.entries(selectedItemsForReturn).map(([id, qty]) => ({
            order_item_id: parseInt(id),
            quantity: qty
        }));

        if (!selectedReturnOrder || returnItems.length === 0 || !returnReason.trim()) {
            if (returnItems.length === 0) showNotification("Please select items to return", "error");
            return;
        }

        setSubmittingReturn(true);
        try {
            const res = await fetch(`/api/inventory/orders/${selectedReturnOrder}/request-return/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({
                    reason: returnReason,
                    items: returnItems
                })
            });

            if (res.ok) {
                showNotification("Return request submitted to Kitchen/Bar", "success");
                setIsReturnModalOpen(false);
                setReturnReason('');
                setSelectedItemsForReturn({});
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
            case 'ROOM': return 'Room';
            case 'TABLE': return 'Table';
            case 'POOL': return 'Pool';
            case 'BEACH': return 'Beach';
            case 'WALK_IN': return 'Walk-in';
            default: return 'Location';
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedTable) {
            showNotification("Please select a table/room number", "error");
            return;
        }
        if (cartItems.length === 0) return;

        setSubmittingOrder(true);
        const orderData = {
            room: selectedTable.toUpperCase(),
            location_type: orderLocation,
            items: cartItems.map(item => ({
                menu_item: item.id,
                quantity: item.quantity
            }))
        };

        try {
            const res = await fetch('/api/inventory/orders/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                showNotification("Order placed successfully!", "success");
                clearCart();
                setIsOrdering(false);
                fetchOrders();
            } else {
                showNotification("Failed to place order", "error");
            }
        } catch (e) {
            showNotification("Connection error", "error");
        } finally {
            setSubmittingOrder(false);
        }
    };

    const filteredMenuItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'All' ||
            categories.find(c => c.name === selectedCategory)?.id === item.category;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
                <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 flex-wrap">
                        Waiter Station <Coffee className="text-[var(--color-primary)]" size={32} />
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight text-sm">Manage service and take orders across the resort.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* New Order Button */}
                    <button
                        onClick={() => { clearCart(); setSelectedTable(''); setIsAddingMore(false); setIsOrdering(true); }}
                        className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200"
                    >
                        <Plus size={18} /> Take New Order
                    </button>

                    {/* Service Stats Card */}
                    <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 shadow-sm sm:min-w-[280px]">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Service Performance</h3>
                        <div className="flex justify-between items-end gap-4">
                            <div>
                                <div className="text-xl font-black text-gray-900">${stats?.revenue_today.toFixed(2) || '0.00'}</div>
                                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{stats?.processed || 0} Total Orders</div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-[10px] font-bold text-gray-500">{stats?.served || 0} Served Today</div>
                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stats?.avg_time || 0} mins Avg</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Tables / Bill Summary */}
            <div className="pt-8">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <ShoppingCart size={20} className="text-blue-500" />
                    Active Tables & Bills
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {billSummary.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 font-medium italic">
                            No active tables.
                        </div>
                    ) : (
                        billSummary.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-gray-50 w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <Utensils size={18} />
                                    </div>
                                    <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                        {item.order_count} Orders
                                    </span>
                                </div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{getLocationLabel(item.location_type)}</div>
                                <div className="text-xl font-black text-gray-900 mb-3 flex justify-between items-center">
                                    <span>#{item.room}</span>
                                    <button
                                        onClick={() => {
                                            clearCart();
                                            setSelectedTable(item.room);
                                            setOrderLocation(item.location_type);
                                            setIsAddingMore(true);
                                            setIsOrdering(true);
                                        }}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        title="Add more to this bill"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-bold uppercase text-[9px]">Bill Total</span>
                                    <span className="font-black text-gray-900">${parseFloat(item.total_bill).toFixed(2)}</span>
                                </div>
                            </div>
                        ))
                    )}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {readyOrders.map(order => (
                            <div key={order.id} className="bg-emerald-50 rounded-[2rem] md:rounded-[2.5rem] border-2 border-emerald-100 shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-6">
                                    <span className="bg-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                        READY
                                    </span>
                                </div>
                                <div className="p-6 md:p-8">
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
                                            onClick={() => {
                                                clearCart();
                                                setSelectedTable(order.room);
                                                setOrderLocation(order.location_type as any);
                                                setIsAddingMore(true);
                                                setIsOrdering(true);
                                            }}
                                            className="p-4 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            title="Add more to this table"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedReturnOrder(order.id);
                                                setSelectedReturnOrderItems(order.items);
                                                setSelectedItemsForReturn({});
                                                setIsReturnModalOpen(true);
                                            }}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4">
                    {activeOrders.map(order => (
                        <div key={order.id} className="bg-white p-5 rounded-2xl border border-gray-100 opacity-70 hover:opacity-100 transition-opacity flex justify-between items-center group">
                            <div className="w-full">
                                <div className="flex justify-between items-start mb-2 gap-4">
                                    <span className="font-bold text-gray-900">#{order.id}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${order.status === 'PREPARING' ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-[11px] font-medium text-gray-500 mb-3 truncate">
                                    {getLocationLabel(order.location_type)}: {order.room}
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/staff/waiter/return/${order.id}`}
                                        className="flex-1 p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest"
                                    >
                                        <RefreshCw size={12} /> Return
                                    </Link>
                                    <button
                                        onClick={() => {
                                            clearCart();
                                            setSelectedTable(order.room);
                                            setOrderLocation(order.location_type as any);
                                            setIsAddingMore(true);
                                            setIsOrdering(true);
                                        }}
                                        className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest"
                                    >
                                        <Plus size={12} /> Add More
                                    </button>
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
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Items to Return</label>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-hide">
                                    {selectedReturnOrderItems.map(item => (
                                        <div key={item.id} className={`p-3 rounded-xl border transition-all ${selectedItemsForReturn[item.id] ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedItemsForReturn[item.id]}
                                                    onChange={() => {
                                                        setSelectedItemsForReturn(prev => {
                                                            if (prev[item.id]) {
                                                                const next = { ...prev };
                                                                delete next[item.id];
                                                                return next;
                                                            }
                                                            return { ...prev, [item.id]: item.quantity };
                                                        });
                                                    }}
                                                    className="w-4 h-4 rounded-lg border-2 border-gray-300 text-orange-500 focus:ring-orange-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="text-xs font-bold text-gray-900">{item.menu_item_name}</div>
                                                    <div className="text-[9px] text-gray-400 font-bold uppercase">Qty: {item.quantity}</div>
                                                </div>
                                                {selectedItemsForReturn[item.id] && (
                                                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-orange-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedItemsForReturn(prev => ({ ...prev, [item.id]: Math.max(1, prev[item.id] - 1) }))}
                                                            className="text-gray-400 hover:text-orange-500"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="text-xs font-black text-gray-900">{selectedItemsForReturn[item.id]}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedItemsForReturn(prev => ({ ...prev, [item.id]: Math.min(item.quantity, prev[item.id] + 1) }))}
                                                            className="text-gray-400 hover:text-orange-500"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Reason for Return</label>
                                <textarea
                                    required
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    placeholder="e.g. Dish was cold, Guest changed mind..."
                                    className="w-full bg-white border-2 border-gray-300 rounded-3xl p-6 text-sm font-bold text-black focus:border-[var(--color-primary)] transition-all outline-none min-h-[120px] resize-none shadow-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submittingReturn || Object.keys(selectedItemsForReturn).length === 0 || !returnReason.trim()}
                                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                            >
                                {submittingReturn ? "Submitting..." : <><RefreshCw size={16} /> Submit Return Request</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Ordering Modal / Slide-over */}
            {isOrdering && (
                <div className="fixed inset-0 z-[150] flex justify-end">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsOrdering(false)}></div>
                    <div className="w-full max-w-4xl bg-gray-50 h-full relative z-10 shadow-2xl flex flex-col sm:rounded-l-[3rem] overflow-hidden border-l border-white/20 animate-slide-in-right">

                        {/* Drawer Header */}
                        <div className="p-8 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                    Take Table Order <Utensils className="text-[var(--color-primary)]" />
                                </h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Select table and add items to cart</p>
                            </div>
                            <button onClick={() => setIsOrdering(false)} className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* Left: Menu Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Table Selection */}
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Location Type</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['TABLE', 'ROOM', 'POOL', 'BEACH'].map(loc => (
                                                    <button
                                                        key={loc}
                                                        disabled={isAddingMore}
                                                        onClick={() => setOrderLocation(loc as any)}
                                                        className={`py-2 text-[10px] font-black rounded-xl border transition-all ${orderLocation === loc ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200' + (isAddingMore ? '' : ' hover:border-gray-900')} ${isAddingMore ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {loc}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-[150px]">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-2 block">{orderLocation} Number</label>
                                            <input
                                                type="text"
                                                readOnly={isAddingMore}
                                                autoFocus={!isAddingMore}
                                                value={selectedTable}
                                                onChange={(e) => setSelectedTable(e.target.value.toUpperCase())}
                                                placeholder={`e.g. ${orderLocation === 'TABLE' ? '5' : '101'}`}
                                                className={`w-full px-5 py-3 rounded-xl border-2 border-gray-100 focus:border-[var(--color-primary)] outline-none font-bold text-gray-900 transition-all ${isAddingMore ? 'bg-gray-50 cursor-not-allowed text-gray-400 border-transparent' : ''}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Filters */}
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search menu..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                        />
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        <button
                                            onClick={() => setSelectedCategory('All')}
                                            className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === 'All' ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            All
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.name)}
                                                className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat.name ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Menu Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredMenuItems.map(item => (
                                        <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-100 hover:border-[var(--color-primary)] transition-all group relative overflow-hidden">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-50">
                                                    <img src={item.image || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                                                    <div className="text-xs font-black text-[var(--color-primary)] mt-1">${item.price}</div>
                                                </div>
                                                <button
                                                    onClick={() => addToCart(item)}
                                                    className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-[var(--color-primary)] transition-all shadow-lg active:scale-95"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Cart Summary (Waiters POS style) */}
                            <div className="w-full md:w-[350px] bg-white border-l border-gray-100 flex flex-col shrink-0">
                                <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                        <ShoppingBag size={14} /> Current selection
                                    </h4>
                                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                                        {cartItems.length === 0 ? (
                                            <div className="text-center py-6">
                                                <p className="text-sm text-gray-400 font-medium italic">Cart is empty</p>
                                            </div>
                                        ) : (
                                            cartItems.map(item => (
                                                <div key={item.id} className="flex justify-between items-center group">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-sm font-bold text-gray-900 truncate">{item.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold">${item.price} x {item.quantity}</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"><Minus size={14} /></button>
                                                        <span className="text-sm font-black text-gray-900 w-4 text-center">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-900 transition-all"><Plus size={14} /></button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Order Footer */}
                                <div className="p-8 mt-auto space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Bill</div>
                                            <div className="text-3xl font-black text-gray-900">${cartTotal.toFixed(2)}</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={submittingOrder || cartItems.length === 0 || !selectedTable}
                                        className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[var(--color-primary)] transition-all shadow-2xl shadow-gray-200 disabled:opacity-50"
                                    >
                                        {submittingOrder ? "Processing..." : (
                                            <><ShoppingCart size={18} /> Confirm Order</>
                                        )}
                                    </button>
                                    <button
                                        onClick={clearCart}
                                        className="w-full text-xs font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
