'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Calendar, User, Phone, MapPin, Save, Hash, Layers } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

export default function NewBookingPage() {
    const router = useRouter();
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState<any[]>([]);

    const [bookingData, setBookingData] = useState({
        room: '',
        guest_name: '',
        guest_phone: '',
        guest_email: '',
        check_in: '',
        check_out: '',
        adults: '1',
        children: '0',
    });

    useEffect(() => {
        // Fetch available rooms
        fetch('/api/pms/rooms/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => setRooms(data.filter((r: any) => r.is_available)))
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/pms/bookings/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(bookingData)
            });

            if (res.ok) {
                showNotification(`Booking created for ${bookingData.guest_name}!`, 'success');
                router.push('/staff/pms');
            } else {
                const err = await res.json();
                showNotification(err.error || "Failed to create booking", "error");
            }
        } catch (e) {
            showNotification("Connection error", "error");
        } finally {
            setLoading(false);
        }
    };

    const illustration = (
        <div className="absolute inset-0 flex items-end justify-center">
            <img
                src="/illustrations/booking_illustration_1770391895407.png"
                alt="Booking Illustration"
                className="w-full h-full object-cover"
            />
        </div>
    );

    return (
        <FormPageLayout
            title="Create New Booking"
            subtitle="Property Management"
            description="Register a new guest arrival. Ensure all details are accurate to provide a seamless check-in experience and personalized service throughout their stay."
            backLink="/staff/pms"
            illustration={illustration}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Guest Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            required
                            type="text"
                            placeholder="e.g. Alexander Knight"
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={bookingData.guest_name}
                            onChange={(e) => setBookingData({ ...bookingData, guest_name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="tel"
                                placeholder="+231..."
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                                value={bookingData.guest_phone}
                                onChange={(e) => setBookingData({ ...bookingData, guest_phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                        <input
                            required
                            type="email"
                            placeholder="guest@example.com"
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={bookingData.guest_email}
                            onChange={(e) => setBookingData({ ...bookingData, guest_email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Suite / Room</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            required
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={bookingData.room}
                            onChange={(e) => setBookingData({ ...bookingData, room: e.target.value })}
                        >
                            <option value="">Choose an available room...</option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>{room.room_number} - {room.room_type_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Check-in Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="date"
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                                value={bookingData.check_in}
                                onChange={(e) => setBookingData({ ...bookingData, check_in: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Check-out Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="date"
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                                value={bookingData.check_out}
                                onChange={(e) => setBookingData({ ...bookingData, check_out: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? "Processing..." : <><Save size={20} /> Confirm Booking</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
