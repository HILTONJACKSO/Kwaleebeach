'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Save, Package, Hash, DollarSign, Layers, Check, Search } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';
import Image from 'next/image';

interface InventoryItem {
    id: number;
    name: string;
    sku: string;
    category: string;
    unit: string;
    cost_price: string;
}

export default function AddInventoryItemPage() {
    const router = useRouter();
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(false);

    // Autocomplete state
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [suggestions, setSuggestions] = useState<InventoryItem[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const suggestionRef = useRef<HTMLDivElement>(null);

    const [newItem, setNewItem] = useState({
        name: '',
        sku: '',
        category: 'BAR',
        unit: 'Bottle',
        cost_price: '',
        initial_stock: '0',
    });

    useEffect(() => {
        // Fetch all items for autocomplete
        const fetchItems = async () => {
            try {
                const res = await fetch('/api/inventory/items/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setItems(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                console.error("Failed to fetch inventory for autocomplete", e);
            }
        };
        fetchItems();

        // Close suggestions on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewItem({ ...newItem, name: value });
        setSelectedItemId(null); // Reset if user keeps typing

        if (value.length > 0) {
            const filtered = items.filter(item =>
                item.name.toLowerCase().includes(value.toLowerCase()) ||
                item.sku.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (item: InventoryItem) => {
        setNewItem({
            ...newItem,
            name: item.name,
            sku: item.sku,
            category: item.category || 'BAR',
            unit: item.unit || 'Bottle',
            cost_price: item.cost_price,
        });
        setSelectedItemId(item.id);
        setShowSuggestions(false);
        showNotification(`Selected existing item: ${item.name}`, 'info');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let itemId = selectedItemId;

            // 1. If not an existing item, create it
            if (!itemId) {
                const res = await fetch('/api/inventory/items/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                    },
                    body: JSON.stringify({
                        name: newItem.name,
                        sku: newItem.sku,
                        category: newItem.category,
                        unit: newItem.unit,
                        cost_price: newItem.cost_price,
                    })
                });

                if (res.ok) {
                    const createdItem = await res.json();
                    itemId = createdItem.id;
                } else {
                    const errorData = await res.json();
                    const errorMessage = typeof errorData === 'object'
                        ? Object.entries(errorData).map(([key, val]) => `${key}: ${val}`).join(', ')
                        : "Failed to add item";
                    showNotification(errorMessage, "error");
                    setLoading(false);
                    return;
                }
            }

            // 2. Add stock (using our new add-stock endpoint)
            if (itemId && parseFloat(newItem.initial_stock) > 0) {
                const stockRes = await fetch(`/api/inventory/items/${itemId}/add-stock/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                    },
                    body: JSON.stringify({
                        department: 'MAIN',
                        quantity: newItem.initial_stock
                    })
                });

                if (!stockRes.ok) {
                    showNotification("Item saved, but failed to update stock level", "error");
                }
            }

            showNotification(`${newItem.name} stock updated successfully!`, 'success');
            router.push('/staff/inventory');

        } catch (e) {
            showNotification("Connection error", "error");
        } finally {
            setLoading(false);
        }
    };

    const illustration = (
        <div className="absolute inset-0 flex items-end justify-center">
            <template className="hidden">Illustration Layer</template>
            <img
                src="/illustrations/inventory_add_illustration_1770391854513.png"
                alt="Inventory Illustration"
                className="w-full h-full object-cover"
            />
        </div>
    );

    return (
        <FormPageLayout
            title={selectedItemId ? "Add More Stock" : "Register New Item"}
            subtitle="Inventory Management"
            description={selectedItemId
                ? `Adding additional units of "${newItem.name}" to the Main Stock.`
                : "Add new items to the resort's global inventory. This includes food, beverages, and luxury amenities."
            }
            backLink="/staff/inventory"
            illustration={illustration}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 relative" ref={suggestionRef}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Item Name</label>
                    <div className="relative">
                        <Package className={`absolute left-4 top-1/2 -translate-y-1/2 ${selectedItemId ? 'text-emerald-500' : 'text-gray-400'}`} size={18} />
                        <input
                            required
                            type="text"
                            placeholder="e.g. Vintage Champagne 2012"
                            className={`w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all ${selectedItemId ? 'border-emerald-500' : 'border-gray-300'}`}
                            value={newItem.name}
                            onChange={handleNameChange}
                            onFocus={() => newItem.name && setSuggestions(items.filter(i => i.name.toLowerCase().includes(newItem.name.toLowerCase())).slice(0, 5))}
                        />
                        {selectedItemId && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                <Check size={12} /> Existing
                            </div>
                        )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            {suggestions.map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => selectSuggestion(item)}
                                    className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors"
                                >
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{item.name}</div>
                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.sku}</div>
                                    </div>
                                    <Search size={14} className="text-gray-300 group-hover:text-[var(--color-primary)]" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">SKU / Code</label>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                readOnly={!!selectedItemId}
                                type="text"
                                placeholder="CH-12-001"
                                className={`w-full pl-12 pr-6 py-4 rounded-2xl border-2 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all ${selectedItemId ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-300'}`}
                                value={newItem.sku}
                                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Unit</label>
                        <select
                            disabled={!!selectedItemId}
                            className={`w-full px-6 py-4 rounded-2xl border-2 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all ${selectedItemId ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-300'}`}
                            value={newItem.unit}
                            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                        >
                            <option value="Bottle">Bottle</option>
                            <option value="Pcs">Pcs</option>
                            <option value="Box">Box</option>
                            <option value="Kg">Kg</option>
                            <option value="Litre">Litre</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                    <select
                        disabled={!!selectedItemId}
                        className={`w-full px-6 py-4 rounded-2xl border-2 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all ${selectedItemId ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-300'}`}
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    >
                        <option value="BAR">Bar</option>
                        <option value="KITCHEN">Kitchen</option>
                        <option value="HOUSEKEEPING">Housekeeping</option>
                        <option value="OFFICE">Office</option>
                        <option value="MAINTENANCE">Maintenance</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cost Price ($)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                readOnly={!!selectedItemId}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className={`w-full pl-12 pr-6 py-4 rounded-2xl border-2 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all ${selectedItemId ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-300'}`}
                                value={newItem.cost_price}
                                onChange={(e) => setNewItem({ ...newItem, cost_price: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2 text-[var(--color-primary)]">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1">{selectedItemId ? 'Add Stock Amount' : 'Initial Stock'}</label>
                        <div className="relative">
                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="number"
                                placeholder="0"
                                className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
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
                    {loading ? "Processing..." : <><Save size={20} /> {selectedItemId ? 'Update Stock' : 'Register Item'}</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
