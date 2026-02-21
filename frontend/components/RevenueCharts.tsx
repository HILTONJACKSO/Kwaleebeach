'use client';

import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const dataPie = [
    { name: 'Kitchen', value: 4250, color: '#f97316' },  // Orange-500
    { name: 'Bar', value: 2180, color: '#3b82f6' },      // Blue-500
    { name: 'Pool', value: 1200, color: '#06b6d4' },     // Cyan-500
    { name: 'Beach', value: 850, color: '#f59e0b' },     // Amber-500
];

const dataBar = [
    { name: 'Mon', revenue: 1200 },
    { name: 'Tue', revenue: 1800 },
    { name: 'Wed', revenue: 1500 },
    { name: 'Thu', revenue: 2100 },
    { name: 'Fri', revenue: 3200 },
    { name: 'Sat', revenue: 4500 },
    { name: 'Sun', revenue: 3800 },
];

export default function RevenueCharts() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Pie Chart: Revenue Mix */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                <h3 className="text-lg font-black text-gray-900 mb-6">Revenue Mix</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dataPie}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {dataPie.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                itemStyle={{ fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4 flex-wrap">
                    {dataPie.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-xs font-bold text-gray-500">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bar Chart: Weekly Trend */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                <h3 className="text-lg font-black text-gray-900 mb-6">Weekly Performance</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dataBar} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                            />
                            <Tooltip
                                cursor={{ fill: '#F3F4F6' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="revenue" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-center mt-4">
                    <span className="text-xs font-bold text-gray-400">Total Weekly Revenue: $18,100</span>
                </div>
            </div>
        </div>
    );
}
