import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function useToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState('products');
  const token = useToken();
  const [me, setMe] = useState(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:4000/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setMe);
  }, [token]);

  // Avoid SSR/CSR mismatch by rendering a stable placeholder until mounted
  if (!mounted) return <main className="max-w-6xl mx-auto px-4 py-6">Loading…</main>;
  if (!token) return <main className="max-w-6xl mx-auto px-4 py-6">로그인이 필요합니다.</main>;
  if (!me?.isAdmin) return <main className="max-w-6xl mx-auto px-4 py-6">관리자 권한이 없습니다.</main>;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
      <aside className="w-60 border-r border-gray-100 pr-4">
        <h2 className="text-lg font-semibold mb-3">Admin</h2>
        <nav className="flex flex-col gap-2">
          <button className={`text-left ${tab==='users'?'font-semibold':''}`} onClick={() => setTab('users')}>회원</button>
          <button className={`text-left ${tab==='products'?'font-semibold':''}`} onClick={() => setTab('products')}>상품 목록</button>
          <button className={`text-left ${tab==='orders'?'font-semibold':''}`} onClick={() => setTab('orders')}>주문 목록</button>
        </nav>
      </aside>
      <section className="flex-1">
        {tab === 'users' && <Users />}
        {tab === 'products' && <Products />}
        {tab === 'orders' && <Orders />}
      </section>
    </main>
  );
}

function Users() {
  const token = useToken();
  const q = useQuery({
    queryKey: ['admin','users'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">회원</h3>
      {q.isLoading ? 'Loading…' : q.isError ? 'Error' : (
        <div className="space-y-2">
          {q.data.map((u) => (
            <div key={u.id} className="border border-gray-100 rounded p-2 flex items-center justify-between">
              <div>
                <div className="font-semibold">{u.name || u.username || u.email || u.provider}</div>
                <div className="text-sm text-gray-600">{u.provider} • {u.email || u.username || '-'}</div>
              </div>
              {u.isAdmin && <span className="text-xs text-gray-600">admin</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Products() {
  const token = useToken();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['admin','products'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/admin/products', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ sku, update }) => {
      const res = await fetch(`http://localhost:4000/api/admin/products/${sku}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(update)
      });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','products'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (sku) => {
      const res = await fetch(`http://localhost:4000/api/admin/products/${sku}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Delete failed');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','products'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">상품 목록</h3>
        <a href="/admin/products/new" className="px-3 py-2 rounded bg-gray-900 text-white">상품 추가</a>
      </div>
      {q.isLoading ? 'Loading…' : q.isError ? 'Error' : (
        <div className="space-y-2">
          {q.data.map((p) => (
            <div key={p.sku} className="border border-gray-100 rounded p-2 flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600">{p.sku} • {p.price} JPY • ship {p.shippingFee ?? 0} • max/user {p.maxQtyPerUser ?? 0}</div>
              </div>
              <div className="flex gap-2">
                <a className="px-2 py-1 rounded bg-gray-100" href={`/admin/products/${p.sku}`}>수정</a>
                <button className="px-2 py-1 rounded bg-rose-600 text-white" onClick={() => deleteMutation.mutate(p.sku)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Orders() {
  const token = useToken();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['admin','orders'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });
  const patch = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(`http://localhost:4000/api/admin/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','orders'] }),
  });
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">주문 목록</h3>
      {q.isLoading ? 'Loading…' : q.isError ? 'Error' : (
        <div className="space-y-2">
          {q.data.map((o) => (
            <div key={o._id} className="border border-gray-100 rounded p-2 flex items-center justify-between">
              <div>
                <div className="font-semibold">{o._id}</div>
                <div className="text-sm text-gray-600">{o.status} • {new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded bg-gray-100" onClick={() => patch.mutate({ id: o._id, status: 'SHIPPED' })}>배송중</button>
                <button className="px-2 py-1 rounded bg-gray-100" onClick={() => patch.mutate({ id: o._id, status: 'DELIVERED' })}>배송완료</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
