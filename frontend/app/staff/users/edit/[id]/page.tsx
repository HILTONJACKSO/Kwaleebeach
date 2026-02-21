'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, Shield, Briefcase, Save, ArrowLeft } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function EditStaffPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <EditStaffForm />
        </ProtectedRoute>
    );
}

function EditStaffForm() {
    const router = useRouter();
    const { id } = useParams();
    const { showNotification } = useUI();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [staffData, setStaffData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: '',
    });

    useEffect(() => {
        const fetchStaff = async () => {
            if (!token) return;
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/core/users/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStaffData({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        role: data.role || '',
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, [id, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/core/users/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(staffData)
            });

            if (res.ok) {
                showNotification(`${staffData.first_name}'s profile updated!`, 'success');
                router.push('/staff/users');
            } else {
                const data = await res.json().catch(() => ({ error: "Server error" }));
                showNotification(data.error || "Failed to update profile", "error");
            }
        } catch (e) {
            console.error("Update error:", e);
            showNotification("Connection error", "error");
        } finally {
            setSaving(false);
        }
    };

    const illustration = (
        <div className="absolute inset-x-0 bottom-0 top-1/2 overflow-hidden pointer-events-none opacity-80">
            <img
                src="/illustrations/booking_illustration_1770391895407.png"
                alt="Staff Illustration"
                className="w-full h-full object-cover"
            />
        </div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Profile...</div>
        </div>
    </div>;

    return (
        <FormPageLayout
            title="Update Profile"
            subtitle="Staff Management"
            description="Manage employee credentials, departmental assignments, and administrative privileges. Secure access control is central to Kwalee resort operations."
            backLink="/staff/users"
            illustration={illustration}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="text"
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                                value={staffData.first_name}
                                onChange={(e) => setStaffData({ ...staffData, first_name: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                        <input
                            required
                            type="text"
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={staffData.last_name}
                            onChange={(e) => setStaffData({ ...staffData, last_name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            required
                            type="email"
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                            value={staffData.email}
                            onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Role / Grade</label>
                        <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                                value={staffData.role}
                                onChange={(e) => setStaffData({ ...staffData, role: e.target.value })}
                            >
                                <option value="ADMIN">System Administrator</option>
                                <option value="FRONT_DESK">Front Desk / Reception</option>
                                <option value="WAITER">Waiter / Service</option>
                                <option value="KITCHEN">Kitchen Staff</option>
                                <option value="BAR">Bar Staff</option>
                                <option value="CASHIER">Cashier / Finance</option>
                                <option value="RECREATION">Recreation / Pool / Beach</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="tel"
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all"
                                value={staffData.phone}
                                onChange={(e) => setStaffData({ ...staffData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <button
                    disabled={saving}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {saving ? "Updating..." : <><Save size={20} /> Save Staff Profile</>}
                </button>
            </form>
        </FormPageLayout>
    );
}

