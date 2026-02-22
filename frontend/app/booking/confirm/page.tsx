'use client';

import { useRouter } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';
import {
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Printer,
    Download,
    Calendar,
    Users,
    CreditCard,
    Mail,
    Phone,
    MessageCircle,
    Tent,
    Hotel
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function BookingConfirm() {
    const router = useRouter();
    const { state, resetBooking } = useBooking();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    if (!state.room) {
        if (typeof window !== 'undefined') router.push('/rooms');
        return null;
    }

    const handleFinalConfirm = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/pms/bookings/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room: state.room?.id,
                    guest_name: state.guestName,
                    guest_email: state.guestEmail,
                    guest_phone: state.guestPhone,
                    check_in: state.checkIn || '2026-10-23', // Demo dates if not picked
                    check_out: state.checkOut || '2026-10-25',
                    adults: state.adults,
                    children: state.children,
                    special_requests: state.specialRequests,
                    status: 'PENDING'
                })
            });

            if (response.ok) {
                setIsConfirmed(true);
            } else {
                alert('Booking failed. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isConfirmed) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center p-4">
                <div className="max-w-xl w-full text-center">
                    <div className="w-24 h-24 bg-emerald-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <CheckCircle2 className="text-emerald-500" size={48} />
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Reservation Placed!</h1>
                    <p className="text-xl text-gray-500 font-medium mb-12">
                        Your stay at Kwalee Beach Resort has been successfully reserved. We've sent a confirmation email to <span className="text-gray-900 font-black italic">{state.guestEmail}</span>.
                    </p>

                    <div className="bg-gray-50 rounded-[2rem] p-8 mb-12 text-left space-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-400 font-black text-xs uppercase tracking-widest">Booking ID</span>
                            <span className="font-black text-gray-900">YRV-{Math.floor(Math.random() * 900000 + 100000)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-400 font-black text-xs uppercase tracking-widest">Resort Location</span>
                            <span className="font-black text-gray-900">Marshall, Liberia</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => { resetBooking(); router.push('/'); }}
                            className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all"
                        >
                            Back to Home
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                            <Printer size={18} /> Print Voucher
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Progress Bar */}
            <div className="bg-white border-b border-gray-100 py-6 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 flex justify-center items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-black italic">1</div>
                        <span className="font-black text-xs uppercase tracking-widest text-gray-900">Select</span>
                    </div>
                    <div className="w-12 h-[2px] bg-gray-900"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-black italic">2</div>
                        <span className="font-black text-xs uppercase tracking-widest text-gray-900">Details</span>
                    </div>
                    <div className="w-12 h-[2px] bg-[var(--color-primary)]"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-black italic">3</div>
                        <span className="font-black text-xs uppercase tracking-widest text-gray-900">Confirm</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Confirmation Content */}
                    <div className="lg:col-span-8">
                        <Link href="/booking/details" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-black text-xs uppercase tracking-widest mb-8 transition-colors">
                            <ArrowLeft size={16} /> Edit Details
                        </Link>

                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 mb-8">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-10">Review Your Stay</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="flex items-start gap-6">
                                        <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Guest Contact</div>
                                            <div className="font-black text-gray-900 text-lg mb-1">{state.guestName}</div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-1"><Mail size={14} /> {state.guestEmail}</div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500"><Phone size={14} /> {state.guestPhone}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-6">
                                        <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stay Duration</div>
                                            <div className="font-black text-gray-900 text-lg mb-1">2 Nights</div>
                                            <div className="text-xs font-bold text-gray-500">Oct 23, 2026 — Oct 25, 2026</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-6">
                                        <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Method</div>
                                            <div className="font-black text-gray-900 text-lg mb-1">Pay at Property</div>
                                            <div className="text-xs font-bold text-gray-500">No deposit required.</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-gray-50 rounded-3xl p-8">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Special Requests</div>
                                        <p className="text-sm font-bold text-gray-600 leading-relaxed italic">
                                            {state.specialRequests || "No special requests provided."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex items-center gap-6">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                <ShieldCheck className="text-emerald-500" size={32} />
                            </div>
                            <div>
                                <h4 className="font-black text-emerald-900 text-lg">Kwalee Price Guarantee</h4>
                                <p className="text-sm text-emerald-700 font-medium">You're getting the best possible rate. No hidden fees or lagoon taxes.</p>
                            </div>
                        </div>
                    </div>

                    {/* Checkout Panel */}
                    <div className="lg:col-span-4 self-start sticky top-32">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-gray-100">
                            <h3 className="text-2xl font-black tracking-tighter mb-8">Final Summary</h3>

                            <div className="flex gap-4 mb-8">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                                    <img src={state.room.image_url || "/placeholder.jpg"} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest mb-1">{state.room.category}</div>
                                    <h4 className="font-black text-gray-900">{state.room.room_type}</h4>
                                    <p className="text-xs font-bold text-gray-400">{state.room.room_number}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-gray-500">Accommodation Price</span>
                                    <span className="font-black text-gray-900">${state.room.price_per_night} x 2</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-gray-500">Service Charge</span>
                                    <span className="font-black text-emerald-500">FREE</span>
                                </div>
                                <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Grand Total</span>
                                    <span className="text-4xl font-black text-gray-900 tracking-tighter">${parseFloat(state.room.price_per_night) * 2}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleFinalConfirm}
                                disabled={isSubmitting}
                                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Processing...' : 'Complete Booking'} <ArrowRight size={24} />
                            </button>

                            <p className="text-[10px] text-gray-400 font-bold text-center mt-6 leading-relaxed">
                                By clicking complete, you agree to our <span className="underline">Terms of Service</span> and <span className="underline">Cancellation Policy</span>.
                            </p>
                        </div>

                        <div className="mt-8 flex justify-center gap-6 text-gray-400">
                            <MessageCircle size={24} />
                            <Mail size={24} />
                            <Phone size={24} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Stub for ShieldCheck since I missed it in imports
function ShieldCheck({ className, size }: { className?: string, size?: number }) {
    return <CheckCircle2 className={className} size={size} />;
}
