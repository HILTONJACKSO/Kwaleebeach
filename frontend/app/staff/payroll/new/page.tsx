'use client';
import { useState } from 'react';
import { ArrowLeft, Save, Banknote } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function NewVoucherPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <NewVoucherContent />
        </ProtectedRoute>
    );
}

function NewVoucherContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        voucher_number: `VCH-${Math.floor(Math.random() * 100000)}`,
        main_account: 'EXPENSE',
        voucher_type: '',
        payee: '',
        description: '',
        total_amount: '',
    });

    const ACCOUNT_CATEGORIES: Record<string, { label: string, types: { value: string, label: string }[] }> = {
        OTHER_REVENUE: {
            label: 'Other Income Revenue',
            types: [
                { value: 'OTHER_REV_RECEPTION', label: 'Other revenue reception' },
                { value: 'OTHER_REV_FOOD', label: 'Other revenue food' },
                { value: 'OTHER_REV_DRINK', label: 'Other revenue drink' },
                { value: 'OTHER_REV_ROOM', label: 'Other revenue room' },
                { value: 'OTHER_REV_BOUTIQUE', label: 'Other revenue boutique' },
                { value: 'OTHER_REV_PACKAGE', label: 'Other revenue package/event' },
            ]
        },
        PURCHASES: {
            label: 'Purchases',
            types: [
                { value: 'PURCHASE_FOOD', label: 'Local purchases food' },
                { value: 'PURCHASE_DRINKS', label: 'Local purchases drinks' },
                { value: 'PURCHASE_BOUTIQUE', label: 'Local purchases boutique' },
                { value: 'PURCHASE_OTHER', label: 'Local purchases Other' },
            ]
        },
        EXPENSE: {
            label: 'Expense',
            types: [
                { value: 'MARKETING', label: 'Marketing' },
                { value: 'SELLING_EXPENSES', label: 'Selling expenses' },
                { value: 'COMMISSION', label: 'Commission' },
                { value: 'EMPLOYEE_BENEFITS', label: 'Employee benefits programs/nasscor' },
                { value: 'FREIGHT', label: 'Freight' },
                { value: 'INSURANCE', label: 'Insurance' },
                { value: 'LAUNDRY_CLEANING', label: 'Laundry and cleaning service' },
                { value: 'LEGAL_PROFESSIONAL', label: 'Legal and professional services' },
                { value: 'POSTAGE', label: 'Postage' },
                { value: 'REPAIRS', label: 'Repairs' },
                { value: 'SUPPLIES_KITCHEN', label: 'Supplies kitchen' },
                { value: 'SUPPLIES_FUEL', label: 'Supplies fuel generator' },
                { value: 'SUPPLIES_OFFICE', label: 'Supply office' },
                { value: 'SUPPLIES_GAS', label: 'Supplies gas' },
                { value: 'SUPPLIES_STAFF_FOOD', label: 'Supplies staff food' },
                { value: 'SUPPLIES_RESTAURANTS', label: 'Supplies restaurants' },
                { value: 'SUPPLIES_ROOM', label: 'Supplies room' },
                { value: 'SUPPLIES_OTHER', label: 'Supplies other' },
                { value: 'TAX_WITHHOLDING', label: 'Taxes withholding Tax' },
                { value: 'TAX_DUTY', label: 'Taxes duty' },
                { value: 'TAX_OTHER', label: 'Taxes other' },
                { value: 'TAX_WITHHOLDING_RENT', label: 'Taxes withholding on rent' },
                { value: 'TAX_PAID_2_PERCENT', label: 'Taxes paid 2% tax' },
                { value: 'TAX_WITHHELD_2_PERCENT', label: 'Taxes withheld 2% tax' },
                { value: 'TAX_GST', label: 'Taxes GST' },
                { value: 'TELEPHONE_INTERNET', label: 'Telephone / Internet' },
                { value: 'TRAVEL_ENT', label: 'Travel & Entertainment' },
                { value: 'UTILITIES', label: 'Utilities' },
                { value: 'WAGES_DAILY', label: 'Wages - Daily hire' },
                { value: 'WAGES_BONUS', label: 'Wages - bonus' },
                { value: 'LOCAL_TRANS', label: 'Local transportation' },
                { value: 'EXPENSE_MISC', label: 'Expenses general misc. Expense' },
            ]
        },
        ASSETS: {
            label: 'Assets',
            types: [
                { value: 'CONSTRUCTION', label: 'Construction' },
                { value: 'RENOVATION', label: 'Renovation' },
            ]
        },
        LIABILITY: {
            label: 'Liability',
            types: [
                { value: 'ACCOUNTS_PAYABLE', label: 'Accounts payable' },
                { value: 'SALES_TAX_PAYABLE', label: 'Sales Tax Payable' },
            ]
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/finance/vouchers/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('yarvo_token')}`
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/staff/payroll');
            } else {
                const data = await res.json();
                console.error("Error creating voucher:", data);
                alert("Failed to create voucher. Check console for details.");
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link href="/staff/payroll" className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-gray-500">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        New Voucher <Banknote className="text-gray-400" size={28} />
                    </h1>
                    <p className="text-gray-500 font-medium">Create a new expense or journal voucher.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Voucher Number</label>
                        <input
                            type="text"
                            required
                            value={formData.voucher_number}
                            onChange={(e) => setFormData({ ...formData, voucher_number: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Main Account</label>
                        <select
                            required
                            value={formData.main_account}
                            onChange={(e) => {
                                const newAccount = e.target.value;
                                setFormData({
                                    ...formData,
                                    main_account: newAccount,
                                    voucher_type: ACCOUNT_CATEGORIES[newAccount].types[0]?.value || ''
                                });
                            }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                        >
                            {Object.entries(ACCOUNT_CATEGORIES).map(([key, cat]) => (
                                <option key={key} value={key}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Voucher Type / Sub Account</label>
                        <select
                            required
                            value={formData.voucher_type}
                            onChange={(e) => setFormData({ ...formData, voucher_type: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                        >
                            {!formData.voucher_type && <option value="">Select a sub-account...</option>}
                            {ACCOUNT_CATEGORIES[formData.main_account]?.types.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Payee</label>
                        <input
                            type="text"
                            required
                            value={formData.payee}
                            onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                            placeholder="e.g. John Doe, Supplier Inc."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.total_amount}
                            onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all resize-none"
                        placeholder="Details about this voucher..."
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Save Voucher
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
