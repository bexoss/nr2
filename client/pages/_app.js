import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../styles/globals.css';
import { CurrencyProvider, useCurrency } from '../lib/currency';

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());
  const [me, setMe] = useState(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) return setMe(null);
    fetch('http://localhost:4000/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <Header me={me} />
        <Component {...pageProps} />
      </CurrencyProvider>
    </QueryClientProvider>
  );
}

function Header({ me }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <a href="/"><h1 className="m-0 text-xl font-semibold text-gray-900">Bloom Cosmetics</h1></a>
        <nav className="flex gap-4 text-gray-700 items-center">
          <a href="/" className="hover:text-gray-900">Home</a>
          <a href="/cart" className="hover:text-gray-900">Cart</a>
          <a href="/orders" className="hover:text-gray-900">Orders</a>
          <a href="/support" className="hover:text-gray-900">Support</a>
          {me?.isAdmin && <a href="/admin" className="hover:text-gray-900">Admin</a>}
          <select className="border rounded px-2 py-1 text-sm" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="JPY">JPY ¥</option>
            <option value="USD">USD $</option>
            <option value="KRW">KRW ₩</option>
            <option value="EUR">EUR €</option>
          </select>
        </nav>
        <div className="text-sm text-gray-700">
          {me ? (
            <span>Hello, {me.name || me.username || me.email}</span>
          ) : (
            <a href="/login">Sign in</a>
          )}
        </div>
      </div>
    </header>
  );
}
