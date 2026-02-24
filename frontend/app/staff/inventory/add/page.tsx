'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Save, Package, Hash, DollarSign, Layers } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';
import Image from 'next/image';

export default function AddInventoryItemPage() {
    const router = useRouter();
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(false);

    const [newItem, setNewItem] = useState({
        name: '',
        sku: '',
        unit: 'Pcs',
        cost_price: '',
        initial_stock: '0',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create the item
            const res = await fetch('/api/inventory/items/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({
                    name: newItem.name,
                    sku: newItem.sku,
                    unit: newItem.unit,
                    cost_price: newItem.cost_price,
                })
            });

            if (res.ok) {
                const createdItem = await res.json();

                // 2. If initial stock > 0, create a stock entry
                if (parseFloat(newItem.initial_stock) > 0) {
                    await fetch('/api/inventory/stocks/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                        },
                        body: JSON.stringify({
                            item: createdItem.id,
                            department: 'MAIN',
                            quantity: newItem.initial_stock
                        })
                    });
                }

                showNotification(`${newItem.name} added successfully!`, 'success');
                router.push('/staff/inventory');
            } else {
                showNotification("Failed to add item", "error");
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
                src="/illustrations/inventory_add_illustration_1770391854513.png"
                alt="Inventory Illustration"
                className="w-full h-full object-cover"
            />
        </div>
    );

    return (
        <FormPageLayout
            title="Register New Item"
            subtitle="Inventory Management"
            description="Add new items to the resort's global inventory. This includes food, beverages, and luxury amenities. All items are tracked in real-time across all departments."
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
                            className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
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
                                className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                                value={newItem.sku}
                                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Unit</label>
                        <select
                            className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                            value={newItem.unit}
                            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                        >
                            <option>Bottle</option>
                            <option>Pcs</option>
                            <option>Box</option>
                            <option>Kg</option>
                            <option>Litre</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cost Price ($)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                                value={newItem.cost_price}
                                onChange={(e) => setNewItem({ ...newItem, cost_price: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Initial Stock</label>
                        <div className="relative">
                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="number"
                                placeholder="0"
                                className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                                value={newItem.initial_stock}
                                onChange={(e) => setNewItem({ ...newItem, initial_stock: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? "Processing..." : <><Save size={20} /> Register Item</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
