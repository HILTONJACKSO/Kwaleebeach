'use client';

import { Heart, Globe, School, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function CSRPage() {
    const projects = [
        {
            title: "Marshall Village School",
            desc: "Providing textbooks, uniforms, and structural repairs to the local primary school. We believe every child in Marshall deserves a quality environment to learn.",
            icon: <School className="text-orange-500" />,
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80"
        },
        {
            title: "Wildlife Preservation",
            desc: "Sponsoring the Libassa Wildlife Sanctuary to rescue and rehabilitate endangered species including pangolins and chimpanzees.",
            icon: <Globe className="text-emerald-500" />,
            image: "https://images.unsplash.com/photo-1547407139-3c921a66005c?auto=format&fit=crop&w=800&q=80"
        },
        {
            title: "Community Healthcare",
            desc: "Supplying essential medical tools and basic medications to the local health clinic to improve emergency response for residents.",
            icon: <Heart className="text-rose-500" />,
            image: "https://images.unsplash.com/photo-1516584281788-b2203135e610?auto=format&fit=crop&w=800&q=80"
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1920&q=80"
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
                />
                <div className="relative z-10 text-center px-4 max-w-4xl">
                    <div className="w-20 h-20 bg-[var(--color-primary)] rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                        <Heart className="text-white" fill="currentColor" size={40} />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-tight">Irene Charity <br /> Foundation</h1>
                    <p className="text-xl md:text-2xl text-gray-200 font-medium">
                        Building a sustainable future for Marshall through education, health, and conservation.
                    </p>
                </div>
            </section>

            {/* Intro */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <span className="text-[var(--color-primary)] font-black tracking-[0.3em] uppercase text-xs mb-4 block">Our Story</span>
                            <h2 className="text-5xl font-black text-gray-900 mb-8 tracking-tighter leading-tight">A Heart for <br /> the Community.</h2>
                            <p className="text-xl text-gray-500 font-medium leading-relaxed mb-8">
                                The Irene Charity Foundation was born from a simple belief: that tourism should empower the land and people it visits. Named after our founder's late mother, the foundation is the soul of Kwalee Resort.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="p-8 bg-gray-50 rounded-[2.5rem]">
                                    <div className="text-4xl font-black text-gray-900 mb-2">15%</div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Of every stay donated</p>
                                </div>
                                <div className="p-8 bg-gray-50 rounded-[2.5rem]">
                                    <div className="text-4xl font-black text-gray-900 mb-2">500+</div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Students supported</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-[3rem] overflow-hidden shadow-2xl rotate-2">
                            <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80" className="w-full h-[500px] object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Projects */}
            <section className="py-32 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Current Initiatives</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {projects.map((project, i) => (
                            <div key={i} className="group bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 flex flex-col">
                                <div className="h-60 overflow-hidden relative">
                                    <img src={project.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute top-6 right-6 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                                        {project.icon}
                                    </div>
                                </div>
                                <div className="p-10 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black text-gray-900 mb-4">{project.title}</h3>
                                    <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                                        {project.desc}
                                    </p>
                                    <button className="mt-auto flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--color-primary)] hover:translate-x-2 transition-transform">
                                        Learn more <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Donation CTA */}
            <section className="py-32">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-gray-900 rounded-[3rem] p-16 text-center text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--color-primary)] rounded-full blur-[120px]"></div>
                            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]"></div>
                        </div>

                        <h2 className="text-5xl font-black mb-8 tracking-tighter">Small Actions, <br /> Big Impacts.</h2>
                        <p className="text-xl text-gray-400 font-medium mb-12 max-w-2xl mx-auto">
                            You can support our foundation during your stay or via direct donation. Every dollar goes directly to Marshall community projects.
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 relative z-10">
                            <button className="bg-[var(--color-primary)] text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-950/20 hover:scale-105 transition-all">
                                Donate Now
                            </button>
                            <Link href="/rooms" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all flex items-center gap-3">
                                Book a Stay <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="py-20 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-12">Proudly partnering with</p>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale">
                            <div className="text-3xl font-black italic">LIBASSA</div>
                            <div className="text-2xl font-black tracking-tighter">Liberia Wildlife</div>
                            <div className="text-3xl font-black italic">GREENPEACE</div>
                            <div className="text-xl font-black uppercase tracking-[0.4em]">UNESCO</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
