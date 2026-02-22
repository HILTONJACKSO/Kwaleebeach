'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { Mail, Lock, LogIn, ShieldCheck, ArrowRight, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showNotification } = useUI();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/core/auth/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                login(data.access, data.user);
                showNotification(`Welcome back, ${data.user.first_name}!`, "info");

                // Role-based redirection
                const roleRedirects: Record<string, string> = {
                    'ADMIN': '/staff/dashboard',
                    'FRONT_DESK': '/staff/rooms',
                    'WAITER': '/staff/waiter',
                    'KITCHEN': '/staff/kitchen',
                    'BAR': '/staff/bar',
                    'CASHIER': '/staff/cashier',
                    'RECREATION': '/staff/pool',
                };

                router.push(roleRedirects[data.user.role] || '/staff/rooms');
            } else {
                const errorData = await response.json();
                showNotification(errorData.detail || "Authentication failed. Please check your credentials.", "error");
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification("Could not connect to the authentication server.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden bg-white shadow-2xl shadow-gray-200 border border-gray-100">

                {/* Form Side */}
                <div className="p-10 md:p-20 flex flex-col justify-center">
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                                <ShieldCheck className="text-[var(--color-primary)]" size={28} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">KWALEE <span className="text-[var(--color-primary)]">HMS</span></h1>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Staff Portal</h2>
                        <div className="h-1.5 w-20 bg-[var(--color-primary)] rounded-full mb-6"></div>
                        <p className="text-gray-500 font-medium">Please enter your credentials to access the resort management protocol.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Username</label>
                            <input
                                required
                                type="text"
                                placeholder="admin"
                                className="w-full px-6 py-5 bg-white border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Secure Password</label>
                            <div className="relative">
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full px-6 py-5 bg-white border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all pr-14"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                                <span className="text-xs font-bold text-gray-500">Remember session</span>
                            </label>
                            <button type="button" className="text-xs font-bold text-[var(--color-primary)] hover:underline">Forgot access?</button>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-gray-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50 group"
                        >
                            {loading ? "Authenticating..." : (
                                <>
                                    Authorize Access
                                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-12 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Secure Cloud Ready</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Protocol v2.4.0</p>
                    </div>
                </div>

                {/* Illustration Side */}
                <div className="hidden lg:flex bg-gray-900 relative flex-col justify-between p-20 text-white">
                    <div className="z-10 relative">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-8">
                            <ShieldAlert size={14} className="text-orange-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Restricted Access Area</span>
                        </div>
                        <h2 className="text-5xl font-black mb-8 leading-[1.1] tracking-tight">Managing Excellence Beyond Boundaries</h2>
                        <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-sm">
                            KWALEE HMS provides the core infrastructure for advanced resort logistics and guest management.
                        </p>
                    </div>

                    <div className="z-10 relative">
                        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <div className="text-sm font-black uppercase tracking-widest">End-to-End Encryption</div>
                                    <div className="text-xs font-medium text-gray-400">Military grade security protocols active</div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed italic">
                                "Our commitment to security ensures that every transaction and guest detail is protected by the highest standards in the industry."
                            </p>
                        </div>
                    </div>

                    {/* Background Illustration Container */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                        <img
                            src="/illustrations/payment_illustration_1770391876407.png"
                            alt="Security Illustration"
                            className="w-full h-full object-cover grayscale brightness-50"
                        />
                    </div>

                    {/* Decorative Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--color-primary-rgb),0.2),transparent)] pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
}
