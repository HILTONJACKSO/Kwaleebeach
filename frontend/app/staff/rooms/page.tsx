'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bed, User, RefreshCcw, Wrench, Plus, Search, Sparkles, MapPin, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Room {
    id: number;
    room_number: string;
    room_type: string;
    category: string;
    status: string;
    price_per_night: string;
    description: string;
    amenities: string;
    image: string | null;
}

export default function RoomGrid() {
    const { showNotification } = useUI();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchRooms = async () => {
        try {
            const res = await fetch('/api/pms/rooms/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setRooms(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
        const interval = setInterval(fetchRooms, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return { bg: 'bg-emerald-500', text: 'text-emerald-500', lightBg: 'bg-emerald-50', border: 'border-emerald-100', icon: <Bed size={14} /> };
            case 'OCCUPIED': return { bg: 'bg-blue-500', text: 'text-blue-500', lightBg: 'bg-blue-50', border: 'border-blue-100', icon: <User size={14} /> };
            case 'DIRTY': return { bg: 'bg-orange-500', text: 'text-orange-500', lightBg: 'bg-orange-50', border: 'border-orange-100', icon: <RefreshCcw size={14} /> };
            case 'MAINTENANCE': return { bg: 'bg-rose-500', text: 'text-rose-500', lightBg: 'bg-rose-50', border: 'border-rose-100', icon: <Wrench size={14} /> };
            default: return { bg: 'bg-gray-500', text: 'text-gray-500', lightBg: 'bg-gray-50', border: 'border-gray-100', icon: <Bed size={14} /> };
        }
    };

    const filteredRooms = rooms.filter(r => {
        const matchesFilter = filter === 'All' || r.status === filter;
        const matchesSearch = r.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.room_type.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Room Inventory (PMS)</h1>
                    <p className="text-gray-500 font-medium tracking-tight text-sm">Monitor and manage room statuses in real-time.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                        href="/staff/rooms/add"
                        className="flex-1 sm:flex-none justify-center bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-[var(--color-primary)] transition-all shadow-lg shadow-gray-200"
                    >
                        <Plus size={18} /> <span className="hidden xs:inline">Register Room</span><span className="xs:hidden">Add</span>
                    </Link>
                    <button onClick={fetchRooms} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                        <RefreshCcw size={18} className="text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl">
                    {['All', 'AVAILABLE', 'OCCUPIED', 'DIRTY', 'MAINTENANCE'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === s
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <div className="flex-1 min-w-[240px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input
                        type="text"
                        placeholder="Search room number or type..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? Array(8).fill(0).map((_, i) => (
                    <div key={i} className="h-80 bg-gray-50 animate-pulse rounded-[2.5rem] border border-gray-100"></div>
                )) : filteredRooms.map(room => {
                    const theme = getStatusTheme(room.status);
                    return (
                        <Link
                            key={room.id}
                            href={`/staff/rooms/edit/${room.id}`}
                            className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 hover:-translate-y-2 flex flex-col"
                        >
                            {/* Image Part */}
                            <div className="relative h-48 overflow-hidden">
                                {room.image ? (
                                    <img src={room.image} alt={room.room_number} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200">
                                        <ImageIcon size={48} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-sm">
                                        <span className="text-xl font-black text-gray-900 tracking-tighter">{room.room_number}</span>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <div className={`${theme.bg} text-white px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-lg shadow-black/10 flex items-center gap-2`}>
                                        {theme.icon} {room.status}
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <div className="bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-xs font-black shadow-lg">
                                        ${room.price_per_night} <span className="text-[8px] font-medium text-gray-400 uppercase tracking-widest">/ Night</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content Part */}
                            <div className="p-6 flex-1 flex flex-col gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-[var(--color-primary)] uppercase tracking-wider mb-1">
                                        <Sparkles size={12} /> {room.category}
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight">{room.room_type}</h3>
                                </div>

                                {room.amenities && (
                                    <div className="flex flex-wrap gap-2">
                                        {room.amenities.split(',').slice(0, 3).map((a, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-50 rounded-lg text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                                                {a.trim()}
                                            </span>
                                        ))}
                                        {room.amenities.split(',').length > 3 && (
                                            <span className="text-[9px] font-bold text-gray-400">+{room.amenities.split(',').length - 3}</span>
                                        )}
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                                    {room.description || "No description provided for this room."}
                                </p>

                                <div className="pt-4 mt-auto border-t border-gray-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[var(--color-primary)] transition-colors">
                                    <span>Manage Attributes</span>
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {!loading && filteredRooms.length === 0 && (
                <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Bed size={32} className="text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No Rooms Found</h3>
                    <p className="text-gray-400 font-medium text-sm">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
}
