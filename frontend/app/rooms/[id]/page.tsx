'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import {
    Star, Users, MapPin, ArrowRight, Wifi, Coffee, Wind, Tv, Waves,
    CheckCircle2, ChevronLeft, ShieldCheck, Clock, CalendarDays,
    Coffee as Mug, Utensils, Maximize
} from 'lucide-react';

interface Room {
    id: number;
    room_number: string;
    room_type: string;
    category: 'ROOM' | 'TENT' | 'VILLA' | 'COTTAGE';
    price_per_night: string;
    capacity_adults: number;
    capacity_children: number;
    amenities: string;
    description: string;
    image_url: string;
    status: string;
}

export default function RoomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [room, setRoom] = useState<Room | null>(null);
    const [relatedRooms, setRelatedRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { state, toggleRoom, setDates, setGuests } = useBooking();

    // Booking Widget Local State
    const [localCheckIn, setLocalCheckIn] = useState(state.checkIn);
    const [localCheckOut, setLocalCheckOut] = useState(state.checkOut);
    const [localAdults, setLocalAdults] = useState(state.adults);
    const [localChildren, setLocalChildren] = useState(state.children);

    useEffect(() => {
        if (id) {
            fetchRoomData();
        }
    }, [id]);

    const fetchRoomData = async () => {
        try {
            // Fetch Single Room
            const roomRes = await fetch(`/api/pms/rooms/${id}/`);
            if (!roomRes.ok) throw new Error('Room not found');
            const roomData = await roomRes.json();
            setRoom(roomData);

            // Fetch all rooms to get related (excluding current)
            const allRoomsRes = await fetch('/api/pms/rooms/');
            if (allRoomsRes.ok) {
                const allRoomsData = await allRoomsRes.json();
                const filtered = allRoomsData.filter((r: Room) => r.id !== parseInt(id as string) && r.category === roomData.category);
                // If not enough in same category, just take any
                const related = filtered.length > 0 ? filtered.slice(0, 3) : allRoomsData.filter((r: Room) => r.id !== parseInt(id as string)).slice(0, 3);
                setRelatedRooms(related);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isRoomSelected = room ? state.rooms.some(r => r.id === room.id) : false;

    const handleBookingUpdate = () => {
        setDates(localCheckIn, localCheckOut);
        setGuests(localAdults, localChildren);
        if (room && !isRoomSelected) {
            toggleRoom(room as any);
        }
        router.push('/booking/details');
    };

    const getAmenityIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('wifi')) return <Wifi size={18} />;
        if (n.includes('coffee') || n.includes('breakfast')) return <Coffee size={18} />;
        if (n.includes('ac') || n.includes('air')) return <Wind size={18} />;
        if (n.includes('tv')) return <Tv size={18} />;
        if (n.includes('pool') || n.includes('lagoon')) return <Waves size={18} />;
        if (n.includes('dine') || n.includes('room service')) return <Utensils size={18} />;
        return <Star size={18} />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Suite Not Found</h1>
                <p className="text-slate-500 font-medium mb-8">The accommodation you're looking for might have been removed or is currently unavailable.</p>
                <Link href="/rooms">
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors">
                        Explore Other Stays
                    </button>
                </Link>
            </div>
        );
    }

    const amenitiesList = room.amenities ? room.amenities.split(',').map(a => a.trim()) : [];

    return (
        <div className="bg-white min-h-screen pb-24">
            {/* Header / Hero Gallery */}
            <div className="relative h-[50vh] min-h-[400px] lg:h-[70vh] bg-slate-900 flex items-center justify-center">
                <img
                    src={room.image_url || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1920&q=80"}
                    alt={room.room_type}
                    className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

                {/* Back Button */}
                <div className="absolute top-8 left-4 md:left-8 z-20">
                    <Link href="/rooms" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group bg-slate-900/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Stays</span>
                    </Link>
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
                    <div className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--color-primary)] mb-4 lg:mb-6">
                        {room.category === 'TENT' ? 'Eco-Luxury Tent' : 'Boutique Room'}
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
                        {room.room_type}
                    </h1>
                </div>
            </div>

            {/* Highlights Bar */}
            <div className="bg-slate-900 text-white border-y border-white/10 sticky top-0 z-40 hidden md:block">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex gap-12">
                        <div className="flex items-center gap-3">
                            <Users size={20} className="text-slate-400" />
                            <div>
                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Capacity</div>
                                <div className="text-sm font-black tracking-tight">Up to {room.capacity_adults + room.capacity_children} Guests</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Maximize size={20} className="text-slate-400" />
                            <div>
                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Space</div>
                                <div className="text-sm font-black tracking-tight">Suite #{room.room_number}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={20} className="text-slate-400" />
                            <div>
                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Status</div>
                                <div className="text-sm font-black tracking-tight">{room.status === 'AVAILABLE' ? 'Ready for Booking' : 'Limited Availability'}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Starting From</div>
                            <div className="text-xl font-black tracking-tighter">${room.price_per_night} <span className="text-[10px] text-slate-500 font-medium tracking-normal uppercase">/ night</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col lg:flex-row gap-12 lg:gap-24 relative">

                {/* Left Column: Details */}
                <div className="flex-1 lg:max-w-3xl">
                    <section className="mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter mb-8">The Experience</h2>
                        <div className="prose prose-lg prose-slate max-w-none prose-p:font-medium prose-p:leading-relaxed prose-p:text-slate-500 text-lg">
                            <p>{room.description}</p>
                            <p className="mt-6">
                                Designed with absolute tranquility in mind, every aspect of this suite invites you to disconnect from the world and reconnect with nature. Floor-to-ceiling aesthetics blend seamlessly with the surrounding environment, offering an unparalleled barefoot luxury experience. Enjoy premium bedding, artisan-crafted local furniture, and exclusive access to the resort's finest amenities.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100 my-16" />

                    <section className="mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter mb-10">Suite Amenities</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                            {amenitiesList.map((amenity, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                                        {getAmenityIcon(amenity)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-sm tracking-tight mb-1 capitalize">{amenity}</h4>
                                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">Included during your stay</p>
                                    </div>
                                </div>
                            ))}
                            {/* Standard inclusions if list is short */}
                            {amenitiesList.length < 4 && (
                                <>
                                    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0"><Mug size={18} /></div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-sm tracking-tight mb-1">Morning Coffee</h4>
                                            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">In-room artisanal roast</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0"><ShieldCheck size={18} /></div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-sm tracking-tight mb-1">Daily Housekeeping</h4>
                                            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">Discrete turn-down service</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Sticky Booking Widget */}
                <div className="w-full lg:w-[420px] shrink-0">
                    <div className="sticky top-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 lg:p-10 z-30">
                        <div className="flex justify-between items-end mb-8 pb-8 border-b border-slate-100">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Reserve Suite</div>
                                <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none">${room.price_per_night}</div>
                            </div>
                            <div className="text-right">
                                {isRoomSelected ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                                        <CheckCircle2 size={12} /> Selected
                                    </span>
                                ) : (
                                    <span className="inline-block px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-widest">
                                        Available
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6 mb-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 pl-1">Check-in</label>
                                    <div className="relative">
                                        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="date"
                                            value={localCheckIn}
                                            onChange={(e) => setLocalCheckIn(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 pl-1">Check-out</label>
                                    <div className="relative">
                                        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="date"
                                            value={localCheckOut}
                                            onChange={(e) => setLocalCheckOut(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 pl-1">Adults</label>
                                    <select
                                        value={localAdults}
                                        onChange={(e) => setLocalAdults(parseInt(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all appearance-none"
                                    >
                                        {[1, 2, 3, 4].map(n => (
                                            <option key={n} value={n}>{n} Adult{n !== 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 pl-1">Children</label>
                                    <select
                                        value={localChildren}
                                        onChange={(e) => setLocalChildren(parseInt(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all appearance-none"
                                    >
                                        {[0, 1, 2, 3].map(n => (
                                            <option key={n} value={n}>{n} Child{n !== 1 ? 'ren' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <button
                                onClick={() => toggleRoom(room as any)}
                                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isRoomSelected
                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                                        : 'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                {isRoomSelected ? (
                                    <>Added to Stay <CheckCircle2 size={18} /></>
                                ) : (
                                    'Add to Stay'
                                )}
                            </button>

                            <button
                                onClick={handleBookingUpdate}
                                className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                            >
                                Continue to Checkout
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">You won't be charged yet</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Rooms */}
            {relatedRooms.length > 0 && (
                <section className="bg-slate-50 border-t border-slate-100 py-24 mt-12">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter mb-4">Discover More</h2>
                            <p className="text-lg text-slate-500 font-medium">Explore other incredible suites to enhance your stay.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                            {relatedRooms.map((relRoom) => (
                                <Link href={`/rooms/${relRoom.id}`} key={relRoom.id} className="group block">
                                    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                                        <div className="h-56 relative overflow-hidden bg-slate-100">
                                            <img
                                                src={relRoom.image_url || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=400&q=80"}
                                                alt={relRoom.room_type}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                                                {relRoom.category === 'TENT' ? 'Eco-Luxury' : 'Boutique'}
                                            </div>
                                        </div>
                                        <div className="p-8 flex-1 flex flex-col">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-[var(--color-primary)] transition-colors">{relRoom.room_type}</h3>
                                            <div className="text-sm font-black text-slate-500 mb-6">${relRoom.price_per_night} <span className="text-[9px] uppercase tracking-widest font-bold">/ night</span></div>
                                            <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                                                Explore Suite <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
