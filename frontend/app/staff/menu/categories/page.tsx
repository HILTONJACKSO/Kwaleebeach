'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Plus, Trash2, ChevronLeft, Tag as TagIcon, Hash, Save, Search, LayoutGrid } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Category {
    id: number;
    name: string;
    slug: string;
}

export default function CategoryManagementPage() {
    const router = useRouter();
    const { showNotification } = useUI();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newName, setNewName] = useState('');

    const fetchData = async () => {
        try {
            const res = await fetch('/api/inventory/menu/categories/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                }
            });
            if (res.ok) {
                setCategories(await res.json());
            }
        } catch (e) {
            console.error("Failed to fetch categories", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setSaving(true);
        const slug = generateSlug(newName);

        try {
            const res = await fetch('/api/inventory/menu/categories/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({ name: newName, slug })
            });

            if (res.ok) {
                showNotification(`Category "${newName}" created`, "success");
                setNewName('');
                fetchData();
            } else {
                const data = await res.json();
                showNotification(data.detail || "Failed to create category", "error");
            }
        } catch (e) {
            showNotification("Connection error", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCategory = async (cat: Category) => {
        if (!confirm(`Are you sure you want to delete "${cat.name}"? This will affect all items in this category.`)) return;

        try {
            const res = await fetch(`/api/inventory/menu/categories/${cat.id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                }
            });

            if (res.status === 204) {
                showNotification("Category removed", "success");
                fetchData();
            } else {
                showNotification("Failed to delete category", "error");
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
                            Menu Categories <LayoutGrid className="text-orange-500" size={32} />
                        </h1>
                        <p className="text-gray-500 font-medium tracking-tight text-sm">Organize your menu for guests and staff.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Category Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8 sticky top-8">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">New Category</h3>
                                <p className="text-xs text-gray-400 font-medium">Add a new section to your menu.</p>
                            </div>

                            <form onSubmit={handleAddCategory} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category Name</label>
                                    <div className="relative group">
                                        <TagIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" size={18} />
                                        <input
                                            required
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            placeholder="e.g. Signature Cocktails"
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--color-primary)] outline-none transition-all font-bold text-gray-900 shadow-sm"
                                        />
                                    </div>
                                    {newName && (
                                        <div className="flex items-center gap-2 ml-1 text-gray-400 font-mono text-[9px] uppercase tracking-tighter">
                                            <Hash size={10} /> slug: {generateSlug(newName)}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving || !newName.trim()}
                                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Plus size={18} className="group-hover:scale-125 transition-transform" />
                                            Create Category
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Categories List */}
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-gray-100"></div>
                                ))}
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="bg-white rounded-[3rem] border border-gray-100 p-20 text-center space-y-6 shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto text-gray-300">
                                    <Search size={40} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">No Categories Found</h3>
                                    <p className="text-gray-400 font-medium">Start by adding your first menu category.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {categories.map(cat => (
                                    <div
                                        key={cat.id}
                                        className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:rotate-12">
                                                <TagIcon size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-gray-900">{cat.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{cat.slug}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCategory(cat)}
                                            className="p-4 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                            title="Delete Category"
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
