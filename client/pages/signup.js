import { useState } from 'react';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');

  async function submit(e) {
    e.preventDefault();
    setStatus('');
    try {
      const res = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, name }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Signup failed');
      localStorage.setItem('auth_token', json.token);
      try {
        const anon = JSON.parse(localStorage.getItem('anon_cart') || '{"items": []}');
        const anonItems = Array.isArray(anon.items) ? anon.items : [];
        if (anonItems.length > 0) {
          const currentRes = await fetch('http://localhost:4000/api/cart', { headers: { Authorization: `Bearer ${json.token}` } });
          const current = currentRes.ok ? await currentRes.json() : { items: [] };
          const map = new Map((current.items || []).map((i) => [i.productId, i]));
          for (const it of anonItems) {
            const prev = map.get(it.productId);
            if (prev) prev.qty = (prev.qty || 1) + (it.qty || 1);
            else map.set(it.productId, { ...it });
          }
          const merged = Array.from(map.values());
          await fetch('http://localhost:4000/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${json.token}` },
            body: JSON.stringify({ items: merged }),
          });
          localStorage.removeItem('anon_cart');
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart:updated'));
        }
      } catch (_) {}
      window.location.href = '/account';
    } catch (e) {
      setStatus(String(e.message || e));
    }
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-3">Sign up</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700">Username</label>
          <input className="w-full border rounded px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Password</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Email (optional)</label>
          <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Name (optional)</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button className="px-4 py-2 rounded bg-gray-900 text-white" type="submit">Create Account</button>
        {status && <p className="text-rose-600">{status}</p>}
      </form>

      <div className="mt-6 text-sm text-gray-700">
        Already have an account? <a className="underline" href="/login">Log in</a>
      </div>
    </main>
  );
}
