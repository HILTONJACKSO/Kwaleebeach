'use client';
import { useRef, useEffect } from 'react';
import { Waves, Umbrella, Printer, X } from 'lucide-react';

interface PassDetails {
    id: number;
    pass_type_name: string;
    guest_name: string;
    room_number?: string;
    amount_paid: number;
    created_at: string;
    location: 'POOL' | 'BEACH';
}

export default function PrintablePass({ details, onClose, onPrint }: { details: PassDetails, onClose: () => void, onPrint: () => Promise<void> }) {

    const handlePrint = async () => {
        await onPrint();
        window.print();
        setTimeout(onClose, 500); // Close after print dialog likely triggered
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
            {/* Screen View */}
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl relative overflow-hidden border border-gray-100 flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Printable Ticket Area */}
                <div className="printable-area bg-white p-8 text-center relative selection:bg-none">
                    <div className="border-4 border-dashed border-gray-200 rounded-[2rem] p-6 relative">
                        {/* Circular Cutouts */}
                        <div className="absolute top-1/2 -left-9 w-6 h-6 bg-gray-900 rounded-full transform -translate-y-1/2"></div>
                        <div className="absolute top-1/2 -right-9 w-6 h-6 bg-gray-900 rounded-full transform -translate-y-1/2"></div>

                        {/* Icon */}
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${details.location === 'POOL' ? 'bg-cyan-50 text-cyan-500' : 'bg-orange-50 text-orange-500'
                            }`}>
                            {details.location === 'POOL' ? <Waves size={40} /> : <Umbrella size={40} />}
                        </div>

                        {/* Title */}
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Kwalee Beach Resort</h2>
                        <h1 className="text-2xl font-black text-gray-900 mb-6">{details.pass_type_name}</h1>

                        {/* Details */}
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                <span className="text-gray-400 font-medium">Guest</span>
                                <span className="font-bold text-gray-900">{details.guest_name || 'Walk-in Guest'}</span>
                            </div>
                            {details.room_number && (
                                <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                    <span className="text-gray-400 font-medium">Room</span>
                                    <span className="font-bold text-gray-900">{details.room_number}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-b border-dashed border-gray-200 pb-2">
                                <span className="text-gray-400 font-medium">Date</span>
                                <span className="font-bold text-gray-900">{new Date(details.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 font-medium">Price</span>
                                <span className="font-black text-xl text-gray-900">${details.amount_paid}</span>
                            </div>
                        </div>

                        {/* Barcode Mockup */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="font-mono text-[10px] text-gray-400 tracking-[0.5em] uppercase">
                                Ticket #{details.id.toString().padStart(6, '0')}
                            </div>
                            <div className="h-12 w-full bg-gray-900 mt-2 opacity-10"></div>
                        </div>
                    </div>
                </div>

                {/* Confirm Action */}
                <div className="p-6 pt-0">
                    <button
                        onClick={handlePrint}
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${details.location === 'POOL'
                            ? 'bg-cyan-500 shadow-cyan-200 hover:bg-cyan-600'
                            : 'bg-orange-500 shadow-orange-200 hover:bg-orange-600'
                            }`}
                    >
                        <Printer size={20} /> Print Ticket
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                        Please print and hand to guest.
                    </p>
                </div>
            </div>
        </div>
    );
}
