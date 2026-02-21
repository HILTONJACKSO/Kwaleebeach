'use client';
import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface FormPageLayoutProps {
    title: string;
    description: string;
    illustration?: ReactNode;
    subtitle?: string;
    backLink: string;
    children: ReactNode;
}

export default function FormPageLayout({
    title,
    description,
    illustration,
    subtitle,
    backLink,
    children
}: FormPageLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header / Navigation */}
            <div className="p-8">
                <Link
                    href={backLink}
                    className="group inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-sm font-bold text-gray-900"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Station
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">

                    {/* Form Card */}
                    <div className="bg-white shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-50 flex flex-col">
                        <div className="p-10 md:p-16 flex-1 flex flex-col justify-center">
                            <div className="mb-10">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">{title}</h1>
                                {subtitle && <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-primary)] mb-4">{subtitle}</p>}
                                <div className="h-1.5 w-20 bg-[var(--color-primary)] rounded-full mb-6"></div>
                            </div>

                            <div className="space-y-8">
                                {children}
                            </div>
                        </div>
                    </div>

                    {/* Illustration/Description Card */}
                    <div className="hidden lg:flex bg-gray-900 shadow-2xl shadow-gray-900/10 overflow-hidden relative flex-col justify-between text-white p-16">
                        <div className="z-10 relative">
                            <h2 className="text-3xl font-black mb-6 tracking-tight">Professional Management</h2>
                            <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-sm">
                                {description}
                            </p>
                        </div>

                        <div className="z-10 relative">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                <p className="text-xs font-bold text-white/60 mb-2 italic">"Precision in every detail ensures the highest level of guest satisfaction."</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">System Ready</span>
                                </div>
                            </div>
                        </div>

                        {/* Background Illustration Container */}
                        <div className="absolute inset-x-0 bottom-0 top-1/2 overflow-hidden pointer-events-none opacity-80">
                            {illustration}
                        </div>

                        {/* Decorative Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent pointer-events-none"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--color-primary-rgb),0.1),transparent)] pointer-events-none"></div>
                    </div>
                </div>
            </div>

            {/* Footer Credit */}
            <div className="p-8 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Kwalee Beach Resort Management Protocol v2.4.0</p>
            </div>
        </div>
    );
}
