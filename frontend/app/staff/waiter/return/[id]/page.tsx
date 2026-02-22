'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { RefreshCw, MessageSquare, Save, Hash } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

export default function WaiterReturnPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id;
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            showNotification("Please provide a reason for the return", "error");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/inventory/orders/${orderId}/request-return/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ reason })
            });

            if (res.ok) {
                showNotification(`Return request for Order #${orderId} submitted!`, 'success');
                router.push('/staff/waiter');
            } else {
                showNotification("Failed to submit return request", "error");
            }
        } catch (e) {
            showNotification("Connection error", "error");
        } finally {
            setLoading(false);
        }
    };

    const illustration = (
        <div className="absolute inset-x-0 bottom-0 top-1/2 overflow-hidden pointer-events-none opacity-80">
            <img
                src="/illustrations/return_order_illustration_1770392140452.png"
                alt="Return Illustration"
                className="w-full h-full object-cover"
            />
        </div>
    );

    return (
        <FormPageLayout
            title={`Return Order #${orderId}`}
            subtitle="Request Reversal"
            description="Initiate a formal return request for this order. Please provide a clear reason to ensure quick approval from the Kitchen/Bar and Management."
            backLink="/staff/waiter"
            illustration={illustration}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center gap-4 mb-6">
                    <div className="bg-orange-500 text-white p-3 rounded-xl">
                        <Hash size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">Order ID</div>
                        <div className="text-xl font-black text-gray-900">{orderId}</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Reason for Return</label>
                    <div className="relative">
                        <MessageSquare className="absolute left-4 top-6 text-gray-400" size={18} />
                        <textarea
                            required
                            rows={4}
                            placeholder="e.g. Guest changed mind, incorrect preparation, etc..."
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all resize-none"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">
                        <span className="font-black text-gray-900 uppercase tracking-widest mr-2 underline">Note:</span>
                        This request will be sent to the preparation station (Kitchen/Bar) and the management portal for final authorization.
                    </p>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.1em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? "Submitting Request..." : <><RefreshCw size={20} /> Request Return</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
