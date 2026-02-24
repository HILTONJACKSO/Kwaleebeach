// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, AlertTriangle, ArrowUpDown, ArrowRightLeft, X, Save, History } from 'lucide-react';
import { useUI } from '@/context/UIContext';

interface InventoryStock {
    id: number;
    department: string;
    department_display: string;
    quantity: number;
}

interface InventoryItem {
    id: number;
    name: string;
    sku: string;
    unit: string;
    cost_price: string;
    selling_price: string;
    stocks: InventoryStock[];
    total_stock: number;
}

const DEPARTMENTS = [
    { id: 'MAIN', name: 'Main Stock' },
    { id: 'POOL', name: 'Pool' },
    { id: 'BAR', name: 'Bar' },
    { id: 'BEACH_BAR', name: 'Beach Bar' },
    { id: 'KITCHEN', name: 'Kitchen' },
    { id: 'LAUNDRY', name: 'Laundry' },
    { id: 'OFFICE', name: 'Office' },
];

import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function InventoryPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN', 'KITCHEN', 'BAR']}>
            <InventoryPageContent />
        </ProtectedRoute>
    );
}

function InventoryPageContent() {
    const { showNotification } = useUI();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        try {
            const res = await fetch('/api/inventory/items/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setInventory(data);
            }
        } catch (e) {
            console.error("Failed to fetch inventory", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ).filter(item => {
        if (filter === 'ALL') return true;
        // Assuming item.category is one of 'BAR', 'KITCHEN', 'HOUSEKEEPING'
        return item.category.toUpperCase() === filter.toUpperCase();
    });

    const getStatusColor = (status: 'IN' | 'LOW' | 'OUT') => {
        switch (status) {
            case 'IN':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'LOW':
                return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'OUT':
                return 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 flex-wrap">
                        Inventory Tracking <Package className="text-blue-500" size={32} />
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight text-sm">Monitor stock levels across all resort departments.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                    <button
                        onClick={() => setIsTransferModalOpen(true)}
                        className="px-6 py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <ArrowRightLeft size={18} /> Transfer
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                    >
                        <PlusCircle size={18} /> Add Item
                    </button>
                </div>
            </div>

            {/* Stock Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-500">
                            <Box size={24} />
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total SKU Count</div>
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-gray-900">{inventory.length}</div>
                </div>

                <div className="bg-orange-50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-orange-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white rounded-2xl text-orange-500 shadow-sm border border-orange-100">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Critical Reorder</div>
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-gray-900">
                        {inventory.filter(i => i.status === 'LOW' || i.status === 'OUT').length}
                    </div>
                </div>

                <div className="bg-emerald-50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-emerald-100 shadow-sm sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white rounded-2xl text-emerald-500 shadow-sm border border-emerald-100">
                            <Truck size={24} />
                        </div>
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Requests</div>
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-gray-900">12</div>
                </div>
            </div>

            {/* Main Inventory Table */}
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input
                            type="text"
                            placeholder="Find items..."
                            className="w-full pl-16 pr-8 py-4 bg-gray-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-gray-50 p-1.5 rounded-2xl overflow-x-auto scrollbar-hide">
                        {['ALL', 'BAR', 'KITCHEN', 'HOUSEKEEPING'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 md:px-6 py-2 rounded-xl text-[10px] font-black transition-all ${filter === cat ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Details</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Departmental Stock</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Level</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Movement</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredInventory.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                                                <Box size={24} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}
