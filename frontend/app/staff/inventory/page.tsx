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
    );

    const lowStockCount = inventory.filter(i => i.total_stock < 10).length;
    const outOfStockCount = inventory.filter(i => i.total_stock === 0).length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inventory Tracking</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Manage stock levels across all departments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/staff/inventory/transfer"
                        className="bg-white border border-gray-100 text-gray-900 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all"
                    >
                        <ArrowRightLeft size={18} /> Transfer Stock
                    </Link>
                    <Link
                        href="/staff/inventory/add"
                        className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-[var(--color-primary)] transition-all shadow-lg shadow-gray-200"
                    >
                        <Plus size={18} /> Add New Item
                    </Link>
                </div>
            </div>

            {/* KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 transition-all hover:shadow-md">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
                        <Package size={28} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Items</div>
                        <div className="text-3xl font-black text-gray-900">{inventory.length}</div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 transition-all hover:shadow-md">
                    <div className="p-4 bg-orange-50 text-orange-600 rounded-3xl">
                        <AlertTriangle size={28} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Low Stock</div>
                        <div className="text-3xl font-black text-orange-600">{lowStockCount}</div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 transition-all hover:shadow-md">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-3xl">
                        <AlertTriangle size={28} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Out of Stock</div>
                        <div className="text-3xl font-black text-rose-600">{outOfStockCount}</div>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-6 py-4 bg-gray-50 rounded-[1.5rem] text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-gray-100 transition-all">
                            <Filter size={14} /> Category
                        </button>
                        <button className="flex items-center gap-2 px-6 py-4 bg-gray-50 rounded-[1.5rem] text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-gray-100 transition-all">
                            <History size={14} /> Log
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Item Detail</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Departmental Stock</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center">Total</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredInventory.map(item => (
                                <tr key={item.id} className="group hover:bg-gray-50/80 transition-all duration-300">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                <Package size={24} />
                                            </div>
                                            <div>
                                                <div className="font-black text-base text-gray-900 leading-tight">{item.name}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-1">SKU: {item.sku}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-wrap gap-2">
                                            {item.stocks.length > 0 ? (
                                                item.stocks.map(s => (
                                                    <span key={s.id} className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-bold text-gray-600 shadow-sm">
                                                        {s.department_display}: <span className="text-gray-900">{s.quantity}</span>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-300 uppercase italic">No Stock Assigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="text-lg font-black text-gray-900">{item.total_stock}</div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.unit}</div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/staff/inventory/edit/${item.id}`}
                                                className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-900 hover:text-white transition-all shadow-sm group-hover:bg-white group-hover:shadow-md"
                                            >
                                                <History size={18} />
                                            </Link>
                                            <Link
                                                href={`/staff/inventory/edit/${item.id}`}
                                                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${item.total_stock > 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    item.total_stock > 0 ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                                                    } hover:scale-105 active:scale-95`}>
                                                {item.total_stock > 10 ? 'In Stock' : item.total_stock > 0 ? 'Low Stock' : 'Out of Stock'}
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
