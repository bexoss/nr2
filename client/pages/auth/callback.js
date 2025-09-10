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

