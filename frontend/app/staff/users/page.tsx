'use client';
import { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, Mail, Phone, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';

export default function UsersPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <UsersPageContent />
        </ProtectedRoute>
    );
}

function UsersPageContent() {
    const { showNotification } = useUI();
    const { token } = useAuth();
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/core/users/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setStaff(data);
            } else {
                showNotification(`List error ${res.status}: ${res.statusText}`, "error");
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            showNotification("Connection error when fetching staff", "error");
        } finally {
            setLoading(false);
        }
    };

    // Ensure the dependency array is consistent. Token is the only dependency.
    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    const getStatusColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-50 text-purple-600';
            case 'FRONT_DESK': return 'bg-blue-50 text-blue-600';
            case 'WAITER': return 'bg-emerald-50 text-emerald-600';
            case 'KITCHEN': return 'bg-orange-50 text-orange-600';
            case 'BAR': return 'bg-indigo-50 text-indigo-600';
            default: return 'bg-gray-50 text-gray-400';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Staff Management</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Monitor team presence and manage access permissions.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={fetchUsers}
                        className="bg-white border border-gray-200 text-gray-600 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all"
                    >
                        Refresh List
                    </button>
                    <Link
                        href="/staff/users/add"
                        className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[var(--color-primary)] transition-all"
                    >
                        <Plus size={18} /> Add New Staff
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {staff.map(person => (
                        <Link
                            key={person.id}
                            href={`/staff/users/edit/${person.id}`}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-500 cursor-pointer"
                        >
                            <div className="w-24 h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-6 relative group-hover:bg-[var(--color-primary)]/10 transition-colors">
                                <UserIcon size={40} className="text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center border border-gray-100">
                                    <ShieldCheck size={16} className="text-emerald-500" />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-gray-900">{person.first_name} {person.last_name}</h3>
                            <p className="text-[var(--color-primary)] text-[10px] font-black uppercase tracking-[0.2em] mb-6">{person.role}</p>

                            <div className="w-full flex justify-center gap-3 mb-8">
                                <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
                                    <Mail size={18} />
                                </div>
                                <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
                                    <Phone size={18} />
                                </div>
                            </div>

                            <div className="w-full pt-6 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">@{person.username}</span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(person.role)}`}>
                                    {person.role}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
