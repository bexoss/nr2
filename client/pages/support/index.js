import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

function useToken() { if (typeof window==='undefined') return null; return localStorage.getItem('auth_token'); }

export default function SupportListPage() {
  const token = useToken();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const q = useQuery({
    queryKey: ['support','tickets'],
    enabled: mounted && !!token,
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/support/tickets', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    }
  });

  if (!mounted) return <main className="max-w-4xl mx-auto px-4 py-6">Loading…</main>;
  if (!token) return <main className="max-w-4xl mx-auto px-4 py-6">로그인이 필요합니다.</main>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">고객지원</h1>
        <Link className="px-3 py-2 rounded bg-gray-900 text-white" href="/support/new">티켓 생성</Link>
      </div>
      {q.isLoading ? 'Loading…' : q.isError ? 'Error' : (
        <div className="space-y-2">
          {q.data.map((t) => (
            <Link key={t._id} href={`/support/${t._id}`} className="block border border-gray-100 rounded p-2">
              <div className="font-semibold">{t.subject}</div>
              <div className="text-sm text-gray-600">{t.status} • {new Date(t.updatedAt).toLocaleString()}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

