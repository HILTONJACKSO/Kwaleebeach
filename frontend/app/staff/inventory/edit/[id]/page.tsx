'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Save, Package, Hash, DollarSign, Layers, ArrowLeft } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

export default function EditInventoryItemPage() {
    const router = useRouter();
    const { id } = useParams();
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [itemData, setItemData] = useState({
        name: '',
        sku: '',
        unit: '',
        cost_price: '',
    });

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await fetch(`/api/inventory/items/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setItemData({
                        name: data.name,
                        sku: data.sku,
                        unit: data.unit,
                        cost_price: data.cost_price,
                    });
                } else {
                    showNotification("Failed to load item details", "error");
                    router.push('/staff/inventory');
                }
            } catch (e) {
                showNotification("Connection error", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/inventory/items/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(itemData)
            });

            if (res.ok) {
                showNotification(`${itemData.name} updated successfully!`, 'success');
                router.push('/staff/inventory');
            } else {
                showNotification("Failed to update item", "error");
            }
        } catch (e) {
            showNotification("Connection error", "error");
        } finally {
            setSaving(false);
        }
    };

    const illustration = (
        <div className="absolute inset-x-0 bottom-0 top-1/2 overflow-hidden pointer-events-none opacity-80">
            <img
                src="/illustrations/inventory_add_illustration_1770391854513.png"
                alt="Inventory Illustration"
                className="w-full h-full object-cover"
            />
        </div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Details...</div>
        </div>
    </div>;

    return (
        <FormPageLayout
            title="Update Item"
            subtitle="Inventory Management"
            description="Update the technical specifications, SKU, or pricing for this inventory item. Changes are reflected immediately across all departmental stock counts."
            backLink="/staff/inventory"
            illustration={illustration}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Item Name</label>
                    <div className="relative">
                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            required
                            type="text"
                            placeholder="e.g. Vintage Champagne 2012"
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={itemData.name}
                            onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">SKU / Code</label>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="text"
                                placeholder="CH-12-001"
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                                value={itemData.sku}
                                onChange={(e) => setItemData({ ...itemData, sku: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Unit</label>
                        <select
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={itemData.unit}
                            onChange={(e) => setItemData({ ...itemData, unit: e.target.value })}
                        >
                            <option>Bottle</option>
                            <option>Pcs</option>
                            <option>Box</option>
                            <option>Kg</option>
                            <option>Litre</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cost Price ($)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            required
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={itemData.cost_price}
                            onChange={(e) => setItemData({ ...itemData, cost_price: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    disabled={saving}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {saving ? "Saving Changes..." : <><Save size={20} /> Update Inventory Item</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
