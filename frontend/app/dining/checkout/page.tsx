'use client';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const [room, setRoom] = useState('');
    const [status, setStatus] = useState('');
    const router = useRouter();

    const handleOrder = async () => {
        if (!room) return alert('Please enter room/table number');

        setStatus('Processing...');

        const payload = {
            room,
            status: 'PENDING',
            items: items.map(i => ({
                menu_item: i.id,
                quantity: i.quantity
            }))
        };

        try {
            const res = await fetch('http://127.0.0.1:8000/api/inventory/orders/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                clearCart();
                alert('Order Placed Successfully!');
                router.push('/dining');
            } else {
                alert('Failed to place order.');
            }
        } catch (e) {
            console.error(e);
            alert('Error connecting to server');
        } finally {
            setStatus('');
        }
    };

    if (items.length === 0) return <div className="p-8 text-center">Your cart is empty.</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            <div className="bg-white shadow p-6 rounded-lg mb-6">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            <div className="bg-white shadow p-6 rounded-lg">
                <label className="block mb-2 font-bold">Room / Table Number</label>
                <input
                    type="text"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    className="w-full border-gray-300 border-2 p-3 rounded-xl mb-4 text-black font-bold"
                    placeholder="e.g. 101 or Table 5"
                />

                <button
                    onClick={handleOrder}
                    disabled={!!status}
                    className="w-full bg-[var(--color-primary)] text-white py-3 rounded font-bold hover:opacity-90 disabled:opacity-50"
                >
                    {status || 'Place Order'}
                </button>
            </div>
        </div>
    );
}
