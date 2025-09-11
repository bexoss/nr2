import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useCurrency } from '../lib/currency';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');

  const products = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      return res.json();
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      try {
        const anon = JSON.parse(localStorage.getItem('anon_cart') || '{"items": []}');
        setItems(Array.isArray(anon.items) ? anon.items : []);
        setStatus('');
      } catch (e) {
        setItems([]);
      }
      return;
    }
    fetch('http://localhost:4000/api/cart', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch((e) => setStatus(String(e)));
  }, []);

  const decorated = useMemo(() => {
    const map = new Map((products.data || []).map((p) => [p.id, p]));
    return items.map((it) => ({ ...map.get(it.productId), ...it }));
  }, [items, products.data]);

  async function save() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      localStorage.setItem('anon_cart', JSON.stringify({ items }));
      setStatus('Saved');
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart:updated'));
      return;
    }
    setStatus('Saving...');
    const res = await fetch('http://localhost:4000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) setStatus('Save failed');
    else { setStatus('Saved'); if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart:updated')); }
  }

  async function checkout() {
    const token = localStorage.getItem('auth_token');
    if (!token) return setStatus('Please login first.');
    const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
    const res = await fetch('http://localhost:4000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items, total }),
    });
    if (!res.ok) setStatus('Checkout failed');
    else {
      setItems([]);
      setStatus('Order placed!');
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart:updated'));
    }
  }

  function changeQty(productId, delta) {
    setItems((prev) => changeQtyLocal(prev, productId, delta));
  }

  const { format } = useCurrency();
  const total = decorated.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);

  return (
    <main className="max-w-3xl mx-auto px-4">
      <h1 className="text-2xl font-semibold my-4">My Cart</h1>
      {status && <p className="text-rose-600">{status}</p>}
      {decorated.length === 0 ? (
        <p className="text-gray-600">장바구니가 비어있습니다.</p>
      ) : (
        <div className="bg-white border border-gray-100 rounded-lg p-2">
          {decorated.map((it) => (
            <div key={it.productId} className="flex gap-3 items-center py-3 border-b last:border-b-0">
              <div className="relative w-22 h-22 min-w-[88px] min-h-[88px]">
                <Image src={it.image} alt={it.name} width={88} height={88} className="rounded-lg object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-gray-600">{format(it.price)}</div>
              </div>
              <div className="flex items-center">
                <button className="px-2 py-1 rounded-md bg-gray-100" onClick={() => changeQty(it.productId, -1)}>-</button>
                <span className="mx-2">{it.qty}</span>
                <button className="px-2 py-1 rounded-md bg-gray-100" onClick={() => changeQty(it.productId, 1)}>+</button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3">
            <strong>합계</strong>
            <strong>{format(total)}</strong>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 rounded-md bg-gray-900 text-white" onClick={save}>Save Cart</button>
            <button className="px-3 py-2 rounded-md bg-gray-100 text-gray-900" onClick={checkout}>Checkout</button>
          </div>
        </div>
      )}
    </main>
  );
}

function changeQtyLocal(items, productId, delta) {
  const idx = items.findIndex((i) => i.productId === productId);
  if (idx < 0) return items;
  const next = [...items];
  const qty = Math.max(0, (next[idx].qty || 1) + delta);
  if (qty === 0) next.splice(idx, 1);
  else next[idx] = { ...next[idx], qty };
  return next;
}
