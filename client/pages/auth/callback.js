import { useEffect, useState } from 'react';

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing...');
  const [me, setMe] = useState(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const error = url.searchParams.get('error');
    if (error) {
      setStatus(`Login failed: ${error}`);
      return;
    }
    if (token) {
      localStorage.setItem('auth_token', token);
      setStatus('Logged in. Fetching profile...');
      fetch('http://localhost:4000/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setMe(data);
          setStatus('Login success');
          // Merge anonymous cart if exists
          try {
            const anon = JSON.parse(localStorage.getItem('anon_cart') || '{"items": []}');
            const anonItems = Array.isArray(anon.items) ? anon.items : [];
            if (anonItems.length > 0) {
              fetch('http://localhost:4000/api/cart', { headers: { Authorization: `Bearer ${token}` } })
                .then((r) => (r.ok ? r.json() : { items: [] }))
                .then(async (current) => {
                  const map = new Map((current.items || []).map((i) => [i.productId, i]));
                  for (const it of anonItems) {
                    const prev = map.get(it.productId);
                    if (prev) prev.qty = (prev.qty || 1) + (it.qty || 1);
                    else map.set(it.productId, { ...it });
                  }
                  const merged = Array.from(map.values());
                  await fetch('http://localhost:4000/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ items: merged }),
                  });
                  localStorage.removeItem('anon_cart');
                  if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart:updated'));
                });
            }
          } catch (_) {}
        })
        .catch((e) => {
          setStatus(`Failed to load profile: ${e}`);
        });
    } else {
      setStatus('No token found in URL');
    }
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Auth Callback</h1>
      <p>{status}</p>
      {me && (
        <pre style={{ background: '#f6f8fa', padding: 12 }}>{JSON.stringify(me, null, 2)}</pre>
      )}
      <p style={{ marginTop: 16 }}>
        <a href="/">Go Home</a>
      </p>
    </main>
  );
}
