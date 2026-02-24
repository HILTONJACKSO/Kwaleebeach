'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { DollarSign, CreditCard, Banknote, User, Save, Hash } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

export default function CashierPaymentPage() {
    const router = useRouter();
    const params = useParams();
    const invoiceId = params.id;
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    useEffect(() => {
        fetch(`/api/finance/invoices/${invoiceId}/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
            }
        })
            .then(res => res.json())
            .then(data => setInvoice(data))
            .catch(err => console.error(err));
    }, [invoiceId]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/finance/invoices/${invoiceId}/pay/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({
                    mode: paymentMethod,
                    amount: invoice.total_ft
                })
            });

            if (res.ok) {
                showNotification(`Payment of $${invoice?.total_ft} processed successfully!`, 'success');
                router.push('/staff/cashier');
            } else {
                showNotification("Payment failed", "error");
            }
        } catch (e) {
            showNotification("Connection error", "error");
        } finally {
            setLoading(false);
        }
    };

    const illustration = (
        <div className="absolute inset-0 flex items-end justify-center">
            <img
                src="/illustrations/payment_illustration_1770391876407.png"
                alt="Payment Illustration"
                className="w-full h-full object-cover"
            />
        </div>
    );

    if (!invoice) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    );

    return (
        <FormPageLayout
            title={`Process Payment`}
            subtitle="Financial Reconciliation"
            description="Process guest payments securely. Select the payment method and confirm the transaction to settle the invoice balance in real-time."
            backLink="/staff/cashier"
            illustration={illustration}
        >
            <form onSubmit={handlePayment} className="space-y-6">
                <div className="bg-gray-900 p-8 rounded-[2rem] text-white shadow-xl shadow-gray-200 mb-8 relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Outstanding</p>
                            <h2 className="text-4xl font-black">${invoice.total_ft}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Invoice</p>
                            <p className="text-sm font-bold">#{invoice.invoice_number}</p>
                        </div>
                    </div>
                    {/* Decorative card pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Payment Method</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('CASH')}
                            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'CASH'
                                ? 'border-[var(--color-primary)] bg-orange-50 text-[var(--color-primary)]'
                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                        >
                            <Banknote size={24} />
                            <span className="text-xs font-black uppercase tracking-widest">Cash</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('CARD')}
                            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'CARD'
                                ? 'border-[var(--color-primary)] bg-orange-50 text-[var(--color-primary)]'
                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                        >
                            <CreditCard size={24} />
                            <span className="text-xs font-black uppercase tracking-widest">Card</span>
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Guest / Booking</p>
                        <p className="text-sm font-bold text-gray-900">{invoice.booking_details?.guest_name || 'Guest'}</p>
                    </div>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? "Processing..." : <><Save size={20} /> Authorize Payment</>}
                </button>
            </form>
        </FormPageLayout>
    );
}
