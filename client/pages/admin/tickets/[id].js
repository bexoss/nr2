import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

function useToken() { if (typeof window==='undefined') return null; return localStorage.getItem('auth_token'); }

export default function AdminTicketDetail() {
  const token = useToken();
  const router = useRouter();
  const { id } = router.query;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ['admin','ticket', id],
    enabled: mounted && !!token && !!id,
    queryFn: async () => {
      const res = await fetch(`http://localhost:4000/api/admin/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    }
  });

  const reply = useMutation({
    mutationFn: async ({ text, status }) => {
      const res = await fetch(`http://localhost:4000/api/admin/tickets/${id}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ text, status }) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','ticket', id] })
  });

  const update = useMutation({
    mutationFn: async ({ status, priority, category }) => {
      const res = await fetch(`http://localhost:4000/api/admin/tickets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status, priority, category }) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','ticket', id] })
  });

  if (!mounted) return <main className="max-w-6xl mx-auto px-4 py-6">Loading…</main>;
  if (!token) return <main className="max-w-6xl mx-auto px-4 py-6">로그인이 필요합니다.</main>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-3"><a href="/admin/tickets" className="text-gray-700 underline">← 목록으로</a></div>
      {q.isLoading ? 'Loading…' : q.isError ? 'Error' : (
        <div>
          <h1 className="text-2xl font-semibold mb-1">{q.data.subject}</h1>
          <div className="text-sm text-gray-600 mb-4">{q.data.status} • {q.data.category} • {q.data.priority}</div>
          <div className="space-y-3">
            {q.data.messages?.map((m, i) => (
              <div key={i} className={`rounded p-2 ${m.author==='admin'?'bg-blue-50':'bg-gray-50'}`}>
                <div className="text-xs text-gray-500">{m.author} • {new Date(m.createdAt).toLocaleString()}</div>
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.attachments?.length>0 && (
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {m.attachments.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer" className="underline text-sm">첨부 {idx+1}</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form className="mt-4 space-y-2" onSubmit={(e) => { e.preventDefault(); const text = e.currentTarget.message.value; const status = e.currentTarget.status.value; if (!text) return; reply.mutate({ text, status }); e.currentTarget.reset(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-700">상태</label>
                <select name="status" defaultValue={q.data.status} className="w-full border rounded px-3 py-2">
                  <option value="open">open</option>
                  <option value="pending">pending</option>
                  <option value="resolved">resolved</option>
                  <option value="closed">closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700">우선순위</label>
                <select defaultValue={q.data.priority} onChange={(e) => update.mutate({ priority: e.target.value })} className="w-full border rounded px-3 py-2">
                  <option value="low">low</option>
                  <option value="normal">normal</option>
                  <option value="high">high</option>
                </select>
              </div>
            </div>
            <textarea name="message" className="w-full border rounded px-3 py-2 min-h-[100px]" placeholder="답변 입력" />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-gray-900 text-white" type="submit">답변</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

