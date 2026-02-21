'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Bed, Hash, Layers, Save, Ruler, ArrowLeft, Image as ImageIcon, Sparkles, AlignLeft } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

export default function EditRoomPage() {
    const router = useRouter();
    const { id } = useParams();
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [roomData, setRoomData] = useState({
        room_number: '',
        room_type: '',
        category: 'ROOM',
        status: 'AVAILABLE',
        price_per_night: '',
        description: '',
        amenities: '',
    });

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/pms/rooms/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRoomData({
                        room_number: data.room_number,
                        room_type: data.room_type,
                        category: data.category || 'ROOM',
                        status: data.status,
                        price_per_night: data.price_per_night || '',
                        description: data.description || '',
                        amenities: data.amenities || '',
                    });
                    if (data.image) {
                        setImagePreview(data.image);
                    }
                } else {
                    showNotification("Failed to load room details", "error");
                    router.push('/staff/rooms');
                }
            } catch (e) {
                showNotification("Connection error", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        formData.append('room_number', roomData.room_number);
        formData.append('room_type', roomData.room_type);
        formData.append('category', roomData.category);
        formData.append('status', roomData.status);
        formData.append('price_per_night', roomData.price_per_night);
        formData.append('description', roomData.description);
        formData.append('amenities', roomData.amenities);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/pms/rooms/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData,
            });

            if (res.ok) {
                showNotification(`Room ${roomData.room_number} updated successfully!`, 'success');
                router.push('/staff/rooms');
            } else {
                const data = await res.json().catch(() => ({}));
                showNotification(data.detail || "Failed to update room", "error");
            }
        } catch (e) {
            showNotification("Connection error", "error");
        } finally {
            setSaving(false);
        }
    };

    const illustration = (
        <div className="absolute inset-0 flex items-center justify-center p-8">
            {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-[2rem] shadow-2xl shadow-gray-400" />
            ) : (
                <div className="w-full h-full bg-gray-50 rounded-[2rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 gap-4">
                    <ImageIcon size={64} strokeWidth={1} />
                    <p className="text-xs font-black uppercase tracking-widest">Room Image</p>
                </div>
            )}
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
            title="Update Room"
            subtitle="Inventory Management"
            description="Adjust room specifications, availability status, or pricing. Changes reflect immediately on the global booking engine."
            backLink="/staff/rooms"
            illustration={illustration}
        >
            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Room Image</label>
                    <div className="relative group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full py-4 bg-gray-50 rounded-2xl border-none text-sm font-bold flex items-center justify-center gap-2 text-gray-400 group-hover:bg-gray-100 transition-all">
                            <ImageIcon size={18} />
                            {imageFile ? imageFile.name : (imagePreview ? "Change room photo" : "Click to upload room photo")}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Room Number</label>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="text"
                                placeholder="e.g. 304"
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                                value={roomData.room_number}
                                onChange={(e) => setRoomData({ ...roomData, room_number: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Current Status</label>
                        <select
                            required
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={roomData.status}
                            onChange={(e) => setRoomData({ ...roomData, status: e.target.value })}
                        >
                            <option value="AVAILABLE">Available</option>
                            <option value="OCCUPIED">Occupied</option>
                            <option value="DIRTY">Dirty</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Room Category</label>
                        <select
                            required
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={roomData.category}
                            onChange={(e) => setRoomData({ ...roomData, category: e.target.value })}
                        >
                            <option value="ROOM">Standard Room</option>
                            <option value="TENT">Luxury Tent</option>
                            <option value="VILLA">Private Villa</option>
                            <option value="COTTAGE">Cottage</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Room Name / Type</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Hornbill Luxury"
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={roomData.room_type}
                            onChange={(e) => setRoomData({ ...roomData, room_type: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Price / Night ($)</label>
                    <div className="relative">
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            required
                            type="number"
                            placeholder="0.00"
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={roomData.price_per_night}
                            onChange={(e) => setRoomData({ ...roomData, price_per_night: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Amenities</label>
                    <div className="relative">
                        <Sparkles className="absolute left-4 top-4 text-gray-400" size={18} />
                        <textarea
                            rows={2}
                            placeholder="WiFi, Pool View, King Bed, Mini Bar..."
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all resize-none"
                            value={roomData.amenities}
                            onChange={(e) => setRoomData({ ...roomData, amenities: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
                    <div className="relative">
                        <AlignLeft className="absolute left-4 top-4 text-gray-400" size={18} />
                        <textarea
                            rows={3}
                            placeholder="Detailed description..."
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all resize-none"
                            value={roomData.description}
                            onChange={(e) => setRoomData({ ...roomData, description: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    disabled={saving}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {saving ? "Saving..." : <><Save size={20} /> Update Room</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
