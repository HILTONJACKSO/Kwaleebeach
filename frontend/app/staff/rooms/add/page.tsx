'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Bed, Hash, Layers, Save, Ruler, Image as ImageIcon, Sparkles, AlignLeft } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

export default function AddRoomPage() {
    const router = useRouter();
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [roomData, setRoomData] = useState({
        room_number: '',
        room_type: 'STANDARD',
        category: 'ROOM',
        price_per_night: '',
        description: '',
        amenities: '',
    });

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
        setLoading(true);

        const formData = new FormData();
        formData.append('room_number', roomData.room_number);
        formData.append('room_type', roomData.room_type);
        formData.append('category', roomData.category);
        formData.append('price_per_night', roomData.price_per_night);
        formData.append('description', roomData.description);
        formData.append('amenities', roomData.amenities);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const res = await fetch('/api/pms/rooms/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: formData,
                // Do not set Content-Type, browser will set it with boundary for FormData
            });

            if (res.ok) {
                showNotification(`Room ${roomData.room_number} added successfully!`, 'success');
                router.push('/staff/rooms');
            } else {
                const data = await res.json().catch(() => ({}));
                showNotification(data.detail || "Failed to add room", "error");
            }
        } catch (e) {
            showNotification("Connection error", "error");
        } finally {
            setLoading(false);
        }
    };

    const illustration = (
        <div className="absolute inset-0 flex items-center justify-center p-8">
            {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-[2rem] shadow-2xl shadow-gray-400" />
            ) : (
                <div className="w-full h-full bg-gray-50 rounded-[2rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 gap-4">
                    <ImageIcon size={64} strokeWidth={1} />
                    <p className="text-xs font-black uppercase tracking-widest">Room Preview</p>
                </div>
            )}
        </div>
    );

    return (
        <FormPageLayout
            title="Register New Room"
            subtitle="Inventory Expansion"
            description="Add a new luxury suite or standard room to the resort's inventory. Configure the room type, amenities, and pricing."
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
                            {imageFile ? imageFile.name : "Click to upload room photo"}
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
                            placeholder="Detailed description of the room..."
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all resize-none"
                            value={roomData.description}
                            onChange={(e) => setRoomData({ ...roomData, description: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? "Processing..." : <><Save size={20} /> Register Room</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
