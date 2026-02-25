'use client';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bed, Utensils, ChevronRight, CheckCircle, MapPin, Hash } from 'lucide-react';

interface Room {
    id: number;
    room_number: string;
    status: string;
}

interface Table {
    id: number;
    number: string;
    is_active: boolean;
}

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const [serviceType, setServiceType] = useState<'ROOM' | 'TABLE' | 'WALK_IN'>('WALK_IN');
    const [locationId, setLocationId] = useState('');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [status, setStatus] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomRes, tableRes] = await Promise.all([
                    fetch('/api/pms/rooms/'),
                    fetch('/api/inventory/tables/')
                ]);
                if (roomRes.ok) setRooms(await roomRes.json());
                if (tableRes.ok) setTables(await tableRes.json());
            } catch (e) {
                console.error("Failed to fetch locations", e);
            }
        };
        fetchData();
    }, []);

    const handleOrder = async () => {
        if (serviceType !== 'WALK_IN' && !locationId) {
            return alert(`Please select a ${serviceType === 'ROOM' ? 'room' : 'table'}`);
        }

        setStatus('Processing...');

        const payload = {
            room: serviceType === 'WALK_IN' ? 'Walk-in' : locationId,
            location_type: serviceType,
            status: 'PENDING',
            items: items.map(i => ({
                menu_item: i.id,
                quantity: i.quantity
            }))
        };

        try {
            const res = await fetch('/api/inventory/orders/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                clearCart();
                alert('Order Placed Successfully!');
                router.push('/dining');
            } else {
                alert('Failed to place order.');
            }
        } catch (e) {
            console.error(e);
            alert('Error connecting to server');
        } finally {
            setStatus('');
        }
    };

    if (items.length === 0) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                <Utensils size={48} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Your cart is empty</h2>
            <p className="text-gray-400 font-medium max-w-xs">Looks like you haven't added anything to your order yet.</p>
            <button onClick={() => router.push('/dining')} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[var(--color-primary)] transition-all">
                Browse Menu
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Checkout</h1>
                <p className="text-gray-400 font-medium">Finalize your order and select delivery location.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Summary */}
                <div className="space-y-8">
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-100/50">
                        <h3 className="text-xl font-black text-gray-900 mb-6">Order Summary</h3>
                        <div className="space-y-4">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[var(--color-primary)] font-black">
                                            {item.quantity}x
                                        </div>
                                        <span className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{item.name}</span>
                                    </div>
                                    <span className="font-black text-gray-900">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-100 flex justify-between items-end">
                            <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Total Amount</span>
                            <span className="text-4xl font-black text-gray-900 tracking-tighter">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Service Selection */}
                <div className="space-y-8">
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-100/50 space-y-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Service & Location</h3>
                            <p className="text-xs text-gray-400 font-medium">Where should we serve your order?</p>
                        </div>

                        {/* Service Type Toggles */}
                        <div className="grid grid-cols-3 gap-3 bg-gray-50 p-2 rounded-3xl">
                            {(['ROOM', 'TABLE', 'WALK_IN'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => { setServiceType(type); setLocationId(''); }}
                                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all ${serviceType === type ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {type === 'ROOM' && <Bed size={20} />}
                                    {type === 'TABLE' && <Utensils size={20} />}
                                    {type === 'WALK_IN' && <CheckCircle size={20} />}
                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                        {type.replace('_', ' ')}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Location Selectors */}
                        <div className="space-y-4">
                            {serviceType === 'ROOM' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Room Number</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <select
                                            value={locationId}
                                            onChange={e => setLocationId(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--color-primary)] outline-none transition-all font-bold text-gray-900 appearance-none"
                                        >
                                            <option value="">Choose Room...</option>
                                            {rooms.filter(r => r.status === 'OCCUPIED').map(r => (
                                                <option key={r.id} value={r.room_number}>Room {r.room_number}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {serviceType === 'TABLE' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select table</label>
                                    <div className="relative">
                                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <select
                                            value={locationId}
                                            onChange={e => setLocationId(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--color-primary)] outline-none transition-all font-bold text-gray-900 appearance-none"
                                        >
                                            <option value="">Choose Table...</option>
                                            {tables.filter(t => t.is_active).map(t => (
                                                <option key={t.id} value={`Table ${t.number}`}>Table {t.number}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {serviceType === 'WALK_IN' && (
                                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 shrink-0">
                                        <CheckCircle size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-emerald-800 leading-relaxed italic">
                                        No location selection needed for Walk-in orders.
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleOrder}
                            disabled={!!status || (serviceType !== 'WALK_IN' && !locationId)}
                            className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-[var(--color-primary)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                        >
                            {status || 'Confirm Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
