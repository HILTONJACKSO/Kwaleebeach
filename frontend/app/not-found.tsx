import Link from 'next/link';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
            <div className="mb-8 relative">
                <h1 className="text-[12rem] md:text-[15rem] font-black text-gray-100 leading-none select-none tracking-tighter">
                    404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Compass className="text-[var(--color-primary)] opacity-90 animate-pulse" size={120} />
                </div>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Looks like you're lost.</h2>
            <p className="text-gray-500 font-medium text-lg md:text-xl max-w-lg mb-10">
                We can't seem to find the page you're looking for. It might have been moved, or it simply doesn't exist.
            </p>

            <Link
                href="/"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
                <Home size={20} className="transition-transform group-hover:scale-110" />
                Back to Home
            </Link>
        </div>
    );
}
