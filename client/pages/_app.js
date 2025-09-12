import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '../styles/globals.css'
import { DialogProvider } from '../lib/dialog'
import { CurrencyProvider, useCurrency } from '../lib/currency'
import { KoHo } from 'next/font/google'

const koho = KoHo({ weight: '600', subsets: ['latin'] })

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient())
  const [me, setMe] = useState(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) return setMe(null)
    fetch('http://localhost:4000/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null))
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <DialogProvider>
          <div className="min-h-screen flex flex-col">
            <Header me={me} />
            <div className="flex-1">
              <Component {...pageProps} />
            </div>
            <SiteFooter />
          </div>
        </DialogProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  )
}

function Header({ me }) {
  const { currency } = useCurrency()
  const [open, setOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [q, setQ] = useState('')
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    async function load() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        try {
          const anon = JSON.parse(localStorage.getItem('anon_cart') || '{"items": []}')
          const n = Array.isArray(anon.items) ? anon.items.reduce((s, it) => s + (it.qty || 1), 0) : 0
          setCartCount(n)
        } catch (_) {
          setCartCount(0)
        }
      } else {
        try {
          const res = await fetch('http://localhost:4000/api/cart', { headers: { Authorization: `Bearer ${token}` } })
          const json = await res.json()
          const n = Array.isArray(json.items) ? json.items.reduce((s, it) => s + (it.qty || 1), 0) : 0
          setCartCount(n)
        } catch (_) {
          setCartCount(0)
        }
      }
    }
    load()
    const onUpd = () => load()
    if (typeof window !== 'undefined') window.addEventListener('cart:updated', onUpd)
    return () => { if (typeof window !== 'undefined') window.removeEventListener('cart:updated', onUpd) }
  }, [])

  function submitSearch(e) {
    e.preventDefault()
    window.location.href = `/shop?search=${encodeURIComponent(q)}`
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4" style={{ height: 78 }}>
        <div className="h-full grid grid-cols-3 items-center">
          <div className="flex items-center gap-4 whitespace-nowrap overflow-hidden">
            <button className="md:hidden p-2 rounded border border-gray-200" aria-label="메뉴 열기" aria-expanded={open ? 'true' : 'false'} onClick={() => setOpen(!open)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <nav className="hidden md:flex items-center gap-4 text-gray-700">
              <a href="/shop" className="hover:text-gray-900">SHOP</a>
              <a href="/about" className="hover:text-gray-900">ABOUT</a>
              <a href="/usage-guide" className="hover:text-gray-900">HOW TO USE</a>
            </nav>
          </div>
          <div className="flex items-center justify-center">
            <a href="/"><h1 className={`m-0 text-xl font-semibold text-gray-900 ${koho.className}`}>NANO RECIPE.</h1></a>
          </div>
          <div className="flex justify-end items-center gap-3 whitespace-nowrap">
            <a href="/support" className="hidden md:inline hover:text-gray-900">SUPPORT</a>
            <button className="hidden md:inline px-3 py-1.5 rounded border border-gray-200 text-sm hover:bg-gray-50" onClick={() => setShowSearch((v) => !v)}>SEARCH</button>
            <a href="/cart" className="relative hover:text-gray-900">CART <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-gray-900 text-white text-xs align-middle">{cartCount}</span></a>
            <a href="/account" className="px-3 py-1.5 rounded border border-gray-200 text-sm">ACCOUNT</a>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 text-gray-700">
            <a href="/shop" className="hover:text-gray-900">SHOP</a>
            <a href="/about" className="hover:text-gray-900">ABOUT</a>
            <a href="/usage-guide" className="hover:text-gray-900">HOW TO USE</a>
            <a href="/support" className="hover:text-gray-900">SUPPORT</a>
            {me?.isAdmin && <a href="/admin" className="hover:text-gray-900">Admin</a>}
          </div>
        </div>
      )}
      {showSearch && (
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <form className="flex gap-2" onSubmit={submitSearch}>
              <input className="flex-1 px-3 py-2 rounded border border-gray-200" value={q} onChange={(e) => setQ(e.target.value)} placeholder="상품명, 옵션명으로 검색" />
              <button className="px-4 py-2 rounded bg-gray-900 text-white">검색</button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gray-100 bg-white" style={{ minHeight: 120 }}>
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-700">
        <div className="flex flex-wrap gap-6 items-start justify-between">
          <div>
            <div className={`font-semibold text-gray-900 ${koho.className}`}>NANO RECIPE.</div>
            <div className="mt-2 text-gray-600">Appton Inc.</div>
          </div>
          <nav className="flex flex-col gap-1">
            <a href="/about" className="hover:underline">회사 소개</a>
            <a href="/about#philosophy" className="hover:underline">브랜드 철학</a>
            <a href="/privacy" className="hover:underline">개인정보처리방침</a>
            <a href="/terms" className="hover:underline">이용약관</a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
