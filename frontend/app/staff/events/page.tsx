'use client';
import { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Clock, Tag } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function StaffEventsPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN', 'FRONT_DESK']}>
            <StaffEventsPageContent />
        </ProtectedRoute>
    );
}

interface EventData {
    id: number;
    title: string;
    description: string;
    price: string;
    image: string | null;
    date: string;
    time: string;
    location: string;
    capacity: number;
    status: string;
}

function StaffEventsPageContent() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/recreation/events/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data);
                }
            } catch (err) {
                console.error("Failed to fetch events:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Event Management</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Schedule and track resort experiences and bookings.</p>
                </div>
                <Link
                    href="/staff/events/new"
                    className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[var(--color-primary)] transition-all"
                >
                    <Plus size={18} /> Create New Event
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-[2.5rem] p-8 h-64 animate-pulse border border-gray-100">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl mb-6"></div>
                            <div className="h-6 w-3/4 bg-gray-100 rounded-lg mb-4"></div>
                            <div className="h-4 w-1/2 bg-gray-100 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500 flex flex-col">
                            {event.image ? (
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900">
                                        ${event.price}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 bg-orange-50 flex items-center justify-center text-[var(--color-primary)]">
                                    <Calendar size={48} />
                                </div>
                            )}

                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${event.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                                        event.status === 'Scheduled' || event.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600' :
                                            'bg-gray-50 text-gray-400'
                                        }`}>
                                        {event.status}
                                    </span>
                                    <div className="text-gray-400 text-xs font-bold flex items-center gap-1">
                                        <Clock size={14} /> {event.date}
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 mb-2">{event.title}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">{event.description}</p>

                                <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <MapPin size={14} />
                                        <span className="text-xs font-bold">{event.location}</span>
                                    </div>
                                    <Link
                                        href={`/staff/events/edit/${event.id}`}
                                        className="text-xs font-black text-[var(--color-primary)] uppercase tracking-widest hover:underline"
                                    >
                                        Manage Experience
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="col-span-full py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                            <div className="bg-white p-6 rounded-3xl shadow-sm mb-4">
                                <Calendar size={48} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-1">No Experiences Found</h3>
                            <p className="text-gray-400 font-medium max-w-xs">Start by creating your first resort event to see it listed here.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
