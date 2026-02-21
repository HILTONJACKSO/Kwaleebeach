'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Beer, CreditCard, Save, ArrowLeft, GlassWater, Plus, ShoppingBag } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

export default function BarSellPage() {
    const router = useRouter();
    const { showNotification } = useUI();
    const [saving, setSaving] = useState(false);

    // In a real app, we'd fetch menu items. For now, a simplified direct sale form.
    const [saleData, setSaleData] = useState({
        item_name: 'Custom Cocktail',
        amount: '',
        quantity: '1',
    });

    const handleSell = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        // Mocking a sale for now
        setTimeout(() => {
            showNotification(`Sale of ${saleData.item_name} processed!`, 'success');
            router.push('/staff/bar');
            setSaving(false);
        }, 1000);
    };

    const illustration = (
        <div className="absolute inset-0 flex items-end justify-center">
            <img
                src="/illustrations/inventory_add_illustration_1770391854513.png"
                alt="Bar Illustration"
                className="w-full h-full object-cover"
            />
        </div>
    );

    return (
        <FormPageLayout
            title="Bar Point of Sale"
            subtitle="Hospitality Service"
            description="Process direct beverage sales for walk-in guests and non-resident visitors. All transactions are logged for real-time inventory depletion and financial auditing."
            backLink="/staff/bar"
            illustration={illustration}
        >
            <form onSubmit={handleSell} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Menu Item / Description</label>
                    <div className="relative">
                        <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            required
                            type="text"
                            placeholder="e.g. Signature Moonlight Gin"
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={saleData.item_name}
                            onChange={(e) => setSaleData({ ...saleData, item_name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Quantity</label>
                        <div className="relative">
                            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="number"
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                                value={saleData.quantity}
                                onChange={(e) => setSaleData({ ...saleData, quantity: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Total Amount ($)</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                                value={saleData.amount}
                                onChange={(e) => setSaleData({ ...saleData, amount: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-blue-500">
                        <Beer size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Station Active</div>
                        <div className="text-xs font-bold text-gray-900">Main Terrace Bar - Station 01</div>
                    </div>
                </div>

                <button
                    disabled={saving}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {saving ? "Processing..." : <><Save size={20} /> Finalize Sale</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
