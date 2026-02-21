'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
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
    User
} from 'lucide-react';
import Link from 'next/link';

export default function BookingDetails() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('room');
    const router = useRouter();
    const { state, setRoom, setPersonalInfo, setSpecialRequests, setDates, setGuests, toggleActivity } = useBooking();
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        if (roomId) {
            fetchData(roomId);
        } else if (!state.room) {
            router.push('/rooms');
        } else {
            setLoading(false);
        }
    }, [roomId]);

    const fetchData = async (id: string) => {
        try {
            const [roomRes, toursRes, packagesRes] = await Promise.all([
                fetch(`http://127.0.0.1:8000/api/pms/rooms/${id}/`),
                fetch('http://127.0.0.1:8000/api/recreation/activities/'),
                fetch('http://127.0.0.1:8000/api/recreation/packages/')
            ]);

            const roomData = await roomRes.json();
            const toursData = await toursRes.json();
            const packagesData = await packagesRes.json();

            setRoom(roomData);
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
        // Validate inputs if needed
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

    if (!state.room) return null;

    // Helper to get random rating for demo purposes
    const rating = "New";
    const reviewCount = 0;

    return (
        <div className="bg-white min-h-screen pb-20 pt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">{state.room.room_type} in Marshall</h1>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 font-medium text-gray-800 underline decoration-gray-300 underline-offset-2">
                            <Star size={16} fill="black" className="text-black" />
                            <span>{rating === "New" ? "No reviews yet" : `${rating} · ${reviewCount} reviews`}</span>
                            <span className="text-gray-400 no-underline">·</span>
                            <span className="text-gray-500 font-medium no-underline">{state.room.category === 'TENT' ? 'Luxury Tent' : 'Boutique Resort'}</span>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all font-medium text-gray-700 underline underline-offset-2 decoration-gray-200">
                                <Share size={16} /> Share
                            </button>
                            <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all font-medium text-gray-700 underline underline-offset-2 decoration-gray-200">
                                <Heart size={16} /> Save
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero Image Grid (Simplified to single for now, can be grid later) */}
                <div className="relative aspect-[2/1] md:aspect-[2.5/1] rounded-2xl overflow-hidden mb-12 shadow-sm">
                    <img
                        src={state.room.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80"}
                        alt={state.room.room_type}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <button className="absolute bottom-6 right-6 bg-white px-4 py-2 rounded-lg border border-gray-900 font-medium text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all text-gray-900">
                        Show all photos
                    </button>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative">

                    {/* Left Column: Content & Inputs */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Host Info */}
                        <div className="flex justify-between items-center pb-8 border-b border-gray-200">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                                    Hosted by Kwalee Beach Resort
                                </h2>
                                <p className="text-gray-500">
                                    {state.room.capacity_adults} guests · 1 bedroom · 1 bed · 1 bath
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center text-white font-black text-xl">
                                Y
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="space-y-6 pb-8 border-b border-gray-200">
                            <div className="flex gap-4 items-start">
                                <div className="mt-1">
                                    <ShieldCheck size={24} className="text-gray-900" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Secure Experience</h3>
                                    <p className="text-gray-500 text-sm">Every booking includes free protection from cancellations and inaccuracies.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="mt-1">
                                    <Waves size={24} className="text-gray-900" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Lagoon Access</h3>
                                    <p className="text-gray-500 text-sm">Guests get exclusive access to the private lagoon beach.</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="pb-8 border-b border-gray-200">
                            <p className="text-gray-800 leading-relaxed text-lg">
                                {state.room.description || "Experience the ultimate in relaxation. Our rooms are designed with local materials and sustainable architecture to blend seamlessly with the natural beauty of Marshall. Enjoy breathtaking views, premium amenities, and the sound of the ocean right outside your door."}
                            </p>
                            <button className="mt-4 font-semibold underline flex items-center text-gray-900">
                                Show more <ChevronDown size={16} className="ml-1" />
                            </button>
                        </div>

                        {/* Amenities */}
                        <div className="pb-8 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">What this place offers</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 text-gray-700"><Wifi size={20} /> Fast Wifi</div>
                                <div className="flex items-center gap-4 text-gray-700"><Car size={20} /> Free parking on premises</div>
                                <div className="flex items-center gap-4 text-gray-700"><Utensils size={20} /> Kitchen</div>
                                <div className="flex items-center gap-4 text-gray-700"><Wind size={20} /> Air conditioning</div>
                                <div className="flex items-center gap-4 text-gray-700"><Tv size={20} /> HDTV with Netflix</div>
                                <div className="flex items-center gap-4 text-gray-700"><Waves size={20} /> Beach access</div>
                            </div>
                            <button className="mt-8 px-6 py-3 border border-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-gray-900">
                                Show all 24 amenities
                            </button>
                        </div>

                        {/* Enhancements */}
                        <div className="pb-8 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Enhance Your Stay</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activities.map((activity, i) => (
                                    <div
                                        key={i}
                                        onClick={() => toggleActivity(activity)}
                                        className={`cursor-pointer border rounded-xl p-4 flex items-start gap-4 transition-all ${state.selectedActivities.some(a => a.id === activity.id && a.type === activity.type)
                                            ? 'border-gray-900 bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                            {activity.image_url && <img src={activity.image_url} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-gray-900 text-sm">{activity.title}</h4>
                                                <span className="font-bold text-sm">${activity.price}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{activity.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Guest Details Input Section */}
                        <div className="pt-4">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Information</h3>
                            <p className="text-gray-500 mb-6">Enter your details to proceed with the reservation.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                <div className="border-b border-gray-200 py-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full outline-none text-gray-900 placeholder-gray-300 font-medium text-lg"
                                        placeholder="Your Full Name"
                                        value={state.guestName}
                                        onChange={(e) => setPersonalInfo(e.target.value, state.guestEmail, state.guestPhone)}
                                    />
                                </div>
                                <div className="border-b border-gray-200 py-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full outline-none text-gray-900 placeholder-gray-300 font-medium text-lg"
                                        placeholder="your@email.com"
                                        value={state.guestEmail}
                                        onChange={(e) => setPersonalInfo(state.guestName, e.target.value, state.guestPhone)}
                                    />
                                </div>
                            </div>
                            <div className="border-b border-gray-200 py-2 mb-8">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    className="w-full outline-none text-gray-900 placeholder-gray-300 font-medium text-lg"
                                    placeholder="Your Phone Number"
                                    value={state.guestPhone}
                                    onChange={(e) => setPersonalInfo(state.guestName, state.guestEmail, e.target.value)}
                                />
                            </div>

                            <div className="border p-4 rounded-xl border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Special Requests</label>
                                <textarea
                                    className="w-full outline-none text-gray-900 placeholder-gray-300 font-medium resize-none"
                                    rows={3}
                                    placeholder="Any special needs or requests?"
                                    value={state.specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                />
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Sticky Booking Widget */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="border border-gray-200 rounded-2xl p-6 shadow-xl bg-white">
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <span className="text-2xl font-semibold text-gray-900">${state.room.price_per_night}</span>
                                        <span className="text-gray-500 text-base"> / night</span>
                                    </div>
                                    <div className="flex items-baseline gap-1 text-xs font-medium text-gray-500">
                                        <Star size={12} fill="black" className="text-black" />
                                        <span className="text-gray-900 font-bold">{rating}</span>
                                        <span className="underline">{reviewCount} reviews</span>
                                    </div>
                                </div>

                                {/* Date/Guest Picker Visuals */}
                                <div className="border border-gray-400 rounded-xl mb-4 overflow-hidden">
                                    <div className="grid grid-cols-2 border-b border-gray-400">
                                        <div className="p-3 border-r border-gray-400 hover:bg-gray-50 bg-white relative">
                                            <div className="text-[10px] uppercase font-bold text-gray-800 absolute top-2 left-3 z-10 pointer-events-none">Check-in</div>
                                            <input
                                                type="date"
                                                className="w-full h-full pt-4 pb-0 bg-transparent border-none outline-none text-sm font-medium text-gray-900 cursor-pointer"
                                                value={state.checkIn}
                                                onChange={(e) => setDates(e.target.value, state.checkOut)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div className="p-3 hover:bg-gray-50 bg-white relative">
                                            <div className="text-[10px] uppercase font-bold text-gray-800 absolute top-2 left-3 z-10 pointer-events-none">Check-out</div>
                                            <input
                                                type="date"
                                                className="w-full h-full pt-4 pb-0 bg-transparent border-none outline-none text-sm font-medium text-gray-900 cursor-pointer"
                                                value={state.checkOut}
                                                onChange={(e) => setDates(state.checkIn, e.target.value)}
                                                min={state.checkIn || new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center bg-white relative">
                                        <div className="flex-1">
                                            <div className="text-[10px] uppercase font-bold text-gray-800 mb-1">Guests</div>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-gray-500">Adults</span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={state.room.capacity_adults}
                                                        value={state.adults}
                                                        onChange={(e) => setGuests(parseInt(e.target.value) || 1, state.children)}
                                                        className="w-12 text-sm font-bold bg-transparent outline-none border-b border-gray-200"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-gray-500">Kids</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={state.room.capacity_children}
                                                        value={state.children}
                                                        onChange={(e) => setGuests(state.adults, parseInt(e.target.value) || 0)}
                                                        className="w-12 text-sm font-bold bg-transparent outline-none border-b border-gray-200"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleContinue}
                                    className="w-full bg-[#f56815] text-white font-semibold py-3.5 rounded-xl hover:bg-[#d4560d] transition-all shadow-md active:scale-[0.98]"
                                >
                                    Reserve
                                </button>

                                {!state.checkIn || !state.checkOut ? (
                                    <div className="text-center text-sm text-gray-500 mt-4 mb-6">
                                        Enter dates to see total price
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-center text-sm text-gray-500 mt-4 mb-6">
                                            You won't be charged yet
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between text-gray-600">
                                                <span className="underline decoration-gray-300">
                                                    ${state.room.price_per_night} x {Math.max(1, Math.ceil((new Date(state.checkOut).getTime() - new Date(state.checkIn).getTime()) / (1000 * 60 * 60 * 24)))} nights
                                                </span>
                                                <span>
                                                    ${(parseFloat(state.room.price_per_night) * Math.max(1, Math.ceil((new Date(state.checkOut).getTime() - new Date(state.checkIn).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span className="underline decoration-gray-300">Cleaning fee</span>
                                                <span>$45.00</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span className="underline decoration-gray-300">Service fee</span>
                                                <span>$72.00</span>
                                            </div>

                                            {state.selectedActivities.map((activity, i) => (
                                                <div key={i} className="flex justify-between text-gray-600">
                                                    <span className="underline decoration-gray-300">{activity.title}</span>
                                                    <span>${activity.price}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-200 mt-6 pt-6 flex justify-between font-semibold text-lg text-gray-900">
                                            <span>Total before taxes</span>
                                            <span>
                                                ${(
                                                    (parseFloat(state.room.price_per_night) * Math.max(1, Math.ceil((new Date(state.checkOut).getTime() - new Date(state.checkIn).getTime()) / (1000 * 60 * 60 * 24)))) + 45 + 72 + state.selectedActivities.reduce((sum, a) => sum + parseFloat(a.price), 0)
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    </>
                                )}

                            </div>

                            <div className="mt-4 flex justify-center items-center gap-2 text-gray-400 text-sm">
                                <span className="font-bold underline decoration-gray-300">Report this listing</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
