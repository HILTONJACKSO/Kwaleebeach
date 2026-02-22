'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Palmtree,
    Compass,
    Anchor,
    Waves,
    Star,
    Music,
    Flame,
    Utensils,
    ArrowRight,
    Clock,
    DollarSign,
    Mountain,
    Gem,
    Zap,
    CheckCircle,
    Sparkles,
    Trophy,
    Gamepad,
    Mic2,
    Palette,
    GlassWater,
    Wind
} from 'lucide-react';

interface Item {
    id: number;
    title: string;
    description: string;
    price: string;
    duration?: string;
    image_url: string;
    type: 'tour' | 'package';
}

export default function ActivitiesPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [siteConfig, setSiteConfig] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchData();
        fetchCMS();
    }, []);

    const fetchCMS = async () => {
        try {
            const res = await fetch('/api/website/config/');
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

    const fetchData = async () => {
        try {
            const [toursRes, packagesRes] = await Promise.all([
                fetch('/api/recreation/activities/'),
                fetch('/api/recreation/packages/')
            ]);

            const toursData = toursRes.ok ? await toursRes.json() : [];
            const packagesData = packagesRes.ok ? await packagesRes.json() : [];

            const combined = [
                ...(Array.isArray(toursData) ? toursData : []).map((t: any) => ({ ...t, type: 'tour' })),
                ...(Array.isArray(packagesData) ? packagesData : []).map((p: any) => ({ ...p, type: 'package' }))
            ];

            setItems(combined);
        } catch (error) {
            console.error('Error fetching data:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = filter === 'All'
        ? items
        : items.filter(item => (filter === 'Tours' ? item.type === 'tour' : item.type === 'package'));

    const getIcon = (title: string, index: number) => {
        const t = title.toLowerCase();
        if (t.includes('village')) return <Palmtree size={24} className="text-emerald-500" />;
        if (t.includes('wildlife') || t.includes('chimpanzees')) return <Compass size={24} className="text-orange-500" />;
        if (t.includes('soccer') || t.includes('volleyball')) return <Trophy size={24} className="text-yellow-500" />;
        if (t.includes('dance') || t.includes('performance')) return <Music size={24} className="text-purple-500" />;
        if (t.includes('culinary')) return <Utensils size={24} className="text-rose-500" />;
        if (t.includes('game')) return <Gamepad size={24} className="text-blue-500" />;
        if (t.includes('bonfire')) return <Flame size={24} className="text-orange-600" />;
        if (t.includes('jazz')) return <Music size={24} className="text-indigo-500" />;
        if (t.includes('karaoke')) return <Mic2 size={24} className="text-pink-500" />;
        if (t.includes('swimming')) return <Waves size={24} className="text-cyan-500" />;
        if (t.includes('ocean') || t.includes('fishing')) return <Anchor size={24} className="text-blue-600" />;

        const tourIcons = [
            <Palmtree size={24} className="text-emerald-500" />,
            <Compass size={24} className="text-orange-500" />,
            <Anchor size={24} className="text-blue-500" />,
            <Waves size={24} className="text-cyan-500" />,
            <Star size={24} className="text-yellow-500" />
        ];
        return tourIcons[index % tourIcons.length];
    };

    return (
        <div className="bg-gray-900 min-h-screen pb-32">
            {/* Cinematic Hero */}
            <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <img
                    src={getConfig('act_hero_bg', 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=1920&q=80')}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Background"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/40 to-gray-900" />

                <div className="relative z-10 text-center px-6 max-w-5xl">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md text-[var(--color-yellow)] rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 border border-white/10 animate-fade-in shadow-2xl">
                        <Sparkles size={14} /> Curated Journeys
                    </div>
                    <h1 className="text-6xl md:text-[9rem] text-white tracking-tighter mb-8 leading-[0.85] shadow-2xl" style={{ fontFamily: 'serif' }}>
                        {getConfig('act_hero_title', 'The Experience Collection.')}
                    </h1>
                    <p className="text-xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed opacity-80">
                        {getConfig('act_hero_desc', 'Beyond the luxury of your room lies a world of discovery. From hidden lagoons to premium coastal bundles, discover the soul of Kwalee Beach Resort.')}
                    </p>
                </div>
            </div>

            {/* Premium Glass Filter Bar */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
                <div className="bg-white/5 backdrop-blur-2xl p-4 rounded-[3rem] shadow-2xl flex flex-wrap items-center justify-center gap-4 border border-white/10">
                    {['All', 'Tours', 'Packages'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-12 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${filter === f
                                ? 'bg-[var(--color-yellow)] text-gray-900 shadow-[0_0_30px_rgba(251,182,125,0.3)] scale-105'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-32">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[var(--color-yellow)] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredItems.map((item, i) => (
                            <div key={i} className="group relative bg-white/5 rounded-[3.5rem] overflow-hidden border border-white/5 hover:bg-white/10 transition-all duration-700 p-2 flex flex-col h-full shadow-2xl">
                                {/* Image Container */}
                                <div className="h-80 rounded-[3rem] overflow-hidden relative">
                                    <img
                                        src={item.image_url || `https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=800&q=80&sig=${i}`}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                    <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl flex items-center gap-2 border border-white/20 shadow-2xl">
                                        {item.type === 'package' ? <Gem size={14} className="text-[var(--color-yellow)]" /> : <Compass size={14} className="text-[var(--color-yellow)]" />}
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">{item.type}</span>
                                    </div>
                                    <div className="absolute top-6 right-6 bg-[var(--color-yellow)] px-5 py-2.5 rounded-2xl shadow-2xl">
                                        <span className="text-gray-900 font-black text-xs uppercase tracking-widest">${item.price}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-10 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-8">
                                        {item.type === 'tour' ? (
                                            <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center border border-white/10 group-hover:bg-[var(--color-yellow)] group-hover:text-gray-900 transition-all duration-500 shadow-xl">
                                                {getIcon(item.title, i)}
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-lg">Premium</div>
                                                <div className="px-3 py-1.5 bg-yellow-500/10 text-[var(--color-yellow)] rounded-full text-[9px] font-black uppercase tracking-widest border border-yellow-500/20 shadow-lg">VVIP</div>
                                            </div>
                                        )}
                                        <div className="text-right">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1 block">Duration</span>
                                            <span className="text-white font-serif italic text-sm">{item.duration || "Bespoke"}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-serif text-white mb-4 tracking-tight leading-tight group-hover:text-[var(--color-yellow)] transition-colors duration-500">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-400 font-medium mb-12 leading-relaxed line-clamp-3 text-sm">
                                        {item.description}
                                    </p>

                                    <div className="mt-auto">
                                        <button className="w-full bg-[var(--color-yellow)] text-gray-900 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl flex items-center justify-center gap-3 group/btn">
                                            Discover Details <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cinematic CTA Banner */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto relative rounded-[4rem] overflow-hidden min-h-[600px] flex items-center shadow-2xl">
                    <img
                        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="CTA Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent" />

                    <div className="relative z-10 p-16 md:p-32 max-w-3xl">
                        <span className="text-[var(--color-yellow)] font-bold tracking-[0.4em] text-[10px] uppercase mb-6 block">Legacy of Adventure</span>
                        <h2 className="text-5xl md:text-8xl text-white mb-10 tracking-tighter leading-none shadow-2xl" style={{ fontFamily: 'serif' }}>
                            Your Story <br /> <span className="italic">Starts Today.</span>
                        </h2>
                        <p className="text-xl text-gray-300 font-medium mb-16 leading-relaxed opacity-80 max-w-xl">
                            Whether it's a romantic getaway or a family adventure, our curators are ready to design your perfect escape.
                        </p>
                        <div className="flex flex-wrap gap-8">
                            <button className="bg-[var(--color-yellow)] text-gray-900 px-12 py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-110 hover:bg-white transition-all duration-500">
                                Request Custom Package
                            </button>
                        </div>
                    </div>
                </div>
            </section>

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
