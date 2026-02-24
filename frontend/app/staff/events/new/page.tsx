'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Save, Image as ImageIcon, AlignLeft, Calendar, Clock, MapPin, Tag, Users, DollarSign } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

export default function NewEventPage() {
    const router = useRouter();
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [eventData, setEventData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        capacity: '50',
        price: '',
        status: 'SCHEDULED',
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
        formData.append('title', eventData.title);
        formData.append('date', eventData.date);
        formData.append('time', eventData.time);
        formData.append('location', eventData.location);
        formData.append('description', eventData.description);
        formData.append('capacity', eventData.capacity);
        formData.append('price', eventData.price);
        formData.append('status', eventData.status);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const res = await fetch('/api/recreation/events/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: formData,
            });

            if (res.ok) {
                showNotification(`Event "${eventData.title}" created successfully!`, 'success');
                router.push('/staff/events');
            } else {
                const data = await res.json().catch(() => ({}));
                showNotification(data.detail || "Failed to create event", "error");
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
                    <p className="text-xs font-black uppercase tracking-widest">Event Preview</p>
                </div>
            )}
        </div>
    );

    return (
        <FormPageLayout
            title="Design New Experience"
            subtitle="Resort Recreation"
            description="Create a new guest experience or resort event. Set the schedule, location, and capacity to begin accepting bookings and promoting the event."
            backLink="/staff/events"
            illustration={illustration}
        >
            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Event Banner Image</label>
                    <div className="relative group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full py-4 bg-white rounded-2xl border-2 border-gray-300 text-sm font-bold flex items-center justify-center gap-2 text-gray-400 group-hover:bg-gray-50 transition-all">
                            <ImageIcon size={18} />
                            {imageFile ? imageFile.name : "Upload event banner"}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Event Title</label>
                    <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            required
                            type="text"
                            placeholder="e.g. Sunset Jazz & Cocktails"
                            className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                            value={eventData.title}
                            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Price per Person ($)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="number"
                                placeholder="0.00"
                                className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                                value={eventData.price}
                                onChange={(e) => setEventData({ ...eventData, price: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Guest Capacity</label>
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="number"
                                placeholder="50"
                                className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                                value={eventData.capacity}
                                onChange={(e) => setEventData({ ...eventData, capacity: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="date"
                                className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                                value={eventData.date}
                                onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Start Time</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="time"
                                className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                                value={eventData.time}
                                onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            required
                            type="text"
                            placeholder="e.g. Ocean Terrace"
                            className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                            value={eventData.location}
                            onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Detailed Description</label>
                    <div className="relative">
                        <AlignLeft className="absolute left-4 top-4 text-gray-400" size={18} />
                        <textarea
                            rows={4}
                            placeholder="Describe the experience..."
                            className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all resize-none"
                            value={eventData.description}
                            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? "Processing..." : <><Save size={20} /> Publish Event</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
