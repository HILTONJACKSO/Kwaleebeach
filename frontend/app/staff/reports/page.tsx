'use client';
import { Download, FileText, Calendar, Filter, FileSpreadsheet } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ReportsPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <ReportsContent />
        </ProtectedRoute>
    );
}

function ReportsContent() {
    const reportTypes = [
        { id: 'daily-revenue', name: 'Daily Revenue Summary', desc: 'End of day financial breakdown' },
        { id: 'inventory-levels', name: 'Inventory Thresholds', desc: 'Current stock vs minimum bounds' },
        { id: 'occupancy', name: 'Weekly Occupancy', desc: 'Room utilization metrics' },
        { id: 'payroll', name: 'Monthly Payroll', desc: 'Salary and Expense voucher summaries' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        System Reports <FileText className="text-gray-400" size={32} />
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight text-sm">Generate and export official documentation and data summaries.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                    <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white rounded-2xl border-2 border-gray-100 text-xs font-black uppercase tracking-widest text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
                        <Calendar size={18} /> Date Range
                    </button>
                    <button className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl shadow-lg shadow-gray-200 hover:bg-[var(--color-primary)] transition-all text-xs font-black uppercase tracking-widest">
                        <Filter size={18} /> Filter
                    </button>
                </div>
            </div>

            {/* Generated Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportTypes.map((report) => (
                    <div key={report.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-gray-50 text-gray-600 group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-colors">
                                <FileSpreadsheet size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors" title="Download CSV">
                                    <Download size={16} />
                                </button>
                                <button className="px-4 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[var(--color-primary)] transition-colors">
                                    Generate
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">{report.name}</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">{report.desc}</p>
                    </div>
                ))}
            </div>

            {/* Recent Exports Log */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Recent Exports</h2>
                </div>
                <div className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 text-gray-400">
                        <FileText size={24} />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No reports generated today</p>
                </div>
            </div>
        </div>
    );
}
