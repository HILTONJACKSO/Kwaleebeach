'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { ArrowLeftRight, Package, User, Hash, Move } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

const DEPARTMENTS = [
    { id: 'MAIN', name: 'Main Stock' },
    { id: 'POOL', name: 'Pool' },
    { id: 'BAR', name: 'Bar' },
    { id: 'BEACH_BAR', name: 'Beach Bar' },
    { id: 'KITCHEN', name: 'Kitchen' },
    { id: 'LAUNDRY', name: 'Laundry' },
    { id: 'OFFICE', name: 'Office' },
];

export default function TransferInventoryPage() {
    const router = useRouter();
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<any[]>([]);

    const [transferData, setTransferData] = useState({
        item: '',
        from_dept: 'MAIN',
        to_dept: 'BAR',
        quantity: '',
        performed_by: '',
    });

    useEffect(() => {
        setLoading(true);
        fetch('/api/inventory/items/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setItems(Array.isArray(data) ? data : []);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferData.item) {
            showNotification("Please select an item", "error");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/inventory/transfers/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify(transferData)
            });

            if (res.ok) {
                showNotification("Stock transferred successfully!", "success");
                router.push('/staff/inventory');
            } else {
                const errorData = await res.json();
                const errorMessage = typeof errorData === 'object'
                    ? Object.entries(errorData).map(([key, val]) => `${key}: ${val}`).join(', ')
                    : "Transfer failed";
                showNotification(errorMessage, "error");
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
                src="/illustrations/logistics_transfer_illustration_1770391964409.png"
                alt="Transfer Illustration"
                className="w-full h-full object-cover"
            />
        </div>
    );

    return (
        <FormPageLayout
            title="Internal Stock Transfer"
            subtitle="Departmental Logistics"
            description="Securely move stock items between departments. This ensures accurate tracking and departmental accountability for all resort resources."
            backLink="/staff/inventory"
            illustration={illustration}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Item</label>
                    <div className="relative">
                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            required
                            className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                            value={transferData.item}
                            onChange={(e) => setTransferData({ ...transferData, item: e.target.value })}
                        >
                            <option value="">Choose an item...</option>
                            {items.map(item => (
                                <option key={item.id} value={item.id}>{item.name} (SKU: {item.sku})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Source Department</label>
                        <select
                            className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                            value={transferData.from_dept}
                            onChange={(e) => setTransferData({ ...transferData, from_dept: e.target.value })}
                        >
                            {DEPARTMENTS.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2 text-center flex flex-col justify-center">
                        <div className="flex items-center justify-center">
                            <ArrowLeftRight className="text-[var(--color-primary)]" size={24} />
                        </div>
                    </div>
                    <div className="space-y-2 col-start-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Destination</label>
                        <select
                            className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                            value={transferData.to_dept}
                            onChange={(e) => setTransferData({ ...transferData, to_dept: e.target.value })}
                        >
                            {DEPARTMENTS.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Quantity</label>
                        <div className="relative">
                            <Move className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                                value={transferData.quantity}
                                onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Authorized By</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="text"
                                placeholder="Staff Name"
                                className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-bold text-black transition-all"
                                value={transferData.performed_by}
                                onChange={(e) => setTransferData({ ...transferData, performed_by: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? "Processing Transfer..." : <><ArrowLeftRight size={20} /> Authorize Transfer</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
