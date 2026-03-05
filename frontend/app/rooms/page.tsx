'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import {
    Star,
    Users,
    MapPin,
    ArrowRight,
    Wifi,
    Coffee,
    Wind,
    Tv,
    Waves,
    LayoutGrid,
    List,
    Tent,
    Hotel,
    CheckCircle2,
    ShoppingBag,
    ChevronDown,
    Maximize
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

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'ROOM' | 'TENT'>('ALL');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const { state } = useBooking();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await fetch('/api/pms/rooms/');
            const data = await response.json();
            setRooms(data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRooms = rooms.filter(room => {
        if (filter === 'ALL') return true;
        return room.category === filter;
    });

    const getAmenityIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('wifi')) return <Wifi size={14} />;
        if (n.includes('coffee') || n.includes('breakfast')) return <Coffee size={14} />;
        if (n.includes('ac') || n.includes('air')) return <Wind size={14} />;
        if (n.includes('tv')) return <Tv size={14} />;
        if (n.includes('pool') || n.includes('lagoon')) return <Waves size={14} />;
        return <Star size={14} />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    const isRoomSelected = (id: number) => state.rooms.some(r => r.id === id);

    return (
        <div className="bg-gray-50/50 min-h-screen relative pb-24">
            {/* Header */}
            <div className="relative h-[60vh] bg-gray-900 flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80"
                    alt="Luxury Stays Header"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent"></div>
                <div className="relative text-center px-4 max-w-4xl mx-auto z-10 translate-y-8">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-primary)] mb-6">Discover Your Sanctuary</div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
                        Elevated <br /> Stays
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
                        Immerse yourself in barefoot luxury. From artisan bamboo suites to eco-friendly beach tents, every detail is crafted for tranquility.
                    </p>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-subtle text-white/50 flex flex-col items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest">Scroll to explore</span>
                    <ChevronDown size={16} />
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Refined Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16 pb-8 border-b border-gray-200/50">
                    <div className="flex gap-2 p-1 bg-white rounded-full shadow-sm border border-gray-100">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 ${filter === 'ALL' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-slate-900'}`}
                        >
                            All Discoveries
                        </button>
                        <button
                            onClick={() => setFilter('ROOM')}
                            className={`px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${filter === 'ROOM' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-slate-900'}`}
                        >
                            <Hotel size={16} /> Suites
                        </button>
                        <button
                            onClick={() => setFilter('TENT')}
                            className={`px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${filter === 'TENT' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-slate-900'}`}
                        >
                            <Tent size={16} /> Eco-Tents
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-full shadow-sm border border-gray-100">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-3 rounded-full transition-all duration-300 ${view === 'grid' ? 'bg-slate-50 text-slate-900 shadow-sm' : 'text-gray-400 hover:text-slate-900'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-3 rounded-full transition-all duration-300 ${view === 'list' ? 'bg-slate-50 text-slate-900 shadow-sm' : 'text-gray-400 hover:text-slate-900'}`}
                            title="List View"
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* Grid View */}
                {view === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
                        {filteredRooms.map((room) => (
                            <Link href={`/rooms/${room.id}`} key={room.id} className="group block focus:outline-none">
                                <div className={`h-full flex flex-col bg-white rounded-[2rem] overflow-hidden border transition-all duration-500 hover:-translate-y-2 ${isRoomSelected(room.id) ? 'border-slate-900 shadow-2xl' : 'border-gray-100 shadow-lg hover:shadow-2xl hover:border-gray-200'}`}>
                                    {/* Edge-to-edge Image Container */}
                                    <div className="relative h-80 overflow-hidden bg-gray-100">
                                        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                        <img
                                            src={room.image_url || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"}
                                            alt={room.room_type}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />

                                        {/* Status Tags */}
                                        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                                            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm inline-block">
                                                {room.category === 'TENT' ? 'Eco-Luxury' : 'Boutique'}
                                            </div>
                                            {isRoomSelected(room.id) && (
                                                <div className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 w-fit animate-in fade-in zoom-in duration-300">
                                                    <CheckCircle2 size={12} /> In Your Stay
                                                </div>
                                            )}
                                        </div>

                                        {/* Hover Overlay Action */}
                                        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                            <div className="bg-white/90 backdrop-blur-md text-slate-900 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                <Maximize size={16} /> Explore Details
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 lg:p-10 flex flex-col flex-1 relative bg-white z-30">
                                        <div className="flex justify-between items-end mb-6">
                                            <div className="flex-1 pr-4">
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-[var(--color-primary)] transition-colors">{room.room_type}</h3>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-sm font-black text-slate-400 uppercase tracking-widest line-through decoration-slate-300/50 decoration-2 mb-0.5">${(parseFloat(room.price_per_night) * 1.2).toFixed(0)}</div>
                                                <div className="text-2xl font-black text-slate-900 leading-none">${room.price_per_night}</div>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">/ Night</div>
                                            </div>
                                        </div>

                                        <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed line-clamp-2">
                                            {room.description}
                                        </p>

                                        {/* Subtle Amenities Row */}
                                        <div className="flex flex-wrap gap-4 mb-8">
                                            {room.amenities ? (
                                                room.amenities.split(',').slice(0, 3).map((amenity: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                        {getAmenityIcon(amenity)} {amenity.trim()}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                                                    <Star size={12} className="text-slate-300" /> Standard Amenities Included
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer */}
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Users size={16} className="text-slate-400" />
                                                <span className="font-black text-[10px] uppercase tracking-widest">
                                                    Up to {room.capacity_adults + room.capacity_children} {room.capacity_adults + room.capacity_children === 1 ? 'Guest' : 'Guests'}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 group-hover:text-slate-900 transition-colors">
                                                View Suite <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Horizontal Row View */
                    <div className="space-y-8 max-w-5xl mx-auto">
                        {filteredRooms.map((room) => (
                            <Link href={`/rooms/${room.id}`} key={room.id} className="group block focus:outline-none">
                                <div className={`flex flex-col md:flex-row bg-white rounded-[2rem] overflow-hidden border transition-all duration-500 hover:-translate-y-1 ${isRoomSelected(room.id) ? 'border-slate-900 shadow-2xl' : 'border-gray-100 shadow-md hover:shadow-xl hover:border-gray-200'}`}>

                                    {/* Image Column */}
                                    <div className="md:w-[40%] h-72 md:h-auto relative overflow-hidden bg-gray-100 shrink-0">
                                        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                        <img
                                            src={room.image_url || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"}
                                            alt={room.room_type}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />

                                        {/* Status Tags */}
                                        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                                            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm inline-block">
                                                {room.category === 'TENT' ? 'Eco-Luxury' : 'Boutique'}
                                            </div>
                                            {isRoomSelected(room.id) && (
                                                <div className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 w-fit animate-in fade-in zoom-in duration-300">
                                                    <CheckCircle2 size={12} /> In Your Stay
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Column */}
                                    <div className="p-8 lg:p-12 flex-1 flex flex-col justify-center bg-white z-30 relative">
                                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-6">
                                            <div>
                                                <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-[var(--color-primary)] transition-colors mb-2">{room.room_type}</h3>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Users size={16} className="text-slate-400" />
                                                    <span className="font-black text-[10px] uppercase tracking-widest">
                                                        Sleeps {room.capacity_adults + room.capacity_children}
                                                    </span>
                                                    <span className="text-slate-300 mx-2">•</span>
                                                    <span className="font-black text-[10px] uppercase tracking-widest">Suite #{room.room_number}</span>
                                                </div>
                                            </div>
                                            <div className="text-left lg:text-right shrink-0">
                                                <div className="text-sm font-black text-slate-400 uppercase tracking-widest line-through decoration-slate-300/50 decoration-2 mb-0.5">${(parseFloat(room.price_per_night) * 1.2).toFixed(0)}</div>
                                                <div className="text-3xl font-black text-slate-900 leading-none">${room.price_per_night}</div>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">/ Night</div>
                                            </div>
                                        </div>

                                        <p className="text-slate-500 font-medium mb-8 text-sm lg:text-base leading-relaxed max-w-2xl">
                                            {room.description}
                                        </p>

                                        {/* Subtle Amenities Row */}
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex flex-wrap gap-4">
                                                {room.amenities ? (
                                                    room.amenities.split(',').slice(0, 4).map((amenity: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                            {getAmenityIcon(amenity)} <span className="hidden sm:inline">{amenity.trim()}</span>
                                                        </div>
                                                    ))
                                                ) : null}
                                            </div>
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300 shrink-0 shadow-sm border border-slate-100 group-hover:border-transparent">
                                                <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {filteredRooms.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm max-w-4xl mx-auto">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Tent className="text-gray-300" size={40} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">No matching stays found</h3>
                        <p className="text-gray-500 font-medium text-lg">Adjust your filters to discover our other unique accommodations.</p>
                        <button onClick={() => setFilter('ALL')} className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors">
                            View All Stays
                        </button>
                    </div>
                )}
            </div>

            {/* Sticky "Review Stays" Float */}
            {state.rooms.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <Link href="/booking/details">
                        <button className="bg-slate-900 text-white px-8 py-5 rounded-full shadow-2xl flex items-center gap-6 hover:-translate-y-1 transition-transform border border-white/10 group">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <ShoppingBag size={20} className="text-[var(--color-primary)]" />
                                    <span className="absolute -top-2 -right-2 bg-white text-slate-900 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black">
                                        {state.rooms.length}
                                    </span>
                                </div>
                                <div className="text-left">
                                    <div className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Your Expedition</div>
                                    <div className="text-sm font-black tracking-tight">Review & Checkout</div>
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:bg-[var(--color-primary)] group-hover:text-slate-900 transition-colors">
                                <ArrowRight size={18} />
                            </div>
                        </button>
                    </Link>
                </div>
            )}

            {/* Footer Features */}
            <section className="bg-white border-t border-gray-100 relative z-10">
                <div className="max-w-[1400px] mx-auto px-4 py-24 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 lg:gap-24">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner border border-slate-100 mb-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-slate-100 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <Star className="text-slate-900 relative z-10" fill="currentColor" size={24} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight mb-4">Premium Quality</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">Handcrafted artisan furniture and 100% locally-sourced sustainable materials in every suite.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner border border-slate-100 mb-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-slate-100 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <MapPin className="text-[var(--color-primary)] relative z-10" size={24} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight mb-4">Exclusive Locations</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">Choose between direct beach access or private balconies overlooking the serene estuarine lagoon.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner border border-slate-100 mb-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-slate-100 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <Users className="text-emerald-500 relative z-10" size={24} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight mb-4">Community Impact</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">A portion of every stay directly supports the Irene Charity Foundation education funds.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
