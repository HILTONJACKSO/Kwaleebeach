'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent, Suspense } from 'react';
import { useBooking } from '@/context/BookingContext';
import {
    Star, MapPin, Share, Heart, Wifi, Car, Utensils, Tv, Wind, Waves,
    ChevronDown, ShieldCheck, CreditCard, User, ArrowRight,
    CalendarDays, Mail, Phone, MessageSquare, CheckCircle2, Users
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
            alert("Please provide your name and email to continue.");
            return;
        }
        if (!state.checkIn || !state.checkOut) {
            alert("Please select your stay dates before proceeding.");
            return;
        }
        router.push('/booking/confirm');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
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
        <div className="bg-gray-50/50 min-h-screen pb-24 pt-12">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="mb-16 border-b border-gray-200/50 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.3em] mb-4">Step 2 of 3</div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter">Your Island Escape</h1>
                        <p className="text-slate-500 font-medium text-lg mt-4 max-w-2xl">
                            We're thrilled to host you. Please review your selections and let us know a few details to make your stay perfect.
                        </p>
                    </div>
                    <Link href="/rooms" className="shrink-0">
                        <button className="px-8 py-4 bg-white border border-slate-200 rounded-full font-black text-xs uppercase tracking-widest text-slate-900 hover:border-slate-900 hover:shadow-lg transition-all flex items-center gap-2">
                            Add Another Suite
                        </button>
                    </Link>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative">

                    {/* Left Column: Flow & Forms */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Section 1: Selected Accommodations */}
                        <section className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 shadow-sm">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-8 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-xs">1</span>
                                Selected Suites
                            </h3>
                            <div className="space-y-6">
                                {state.rooms.map((room) => (
                                    <div key={room.id} className="group relative bg-slate-50 rounded-[2rem] p-4 lg:p-6 border border-slate-100 flex flex-col sm:flex-row gap-6 items-center hover:shadow-md transition-all">
                                        <div className="w-full sm:w-40 h-48 sm:h-32 rounded-xl overflow-hidden shrink-0 shadow-sm relative">
                                            <img src={room.image_url} alt={room.room_type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest text-slate-900">
                                                Suite {room.room_number}
                                            </div>
                                        </div>
                                        <div className="flex-1 w-full">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="text-[9px] font-black text-[var(--color-primary)] uppercase tracking-widest mb-1.5">
                                                        {room.category === 'TENT' ? 'Eco-Luxury Tent' : 'Boutique Room'}
                                                    </div>
                                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">{room.room_type}</h4>
                                                </div>
                                                <button onClick={() => toggleRoom(room)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-colors" title="Remove Room">
                                                    <span className="sr-only">Remove</span>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                </button>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <span>Up to {room.capacity_adults + room.capacity_children} Guests</span>
                                                </div>
                                                <div className="text-xl font-black text-slate-900 leading-none">
                                                    ${room.price_per_night}<span className="text-[10px] text-slate-400 ml-1 uppercase tracking-widest">/ night</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 2: Personal Details */}
                        <section className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 shadow-sm">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-8 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-xs">2</span>
                                Who's Traveling?
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 pl-4 block">Primary Guest Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all placeholder:text-slate-400"
                                            placeholder="e.g. Jane Doe"
                                            value={state.guestName}
                                            onChange={(e) => setPersonalInfo(e.target.value, state.guestEmail, state.guestPhone)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 pl-4 block">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all placeholder:text-slate-400"
                                                placeholder="jane@example.com"
                                                value={state.guestEmail}
                                                onChange={(e) => setPersonalInfo(state.guestName, e.target.value, state.guestPhone)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 pl-4 block">Phone Number</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                                            </div>
                                            <input
                                                type="tel"
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all placeholder:text-slate-400"
                                                placeholder="+1 (555) 000-0000"
                                                value={state.guestPhone}
                                                onChange={(e) => setPersonalInfo(state.guestName, state.guestEmail, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Enhancements */}
                        {activities.length > 0 && (
                            <section className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 shadow-sm">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-8 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-xs">3</span>
                                    Curate Your Stay (Optional)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {activities.map((activity, i) => {
                                        const isSelected = state.selectedActivities.some(a => a.id === activity.id && a.type === activity.type);
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => toggleActivity(activity)}
                                                className={`group cursor-pointer rounded-3xl p-6 transition-all border-2 relative overflow-hidden ${isSelected
                                                    ? 'border-slate-900 bg-slate-900 text-white shadow-xl'
                                                    : 'border-slate-100 hover:border-slate-300 bg-white shadow-sm'
                                                    }`}
                                            >
                                                {/* Decorative Background Icon */}
                                                <Waves className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-5 transition-transform group-hover:scale-110 ${isSelected ? 'text-white' : 'text-slate-900'}`} />

                                                <div className="relative z-10 flex flex-col h-full">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-600'}`}>
                                                            {activity.type === 'tour' ? <MapPin size={20} /> : <Star size={20} />}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-xl font-black leading-none ${isSelected ? 'text-white' : 'text-slate-900'}`}>${activity.price}</div>
                                                            <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isSelected ? 'text-[var(--color-primary)]' : 'text-slate-400'}`}>Per Person</div>
                                                        </div>
                                                    </div>
                                                    <h4 className={`text-lg font-black tracking-tight mb-2 ${isSelected ? 'text-white' : 'text-slate-900'}`}>{activity.title}</h4>
                                                    <p className={`text-xs font-medium line-clamp-2 mt-auto ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{activity.description}</p>

                                                    {isSelected && (
                                                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">
                                                            <CheckCircle2 size={12} /> Added to Itinerary
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Section 4: Special Requests */}
                        <section className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 shadow-sm">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-8 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-xs">4</span>
                                Special Requests?
                            </h3>
                            <div>
                                <div className="relative group">
                                    <div className="absolute top-5 left-4 flex pointer-events-none">
                                        <MessageSquare className="h-5 w-5 text-slate-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                                    </div>
                                    <textarea
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all placeholder:text-slate-400 resize-none"
                                        rows={4}
                                        placeholder="Celebrating a honeymooon? Dietary restrictions? Let us know how we can make your stay extraordinary."
                                        value={state.specialRequests}
                                        onChange={(e) => setSpecialRequests(e.target.value)}
                                    />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-3 text-right">
                                    Note: We cannot guarantee all requests, but will do our absolute best.
                                </p>
                            </div>
                        </section>

                    </div>

                    {/* Right Column: Sticky Summary Widget */}
                    <div className="lg:col-span-4 shrink-0">
                        <div className="sticky top-10 w-full">
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col">

                                {/* Widget Header */}
                                <div className="bg-slate-900 p-8 text-white relative">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-primary)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                    <h3 className="text-xl font-black tracking-tighter mb-1 relative z-10">Reservation Summary</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 relative z-10">Kwalee Beach Resort</p>
                                </div>

                                {/* Form Inputs within Widget */}
                                <div className="p-8 pb-0">
                                    <div className="bg-slate-50 border border-slate-200/60 rounded-3xl mb-8 overflow-hidden shadow-sm">
                                        <div className="grid grid-cols-2 border-b border-slate-200/60">
                                            <div className="p-4 border-r border-slate-200/60 hover:bg-white relative focus-within:bg-white transition-colors">
                                                <label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 block mb-1">Check-in</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-transparent border-none outline-none text-xs font-black text-slate-900 cursor-pointer"
                                                    value={state.checkIn}
                                                    onChange={(e) => setDates(e.target.value, state.checkOut)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                            <div className="p-4 hover:bg-white relative focus-within:bg-white transition-colors">
                                                <label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 block mb-1">Check-out</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-transparent border-none outline-none text-xs font-black text-slate-900 cursor-pointer"
                                                    value={state.checkOut}
                                                    onChange={(e) => setDates(state.checkIn, e.target.value)}
                                                    min={state.checkIn || new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                        </div>
                                        <div className="p-4 hover:bg-white focus-within:bg-white transition-colors">
                                            <div className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2">Guests</div>
                                            <div className="flex gap-8">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-slate-300" />
                                                    <select
                                                        value={state.adults}
                                                        onChange={(e) => setGuests(parseInt(e.target.value) || 1, state.children)}
                                                        className="bg-transparent text-sm font-black outline-none text-slate-900 appearance-none pr-2 cursor-pointer"
                                                    >
                                                        {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
                                                    </select>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users size={14} className="text-slate-300" />
                                                    <select
                                                        value={state.children}
                                                        onChange={(e) => setGuests(state.adults, parseInt(e.target.value) || 0)}
                                                        className="bg-transparent text-sm font-black outline-none text-slate-900 appearance-none pr-2 cursor-pointer"
                                                    >
                                                        {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n} Child{n !== 1 ? 'ren' : ''}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {!state.checkIn || !state.checkOut ? (
                                        <div className="text-center py-8 mb-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                            <CalendarDays className="mx-auto text-slate-300 mb-2" size={24} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Dates to see Total</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 mb-8">
                                            <div className="space-y-4">
                                                {state.rooms.map((room) => (
                                                    <div key={room.id} className="flex justify-between items-start text-sm">
                                                        <div className="flex flex-col pr-4">
                                                            <span className="font-black text-slate-900 leading-tight">{room.room_type} (Suite {room.room_number})</span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">${room.price_per_night} x {nights} nights</span>
                                                        </div>
                                                        <span className="font-black text-slate-900 mt-0.5">${(parseFloat(room.price_per_night) * nights).toFixed(2)}</span>
                                                    </div>
                                                ))}

                                                {state.selectedActivities.map((activity, i) => (
                                                    <div key={i} className="flex justify-between items-start text-sm pt-4 border-t border-slate-100">
                                                        <span className="font-black text-slate-500 line-clamp-1 pr-4">{activity.title}</span>
                                                        <span className="font-black text-slate-900">${parseFloat(activity.price).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="border-t-2 border-slate-900 pt-6 flex justify-between items-end">
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Due</div>
                                                    <div className="text-4xl font-black text-slate-900 tracking-tighter leading-none">${grandTotal.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 pt-0 mt-auto bg-white">
                                    <button
                                        onClick={handleContinue}
                                        className="w-full bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group"
                                    >
                                        Confirm & Pay
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <div className="mt-6 flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                        Secure 256-bit Encryption
                                    </div>
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
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        }>
            <BookingDetailsContent />
        </Suspense>
    );
}
