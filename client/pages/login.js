import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  async function submit(e) {
    e.preventDefault();
    setStatus('');
    try {
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Login failed');
      localStorage.setItem('auth_token', json.token);
      window.location.href = '/';
    } catch (e) {
      setStatus(String(e.message || e));
    }
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-3">Sign in</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700">Username</label>
          <input className="w-full border rounded px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Password</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="px-4 py-2 rounded bg-gray-900 text-white" type="submit">Login</button>
        {status && <p className="text-rose-600">{status}</p>}
      </form>

      <div className="mt-6">
        <p className="text-sm text-gray-600">Or continue with</p>
        <div className="flex gap-2 mt-2">
          <a className="px-4 py-2 rounded bg-gray-100" href="http://localhost:4000/auth/google">Google</a>
          <a className="px-4 py-2 rounded bg-gray-100" href="http://localhost:4000/auth/facebook">Facebook</a>
          <a className="px-4 py-2 rounded bg-gray-100" href="http://localhost:4000/auth/line">LINE</a>
        </div>
      </div>
    </main>
  );
}

