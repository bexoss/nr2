import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../styles/globals.css';
import { CurrencyProvider, useCurrency } from '../lib/currency';
import { KoHo } from 'next/font/google';

const koho = KoHo({ weight: '600', subsets: ['latin'] });

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
        <div className="min-h-screen flex flex-col">
          <Header me={me} />
          <div className="flex-1">
            <Component {...pageProps} />
          </div>
          <SiteFooter />
        </div>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}

function Header({ me }) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function load() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        try {
          const anon = JSON.parse(localStorage.getItem('anon_cart') || '{"items": []}');
          const n = Array.isArray(anon.items) ? anon.items.reduce((s, it) => s + (it.qty || 1), 0) : 0;
          setCartCount(n);
        } catch (_) { setCartCount(0); }
        return;
      }
      try {
        const res = await fetch('http://localhost:4000/api/cart', { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        const n = Array.isArray(json.items) ? json.items.reduce((s, it) => s + (it.qty || 1), 0) : 0;
        setCartCount(n);
      } catch (_) { setCartCount(0); }
    }
    load();
    const onUpd = () => load();
    if (typeof window !== 'undefined') window.addEventListener('cart:updated', onUpd);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('cart:updated', onUpd); };
  }, []);
  const [acctOpen, setAcctOpen] = useState(false);
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-3 items-center">
        <button
          className="md:hidden p-2 rounded border border-gray-200"
          aria-label="메뉴 열기"
          aria-expanded={open ? 'true' : 'false'}
          onClick={() => setOpen(!open)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="flex items-center justify-center md:col-start-2 md:row-start-1">
          <a href="/"><h1 className={`m-0 text-xl font-semibold text-gray-900 ${koho.className}`}>NANO RECIPE.</h1></a>
        </div>
        <nav className="hidden md:flex gap-4 text-gray-700 items-center md:col-start-1 md:row-start-1 justify-self-start">
          <a href="/shop" className="hover:text-gray-900">SHOP</a>
          <a href="/about" className="hover:text-gray-900">ABOUT</a>
          <div className="hidden">
            <a href="/support" className="hover:text-gray-900">SUPPORT</a>
            {/* cart moved to right cluster */}
            <div className="absolute left-0 mt-2 hidden group-hover:block bg-white border border-gray-100 rounded shadow-md min-w-[160px]">
              <a href="/support" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">FAQ</a>
              <a href="/support/new" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">문의하기</a>
            </div>
          </div>
          {/* main menu only: SHOP / ABOUT */}
        </nav>
        <div className="flex justify-end items-center gap-2 md:gap-3 whitespace-nowrap md:col-start-3 md:row-start-1">
          {me?.isAdmin && <a href="/admin" className="hidden md:inline hover:text-gray-900">Admin</a>}
          <a href="/cart" className="relative hover:text-gray-900">
            CART
            <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-gray-900 text-white text-xs align-middle">{cartCount}</span>
          </a>
          <div className="relative">
          <button
          className="px-2 py-1 md:px-3 md:py-1.5 rounded border border-gray-200 text-sm hover:bg-gray-50"
            aria-haspopup="menu"
            aria-expanded={acctOpen ? 'true' : 'false'}
            onClick={() => setAcctOpen((v) => !v)}
          >
            Account
          </button>
          {acctOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-100 rounded shadow-md min-w-[160px] py-1">
              {!me ? (
                <>
                  <a href="/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">SIGN UP</a>
                  <a href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">LOGIN</a>
                </>
              ) : (
                <a href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">MYPAGE</a>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 text-gray-700">
            <a href="/shop" className="hover:text-gray-900">SHOP</a>
            <a href="/about" className="hover:text-gray-900">ABOUT</a>
            <a href="/cart" className="hover:text-gray-900">CART <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-gray-900 text-white text-xs align-middle">{cartCount}</span></a>
            <a href="/support" className="hover:text-gray-900">SUPPORT</a>
            <a href="/support/new" className="text-sm text-gray-600">문의하기</a>
            {me?.isAdmin && <a href="/admin" className="hover:text-gray-900">Admin</a>}
            {!me ? (
              <div className="flex gap-2 pt-1">
                <a href="/signup" className="px-3 py-1.5 rounded border border-gray-200 text-sm">SIGN UP</a>
                <a href="/login" className="px-3 py-1.5 rounded border border-gray-200 text-sm">LOGIN</a>
              </div>
            ) : (
              <a href="/account" className="px-3 py-1.5 rounded border border-gray-200 text-sm w-max">MYPAGE</a>
            )}
            
          </div>
        </div>
      )}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-700">
        <div className="flex flex-col gap-2">
          <div className={`font-semibold text-gray-900 ${koho.className}`}>NANO RECIPE.</div>
          <div>상호: 주식회사 앱톤</div>
          <div>사업자등록번호: 897-87-01516</div>
          <div>사업장소재지: 경기도 김포시 장기동 789, 704-705호</div>
          <div className="flex flex-wrap gap-4 mt-1">
            <a className="underline hover:text-gray-900" href="tel:1544-3197">고객센터: 1544-3197</a>
            <a className="underline hover:text-gray-900" href="mailto:contact@appton.co.kr">이메일: contact@appton.co.kr</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
