'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, Shield, Briefcase, Save, ArrowLeft, Key, Trash2, AlertTriangle } from 'lucide-react';
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
    const [resetPassword, setResetPassword] = useState('');
    const [resetting, setResetting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [staffData, setStaffData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: '',
        roles: [] as string[],
    });

    useEffect(() => {
        const fetchStaff = async () => {
            if (!token) return;
            try {
                const res = await fetch(`/api/core/users/${id}/`, {
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
                        roles: data.roles || [],
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
            const res = await fetch(`/api/core/users/${id}/`, {
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

    const handlePasswordReset = async () => {
        if (!resetPassword || resetPassword.length < 6) {
            showNotification("Password must be at least 6 characters.", "error");
            return;
        }

        setResetting(true);
        try {
            const res = await fetch(`/api/core/users/${id}/reset-password/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ new_password: resetPassword })
            });

            if (res.ok) {
                showNotification("Password reset successfully!", "success");
                setResetPassword('');
            } else {
                const data = await res.json().catch(() => ({}));
                showNotification(data.error || "Failed to reset password", "error");
            }
        } catch (e) {
            showNotification("Connection error", "error");
        } finally {
            setResetting(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(`Are you absolutely sure you want to delete ${staffData.first_name}'s account? This action cannot be undone.`);
        if (!confirmed) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/core/users/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                showNotification("Staff account deleted permanently.", "success");
                router.push('/staff/users');
            } else {
                showNotification("Failed to delete account", "error");
                setDeleting(false);
            }
        } catch (e) {
            showNotification("Connection error", "error");
            setDeleting(false);
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

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Professional Roles (Select all that apply)</label>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { id: 'ADMIN', label: 'Administrator' },
                            { id: 'FRONT_DESK', label: 'Front Desk' },
                            { id: 'WAITER', label: 'Waiter' },
                            { id: 'KITCHEN', label: 'Kitchen' },
                            { id: 'BAR', label: 'Bar' },
                            { id: 'CASHIER', label: 'Cashier' },
                            { id: 'RECREATION', label: 'Recreation' },
                        ].map((role) => (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => {
                                    const currentRoles = staffData.roles || [];
                                    const newRoles = currentRoles.includes(role.id)
                                        ? currentRoles.filter(r => r !== role.id)
                                        : [...currentRoles, role.id];
                                    setStaffData({ ...staffData, roles: newRoles, role: newRoles[0] || 'WAITER' });
                                }}
                                className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-2 text-left flex items-center justify-between ${staffData.roles?.includes(role.id)
                                    ? 'bg-gray-900 border-gray-900 text-white shadow-lg'
                                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                    }`}
                            >
                                <span className="mr-3">{role.label}</span>
                                {staffData.roles?.includes(role.id) && <Shield size={14} className="text-[var(--color-primary)] flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    disabled={saving}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
                >
                    {saving ? "Updating..." : <><Save size={20} /> Save Staff Profile</>}
                </button>
            </form>

            {/* DANGER ZONE */}
            <div className="mt-16 pt-12 border-t-2 border-dashed border-red-200">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle size={20} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-black text-red-500 uppercase tracking-widest">Danger Zone</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Reset Password */}
                    <div className="bg-red-50/50 p-6 rounded-[2rem] border border-red-100">
                        <h4 className="font-black text-gray-900 mb-2">Force Password Reset</h4>
                        <p className="text-xs text-gray-500 font-medium mb-6">Manually override the password for this staff member.</p>

                        <div className="space-y-4">
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-red-500 text-sm font-bold transition-all"
                                    value={resetPassword}
                                    onChange={(e) => setResetPassword(e.target.value)}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handlePasswordReset}
                                disabled={resetting || !resetPassword}
                                className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-200 transition-all disabled:opacity-50"
                            >
                                {resetting ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </div>

                    {/* Delete Account */}
                    <div className="bg-red-50/50 p-6 rounded-[2rem] border border-red-100 flex flex-col justify-between">
                        <div>
                            <h4 className="font-black text-gray-900 mb-2">Delete Account</h4>
                            <p className="text-xs text-gray-500 font-medium mb-6">Permanently remove this staff member from the system. This cannot be undone.</p>
                        </div>

                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="w-full py-4 bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200 disabled:opacity-50"
                        >
                            <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete Staff Account'}
                        </button>
                    </div>
                </div>
            </div>
        </FormPageLayout>
    );
}

