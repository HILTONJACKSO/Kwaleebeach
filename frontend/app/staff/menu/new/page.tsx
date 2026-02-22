'use client';
import { useState, useEffect } from 'react';
import {
    Plus, X, Image as ImageIcon, DollarSign, FileText,
    Utensils, ChevronLeft, Save, Upload, Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Category {
    id: number;
    name: string;
}

export default function AddMenuItemPage() {
    const router = useRouter();
    const { showNotification } = useUI();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        preparation_station: 'KITCHEN',
        is_available: true
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/inventory/menu/categories/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
                if (data.length > 0) setFormData(prev => ({ ...prev, category: data[0].id.toString() }));
            }
        } catch (e) {
            console.error("Failed to fetch categories", e);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('category', formData.category);
        data.append('preparation_station', formData.preparation_station);
        data.append('is_available', formData.is_available.toString());
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            const res = await fetch('/api/inventory/menu/items/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                // Note: Don't set Content-Type header when using FormData, browser will set it with boundary
                body: data
            });

            if (res.ok) {
                showNotification("Menu item created successfully", "success");
                router.push('/staff/menu');
            } else {
                const errData = await res.json();
                showNotification(errData.detail || "Failed to create item", "error");
            }
        } catch (e) {
            showNotification("Network error", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-bold text-sm uppercase tracking-widest"
                    >
                        <ChevronLeft size={20} />
                        Back to Menu
                    </button>
                    <div className="text-right">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Add New Item</h1>
                        <p className="text-gray-500 font-medium">Define your new restaurant or bar offering.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Image Upload */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block text-center">Item Image</label>

                            <div className="relative aspect-square rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden group hover:border-[var(--color-primary)] transition-all">
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white font-bold text-xs">Change Image</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm text-gray-400 group-hover:text-[var(--color-primary)] transition-colors">
                                            <Upload size={32} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Click to upload</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>

                            <p className="text-[9px] text-gray-400 text-center font-medium leading-relaxed italic">
                                Recommended: 800x800px or larger. Support formats: JPG, PNG, WEBP.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${formData.is_available ? 'bg-emerald-50 text-emerald-500 shadow-emerald-100' : 'bg-rose-50 text-rose-500 shadow-rose-100'} shadow-lg`}>
                                    {formData.is_available ? <Check size={24} strokeWidth={3} /> : <X size={24} strokeWidth={3} />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-gray-900">Available</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Visible to guests</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={formData.is_available}
                                    onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                                />
                                <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.is_available ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_available ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Right Column: Details Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Item Name</label>
                                    <div className="relative group">
                                        <Utensils className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" size={18} />
                                        <input
                                            required
                                            placeholder="e.g. Lobster Thermidor"
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[var(--color-primary)] outline-none transition-all font-bold text-gray-900"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Price ($)</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" size={18} />
                                        <input
                                            required
                                            type="number" step="0.01"
                                            placeholder="0.00"
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[var(--color-primary)] outline-none transition-all font-bold text-gray-900 font-mono"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
                                <div className="relative group">
                                    <FileText className="absolute left-5 top-5 text-gray-300 group-focus-within:text-[var(--color-primary)] transition-colors" size={18} />
                                    <textarea
                                        rows={4}
                                        placeholder="Describe the ingredients, preparation, and taste..."
                                        className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[var(--color-primary)] outline-none transition-all font-bold text-gray-900 leading-relaxed"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[var(--color-primary)] outline-none transition-all font-bold text-gray-900 appearance-none cursor-pointer"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <ChevronLeft size={18} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-[-90deg] text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Preparation Station</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-[var(--color-primary)] outline-none transition-all font-bold text-gray-900 appearance-none cursor-pointer"
                                            value={formData.preparation_station}
                                            onChange={e => setFormData({ ...formData, preparation_station: e.target.value as any })}
                                        >
                                            <option value="KITCHEN">Kitchen Dashboard</option>
                                            <option value="BAR">Bar Dashboard</option>
                                        </select>
                                        <ChevronLeft size={18} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-[-90deg] text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-[var(--color-primary)] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save size={20} className="group-hover:scale-125 transition-transform" />
                                        Save & Build Menu
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
}
