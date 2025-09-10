import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

function useToken() { if (typeof window==='undefined') return null; return localStorage.getItem('auth_token'); }

export default function AdminTicketsList() {
  const token = useToken();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const q = useQuery({
    queryKey: ['admin','tickets'],
    enabled: mounted && !!token,
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/admin/tickets', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    }
  });

  if (!mounted) return <main className="max-w-6xl mx-auto px-4 py-6">Loading…</main>;
  if (!token) return <main className="max-w-6xl mx-auto px-4 py-6">로그인이 필요합니다.</main>;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-3">CS 티켓</h1>
      {q.isLoading ? 'Loading…' : q.isError ? 'Error' : (
        <div className="space-y-2">
          {q.data.map((t) => (
            <Link key={t._id} href={`/admin/tickets/${t._id}`} className="block border border-gray-100 rounded p-2">
              <div className="font-semibold">{t.subject}</div>
              <div className="text-sm text-gray-600">{t.status} • {t.category} • {t.priority} • {new Date(t.updatedAt).toLocaleString()}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

