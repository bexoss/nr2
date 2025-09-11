import { useEffect, useState } from 'react';

export default function AccountPage() {
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) return;
    fetch('http://localhost:4000/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  function logout() {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">My Page</h1>
      {!me ? (
        <div className="text-gray-700">
          <p>로그인이 필요합니다.</p>
          <div className="mt-3 flex gap-2">
            <a className="px-4 py-2 rounded bg-gray-900 text-white" href="/login">LOGIN</a>
            <a className="px-4 py-2 rounded bg-gray-100 text-gray-900" href="/signup">SIGN UP</a>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded p-4">
            <div className="font-semibold">계정 정보</div>
            <div className="text-sm text-gray-700 mt-2">이름: {me.name || '-'}</div>
            <div className="text-sm text-gray-700">이메일: {me.email || '-'}</div>
            <div className="text-sm text-gray-700">아이디: {me.username || '-'}</div>
          </div>
          <div className="flex gap-2">
            <a href="/orders" className="px-4 py-2 rounded bg-gray-100 text-gray-900">주문 내역</a>
            <a href="/support" className="px-4 py-2 rounded bg-gray-100 text-gray-900">고객 지원</a>
            <button onClick={logout} className="px-4 py-2 rounded bg-gray-900 text-white">로그아웃</button>
          </div>
          {status && <p className="text-rose-600">{status}</p>}
        </div>
      )}
    </main>
  );
}

