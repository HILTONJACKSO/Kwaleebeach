'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { DollarSign, Receipt, Clock, CheckCircle, Search, CreditCard, Banknote, RefreshCw, Package, Waves, Utensils, FileText, ArrowUpRight, Wallet, Smartphone, User, Save, ChevronLeft } from 'lucide-react';
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
    const [currentAmount, setCurrentAmount] = useState('');

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

    const totalPaid = invoice?.payments?.reduce((acc: number, p: any) => acc + parseFloat(p.amount), 0) || 0;
    const remainingBalance = invoice ? parseFloat(invoice.total_ft) - totalPaid : 0;

    // Set default amount to remaining balance when step changes or invoice loads
    useEffect(() => {
        if (invoice && remainingBalance > 0 && !currentAmount) {
            setCurrentAmount(remainingBalance.toFixed(2));
        }
    }, [invoice, step]);

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
        if (!currentAmount || parseFloat(currentAmount) <= 0) {
            showNotification("Please enter a valid amount", "error");
            return;
        }

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
                    amount: currentAmount
                })
            });

            if (res.ok) {
                const data = await res.json();
                showNotification(`Payment of $${currentAmount} processed!`, 'success');
                setCurrentAmount('');
                fetchData();
                if (data.is_paid) {
                    router.push('/staff/cashier');
                }
            } else {
                const err = await res.json();
                showNotification(err.error || "Payment failed", "error");
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
            backLink="/staff/cashier"
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

                {/* Service Pending Warning */}
                {!invoice.is_service_ready && (
                    <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl flex items-start gap-4 animate-pulse">
                        <div className="bg-amber-200 p-3 rounded-2xl text-amber-700">
                            <Utensils size={24} />
                        </div>
                        <div>
                            <h4 className="text-amber-800 font-black uppercase tracking-widest text-[10px] mb-1">Service Pending</h4>
                            <p className="text-amber-700 text-sm font-bold">This invoice contains food or drinks that have not been served yet. Payment and invoicing are restricted until all items are marked as SERVED.</p>
                        </div>
                    </div>
                )}

                {step === 'REVIEW' ? (
                    // ... (rest of review step remains same)
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
                    <form onSubmit={handlePayment} className="space-y-8 animate-in slide-in-from-right duration-300">
                        {/* Split Payment Progress */}
                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl relative overflow-hidden">
                            <div className="relative z-10 flex justify-between items-end">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Remaining Balance</p>
                                    <h4 className="text-2xl font-black text-emerald-900">${remainingBalance.toFixed(2)}</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Total Paid</p>
                                    <p className="text-sm font-bold text-emerald-900">${totalPaid.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="mt-4 h-2 bg-white/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${(totalPaid / parseFloat(invoice.total_ft)) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Payment History */}
                        {invoice.payments?.length > 0 && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Payment History</label>
                                <div className="space-y-2">
                                    {invoice.payments.map((p: any) => (
                                        <div key={p.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                                                    {p.mode === 'CASH' ? <Banknote size={16} /> : <Smartphone size={16} />}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-900 uppercase">{p.mode.replace('_', ' ')}</p>
                                                    <p className="text-[8px] text-gray-400 font-medium">{new Date(p.date_paid).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-black text-gray-900">${parseFloat(p.amount).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {remainingBalance > 0 ? (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Amount to Pay</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={currentAmount}
                                            onChange={(e) => setCurrentAmount(e.target.value)}
                                            className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-3xl text-2xl font-black text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                                            placeholder="0.00"
                                            max={remainingBalance}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Payment Method</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('CASH')}
                                            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'CASH'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                                                : 'border-gray-50 bg-white text-gray-400 hover:border-gray-100'}`}
                                        >
                                            <Banknote size={24} />
                                            <span className="text-xs font-black uppercase tracking-widest">Cash</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('VISA')}
                                            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'VISA'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                                                : 'border-gray-50 bg-white text-gray-400 hover:border-gray-100'}`}
                                        >
                                            <CreditCard size={24} />
                                            <span className="text-xs font-black uppercase tracking-widest">Visa/Card</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('MOMO_LONESTAR')}
                                            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'MOMO_LONESTAR'
                                                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                                : 'border-gray-50 bg-white text-gray-400 hover:border-gray-100'}`}
                                        >
                                            <Smartphone size={24} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-center">Momo Lonestar</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('MOMO_ORANGE')}
                                            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'MOMO_ORANGE'
                                                ? 'border-orange-600 bg-orange-50 text-orange-700'
                                                : 'border-gray-50 bg-white text-gray-400 hover:border-gray-100'}`}
                                        >
                                            <Smartphone size={24} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-center">Momo Orange</span>
                                        </button>
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
                                        disabled={loading || !invoice.is_service_ready}
                                        type="submit"
                                        className="flex-1 bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {loading ? "Processing..." : (
                                            invoice.is_service_ready ? <><Save size={20} /> Authorize ${currentAmount}</> : "Service Pending"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-500 p-8 rounded-[2rem] text-white flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                    <CheckCircle size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-widest">Fully Paid</h3>
                                    <p className="text-emerald-100 text-sm font-medium mt-1">This invoice has been settled in full. You can now return to the dashboard.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.push('/staff/cashier')}
                                    className="mt-4 px-10 py-4 bg-white text-emerald-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-50 transition-all"
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        )}
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
