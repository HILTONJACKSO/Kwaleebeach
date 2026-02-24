'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Umbrella, CreditCard, Save, ArrowLeft, Sun, Ticket } from 'lucide-react';
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
    const [passTypes, setPassTypes] = useState<PassType[]>([]);
    const [selectedPass, setSelectedPass] = useState<PassType | null>(null);

    useEffect(() => {
        fetch('/api/recreation/types/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                const beachPasses = data.filter((p: PassType) => p.location === 'BEACH');
                setPassTypes(beachPasses);
                if (beachPasses.length > 0) setSelectedPass(beachPasses[0]);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSell = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPass) return;

        setSaving(true);
        try {
            const res = await fetch('/api/recreation/passes/sell/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({ pass_type_id: selectedPass.id })
            });
            if (res.ok) {
                showNotification(`${selectedPass.name} Issued!`, 'success');
                router.push('/staff/beach');
            } else {
                showNotification('Sale failed', 'error');
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

    return (
        <FormPageLayout
            title="Beach Access POS"
            subtitle="Access & Recreation"
            description="Authorize private beach entry and equipment rentals. Digital tickets are tracked via the Kwalee recreation mesh for real-time occupancy monitoring."
            backLink="/staff/beach"
            illustration={illustration}
        >
            <form onSubmit={handleSell} className="space-y-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Access Type</label>
                    <div className="grid grid-cols-1 gap-4">
                        {passTypes.length > 0 ? passTypes.map(pass => (
                            <button
                                key={pass.id}
                                type="button"
                                onClick={() => setSelectedPass(pass)}
                                className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${selectedPass?.id === pass.id ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${selectedPass?.id === pass.id ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                        <Sun size={24} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-gray-900">{pass.name}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Day Access</div>
                                    </div>
                                </div>
                                <div className="text-xl font-black text-gray-900">${pass.price}</div>
                            </button>
                        )) : (
                            <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-bold">
                                No Beach Passes Configured
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-orange-500">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment</div>
                            <div className="text-xs font-bold text-gray-900">Digital / Cash</div>
                        </div>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-500">
                            <Umbrella size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Status</div>
                            <div className="text-xs font-bold text-emerald-600">Safe to Swim</div>
                        </div>
                    </div>
                </div>

                <button
                    disabled={saving || !selectedPass}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-orange-500 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {saving ? "Processing..." : <><Save size={20} /> Issue Beach Access</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
