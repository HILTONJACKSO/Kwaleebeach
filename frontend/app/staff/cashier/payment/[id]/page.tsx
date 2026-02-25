'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { DollarSign, CreditCard, Banknote, User, Save, Hash, ArrowUpRight } from 'lucide-react';
import FormPageLayout from '@/components/FormPageLayout';

export default function CashierPaymentPage() {
    const router = useRouter();
    const params = useParams();
    const invoiceId = params.id;
    const { showNotification } = useUI();
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [step, setStep] = useState<'REVIEW' | 'PAYMENT'>('REVIEW');
    const [discountForm, setDiscountForm] = useState({
        type: 'FIXED',
        amount: '',
        reason: ''
    });

    const fetchData = () => {
        fetch(`/api/finance/invoices/${invoiceId}/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
            }
        })
            .then(res => res.json())
            .then(data => setInvoice(data))
            .catch(err => console.error(err));
    }

    useEffect(() => {
        fetchData();
    }, [invoiceId]);

    const handleApplyDiscount = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/finance/invoices/${invoiceId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify({
                    discount_type: discountForm.type,
                    discount_amount: discountForm.amount,
                    discount_reason: discountForm.reason
                })
            });

            if (res.ok) {
                showNotification("Discount applied successfully", "success");
                setShowDiscountModal(false);
                fetchData();
            } else {
                showNotification("Failed to apply discount", "error");
            }
        } catch (e) {
            showNotification("Error applying discount", "error");
        } finally {
            setLoading(false);
        }
    };

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
            title={step === 'REVIEW' ? 'Review & Discount' : 'Select Payment Method'}
            subtitle="Financial Reconciliation"
            description={step === 'REVIEW' ? "Review the invoice items and apply any necessary discounts before proceeding to payment." : "Select the guest's preferred payment method and authorize the transaction."}
            backLink={step === 'PAYMENT' ? undefined : "/staff/cashier"}
            illustration={illustration}
        >
            <div className="space-y-6">
                <div className="bg-gray-900 p-8 rounded-[2rem] text-white shadow-xl shadow-gray-200 mb-8 relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Outstanding</p>
                            <h2 className="text-4xl font-black">${invoice.total_ft}</h2>
                            {invoice.discount_amount > 0 && (
                                <p className="text-[10px] text-emerald-400 font-bold mt-1">
                                    Includes discount: {invoice.discount_reason || 'General'}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Invoice</p>
                            <p className="text-sm font-bold">#{invoice.invoice_number}</p>
                            {step === 'REVIEW' && (
                                <button
                                    onClick={() => setShowDiscountModal(true)}
                                    className="mt-4 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Apply Discount
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Decorative card pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>
                </div>

                {step === 'REVIEW' ? (
                    <div className="space-y-6">
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Items in Invoice</label>
                            <div className="space-y-3">
                                {invoice.items?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div className="text-sm font-bold text-gray-900">{item.description} <span className="text-gray-400 ml-1">x{item.quantity}</span></div>
                                        <div className="text-sm font-black text-gray-400">${item.unit_price}</div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-900">Subtotal</div>
                                    <div className="text-sm font-black text-gray-900">${invoice.total_ht}</div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('PAYMENT')}
                            className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3"
                        >
                            Proceed to Payment <ArrowUpRight size={20} />
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handlePayment} className="space-y-6 animate-in slide-in-from-right duration-300">
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
                                    onClick={() => setPaymentMethod('VISA')}
                                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'VISA'
                                        ? 'border-[var(--color-primary)] bg-orange-50 text-[var(--color-primary)]'
                                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                                >
                                    <CreditCard size={24} />
                                    <span className="text-xs font-black uppercase tracking-widest">Visa/Card</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Guest / Booking</p>
                                <p className="text-sm font-bold text-gray-900">{invoice.guest_name || 'Guest'}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep('REVIEW')}
                                className="px-8 bg-gray-100 text-gray-500 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                            >
                                Back
                            </button>
                            <button
                                disabled={loading}
                                type="submit"
                                className="flex-1 bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? "Processing..." : <><Save size={20} /> Authorize Payment</>}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Discount Modal */}
            {showDiscountModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-gray-900 px-10 py-8 text-white">
                            <h3 className="text-xl font-black uppercase tracking-tight italic">Apply Discount</h3>
                            <p className="text-gray-400 text-xs font-medium mt-1 uppercase tracking-widest">Adjust final billing amount</p>
                        </div>
                        <div className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setDiscountForm({ ...discountForm, type: 'PERCENT' })}
                                    className={`py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${discountForm.type === 'PERCENT' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 bg-white text-gray-400'}`}
                                >
                                    Percentage (%)
                                </button>
                                <button
                                    onClick={() => setDiscountForm({ ...discountForm, type: 'FIXED' })}
                                    className={`py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${discountForm.type === 'FIXED' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 bg-white text-gray-400'}`}
                                >
                                    Fixed ($)
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Discount Amount</label>
                                <input
                                    type="number"
                                    placeholder={discountForm.type === 'PERCENT' ? 'e.g. 10 for 10%' : 'e.g. 5.00'}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={discountForm.amount}
                                    onChange={(e) => setDiscountForm({ ...discountForm, amount: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reason</label>
                                <textarea
                                    placeholder="Brief explanation for this discount..."
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all h-24 resize-none"
                                    value={discountForm.reason}
                                    onChange={(e) => setDiscountForm({ ...discountForm, reason: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowDiscountModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApplyDiscount}
                                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </FormPageLayout>
    );
}
