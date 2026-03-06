'use client';
import { useState, useEffect, useRef } from 'react';
import { useUI } from '@/context/UIContext';
import { PackageX, Search, AlertTriangle, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface InventoryItem {
    id: number;
    name: string;
    sku: string;
    category_name: string;
    stocks: { department: string; quantity: string }[];
}

export default function StockOutPage() {
    const { showNotification } = useUI();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<InventoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [department, setDepartment] = useState('MAIN');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length > 1 && !selectedItem) {
            fetch(`/api/inventory/items/?search=${query}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}` }
            })
                .then(res => res.json())
                .then(data => {
                    setSuggestions(Array.isArray(data) ? data : (data.results || []));
                    setShowSuggestions(true);
                });
        } else {
            setSuggestions([]);
        }
    }, [query, selectedItem]);

    const handleStockOut = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !quantity || !reason) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/inventory/items/${selectedItem.id}/stock-out/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({
                    department,
                    quantity: parseFloat(quantity),
                    reason
                })
            });

            const data = await res.json();
            if (res.ok) {
                showNotification(`Stock decreased by ${quantity} for ${selectedItem.name}`, 'success');
                setSelectedItem(null);
                setQuery('');
                setQuantity('');
                setReason('');
            } else {
                showNotification(data.error || 'Stock-out failed', 'error');
            }
        } catch (e) {
            showNotification('Connection error', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-50 text-red-500 rounded-[2rem]">
                        <PackageX size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Stock Out</h1>
                        <p className="text-gray-500 font-medium">Remove damaged or expired goods from inventory.</p>
                    </div>
                </div>

                <div className="card bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-gray-100">
                    <form onSubmit={handleStockOut} className="space-y-8">
                        {/* Search & Select */}
                        <div className="relative" ref={suggestionRef}>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Find Item</label>
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name or SKU..."
                                    value={selectedItem ? selectedItem.name : query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setSelectedItem(null);
                                    }}
                                    className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] font-bold text-gray-900 focus:bg-white focus:border-red-500 outline-none transition-all text-lg"
                                />
                                {selectedItem && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                        <CheckCircle className="text-emerald-500" size={24} />
                                    </div>
                                )}
                            </div>

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4">
                                    {suggestions.map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setShowSuggestions(false);
                                            }}
                                            className="w-full px-8 py-5 text-left hover:bg-red-50 flex items-center justify-between group transition-colors border-b border-gray-50 last:border-none"
                                        >
                                            <div>
                                                <div className="font-black text-gray-900 group-hover:text-red-600">{item.name}</div>
                                                <div className="text-xs font-bold text-gray-400">{item.sku || 'No SKU'} • {item.category_name}</div>
                                            </div>
                                            <ArrowRight className="text-gray-200 group-hover:text-red-500 transition-all group-hover:translate-x-1" size={18} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedItem && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Department</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['MAIN', 'POOL', 'BAR', 'BEACH_BAR', 'KITCHEN'].map(dept => (
                                                <button
                                                    key={dept}
                                                    type="button"
                                                    onClick={() => setDepartment(dept)}
                                                    className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${department === dept
                                                        ? 'border-red-500 bg-red-50 text-red-600'
                                                        : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                                                        }`}
                                                >
                                                    {dept.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Quantity to Remove</label>
                                        <input
                                            type="number"
                                            required
                                            min="0.01"
                                            step="0.01"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-red-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Reason</label>
                                        <textarea
                                            required
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Describe why you are stocking out these items..."
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-red-500 outline-none transition-all h-[150px] resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-red-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <AlertTriangle size={20} />}
                                        Confirm Stock Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
