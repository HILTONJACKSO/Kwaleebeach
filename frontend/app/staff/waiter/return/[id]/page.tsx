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
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [order, setOrder] = useState<any>(null);
    const [reason, setReason] = useState('');
    const [selectedItems, setSelectedItems] = useState<{ [key: number]: number }>({});
    const [availableItems, setAvailableItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/inventory/orders/${orderId}/`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                    // Filter out already returned items or calculate remaining
                    setAvailableItems(data.items);
                } else {
                    showNotification("Failed to fetch order details", "error");
                    router.push('/staff/waiter');
                }
            } catch (e) {
                showNotification("Connection error", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const toggleItem = (itemId: number, maxQty: number) => {
        setSelectedItems(prev => {
            if (prev[itemId]) {
                const newItems = { ...prev };
                delete newItems[itemId];
                return newItems;
            }
            return { ...prev, [itemId]: maxQty };
        });
    };

    const updateQty = (itemId: number, qty: number, maxQty: number) => {
        if (qty < 1 || qty > maxQty) return;
        setSelectedItems(prev => ({ ...prev, [itemId]: qty }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const returnItems = Object.entries(selectedItems).map(([id, qty]) => ({
            order_item_id: parseInt(id),
            quantity: qty
        }));

        if (returnItems.length === 0) {
            showNotification("Please select at least one item to return", "error");
            return;
        }

        if (!reason.trim()) {
            showNotification("Please provide a reason for the return", "error");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/inventory/orders/${orderId}/request-return/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({
                    reason,
                    items: returnItems
                })
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
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <RefreshCw className="animate-spin text-gray-400" size={48} />
        </div>
    );

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
            subtitle="Partial Return Request"
            description="Select the specific items the guest wants to return. This will be sent to the Kitchen/Bar and Management for approval."
            backLink="/staff/waiter"
            illustration={illustration}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center gap-4 mb-6">
                    <div className="bg-orange-500 text-white p-3 rounded-xl">
                        <Hash size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-orange-600">Order ID</div>
                        <div className="text-xl font-black text-gray-900">{orderId}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Items to Return</label>
                    <div className="space-y-3">
                        {availableItems.map(item => (
                            <div key={item.id} className={`p-4 rounded-2xl border transition-all ${selectedItems[item.id] ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        checked={!!selectedItems[item.id]}
                                        onChange={() => toggleItem(item.id, item.quantity)}
                                        className="w-5 h-5 rounded-lg border-2 border-gray-300 text-orange-500 focus:ring-orange-500"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-gray-900">{item.menu_item_name}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ordered: {item.quantity} units</div>
                                    </div>
                                    {selectedItems[item.id] && (
                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-orange-100 shadow-sm">
                                            <button
                                                type="button"
                                                onClick={() => updateQty(item.id, selectedItems[item.id] - 1, item.quantity)}
                                                className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-xs font-black text-gray-900 w-4 text-center">{selectedItems[item.id]}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQty(item.id, selectedItems[item.id] + 1, item.quantity)}
                                                className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Reason for Return</label>
                    <div className="relative">
                        <MessageSquare className="absolute left-4 top-6 text-gray-400" size={18} />
                        <textarea
                            required
                            rows={3}
                            placeholder="e.g. Guest changed mind, incorrect preparation, etc..."
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 text-sm font-bold transition-all resize-none shadow-sm"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    disabled={submitting}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.1em] text-sm hover:bg-orange-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {submitting ? "Submitting Request..." : <><RefreshCw size={20} /> Submit Return Request</>}
                </button>
            </form>
        </FormPageLayout>
    );
}

import { Plus, Minus } from 'lucide-react';
