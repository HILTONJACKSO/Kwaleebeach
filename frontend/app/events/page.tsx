'use client';

import { useState, useEffect } from 'react';
import { useUI } from '@/context/UIContext';
import { Calendar, Clock, MapPin, ArrowRight, Music, Utensils, TreePine, Sparkles, Gem } from 'lucide-react';

export default function EventsPage() {
    const { showModal } = useUI();
    const [filter, setFilter] = useState('All');
    const [siteConfig, setSiteConfig] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchCMS();
    }, []);

    const fetchCMS = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/website/config/');
            if (res.ok) {
                const data = await res.json();
                const configMap = data.reduce((acc: any, item: any) => {
                    acc[item.key] = item.value;
                    return acc;
                }, {});
                setSiteConfig(configMap);
            }
        } catch (error) {
            console.error('Fetch CMS error:', error);
        }
    };

    const getConfig = (key: string, defaultValue: string) => siteConfig[key] || defaultValue;

    const events = [
        {
            id: 1,
            title: "Grand Sunday Brunch",
            subtitle: "Culinary Excellence",
            date: "Feb 08",
            time: "10:00 AM - 2:00 PM",
            location: "Main Restaurant",
            description: "Indulge in a curated selection of gourmet delicacies accompanied by smooth live jazz and bottomless mimosas.",
            price: "$25.00",
            category: "Dining",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
            icon: <Utensils size={18} />
        },
        {
            id: 2,
            title: "Afro-Jazz Night",
            subtitle: "Live Performance",
            date: "Feb 13",
            time: "7:00 PM - 11:00 PM",
            location: "Horizon Bar",
            description: "Experience the soulful rhythms of West Africa with our resident jazz ensemble. Perfect vibe for cocktails.",
            price: "$15.00",
            category: "Music",
            image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
            icon: <Music size={18} />
        },
        {
            id: 3,
            title: "Karaoke Night",
            subtitle: "Guest Spotlight",
            date: "Feb 14",
            time: "8:00 PM - Late",
            location: "Sunset Lounge",
            description: "Unleash your inner star! Join us for a high-energy evening of song and laughter with our crystal-clear sound system.",
            price: "$15.00",
            category: "Music",
            image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
            icon: <Music size={18} />
        },
        {
            id: 4,
            title: "Premium Movie Night",
            subtitle: "Beachside Cinema",
            date: "Feb 15",
            time: "7:30 PM",
            location: "Private Beach",
            description: "Enjoy a blockbuster film under the stars with blankets, private audio, and a selection of gourmet snacks.",
            price: "$40.00",
            category: "Special",
            image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
            icon: <Sparkles size={18} />
        },
        {
            id: 5,
            title: "Romantic Beach Dinner",
            subtitle: "Standard Package",
            date: "Daily",
            time: "7:00 PM",
            location: "Shoreline",
            description: "Private candlelit table for two on the sand with a 3-course curated menu. Perfectly quiet and serene.",
            price: "$130.00",
            category: "Dining",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            icon: <Utensils size={18} />
        },
        {
            id: 6,
            title: "VVIP Poolside Dinner",
            subtitle: "Ultimate Luxury",
            date: "By Request",
            time: "8:00 PM",
            location: "Cabana 1",
            description: "Private cabana dining, 5-course signature menu, champagne toast, and personalized white-glove service.",
            price: "$150.00",
            category: "Dining",
            image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80",
            icon: <Utensils size={18} />
        }
    ];

    const filteredEvents = filter === 'All' ? events : events.filter(e => e.category === filter);

    const handleBook = (title: string) => {
        showModal(
            "Event Reservation",
            `Would you like to reserve your spot for "${title}"? Our concierge will contact you to confirm details.`
        );
    };

    return (
        <div className="bg-gray-900 min-h-screen pb-32">
            {/* Cinematic Hero */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={getConfig('evt_hero_bg', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1920&q=80')}
                        className="w-full h-full object-cover"
                        alt="Hero background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/40 to-gray-900" />
                </div>
                <div className="relative z-10 text-center px-6 max-w-5xl">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md text-[var(--color-yellow)] rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 border border-white/10 animate-fade-in shadow-2xl">
                        <Sparkles size={14} /> Curation of Moments
                    </div>
                    <h1 className="text-6xl md:text-[9rem] text-white tracking-tighter mb-8 leading-[0.85] shadow-2xl" style={{ fontFamily: 'serif' }}>
                        {getConfig('evt_hero_title', 'Unforgettable Happenings.')}
                    </h1>
                    <p className="text-xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed opacity-80">
                        {getConfig('evt_hero_desc', 'Discover the soul of Kwalee Beach Resort through our exclusively designed events, cultural journeys, and high-energy celebrations.')}
                    </p>
                </div>
            </section>

            {/* Premium Glass Filter Bar */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
                <div className="bg-white/5 backdrop-blur-2xl p-4 rounded-[3rem] shadow-2xl flex flex-wrap items-center justify-center gap-4 border border-white/10">
                    {['All', 'Dining', 'Music', 'Adventure', 'Special'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${filter === cat
                                ? 'bg-[var(--color-yellow)] text-gray-900 shadow-[0_0_30px_rgba(251,182,125,0.3)] scale-105'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events Grid */}
            <div className="max-w-7xl mx-auto px-6 py-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredEvents.map(event => (
                        <div key={event.id} className="group relative bg-white/5 rounded-[3.5rem] overflow-hidden border border-white/5 hover:bg-white/10 transition-all duration-700 p-2 flex flex-col h-full shadow-2xl">
                            {/* Image Container */}
                            <div className="relative h-80 rounded-[3rem] overflow-hidden">
                                <img
                                    src={event.image}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    alt={event.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                {/* Category Badge */}
                                <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl flex items-center gap-2 border border-white/20 shadow-2xl">
                                    <span className="text-[var(--color-yellow)]">{event.icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{event.category}</span>
                                </div>

                                {/* Price Badge */}
                                <div className="absolute top-6 right-6 bg-[var(--color-yellow)] px-5 py-2.5 rounded-2xl shadow-2xl">
                                    <span className="text-gray-900 font-black text-xs uppercase tracking-widest">{event.price}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-10 flex flex-col flex-1">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="bg-white/5 p-4 rounded-[1.5rem] min-w-[75px] text-center border border-white/10">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 leading-none">Date</div>
                                        <div className="text-2xl font-serif italic text-white leading-none">{event.date.split(' ')[1]}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-yellow)] mt-1">{event.date.split(' ')[0]}</div>
                                    </div>
                                    <div className="text-right flex-1 ml-6">
                                        <div className="flex items-center justify-end gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">
                                            <Clock size={12} className="text-[var(--color-yellow)]" /> {event.time}
                                        </div>
                                        <div className="flex items-center justify-end gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                                            <MapPin size={12} className="text-rose-500" /> {event.location}
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-3xl font-serif text-white mb-4 tracking-tight leading-tight group-hover:text-[var(--color-yellow)] transition-colors duration-500">
                                    {event.title}
                                </h3>
                                <p className="text-gray-400 font-medium text-sm leading-relaxed mb-12 flex-1 line-clamp-3">
                                    {event.description}
                                </p>

                                <button
                                    onClick={() => handleBook(event.title)}
                                    className="w-full bg-[var(--color-yellow)] text-gray-900 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white transition-all duration-500 shadow-xl group/btn"
                                >
                                    Secure Your Invitation <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
