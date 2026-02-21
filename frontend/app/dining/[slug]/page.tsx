'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Correct import for App Router
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { use } from 'react';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: string;
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    // Untrap params using React.use()
    const { slug } = use(params);

    const [items, setItems] = useState<MenuItem[]>([]);
    const { addToCart, items: cartItems } = useCart();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchItems() {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/inventory/menu/items/?category_slug=${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setItems(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchItems();
    }, [slug]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold capitalize text-[var(--color-primary)]">{slug} Menu</h1>
                <Link href="/dining/checkout" className="bg-[var(--color-secondary)] text-white px-4 py-2 rounded-md">
                    Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
                </Link>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {items.map(item => (
                        <div key={item.id} className="border p-4 rounded-lg shadow-sm flex justify-between items-center bg-white">
                            <div>
                                <h3 className="font-bold text-lg">{item.name}</h3>
                                <p className="text-gray-600 text-sm">{item.description}</p>
                                <p className="text-[var(--color-primary)] font-bold mt-2">${item.price}</p>
                            </div>
                            <button
                                onClick={() => addToCart(item)}
                                className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full hover:bg-[var(--color-secondary)]"
                            >
                                Find
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
