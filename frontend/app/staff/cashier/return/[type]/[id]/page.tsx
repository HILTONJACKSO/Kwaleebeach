'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { RefreshCw, MessageSquare, Save, Package, Ticket } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

export default function CashierReturnPage() {
    const router = useRouter();
    const params = useParams();
    const { type, id } = params;
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [selectedItems, setSelectedItems] = useState<Record<number, number>>({}); // id -> qty
    const [approver, setApprover] = useState({ name: '', department: '' });

    useEffect(() => {
        if (type === 'order') {
            fetch(`/api/inventory/orders/${id}/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}` }
            })
                .then(res => res.json())
                .then(data => setOrder(data));
        }
    }, [id, type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (type === 'order' && Object.keys(selectedItems).length === 0) {
            showNotification("Please select at least one item to return", "error");
            return;
        }

        setLoading(true);
        try {
            const url = type === 'order'
                ? `/api/inventory/orders/${id}/request-return/`
                : `/api/recreation/passes/${id}/request-return/`;

            const payload: any = { reason };
            if (type === 'order') {
                payload.items = Object.entries(selectedItems).map(([order_item_id, quantity]) => ({
                    order_item_id: parseInt(order_item_id),
                    quantity
                }));
                payload.approver_name = approver.name;
                payload.approver_department = approver.department;
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showNotification(`${type === 'order' ? 'Order' : 'Pass'} return request submitted!`, 'success');
                router.push('/staff/cashier');
            } else {
                const err = await res.json();
                showNotification(err.error || "Submission failed", "error");
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
                src="/illustrations/cashier_return_illustration_1770392317867.png"
                alt="Return Illustration"
                className="w-full h-full object-cover"
            />
        </div>
    );

    return (
        <FormPageLayout
            title={`Request ${type === 'order' ? 'Order' : 'Pass'} Return`}
            subtitle="Financial Reversal"
            description={`Initiate a formal return and credit request for ${type === 'order' ? 'Order' : 'Pass'} #${id}. This ensures accurate guest billing and departmental stock reconciliation.`}
            backLink="/staff/cashier"
            illustration={illustration}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-orange-500">
                        {type === 'order' ? <Package size={24} /> : <Ticket size={24} />}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">Reference ID</p>
                        <p className="text-xl font-black text-gray-900">#{id}</p>
                    </div>
                </div>

                {type === 'order' && order && (
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Items to Return</label>
                        <div className="space-y-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedItems[item.id]}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedItems(prev => ({ ...prev, [item.id]: item.quantity }));
                                                } else {
                                                    const newItems = { ...selectedItems };
                                                    delete newItems[item.id];
                                                    setSelectedItems(newItems);
                                                }
                                            }}
                                            className="w-5 h-5 rounded-lg text-orange-500 focus:ring-orange-500 border-gray-200"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{item.menu_item_name}</p>
                                            <p className="text-[10px] text-gray-400">Station: {item.preparation_station}</p>
                                        </div>
                                    </div>
                                    {selectedItems[item.id] !== undefined && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                max={item.quantity}
                                                value={selectedItems[item.id]}
                                                onChange={(e) => setSelectedItems(prev => ({ ...prev, [item.id]: parseInt(e.target.value) }))}
                                                className="w-16 px-3 py-1 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                            <span className="text-[10px] text-gray-400 font-bold">/ {item.quantity}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Approver Name</label>
                        <input
                            type="text"
                            placeholder="Staff Name..."
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 text-sm font-bold transition-all"
                            value={approver.name}
                            onChange={(e) => setApprover(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Approver Department</label>
                        <input
                            type="text"
                            placeholder="e.g. Kitchen, Admin..."
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 text-sm font-bold transition-all"
                            value={approver.department}
                            onChange={(e) => setApprover(prev => ({ ...prev, department: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cancellation Reason</label>
                    <div className="relative">
                        <MessageSquare className="absolute left-4 top-6 text-gray-400" size={18} />
                        <textarea
                            required
                            rows={4}
                            placeholder="State the reason clearly for audit purposes..."
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold transition-all resize-none"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 bg-gray-900 rounded-[2rem] text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Audit Protocol Alpha</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                        All reversals are logged with the authorizing staff credentials and require station-head verification before final payout.
                    </p>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.1em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? "Processing..." : <><RefreshCw size={20} /> Authorize Reversal</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
