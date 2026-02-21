'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: number;
    message: string;
    type: NotificationType;
    title?: string;
}

interface UIContextType {
    showNotification: (message: string, type?: NotificationType, title?: string) => void;
    showModal: (title: string, message: string, onConfirm?: () => void) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [modal, setModal] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);

    const showNotification = (message: string, type: NotificationType = 'info', title?: string) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type, title }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    const showModal = (title: string, message: string, onConfirm?: () => void) => {
        setModal({ title, message, onConfirm });
    };

    return (
        <UIContext.Provider value={{ showNotification, showModal }}>
            {children}

            {/* Global Notifications Container */}
            <div className="fixed top-20 right-8 z-[200] space-y-4 pointer-events-none">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        className="pointer-events-auto bg-gray-900 text-white p-5 rounded-2xl shadow-2xl border-l-4 min-w-[300px] animate-slide-in-right flex items-start gap-4"
                        style={{ borderLeftColor: n.type === 'success' ? '#f56815' : n.type === 'error' ? '#ef4444' : '#3b82f6' }}
                    >
                        <div className={`p-2 rounded-full ${n.type === 'success' ? 'bg-orange-500' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
                            {n.type === 'success' && <CheckCircle size={20} />}
                            {n.type === 'error' && <AlertCircle size={20} />}
                            {n.type === 'info' && <Info size={20} />}
                        </div>
                        <div className="flex-1">
                            {n.title && <p className="font-bold text-sm mb-1">{n.title}</p>}
                            <p className="text-sm text-gray-300 leading-relaxed">{n.message}</p>
                        </div>
                        <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} className="text-gray-500 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Global Modal Overlay */}
            {modal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-scale-up border border-gray-100">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <Info size={32} className="text-[var(--color-primary)]" />
                        </div>
                        <h3 className="text-2xl font-bold text-center text-gray-900 mb-3">{modal.title}</h3>
                        <p className="text-gray-500 text-center leading-relaxed mb-8">{modal.message}</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setModal(null)}
                                className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                            >
                                Close
                            </button>
                            {modal.onConfirm && (
                                <button
                                    onClick={() => {
                                        modal.onConfirm?.();
                                        setModal(null);
                                    }}
                                    className="flex-1 bg-[var(--color-primary)] text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-[var(--color-secondary)] transition-all"
                                >
                                    Confirm
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleUp {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-slide-in-right { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within a UIProvider');
    return context;
}
