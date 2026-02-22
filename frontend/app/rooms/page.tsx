'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    Hotel
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
        if (n.includes('wifi')) return <Wifi size={16} />;
        if (n.includes('coffee') || n.includes('breakfast')) return <Coffee size={16} />;
        if (n.includes('ac') || n.includes('air')) return <Wind size={16} />;
        if (n.includes('tv')) return <Tv size={16} />;
        if (n.includes('pool') || n.includes('lagoon')) return <Waves size={16} />;
        return <Star size={16} />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="relative h-80 bg-gray-900 flex items-center justify-center">
                <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="relative text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">Our Accommodations</h1>
                    <p className="text-xl text-gray-300 font-medium max-w-2xl mx-auto">
                        From luxury bamboo rooms to eco-friendly beach tents, find your sanctuary.
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            All Stays
                        </button>
                        <button
                            onClick={() => setFilter('ROOM')}
                            className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'ROOM' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            <Hotel size={18} /> Boutique Rooms
                        </button>
                        <button
                            onClick={() => setFilter('TENT')}
                            className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'TENT' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            <Tent size={18} /> Eco Tents
                        </button>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-2xl">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* Grid View */}
                {view === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredRooms.map((room) => (
                            <div key={room.id} className="group flex flex-col h-full bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all hover:scale-[1.02]">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={room.image_url || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"}
                                        alt={room.room_type}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 shadow-xl">
                                        {room.category === 'TENT' ? 'Luxury Tent' : 'Boutique Room'}
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{room.room_type}</h3>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-gray-900">${room.price_per_night}</div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/ Night</div>
                                        </div>
                                    </div>

                                    <p className="text-gray-500 font-medium mb-8 text-sm leading-relaxed line-clamp-2">
                                        {room.description || "Experience unparalleled luxury in our carefully designed accommodation with breathtaking views."}
                                    </p>

                                    <div className="flex flex-wrap gap-4 mb-8">
                                        {room.amenities ? (
                                            room.amenities.split(',').slice(0, 3).map((amenity: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                    {getAmenityIcon(amenity)} {amenity.trim()}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-xs font-black text-gray-300 uppercase tracking-widest italic flex items-center gap-2">
                                                <Star size={12} className="text-gray-200" /> Standard Amenities Included
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-8 border-t border-gray-50 mt-auto">
                                        <div className="flex items-center gap-4 text-gray-400">
                                            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-widest">
                                                <Users size={16} className="text-gray-300" /> {room.capacity_adults} Adults
                                            </div>
                                        </div>
                                        <Link href={`/booking/details?room=${room.id}`}>
                                            <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all flex items-center gap-2">
                                                Book Now <ArrowRight size={16} />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-8">
                        {filteredRooms.map((room) => (
                            <div key={room.id} className="group flex flex-col lg:flex-row bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all lg:h-72">
                                <div className="lg:w-1/3 h-64 lg:h-full overflow-hidden">
                                    <img
                                        src={room.image_url || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"}
                                        alt={room.room_type}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="p-8 lg:p-10 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.2em] mb-2">
                                                {room.category === 'TENT' ? 'Eco-Luxury Tent' : 'Boutique Room'}
                                            </div>
                                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{room.room_type}</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-gray-900">${room.price_per_night}</div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/ Night</div>
                                        </div>
                                    </div>

                                    <p className="text-gray-500 font-medium mb-6 text-sm leading-relaxed max-w-2xl">
                                        {room.description || "Experience unparalleled luxury in our carefully designed accommodation with breathtaking views and premium amenities."}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex gap-6">
                                            {room.amenities.split(',').slice(0, 4).map((amenity, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                    {getAmenityIcon(amenity)} {amenity.trim()}
                                                </div>
                                            ))}
                                        </div>
                                        <Link href={`/booking/details?room=${room.id}`}>
                                            <button className="bg-gray-900 text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all flex items-center gap-2">
                                                Reserve Suite <ArrowRight size={16} />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredRooms.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <Tent className="mx-auto text-gray-300 mb-6" size={64} />
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No matching stays found</h3>
                        <p className="text-gray-500 font-medium">Try changing your filter settings to see more options.</p>
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <section className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="flex gap-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                            <Star className="text-yellow-400" fill="currentColor" size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 mb-2">Premium Quality</h4>
                            <p className="text-sm text-gray-500 font-medium">Handcrafted furniture and 100% sustainable materials.</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                            <MapPin className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 mb-2">Lagoon Views</h4>
                            <p className="text-sm text-gray-500 font-medium">Every room features a private balcony overlooking the water.</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                            <Users className="text-emerald-500" size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 mb-2">Local Growth</h4>
                            <p className="text-sm text-gray-500 font-medium">Your stay supports the Irene Charity Foundation education funds.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
