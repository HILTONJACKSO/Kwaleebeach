'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Users, CreditCard, Save, ArrowLeft, Waves, Ticket } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

interface PassType {
    id: number;
    name: string;
    price: string;
    location: string;
}

export default function PoolSellPage() {
    const router = useRouter();
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passTypes, setPassTypes] = useState<PassType[]>([]);
    const [selectedPass, setSelectedPass] = useState<PassType | null>(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/recreation/types/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const poolPasses = data.filter((p: PassType) => p.location === 'POOL');
                    setPassTypes(poolPasses);
                    if (poolPasses.length > 0) setSelectedPass(poolPasses[0]);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSell = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPass) return;

        setSaving(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/recreation/passes/sell/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ pass_type_id: selectedPass.id })
            });
            if (res.ok) {
                showNotification(`${selectedPass.name} Sold!`, 'success');
                router.push('/staff/pool');
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
                src="/illustrations/room_hornbill_luxury_1770335473815.png"
                alt="Pool Illustration"
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
            title="Pool Side POS"
            subtitle="Access & Recreation"
            description="Authorize pool access for walk-in guests. Issuing a day pass grants full access to poolside amenities and towel service until sunset."
            backLink="/staff/pool"
            illustration={illustration}
        >
            <form onSubmit={handleSell} className="space-y-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Pass Type</label>
                    <div className="grid grid-cols-1 gap-4">
                        {passTypes.map(pass => (
                            <button
                                key={pass.id}
                                type="button"
                                onClick={() => setSelectedPass(pass)}
                                className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${selectedPass?.id === pass.id ? 'border-[var(--color-primary)] bg-orange-50 shadow-md' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${selectedPass?.id === pass.id ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-50 text-gray-400'}`}>
                                        <Ticket size={24} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-gray-900">{pass.name}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Day Access</div>
                                    </div>
                                </div>
                                <div className="text-xl font-black text-gray-900">${pass.price}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[var(--color-primary)]">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Method</div>
                        <div className="text-sm font-bold text-gray-900">Direct Cash / POS Terminal</div>
                    </div>
                </div>

                <button
                    disabled={saving || !selectedPass}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {saving ? "Processing Sale..." : <><Save size={20} /> Complete Sale & Issue Pass</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
