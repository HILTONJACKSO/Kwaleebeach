'use client';

import { useState, useEffect } from 'react';
import {
    Layout,
    Type,
    Image as ImageIcon,
    Save,
    RefreshCw,
    Sparkles,
    Eye,
    CheckCircle,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useUI } from '@/context/UIContext';

interface ConfigItem {
    id: number;
    section: string;
    key: string;
    label: string;
    value: string;
    field_type: 'text' | 'textarea' | 'image' | 'color';
    last_updated: string;
}

export default function CMSPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <CMSContent />
        </ProtectedRoute>
    );
}

function CMSContent() {
    const { showNotification } = useUI();
    const [configs, setConfigs] = useState<ConfigItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedSection, setSelectedSection] = useState('All');

    const fetchConfigs = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/website/config/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setConfigs(data);
            }
        } catch (error) {
            console.error("Failed to fetch CMS config", error);
            showNotification("Failed to load website content", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleUpdate = async (key: string, newValue: string) => {
        setConfigs(prev => prev.map(c => c.key === key ? { ...c, value: newValue } : c));
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const promises = configs.map(config =>
                fetch(`http://127.0.0.1:8000/api/website/config/${config.key}/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ value: config.value })
                })
            );

            const results = await Promise.all(promises);
            if (results.every(r => r.ok)) {
                showNotification("Website content successfully updated!", "info");
            } else {
                showNotification("Some updates failed. Please try again.", "error");
            }
        } catch (error) {
            showNotification("Error connecting to server", "error");
        } finally {
            setSaving(false);
        }
    };

    const sections = ['All', ...Array.from(new Set(configs.map(c => c.section)))];
    const filteredConfigs = selectedSection === 'All'
        ? configs
        : configs.filter(c => c.section === selectedSection);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <Sparkles size={12} /> Dynamic Experience
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Website <span className="text-[var(--color-primary)]">CMS</span></h1>
                    <p className="text-gray-500 font-medium tracking-tight mt-1">Directly curate the visitor experience without touching code.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchConfigs}
                        className="p-4 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
                        title="Reload Content"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={saveChanges}
                        disabled={saving}
                        className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                    >
                        {saving ? "Publishing..." : <>Publish Changes <Save size={18} /></>}
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {sections.map(section => (
                    <button
                        key={section}
                        onClick={() => setSelectedSection(section)}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedSection === section
                            ? 'bg-[var(--color-primary)] text-white shadow-lg'
                            : 'bg-white text-gray-400 border border-gray-100 hover:border-[var(--color-primary)]'
                            }`}
                    >
                        {section}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Configuration Storage...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-12 pb-32">
                    {Array.from(new Set(filteredConfigs.map(c => c.section))).map(section => (
                        <div key={section} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{section} Section</h2>
                                <div className="h-px bg-gray-100 flex-1"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredConfigs.filter(c => c.section === section).map(config => (
                                    <div key={config.key} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm group hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-colors">
                                                    {config.field_type === 'image' ? <ImageIcon size={16} /> : <Type size={16} />}
                                                </div>
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{config.label}</label>
                                            </div>
                                            <span className="text-[9px] font-black text-gray-200 uppercase tracking-widest">KEY: {config.key}</span>
                                        </div>

                                        {config.field_type === 'textarea' ? (
                                            <textarea
                                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] transition-all min-h-[100px]"
                                                value={config.value}
                                                onChange={(e) => handleUpdate(config.key, e.target.value)}
                                            />
                                        ) : config.field_type === 'image' ? (
                                            <div className="space-y-4">
                                                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 relative group/img">
                                                    <img src={config.value} className="w-full h-full object-cover" alt="Preview" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                        <a href={config.value} target="_blank" className="text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                                            View Full Size <Eye size={14} />
                                                        </a>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                                    value={config.value}
                                                    placeholder="Enter Image URL..."
                                                    onChange={(e) => handleUpdate(config.key, e.target.value)}
                                                />
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                                value={config.value}
                                                onChange={(e) => handleUpdate(config.key, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
