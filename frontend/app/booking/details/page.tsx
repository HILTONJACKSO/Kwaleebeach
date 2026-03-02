'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent, Suspense } from 'react';
import { useBooking } from '@/context/BookingContext';
import {
    Star,
    MapPin,
    Share,
    Heart,
    Wifi,
    Car,
    Utensils,
    Tv,
    Wind,
    Waves,
    ChevronDown,
    ShieldCheck,
    CreditCard,
    User,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

function BookingDetailsContent() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('room');
    const router = useRouter();
    const { state, toggleRoom, setPersonalInfo, setSpecialRequests, setDates, setGuests, toggleActivity } = useBooking();
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        if (roomId) {
            fetchInitialRoom(roomId);
        } else if (state.rooms.length === 0) {
            router.push('/rooms');
        } else {
            setLoading(false);
        }
    }, [roomId]);

    const fetchInitialRoom = async (id: string) => {
        try {
            const [roomRes, toursRes, packagesRes] = await Promise.all([
                fetch(`/api/pms/rooms/${id}/`),
                fetch('/api/recreation/activities/'),
                fetch('/api/recreation/packages/')
            ]);

            const roomData = await roomRes.json();
            const toursData = await toursRes.json();
            const packagesData = await packagesRes.json();

            // Only add if not already there
            if (!state.rooms.some(r => r.id === roomData.id)) {
                toggleRoom(roomData);
            }
            setActivities([
                ...toursData.map((t: any) => ({ ...t, type: 'tour' })),
                ...packagesData.map((p: any) => ({ ...p, type: 'package' }))
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        if (!state.guestName || !state.guestEmail) {
            alert("Please fill in your details to continue.");
            return;
        }
        if (!state.checkIn || !state.checkOut) {
            alert("Please select check-in and check-out dates.");
            return;
        }
        router.push('/booking/confirm');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    if (state.rooms.length === 0) return null;

    const nights = state.checkIn && state.checkOut
        ? Math.max(1, Math.ceil((new Date(state.checkOut).getTime() - new Date(state.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

    const roomsTotal = state.rooms.reduce((sum, room) => sum + parseFloat(room.price_per_night) * nights, 0);
    const activitiesTotal = state.selectedActivities.reduce((sum, a) => sum + parseFloat(a.price), 0);
    const grandTotal = roomsTotal + activitiesTotal;

    return (
        <div className="bg-white min-h-screen pb-20 pt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Selected Accommodations */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Your Island Escape</h1>
                            <p className="text-gray-500 font-medium">Review your selections and customize your stay.</p>
                        </div>
                        <Link href="/rooms">
                            <button className="px-6 py-3 border-2 border-gray-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all">
                                Add More Stays
                            </button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {state.rooms.map((room) => (
                            <div key={room.id} className="group relative bg-gray-50 rounded-[2rem] p-6 border border-gray-100 flex gap-6 items-center hover:shadow-xl transition-all">
                                <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                                    <img src={room.image_url} alt={room.room_type} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest mb-1">
                                                {room.category === 'TENT' ? 'Luxury Eco-Tent' : 'Boutique Room'}
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">{room.room_type}</h3>
                                            <p className="text-sm text-gray-400 font-medium italic">Suite No. {room.room_number}</p>
                                        </div>
                                        <button onClick={() => toggleRoom(room)} className="text-gray-300 hover:text-rose-500 transition-colors">
                                            <ShieldCheck size={24} />
                                        </button>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-lg font-black text-gray-900">${room.price_per_night}<span className="text-xs text-gray-400">/night</span></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative border-t border-gray-100 pt-16">

                    {/* Left Column: Content & Inputs */}
                    <div className="lg:col-span-2 space-y-16">

                        {/* Guest Details Input Section */}
                        <div className="bg-gray-50 rounded-[2.5rem] p-10 md:p-12 border border-gray-100 shadow-sm">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-8">Traveler Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                        <input
                                            type="text"
                                            className="w-full pl-16 pr-8 py-5 bg-white rounded-2xl border-2 border-transparent focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 text-sm font-bold text-gray-900 transition-all shadow-sm"
                                            placeholder="Marshall Guest"
                                            value={state.guestName}
                                            onChange={(e) => setPersonalInfo(e.target.value, state.guestEmail, state.guestPhone)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Protocol</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                        <input
                                            type="email"
                                            className="w-full pl-16 pr-8 py-5 bg-white rounded-2xl border-2 border-transparent focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 text-sm font-bold text-gray-900 transition-all shadow-sm"
                                            placeholder="your@resort.com"
                                            value={state.guestEmail}
                                            onChange={(e) => setPersonalInfo(state.guestName, e.target.value, state.guestPhone)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-10">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Secure Contact Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                    <input
                                        type="tel"
                                        className="w-full pl-16 pr-8 py-5 bg-white rounded-2xl border-2 border-transparent focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 text-sm font-bold text-gray-900 transition-all shadow-sm"
                                        placeholder="+231-XXX-XXX-XXX"
                                        value={state.guestPhone}
                                        onChange={(e) => setPersonalInfo(state.guestName, state.guestEmail, e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Special Requirements</label>
                                <textarea
                                    className="w-full p-8 bg-white rounded-2xl border-2 border-transparent focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 text-sm font-bold text-gray-900 transition-all shadow-sm resize-none"
                                    rows={4}
                                    placeholder="Any island specifics or allergies?"
                                    value={state.specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Enhancements */}
                        <div className="pb-8 border-b border-gray-100">
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-8">Island Enhancements</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activities.map((activity, i) => (
                                    <div
                                        key={i}
                                        onClick={() => toggleActivity(activity)}
                                        className={`group cursor-pointer border-2 rounded-[2rem] p-6 flex items-start gap-6 transition-all ${state.selectedActivities.some(a => a.id === activity.id && a.type === activity.type)
                                            ? 'border-gray-900 bg-gray-50 shadow-xl'
                                            : 'border-gray-100 hover:border-gray-200 hover:shadow-lg'
                                            }`}
                                    >
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-100 shadow-sm">
                                            {activity.image_url && <img src={activity.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-gray-900 text-base tracking-tight">{activity.title}</h4>
                                                <span className="font-black text-[var(--color-primary)] text-sm">${activity.price}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-2">{activity.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Sticky Booking Widget */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="border-2 border-gray-900 rounded-[3rem] p-10 shadow-2xl bg-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>

                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-8">Booking Summary</h3>

                                    {/* Date/Guest Picker Visuals */}
                                    <div className="border-2 border-gray-100 rounded-3xl mb-8 overflow-hidden shadow-sm">
                                        <div className="grid grid-cols-2 border-b-2 border-gray-100">
                                            <div className="p-5 border-r-2 border-gray-100 hover:bg-gray-50 bg-white relative group transition-colors">
                                                <div className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Arrival</div>
                                                <input
                                                    type="date"
                                                    className="w-full bg-transparent border-none outline-none text-xs font-black text-gray-900 cursor-pointer"
                                                    value={state.checkIn}
                                                    onChange={(e) => setDates(e.target.value, state.checkOut)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                            <div className="p-5 hover:bg-gray-50 bg-white relative group transition-colors">
                                                <div className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Departure</div>
                                                <input
                                                    type="date"
                                                    className="w-full bg-transparent border-none outline-none text-xs font-black text-gray-900 cursor-pointer"
                                                    value={state.checkOut}
                                                    onChange={(e) => setDates(state.checkIn, e.target.value)}
                                                    min={state.checkIn || new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                        </div>
                                        <div className="p-5 hover:bg-gray-50 cursor-pointer flex justify-between items-center bg-white transition-colors">
                                            <div className="flex-1">
                                                <div className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-3">Expedition Team</div>
                                                <div className="flex gap-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-300">Adults</span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={state.adults}
                                                            onChange={(e) => setGuests(parseInt(e.target.value) || 1, state.children)}
                                                            className="w-12 text-sm font-black bg-transparent outline-none text-gray-900"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-300">Explorers</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={state.children}
                                                            onChange={(e) => setGuests(state.adults, parseInt(e.target.value) || 0)}
                                                            className="w-12 text-sm font-black bg-transparent outline-none text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {!state.checkIn || !state.checkOut ? (
                                        <div className="text-center py-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Timeline Required for Quote</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                {state.rooms.map((room) => (
                                                    <div key={room.id} className="flex justify-between items-center text-sm">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-gray-900">{room.room_type} ({room.room_number})</span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">${room.price_per_night} x {nights} nights</span>
                                                        </div>
                                                        <span className="font-black text-gray-900">${(parseFloat(room.price_per_night) * nights).toFixed(2)}</span>
                                                    </div>
                                                ))}

                                                {state.selectedActivities.map((activity, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm pt-4 border-t border-gray-50">
                                                        <span className="font-black text-gray-500">{activity.title}</span>
                                                        <span className="font-black text-gray-900">${activity.price}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="border-t-4 border-gray-900 pt-8 mt-8 flex justify-between items-end">
                                                <div>
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Expedition Cost</div>
                                                    <div className="text-4xl font-black text-gray-900 tracking-tighter">${grandTotal.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleContinue}
                                        className="w-full bg-gray-900 text-white font-black uppercase tracking-[0.2em] py-6 rounded-2xl mt-10 hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-4 group"
                                    >
                                        Initiate Protocol
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <p className="text-[10px] font-black text-center text-gray-300 uppercase tracking-widest mt-8">
                                        Secure transaction protocol active
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function BookingDetails() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
        }>
            <BookingDetailsContent />
        </Suspense>
    );
}
