import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';

function useToken() { if (typeof window==='undefined') return null; return localStorage.getItem('auth_token'); }

export default function SupportNewPage() {
  const token = useToken();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mutation = useMutation({
    mutationFn: async ({ subject, category, priority, message }) => {
      const res = await fetch('http://localhost:4000/api/support/tickets', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, category, priority, message })
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: (t) => router.push(`/support/${t._id}`)
  });

  if (!mounted) return <main className="max-w-4xl mx-auto px-4 py-6">Loading…</main>;
  if (!token) return <main className="max-w-4xl mx-auto px-4 py-6">로그인이 필요합니다.</main>;

  function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const subject = String(form.get('subject') || '').trim();
    const category = String(form.get('category') || 'other');
    const priority = String(form.get('priority') || 'normal');
    const message = String(form.get('message') || '').trim();
    if (!subject || !message) return alert('제목과 내용을 입력하세요');
    mutation.mutate({ subject, category, priority, message });
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">새 티켓</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700">제목</label>
          <input name="subject" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700">카테고리</label>
            <select name="category" className="w-full border rounded px-3 py-2">
              <option value="order">주문</option>
              <option value="product">상품</option>
              <option value="payment">결제</option>
              <option value="account">계정</option>
              <option value="other">기타</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">우선순위</label>
            <select name="priority" className="w-full border rounded px-3 py-2">
              <option value="low">낮음</option>
              <option value="normal">보통</option>
              <option value="high">높음</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700">내용</label>
          <textarea name="message" className="w-full border rounded px-3 py-2 min-h-[120px]" />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-gray-900 text-white" type="submit">생성</button>
          <a href="/support" className="px-4 py-2 rounded bg-gray-100 text-gray-900">취소</a>
        </div>
      </form>
    </main>
  );
}

