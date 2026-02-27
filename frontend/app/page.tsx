'use client';

import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Users,
  Star,
  ArrowRight,
  Heart,
  ChevronRight,
  Play,
  PlayCircle,
  Utensils,
  GlassWater,
  Music,
  Gem,
  Sparkles,
  Compass,
  ChevronDown
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('Hotel');
  const [rooms, setRooms] = useState<any[]>([]);
  const [siteConfig, setSiteConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch Rooms
    fetch('/api/pms/rooms/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRooms(data.slice(0, 3));
        } else if (data && Array.isArray(data.results)) {
          setRooms(data.results.slice(0, 3));
        }
      })
      .catch(err => console.error('Fetch rooms error:', err));

    // Fetch CMS Config
    fetch('/api/website/config/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const configMap = data.reduce((acc: any, item: any) => {
            acc[item.key] = item.value;
            return acc;
          }, {});
          setSiteConfig(configMap);
        }
      })
      .catch(err => console.error('Fetch CMS config error:', err));
  }, []);

  const getConfig = (key: string, defaultValue: string) => siteConfig[key] || defaultValue;

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen">

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={getConfig('hero_bg_image', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1920&q=80')}
            alt="Luxury Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">

          {/* Big Typography */}
          <div className="mt-20 md:mt-0 pb-32 md:pb-48">
            <h1 className="text-4xl sm:text-6xl md:text-9xl text-white tracking-tight leading-[0.9]" style={{ fontFamily: 'serif' }}>
              <span className="block font-medium">{getConfig('hero_title_line_1', 'ONE CLICK')}</span>
              <span className="block font-bold">{getConfig('hero_title_line_2', 'EASY BOOKING')}</span>
            </h1>
          </div>

          {/* Floating Elements Grid */}
          <div className="absolute bottom-8 md:bottom-16 left-0 right-0 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-end">

            {/* Bottom Left: Book Your Stay Now Card */}
            <div className="md:col-span-4 bg-black/60 backdrop-blur-md rounded-[2.5rem] p-4 flex items-center gap-6 border border-white/10 max-w-md">
              <div className="relative w-32 h-24 rounded-2xl overflow-hidden shrink-0">
                <img src={getConfig('hero_cta_video_poster', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80')} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <Play size={12} fill="black" className="ml-0.5" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-white text-xl font-serif">{getConfig('hero_cta_text', 'Book Your Stay Now')}</h3>
                <p className="text-gray-300 text-xs mt-1 leading-relaxed">{getConfig('hero_cta_subtext', 'Effortlessly manage your stay with our seamless hotel reservations.')}</p>
              </div>
            </div>

            <div className="md:col-span-3"></div>

            {/* Bottom Right: Reserve Your Room Widget */}
            <div className="md:col-span-5 bg-white rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-fade-in-up relative z-50">
              <h2 className="text-3xl text-gray-900 text-center mb-6" style={{ fontFamily: 'serif' }}>Reserve Your Room</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Check-In *</label>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <input type="date" className="!bg-transparent !border-none !shadow-none p-0 w-full text-sm outline-none text-gray-900 placeholder-gray-500" style={{ border: 'none', boxShadow: 'none' }} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Check-Out *</label>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <input type="date" className="!bg-transparent !border-none !shadow-none p-0 w-full text-sm outline-none text-gray-900 placeholder-gray-500" style={{ border: 'none', boxShadow: 'none' }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Adults</label>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <input type="number" min="1" defaultValue="1" className="!bg-transparent !border-none !shadow-none p-0 w-full text-sm font-bold outline-none text-gray-900" style={{ border: 'none', boxShadow: 'none' }} />
                    <Users size={16} className="text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Children</label>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <input type="number" min="0" defaultValue="0" className="!bg-transparent !border-none !shadow-none p-0 w-full text-sm font-bold outline-none text-gray-900" style={{ border: 'none', boxShadow: 'none' }} />
                    <Users size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>

              <Link href="/rooms">
                <button className="w-full bg-[var(--color-yellow)] text-gray-900 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg">
                  Check Availability <span className="bg-white/20 rounded-full p-1"><ChevronRight size={12} /></span>
                </button>
              </Link>
            </div>
          </div>

          {/* Floating Icons Right Center - Only show on Large Screens */}
          <div className="absolute top-1/2 right-12 lg:right-24 -translate-y-1/2 flex flex-col gap-8 hidden lg:flex text-center z-10">
            <div className="flex justify-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-900 hover:scale-110 transition-transform cursor-pointer">
                <Gem size={20} />
              </div>
              <div className="w-12 h-12 bg-[#c1865a] rounded-full flex items-center justify-center shadow-lg text-white hover:scale-110 transition-transform cursor-pointer">
                <Compass size={20} />
              </div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-900 hover:scale-110 transition-transform cursor-pointer">
                <Users size={20} />
              </div>
            </div>
            <p className="text-white font-bold text-sm tracking-widest shadow-black drop-shadow-md">FIND COMFORT, RESERVE WITH EASE</p>
          </div>

        </div>
      </section>

      {/* --- STATS & INTRO (Redesigned) --- */}
      <section className="relative py-32 px-4 overflow-hidden bg-gray-900">

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16 text-white">
          <div className="max-w-2xl">
            <span className="text-[var(--color-yellow)] font-bold tracking-widest text-xs uppercase mb-4 block">Our Reach</span>
            <h2 className="text-4xl md:text-6xl tracking-tight leading-tight mb-6" style={{ fontFamily: 'serif' }}>
              {getConfig('stats_title', 'Discover stays tailored to your dreams.')}
            </h2>
            <p className="text-gray-300 text-lg md:text-xl font-light mb-8 max-w-lg">
              {getConfig('stats_description', 'Luxury, comfort, or adventure — your journey begins here. Book Now and Unwind in Style!')}
            </p>
          </div>

          <div className="flex gap-8 md:gap-20 md:border-l border-white/20 md:pl-12 border-l-0 pl-0 mt-8 md:mt-0 pt-8 md:pt-0 border-t md:border-t-0 w-full md:w-auto justify-start">
            <div>
              <div className="text-5xl md:text-7xl font-serif text-white mb-2">{getConfig('stats_room_count', '50+')}</div>
              <div className="text-xs text-[var(--color-yellow)] uppercase tracking-widest font-bold">Luxury Rooms</div>
            </div>
            <div>
              <div className="text-5xl md:text-7xl font-serif text-white mb-2">{getConfig('stats_service_count', '24/7')}</div>
              <div className="text-xs text-[var(--color-yellow)] uppercase tracking-widest font-bold">Guest Service</div>
            </div>
          </div>
        </div>
      </section>



      {/* --- DINING EXPERIENCE SECTION --- */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Restaurant Card */}
            <div className="relative h-[500px] rounded-[3rem] overflow-hidden group">
              <img
                src={getConfig('dining_restaurant_image', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80')}
                alt="Indigo Restaurant"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-12 left-12 right-12 text-white">
                <div className="w-14 h-14 bg-[var(--color-yellow)] rounded-2xl flex items-center justify-center mb-6 text-gray-900 shadow-xl">
                  <Utensils size={28} />
                </div>
                <h3 className="text-4xl font-black mb-4 tracking-tighter">{getConfig('dining_restaurant_title', 'The Indigo Restaurant')}</h3>
                <p className="text-lg text-gray-300 font-medium mb-8 max-w-sm">
                  {getConfig('dining_restaurant_desc', 'Experience a culinary masterpiece where local Liberian flavors meet international fine dining.')}
                </p>
                <Link href="/dining">
                  <button className="bg-[var(--color-yellow)] border border-[var(--color-yellow)] px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white text-gray-900 transition-all shadow-lg">
                    View Menu
                  </button>
                </Link>
              </div>
            </div>

            {/* Bar Card */}
            <div className="relative h-[500px] rounded-[3rem] overflow-hidden group">
              <img
                src={getConfig('dining_bar_image', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80')}
                alt="Azure Bar"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-12 left-12 right-12 text-white">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-xl">
                  <GlassWater size={28} />
                </div>
                <h3 className="text-4xl font-black mb-4 tracking-tighter">{getConfig('dining_bar_title', 'The Azure Bar')}</h3>
                <p className="text-lg text-gray-300 font-medium mb-8 max-w-sm">
                  {getConfig('dining_bar_desc', 'Sip on handcrafted cocktails while watching the Atlantic sunset from our premium lounge.')}
                </p>
                <Link href="/dining">
                  <button className="bg-[var(--color-yellow)] border border-[var(--color-yellow)] px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white text-gray-900 transition-all shadow-lg">
                    Explore Drinks
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Collection removed as requested (mockup) */}


      {/* --- ROOM LISTING GRID --- */}
      <section className="py-32 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter mb-4 leading-none">{getConfig('home_rooms_title', 'Rooms That Feel Like Home')}</h2>
          <p className="text-gray-500 font-medium tracking-tight mb-12">{getConfig('home_rooms_desc', 'Comfort, style, and all the essentials—just like home, only better.')}</p>

          <div className="flex flex-wrap justify-center gap-3">
            {['Rooms', 'Tents'].map(f => (
              <button key={f} className={`px-6 py-2.5 rounded-full text-xs font-black border transition-all ${f === 'Rooms' ? 'bg-[var(--color-yellow)] border-[var(--color-yellow)] text-gray-900' : 'bg-transparent border-gray-200 text-gray-500 hover:border-gray-900'}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room, i) => (
                <div key={i} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 p-2">
                  <div className="relative h-64 rounded-[2rem] overflow-hidden">
                    <img src={room.image_url || `https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-rose-500 hover:text-white transition-all">
                      <Heart size={20} />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">{room.room_type}</h3>
                      <div className="text-xl font-black text-gray-900">${room.price_per_night}</div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-4">
                      <div className="flex items-center gap-1 text-[var(--color-yellow)]">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-black text-gray-900">New</span>
                        <span className="text-[10px] font-black text-gray-400">(0)</span>
                      </div>
                      <Link href={`/booking/details?room=${room.id}`}>
                        <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-lg">
                          Book Now
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Our Stays are Coming Soon</h3>
              <p className="text-gray-500 font-medium">We are currently preparing our exclusive beachfront accommodations.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- EVENTS BANNER --- */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto relative rounded-[3rem] overflow-hidden h-[450px] flex items-end">
          <img
            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1920&q=80"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="relative z-10 p-12 w-full flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest mb-6">Upcoming Event</div>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight mb-2">{getConfig('home_events_banner_title', 'Upcoming event at Kwalee Resort')}</h2>
              <div className="flex gap-6 text-gray-300 font-black text-[10px] uppercase tracking-widest">
                <span className="flex items-center gap-2"><Calendar size={14} /> October 20, 2026</span>
                <span className="flex items-center gap-2"><MapPin size={14} /> Main Ballroom</span>
              </div>
            </div>
            <Link href="/events">
              <button className="bg-[var(--color-yellow)] text-gray-900 px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                View All Events
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- UPCOMING EVENTS GRID --- */}
      <section className="py-32 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl text-white tracking-tighter leading-none mb-6" style={{ fontFamily: 'serif' }}>{getConfig('home_events_section_title', 'Unforgettable Happenings')}</h2>
            <p className="text-gray-400 font-medium max-w-lg">From sunset jazz sessions to gourmet garden brunches, discover the rhythm of Kwalee.</p>
          </div>
          <Link href="/events">
            <button className="bg-[var(--color-yellow)] text-gray-900 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg flex items-center gap-2">
              Explore Full Calendar <ArrowRight size={16} />
            </button>
          </Link>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Grand Sunday Brunch", date: "Feb 08", category: "Dining", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" },
            { title: "Afro-Jazz Night", date: "Feb 13", category: "Music", img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80" },
            { title: "Beach Yoga & Meditation", date: "Daily", category: "Wellness", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80" },
          ].map((event, i) => (
            <div key={i} className="group relative bg-white/5 rounded-[3rem] overflow-hidden hover:bg-white/10 transition-all duration-500 border border-white/10 p-2">
              <div className="relative h-64 rounded-[2.5rem] overflow-hidden mb-6">
                <img src={event.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{event.category}</span>
                </div>
              </div>
              <div className="px-6 pb-6 text-center">
                <div className="text-[10px] font-black text-[var(--color-yellow)] uppercase tracking-[0.2em] mb-3">{event.date}</div>
                <h3 className="text-2xl font-serif text-white tracking-tight leading-none mb-6">{event.title}</h3>
                <Link href="/events">
                  <button className="w-full py-4 rounded-2xl bg-[var(--color-yellow)] border border-[var(--color-yellow)] text-xs font-black uppercase tracking-widest text-gray-900 hover:bg-white hover:text-gray-900 transition-all">
                    Read More
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- DREAM GETAWAY CTA --- */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 rounded-[3rem] overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80" alt="Concierge" className="w-full h-[500px] object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-tight mb-8">
              {getConfig('home_cta_title', "Your Dream Getaway Awaits — Don't Wait!")}
            </h2>
            <p className="text-xl text-gray-500 font-medium mb-12 leading-relaxed">
              {getConfig('home_cta_desc', 'Ready to escape and create unforgettable memories? Book your stay now and experience luxury, comfort, and breathtaking views at Kwalee Resort.')}
            </p>
            <button className="bg-[var(--color-yellow)] text-gray-900 px-10 py-5 rounded-full font-black text-lg flex items-center gap-3 hover:scale-105 transition-all shadow-2xl">
              Reserve Your Stay Today! <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1920&q=80"
            alt="Spa Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[var(--color-yellow)] font-bold tracking-widest text-xs uppercase mb-4 block">Client Feedback</span>
            <h2 className="text-5xl md:text-6xl text-white tracking-tight leading-none" style={{ fontFamily: 'serif' }}>{getConfig('home_testimonials_title', 'What Our Customers Says')}</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-16 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Star size={32} className="text-[var(--color-yellow)]" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-4">No reviews yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">Be the first to share your experience at Kwalee Resort. Your feedback helps us grow.</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      {/* --- FOOTER --- */}
      <footer className="relative pt-32 pb-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=80"
            alt="Footer Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/95"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-20 md:mb-32 text-white">
          <div className="md:col-span-1">
            <div className="text-4xl font-black tracking-tighter mb-8 leading-none">{getConfig('home_brand_name', 'Kwalee')}<span className="text-[var(--color-yellow)]">Go</span></div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-yellow)] hover:text-gray-900 transition-all cursor-pointer">
                <Star size={18} />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-[10px] text-gray-500 mb-8">Company</h4>
            <nav className="flex flex-col gap-4 font-black text-sm">
              <Link href="#" className="hover:text-[var(--color-yellow)] transition-colors">Our Mission</Link>
              <Link href="#" className="hover:text-[var(--color-yellow)] transition-colors">Our Vision</Link>
              <Link href="/csr" className="hover:text-[var(--color-yellow)] transition-colors">Our Story</Link>
              <Link href="#" className="hover:text-[var(--color-yellow)] transition-colors">Meet Our Team</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-[10px] text-gray-500 mb-8">Features</h4>
            <nav className="flex flex-col gap-4 font-black text-sm">
              <Link href="/activities" className="hover:text-[var(--color-yellow)] transition-colors">Tournaments</Link>
              <Link href="/rooms" className="hover:text-[var(--color-yellow)] transition-colors">Book Hotels</Link>
              <Link href="/events" className="hover:text-[var(--color-yellow)] transition-colors">Resort Events</Link>
              <Link href="/dining" className="hover:text-[var(--color-yellow)] transition-colors">Write a Review</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-[10px] text-gray-500 mb-8">Help</h4>
            <nav className="flex flex-col gap-4 font-black text-sm">
              <Link href="#" className="hover:text-[var(--color-yellow)] transition-colors">Term of Services</Link>
              <Link href="#" className="hover:text-[var(--color-yellow)] transition-colors">Customer Service</Link>
            </nav>
          </div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-12 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">© 2026 Kwalee Resort. All Rights Reserved.</p>
          <div className="flex gap-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
