'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Plus, Trash2, ChevronLeft, MapPin, Hash, Save, Search, Table as TableIcon } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface RestaurantTable {
    id: number;
    number: string;
    is_active: boolean;
}

export default function TableManagementPage() {
    const router = useRouter();
    const { showNotification } = useUI();
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newNumber, setNewNumber] = useState('');

    const fetchData = async () => {
        try {
            const res = await fetch('/api/inventory/tables/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                }
            });
            if (res.ok) {
                setTables(await res.json());
            }
        } catch (e) {
            console.error("Failed to fetch tables", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddTable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNumber.trim()) return;

        setSaving(true);

        try {
            const res = await fetch('/api/inventory/tables/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({ number: newNumber, is_active: true })
            });

            if (res.ok) {
                showNotification(`Table "${newNumber}" created`, "success");
                setNewNumber('');
                fetchData();
            } else {
                const data = await res.json();
                showNotification(data.number ? `Table ${data.number[0]}` : "Failed to create table", "error");
            }
        } catch (e) {
            showNotification("Connection error", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTable = async (table: RestaurantTable) => {
        if (!confirm(`Are you sure you want to delete Table "${table.number}"?`)) return;

        try {
            const res = await fetch(`/api/inventory/tables/${table.id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                }
            });

            if (res.status === 204) {
                showNotification("Table removed", "success");
                fetchData();
            } else {
                showNotification("Failed to delete table", "error");
            }
        } catch (e) {
            showNotification("Connection error", "error");
        }
    };

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <button
                            onClick={() => router.push('/staff/menu')}
                            className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-bold text-[10px] uppercase tracking-widest mb-4"
                        >
                            <ChevronLeft size={16} />
                            Back to Menu Management
                        </button>
                        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            Restaurant Tables <TableIcon className="text-emerald-500" size={32} />
                        </h1>
                        <p className="text-gray-500 font-medium tracking-tight text-sm">Manage physical dining locations for order tracking.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Table Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8 sticky top-8">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">New Table</h3>
                                <p className="text-xs text-gray-400 font-medium">Add a new physical table to the restaurant.</p>
                            </div>

                            <form onSubmit={handleAddTable} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Table Number/ID</label>
                                    <div className="relative group">
                                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" size={18} />
                                        <input
                                            required
                                            value={newNumber}
                                            onChange={e => setNewNumber(e.target.value)}
                                            placeholder="e.g. T5 or 21"
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--color-primary)] outline-none transition-all font-bold text-gray-900 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving || !newNumber.trim()}
                                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Plus size={18} className="group-hover:scale-125 transition-transform" />
                                            Add Table
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Tables List */}
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-gray-100"></div>
                                ))}
                            </div>
                        ) : tables.length === 0 ? (
                            <div className="bg-white rounded-[3rem] border border-gray-100 p-20 text-center space-y-6 shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto text-gray-300">
                                    <Search size={40} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">No Tables Configured</h3>
                                    <p className="text-gray-400 font-medium">Start by adding your restaurant tables.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {tables.map(table => (
                                    <div
                                        key={table.id}
                                        className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:rotate-12 shadow-sm">
                                                <MapPin size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-gray-900">Table {table.number}</h4>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Active Location</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteTable(table)}
                                            className="p-4 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                            title="Delete Table"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
