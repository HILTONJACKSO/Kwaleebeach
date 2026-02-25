'use client';
import { useState, useEffect } from 'react';
import {
    Plus, Search, Edit2, Trash2, Check, X,
    Image as ImageIcon, DollarSign, FileText,
    ChevronRight, Filter, MoreVertical, Utensils, Table as TableIcon
} from 'lucide-react';
import { useUI } from '@/context/UIContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string;
    is_available: boolean;
    category: number;
    preparation_station: 'KITCHEN' | 'BAR';
}

export default function MenuManagementPage() {
    const { showNotification } = useUI();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');

    // UI State
    // States removed: isModalOpen, editingItem, formData

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [itemRes, catRes] = await Promise.all([
                fetch('/api/inventory/menu/items/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                    }
                }),
                fetch('/api/inventory/menu/categories/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                    }
                })
            ]);
            if (itemRes.ok) setItems(await itemRes.json());
            if (catRes.ok) setCategories(await catRes.json());
        } catch (e) {
            console.error("Failed to fetch menu data", e);
        } finally {
            setLoading(false);
        }
    };

    // handleOpenModal and handleSubmit removed

    const toggleAvailability = async (item: MenuItem) => {
        try {
            const res = await fetch(`/api/inventory/menu/items/${item.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({ is_available: !item.is_available })
            });
            if (res.ok) {
                setItems(items.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
                showNotification(`Item ${!item.is_available ? 'enabled' : 'disabled'}`, "success");
            }
        } catch (e) {
            showNotification("Toggle failed", "error");
        }
    };

    const deleteItem = async (id: number) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            const res = await fetch(`/api/inventory/menu/items/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                }
            });
            if (res.status === 204) {
                showNotification("Item deleted", "success");
                fetchData();
            }
        } catch (e) {
            showNotification("Delete failed", "error");
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="flex-1">
                        <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            Menu Management <Utensils className="text-orange-500" size={32} />
                        </h1>
                        <p className="text-gray-500 font-medium tracking-tight text-sm">Create and manage your restaurant and bar offerings.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                        <Link
                            href="/staff/menu/categories"
                            className="px-6 py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Filter size={18} /> Categories
                        </Link>
                        <Link
                            href="/staff/menu/tables"
                            className="px-6 py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <TableIcon size={18} /> Tables
                        </Link>
                        <Link
                            href="/staff/menu/new"
                            className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                        >
                            <Plus size={18} /> Add New Item
                        </Link>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search items..."
                            className="w-full pl-16 pr-6 py-4 bg-white border-2 border-transparent rounded-2xl shadow-sm focus:border-[var(--color-primary)] focus:outline-none transition-all font-medium text-gray-900"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === 'all' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            All Items
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Items Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white h-[450px] rounded-[2.5rem] animate-pulse border border-gray-100 shadow-sm"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {filteredItems.map(item => (
                            <div key={item.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col">
                                {/* Image Section */}
                                <div className="relative h-60 overflow-hidden">
                                    <img
                                        src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80"}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${item.is_available ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'}`}>
                                            {item.is_available ? 'In Stock' : 'Out of Stock'}
                                        </div>
                                        <div className="px-4 py-1.5 bg-gray-900/80 text-white rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                            {item.preparation_station}
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                        <p className="text-white text-xs font-medium italic opacity-80">
                                            {categories.find(c => c.id === item.category)?.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-8 flex-1 flex flex-col space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-black text-gray-900 group-hover:text-[var(--color-primary)] transition-colors leading-tight">
                                            {item.name}
                                        </h3>
                                        <span className="text-2xl font-black text-gray-900">
                                            ${item.price}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium line-clamp-3 flex-1 leading-relaxed">
                                        {item.description || "No description provided."}
                                    </p>

                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
                                        <Link
                                            href={`/staff/menu/${item.id}/edit`}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                                        >
                                            <Edit2 size={14} /> Edit
                                        </Link>
                                        <button
                                            onClick={() => toggleAvailability(item)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${item.is_available ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                                        >
                                            {item.is_available ? <X size={14} /> : <Check size={14} />}
                                            {item.is_available ? 'Disable' : 'Enable'}
                                        </button>
                                        <button
                                            onClick={() => deleteItem(item.id)}
                                            className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
                }

                {/* Modal removed */}
            </div >
        </ProtectedRoute >
    );
}
