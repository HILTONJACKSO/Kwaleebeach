'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, ShoppingBag, Plus, Minus, ArrowRight, Clock, CheckCircle, ChefHat, Utensils, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';

// Types
interface Category {
    id: number;
    name: string;
    slug: string;
}

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string;
    category: number;
    is_available: boolean;
}

interface Order {
    id: number;
    status: string;
    location_type: string;
    total_amount: string;
    created_at: string;
    items: any[];
}

export default function MenuPage() {
    const { items: cartItems, addToCart, updateQuantity, removeFromCart, total, clearCart } = useCart();
    const { showNotification, showModal } = useUI();

    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);

    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [locationType, setLocationType] = useState<'ROOM' | 'TABLE' | 'BEACH' | 'POOL'>('ROOM');
    const [guestName, setGuestName] = useState(''); // Optional, for display
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, itemRes] = await Promise.all([
                    fetch('/api/inventory/menu/categories/'),
                    fetch('/api/inventory/menu/items/')
                ]);

                const cats = catRes.ok ? await catRes.json() : [];
                const items = itemRes.ok ? await itemRes.json() : [];

                setCategories(Array.isArray(cats) ? cats : []);
                setMenuItems(Array.isArray(items) ? items : []);
            } catch (error) {
                console.error("Failed to fetch menu data", error);
                setCategories([]);
                setMenuItems([]);
            }
        };
        fetchData();
    }, []);

    // Poll for Active Orders (if room/table number is set)
    useEffect(() => {
        if (!roomNumber) return;

        const fetchOrders = async () => {
            try {
                const res = await fetch(`/api/inventory/orders/active/?room=${roomNumber}&location_type=${locationType}`);
                if (res.ok) {
                    const data = await res.json();
                    setActiveOrders(data);
                }
            } catch (e) { console.error(e); }
        };

        fetchOrders(); // Initial call
        const interval = setInterval(fetchOrders, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, [roomNumber, locationType]);


    // Filter Logic
    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'All' ||
            categories.find(c => c.name === selectedCategory)?.id === item.category;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Order Submission
    const handlePlaceOrder = async () => {
        if (!roomNumber) {
            showModal("Room Required", "Please enter your Room Number before placing the order.");
            return;
        }
        if (cartItems.length === 0) return;

        setIsPlacingOrder(true);
        const orderData = {
            room: roomNumber,
            location_type: locationType,
            items: cartItems.map(item => ({
                menu_item: item.id,
                quantity: item.quantity
            }))
        };

        try {
            const res = await fetch('/api/inventory/orders/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                // Success
                clearCart();
                showModal("Order Success", "Your order has been placed successfully! You can track it in the active orders section.");
                // Trigger immediate refresh of orders
                const ordersRes = await fetch(`/api/inventory/orders/active/?room=${roomNumber}`);
                if (ordersRes.ok) setActiveOrders(await ordersRes.json());
            } else {
                showModal("Order Failed", "We couldn't process your order. Please try again or contact the front desk.");
            }
        } catch (error) {
            console.error(error);
            showNotification("Error connecting to server.", 'error');
        } finally {
            setIsPlacingOrder(false);
            if (res?.ok) setIsCartOpen(false);
        }
    };

    // Helper to get location label
    const getLocationLabel = (type: string) => {
        switch (type) {
            case 'ROOM': return 'Room';
            case 'TABLE': return 'Table';
            case 'BEACH': return 'Beach Side';
            case 'POOL': return 'Pool Side';
            default: return 'Location';
        }
    };

    // Helper to get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'PREPARING': return 'bg-orange-100 text-orange-600 border-orange-200';
            case 'READY': return 'bg-green-100 text-green-600 border-green-200';
            case 'SERVED': return 'bg-blue-100 text-blue-600 border-blue-200';
            default: return 'bg-gray-100';
        }
    };

    // Helper to get status Icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock size={16} />;
            case 'PREPARING': return <ChefHat size={16} />;
            case 'READY': return <CheckCircle size={16} />;
            case 'SERVED': return <Utensils size={16} />;
            default: return <Clock size={16} />;
        }
    };


    return (
        <div className="h-[calc(100vh-4rem)] overflow-hidden bg-gray-50 flex flex-col md:flex-row font-sans relative">

            {/* --- LEFT SIDE: MENU & TRACKER (70%) --- */}
            <div className={`flex-1 overflow-y-auto p-4 md:p-8 h-full transition-all ${isCartOpen ? 'hidden lg:block blur-sm lg:blur-none' : 'block'}`}>

                {/* 1. Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dining Menu</h1>
                        <p className="text-gray-500 text-sm">Delicious meals delivered to your room.</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search for food, coffee, etc..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* 2. Active Orders Tracker */}
                {activeOrders.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Clock size={20} className="text-[var(--color-primary)]" /> Active Orders
                            </h2>
                        </div>

                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                            {activeOrders.map(order => (
                                <div key={order.id} className="min-w-[300px] bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order #{order.id} • {getLocationLabel(order.location_type)}</span>
                                            <h3 className="font-bold text-gray-900 mt-1">{order.items.length} Items</h3>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)} {order.status}
                                        </div>
                                    </div>

                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${order.status === 'READY' ? 'w-full bg-green-500' :
                                                order.status === 'PREPARING' ? 'w-2/3 bg-orange-500' : 'w-1/6 bg-gray-400'
                                                }`}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* 3. Categories Tabs */}
                <div className="flex items-center gap-3 overflow-x-auto pb-6 mb-2">
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === 'All'
                            ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-orange-200'
                            : 'bg-white text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        All Items
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat.name
                                ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-orange-200'
                                : 'bg-white text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* 4. Menu Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 group">
                            <div className="h-44 w-full rounded-3xl overflow-hidden mb-4 relative">
                                <img src={item.image || 'https://via.placeholder.com/300'} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={item.name} />
                            </div>
                            <div className="flex flex-col h-24 justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{item.name}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-1">{item.description}</p>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xl font-bold text-gray-900">${item.price}</span>
                                    <button
                                        onClick={() => {
                                            addToCart(item);
                                            showNotification(`Added ${item.name} to cart`, 'success');
                                        }}
                                        className="w-10 h-10 rounded-full bg-gray-100 text-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-sm"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- MOBILE/TABLET FLOATING CART ICON --- */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative bg-gray-900 text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-center hover:bg-[var(--color-primary)] transition-all active:scale-95 border-2 border-white/20 backdrop-blur-md"
                >
                    <ShoppingBag size={28} />
                    {cartItems.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                            {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                        </span>
                    )}
                </button>
            </div>

            {/* --- CART DRAWER OVERLAY --- */}
            {isCartOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                    onClick={() => setIsCartOpen(false)}
                />
            )}

            {/* --- RIGHT SIDE: CART SIDEBAR / DRAWER --- */}
            <div className={`
                fixed lg:relative inset-y-0 right-0 w-full sm:w-[450px] lg:w-[400px] bg-white border-l border-gray-200 shadow-2xl 
                flex flex-col h-full overflow-hidden text-gray-900 z-[110] transition-transform duration-500 ease-in-out
                ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Details</h2>
                        <p className="text-xs text-gray-400 font-medium">Review selection before confirm</p>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="lg:hidden p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400 group"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* Items List (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Room Info Section */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Delivery Location</label>

                        {/* Location Type Selector */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {[
                                { id: 'ROOM', label: 'Room', icon: <Utensils size={14} /> },
                                { id: 'TABLE', label: 'Table', icon: <Utensils size={14} /> },
                                { id: 'POOL', label: 'Pool', icon: <Utensils size={14} /> },
                                { id: 'BEACH', label: 'Beach', icon: <Utensils size={14} /> },
                            ].map(loc => (
                                <button
                                    key={loc.id}
                                    onClick={() => setLocationType(loc.id as any)}
                                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${locationType === loc.id
                                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-[var(--color-primary)]'
                                        }`}
                                >
                                    {loc.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder={`${getLocationLabel(locationType)} Number (Required)`}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 font-bold text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all placeholder:text-gray-300"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Guest Name (Optional)"
                                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all placeholder:text-gray-300"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">Selected Items</h3>
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                                <ShoppingBag size={48} className="mb-3 opacity-50" />
                                <p className="text-sm font-medium">Cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100 hover:border-[var(--color-primary)] transition-all group">
                                        <div className="w-16 h-16 rounded-xl bg-white overflow-hidden flex-shrink-0 relative border border-gray-100">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"><Utensils size={20} /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                                            <div className="text-[var(--color-primary)] font-bold text-xs mt-0.5">${item.price}</div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center gap-1.5">
                                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-full bg-white text-[var(--color-primary)] border border-gray-100 flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-all"><Plus size={12} /></button>
                                            <span className="font-bold text-xs text-gray-900">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full bg-white text-gray-400 border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"><Minus size={12} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Payment Section */}
                <div className="p-6 border-t border-gray-100 bg-white">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-gray-500 text-xs">
                            <span>Subtotal</span>
                            <span className="font-bold text-gray-700">${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-bold text-gray-900">Total</span>
                            <span className="text-2xl font-bold text-[var(--color-primary)]">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={cartItems.length === 0 || isPlacingOrder}
                        className="w-full bg-[var(--color-primary)] text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-[var(--color-secondary)] transition-all disabled:opacity-50 disabled:grayscale flex justify-center items-center gap-2 group"
                    >
                        {isPlacingOrder ? 'Processing...' : 'Place Order'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="mt-3 text-center">
                        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Cancel & Return Home</Link>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
