'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { Save, Image as ImageIcon, AlignLeft, Calendar, Clock, MapPin, Tag, Users, DollarSign } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

export default function EditEventPage() {
    const router = useRouter();
    const { id } = useParams();
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [eventData, setEventData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        status: 'SCHEDULED',
        price: '',
        capacity: '50',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/recreation/events/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setEventData({
                        title: data.title,
                        date: data.date,
                        time: data.time || '',
                        location: data.location || '',
                        description: data.description || '',
                        status: data.status || 'SCHEDULED',
                        price: data.price ? data.price.toString() : '',
                        capacity: data.capacity ? data.capacity.toString() : '50',
                    });
                    if (data.image) {
                        setImagePreview(data.image);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
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
        formData.append('title', eventData.title);
        formData.append('date', eventData.date);
        formData.append('time', eventData.time);
        formData.append('location', eventData.location);
        formData.append('description', eventData.description);
        formData.append('status', eventData.status);
        formData.append('price', eventData.price);
        formData.append('capacity', eventData.capacity);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const res = await fetch(`/api/recreation/events/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: formData
            });

            if (res.ok) {
                showNotification(`${eventData.title} updated successfully!`, 'success');
                router.push('/staff/events');
            } else {
                showNotification("Failed to update event", "error");
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
                    <p className="text-xs font-black uppercase tracking-widest">Event Preview</p>
                </div>
            )}
        </div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Event...</div>
        </div>
    </div>;

    return (
        <FormPageLayout
            title="Edit Experience"
            subtitle="Event Management"
            description="Manage resort experiences, seasonal festivals, and private bookings. Precision in scheduling ensures seamless guest transitions between activities."
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
                        <div className="w-full py-4 bg-gray-50 rounded-2xl border-none text-sm font-bold flex items-center justify-center gap-2 text-gray-400 group-hover:bg-gray-100 transition-all">
                            <ImageIcon size={18} />
                            {imageFile ? imageFile.name : (imagePreview ? "Change event banner" : "Upload event banner")}
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
                            placeholder="e.g. Sunset Yoga Session"
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
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
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
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
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                                value={eventData.capacity}
                                onChange={(e) => setEventData({ ...eventData, capacity: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Event Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="date"
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
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
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                                value={eventData.time}
                                onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="text"
                                placeholder="e.g. Beachfront Deck"
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                                value={eventData.location}
                                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status</label>
                        <select
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={eventData.status}
                            onChange={(e) => setEventData({ ...eventData, status: e.target.value })}
                        >
                            <option value="PLANNING">Planning</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Detailed Description</label>
                    <div className="relative">
                        <AlignLeft className="absolute left-4 top-4 text-gray-400" size={18} />
                        <textarea
                            rows={4}
                            placeholder="What should guests expect?"
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all resize-none"
                            value={eventData.description}
                            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    disabled={saving}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {saving ? "Updating..." : <><Save size={20} /> Update Experience</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
