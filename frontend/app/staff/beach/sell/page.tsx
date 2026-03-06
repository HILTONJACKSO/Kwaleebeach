'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import {
    Umbrella, CreditCard, Save, ArrowLeft, Sun, Ticket,
    Users, Plus, Minus, Smartphone, Banknote, Landmark, Globe
} from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

interface PassType {
    id: number;
    name: string;
    price: string;
    location: string;
}

export default function BeachSellPage() {
    const router = useRouter();
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [adultCount, setAdultCount] = useState(0);
    const [kidsCount, setKidsCount] = useState(0);
    const [guestName, setGuestName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [prices, setPrices] = useState({ adult: 5, kids: 3 });

    useEffect(() => {
        fetch('/api/recreation/types/?t=' + Date.now(), {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}` }
        })
            .then(res => res.json())
            .then(data => {
                const beachAdult = data.find((p: any) => p.location === 'BEACH' && (p.name.includes('Adult') || p.name.includes('Teens')));
                const beachKids = data.find((p: any) => p.location === 'BEACH' && (p.name.includes('Kids') || p.name.includes('Kid')));
                setPrices({
                    adult: beachAdult ? parseFloat(beachAdult.price) : 5,
                    kids: beachKids ? parseFloat(beachKids.price) : 3
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSell = async (e: React.FormEvent) => {
        e.preventDefault();
        if (adultCount === 0 && kidsCount === 0) return showNotification('Please add at least one guest', 'error');

        setSaving(true);
        try {
            const res = await fetch('/api/recreation/passes/sell/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({
                    location: 'BEACH',
                    adult_count: adultCount,
                    kids_count: kidsCount,
                    payment_method: paymentMethod,
                    guest_name: guestName || 'Walk-in'
                })
            });
            if (res.ok) {
                showNotification(`Passes Issued Successfully!`, 'success');
                router.push('/staff/beach');
            } else {
                const err = await res.json();
                showNotification(err.error || 'Sale failed', 'error');
            }
        } catch (e) {
            showNotification('Connection error', 'error');
        } finally {
            setSaving(false);
        }
    };

    const illustration = (
        <div className="absolute inset-0 flex items-end justify-center">
            <img
                src="/illustrations/event_sunday_brunch_1770335203114.png"
                alt="Beach Illustration"
                className="w-full h-full object-cover"
            />
        </div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Passes...</div>
        </div>
    </div>;

    const totalPrice = (adultCount * prices.adult) + (kidsCount * prices.kids);

    return (
        <FormPageLayout
            title="Beach Access POS"
            subtitle="Gate Entry & Recreation"
            description="Process walk-in beach entries with multi-guest support and integrated payments. Data syncs directly with Finance for real-time reconciliation."
            backLink="/staff/beach"
            illustration={illustration}
        >
            <form onSubmit={handleSell} className="space-y-8">
                {/* Guest Selection */}
                <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Guest Entry Details</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-white border-2 border-gray-100 rounded-3xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><Users size={24} /></div>
                                <div>
                                    <div className="font-black text-gray-900">Adults</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${prices.adult.toFixed(2)} Each</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                                <button type="button" onClick={() => setAdultCount(Math.max(0, adultCount - 1))} className="p-2 hover:bg-white rounded-xl transition-all"><Minus size={18} /></button>
                                <span className="text-lg font-black w-8 text-center">{adultCount}</span>
                                <button type="button" onClick={() => setAdultCount(adultCount + 1)} className="p-2 hover:bg-white rounded-xl transition-all"><Plus size={18} /></button>
                            </div>
                        </div>

                        <div className="p-6 bg-white border-2 border-gray-100 rounded-3xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Users size={24} /></div>
                                <div>
                                    <div className="font-black text-gray-900">Kids</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${prices.kids.toFixed(2)} Each</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                                <button type="button" onClick={() => setKidsCount(Math.max(0, kidsCount - 1))} className="p-2 hover:bg-white rounded-xl transition-all"><Minus size={18} /></button>
                                <span className="text-lg font-black w-8 text-center">{kidsCount}</span>
                                <button type="button" onClick={() => setKidsCount(kidsCount + 1)} className="p-2 hover:bg-white rounded-xl transition-all"><Plus size={18} /></button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lead Guest Name</label>
                        <input
                            type="text"
                            placeholder="e.g. John Doe / Party of 5"
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                        />
                    </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Payment Method</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            { id: 'CASH', name: 'Cash', icon: <Banknote size={20} /> },
                            { id: 'MOMO_LONESTAR', name: 'Momo', icon: <Smartphone size={20} /> },
                            { id: 'MOMO_ORANGE', name: 'Orange', icon: <Smartphone size={20} /> },
                            { id: 'VISA', name: 'Visa', icon: <CreditCard size={20} /> },
                            { id: 'BANK_TRANSFER', name: 'Transfer', icon: <Landmark size={20} /> }
                        ].map(method => (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => setPaymentMethod(method.id)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === method.id ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-gray-100 hover:border-gray-200 text-gray-400'}`}
                            >
                                {method.icon}
                                <span className="text-[10px] font-black uppercase tracking-widest">{method.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary & Submit */}
                <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                    <div className="flex justify-between items-center text-white">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-1">Total Payable</div>
                            <div className="text-3xl font-black">${totalPrice.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Guests</div>
                            <div className="text-xl font-bold">{adultCount + kidsCount} Total</div>
                        </div>
                    </div>

                    <button
                        disabled={saving || (adultCount === 0 && kidsCount === 0)}
                        type="submit"
                        className="w-full bg-orange-500 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {saving ? "Processing Sale..." : <><Save size={20} /> Issue Beach Access</>}
                    </button>
                </div>
            </form>
        </FormPageLayout>
    );
}
