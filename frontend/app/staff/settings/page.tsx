'use client';
import { useState } from 'react';
import { Settings, Save, Lock, Bell, Store, KeyRound, MonitorSmartphone, Mail, CheckCircle2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <SettingsContent />
        </ProtectedRoute>
    );
}

function SettingsContent() {
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications'>('general');
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        // Simulate API call
        setTimeout(() => {
            setSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1200);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    System Settings <Settings className="text-gray-400" size={32} />
                </h1>
                <p className="text-gray-500 font-medium">Manage global resort configurations and system preferences.</p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-2">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'general'
                            ? 'bg-gray-900 text-white shadow-xl shadow-gray-200'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm'
                            }`}
                    >
                        <Store size={18} /> General
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'security'
                            ? 'bg-gray-900 text-white shadow-xl shadow-gray-200'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm'
                            }`}
                    >
                        <Lock size={18} /> Security
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'notifications'
                            ? 'bg-gray-900 text-white shadow-xl shadow-gray-200'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm'
                            }`}
                    >
                        <Bell size={18} /> Notifications
                    </button>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <form onSubmit={handleSave} className="space-y-8">
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <MonitorSmartphone className="text-[var(--color-primary)]" />
                                        Platform Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Resort Name</label>
                                            <input type="text" defaultValue="Kwalee Hotel & Resort" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Support Email</label>
                                            <input type="email" defaultValue="support@Kwalee.com" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">System Currency</label>
                                            <select className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all">
                                                <option>USD ($)</option>
                                                <option>EUR (€)</option>
                                                <option>GBP (£)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <KeyRound className="text-[var(--color-primary)]" />
                                        Authentication Policies
                                    </h2>
                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div>
                                                <div className="text-sm font-black text-gray-900">Enforce 2FA</div>
                                                <div className="text-xs font-medium text-gray-500">Require two-factor authentication for all staff members.</div>
                                            </div>
                                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                                                <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-[var(--color-primary)] cursor-pointer"></label>
                                            </div>
                                        </label>

                                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div>
                                                <div className="text-sm font-black text-gray-900">Session Timeout</div>
                                                <div className="text-xs font-medium text-gray-500">Automatically log out inactive users after 30 minutes.</div>
                                            </div>
                                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input type="checkbox" name="toggle" id="toggle2" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                                                <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-6 rounded-full bg-[var(--color-primary)] cursor-pointer"></label>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <Mail className="text-[var(--color-primary)]" />
                                        Email Dispatch rules
                                    </h2>
                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div>
                                                <div className="text-sm font-black text-gray-900">Booking Confirmations</div>
                                                <div className="text-xs font-medium text-gray-500">Send automated email receipts for successful bookings.</div>
                                            </div>
                                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input type="checkbox" name="toggle" id="toggle3" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                                                <label htmlFor="toggle3" className="toggle-label block overflow-hidden h-6 rounded-full bg-[var(--color-primary)] cursor-pointer"></label>
                                            </div>
                                        </label>

                                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div>
                                                <div className="text-sm font-black text-gray-900">Daily Revenue Report</div>
                                                <div className="text-xs font-medium text-gray-500">Send an end-of-day financial report to standard admin emails.</div>
                                            </div>
                                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input type="checkbox" name="toggle" id="toggle4" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                                                <label htmlFor="toggle4" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Actions */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
                            {showSuccess && (
                                <div className="text-emerald-500 text-sm font-black flex items-center gap-2 animate-in slide-in-from-right-4">
                                    <CheckCircle2 size={18} /> Settings Applied
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#8B6B4A] transition-all shadow-xl shadow-[#A88B68]/30 disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .toggle-checkbox:checked { right: 0; left: auto; border-color: var(--color-primary); }
                .toggle-checkbox:focus { outline: none; }
                .toggle-label { transition: background-color 0.2s; }
            `}} />
        </div>
    );
}
