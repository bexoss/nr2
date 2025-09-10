import { useEffect, useState } from 'react';
import { useCurrency } from '../lib/currency';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return setStatus('Please login first.');
    fetch('http://localhost:4000/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setOrders(data))
      .catch((e) => setStatus(String(e)));
  }, []);

  const { format } = useCurrency();

  return (
    <main className="max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-semibold my-4">Orders</h1>
      {status && <p className="text-rose-600">{status}</p>}
      {orders.length === 0 ? (
        <p className="text-gray-600">주문 내역이 없습니다.</p>
      ) : (
        <div>
          {orders.map((o) => (
            <div key={o._id} className="border border-gray-100 rounded-lg bg-white mb-3">
              <div className="p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">주문번호: {o._id}</div>
                  <div className="text-sm text-gray-600">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{format(o.total)}</div>
                  <div className="text-sm text-gray-600">{o.items?.length || 0} items</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
