'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const isHome = pathname === '/';
  const isStaff = pathname?.startsWith('/staff');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isStaff) return null;

  return (
    <nav className={`z-50 transition-all duration-300 ${isHome
      ? scrolled
        ? 'fixed top-0 left-0 right-0 bg-[var(--color-primary)] shadow-md border-transparent'
        : 'fixed top-0 left-0 right-0 bg-transparent border-b border-white/10'
      : 'sticky top-0 bg-white shadow-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link href="/" className={`text-3xl font-black tracking-tighter ${isHome ? 'text-white' : 'text-gray-900'}`}>
              KWALEE<span className={`${isHome ? 'text-white' : 'text-[var(--color-primary)]'}`}>.</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {[
              { name: 'Home', path: '/' },
              { name: 'Rooms', path: '/rooms' },
              { name: 'Tours', path: '/activities' },
              { name: 'Events', path: '/events' },
              { name: 'CSR', path: '/csr' },
              { name: 'Dining', path: '/dining' },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`px-3 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-colors ${isHome
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-gray-900 hover:text-[var(--color-primary)]'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={isAuthenticated ? "/staff/dashboard" : "/login"}
              className={`px-4 py-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${isHome ? 'text-white hover:text-white/70' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {isAuthenticated ? 'Staff Portal' : 'Login'}
            </Link>
            <Link
              href="/rooms"
              className={`${isHome ? 'bg-white text-[var(--color-primary)] hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-[var(--color-primary)]'} px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95`}
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
