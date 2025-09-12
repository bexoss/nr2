import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useCurrency } from '../lib/currency'
import { useDialog } from '../lib/dialog'

export default function Home() {
  const [me, setMe] = useState(null)
  const { format } = useCurrency()
  const dialog = useDialog()

  const products = useQuery({
    queryKey: ['home-bestsellers'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/products?best=true&limit=6')
      if (!res.ok) throw new Error('Failed to load products')
      return res.json()
    },
  })

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) return
    fetch('http://localhost:4000/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null))
  }, [])

  const items = Array.isArray(products.data?.items) ? products.data.items : Array.isArray(products.data) ? products.data : []

  return (
    <main className="max-w-6xl mx-auto px-4">
      <section className="mt-6 p-6 rounded-xl bg-gradient-to-br from-pink-50 to-blue-50 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">Glow this season</h2>
          <p className="text-gray-600">Discover skincare and makeup crafted to make you shine.</p>
          <div className="mt-4 flex gap-3">
            <a href="#shop" className="inline-flex items-center px-4 py-2 rounded-md bg-gray-900 text-white">Shop Bestsellers</a>
            <a href="/cart" className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-900">View Cart</a>
          </div>
        </div>
        <div className="w-full md:w-[420px]">
          <Image
            src="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=80"
            alt="Cosmetics Hero"
            width={900}
            height={600}
            className="rounded-xl w-full h-auto"
            priority
          />
        </div>
      </section>

      <h3 id="shop" className="mt-8 mb-3 text-xl font-semibold">Bestsellers</h3>
      {products.isLoading ? (
        <p>Loading products...</p>
      ) : products.isError ? (
        <p className="text-rose-600">{String(products.error)}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((p) => (
            <article className="border border-gray-100 rounded-lg overflow-hidden bg-white" key={p.sku || p.id}>
              <div className="relative w-full h-48">
                <Image src={p.image} alt={p.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-3">
                <a href={`/p/${encodeURIComponent(p.sku || p.id)}`} className="hover:underline"><h4 className="font-semibold mb-1">{p.title || p.name}</h4></a>
                <p className="text-sm text-gray-600 mb-2">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{format(p.price)}</span>
                  <button className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-900 text-white" onClick={() => addToCartUnified(p, dialog)}>Add to Cart</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!me && (
        <section className="mt-8">
          <h3 className="text-lg font-semibold">Sign in to save your cart</h3>
          <div className="flex gap-3 mt-2">
            <a className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-900" href="http://localhost:4000/auth/google">Login with Google</a>
            <a className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-900" href="http://localhost:4000/auth/facebook">Login with Facebook</a>
            <a className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-900" href="http://localhost:4000/auth/line">Login with LINE</a>
          </div>
        </section>
      )}
    </main>
  )
}

async function addToCartUnified(product, dialog) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  try {
    if (!token) {
      const anon = JSON.parse(localStorage.getItem('anon_cart') || '{"items": []}')
      const items = Array.isArray(anon.items) ? anon.items : []
      const id = product.sku || product.id
      const idx = items.findIndex((it) => it.productId === id)
      if (idx >= 0) items[idx] = { ...items[idx], qty: (items[idx].qty || 1) + 1 }
      else items.push({ productId: id, name: product.title || product.name, price: product.price, qty: 1 })
      localStorage.setItem('anon_cart', JSON.stringify({ items }))
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart:updated'))
      dialog?.alert?.('Added to cart')
      return
    }
    const cartRes = await fetch('http://localhost:4000/api/cart', { headers: { Authorization: `Bearer ${token}` } })
    const current = cartRes.ok ? await cartRes.json() : { items: [] }
    const items = [...(current.items || [])]
    const id = product.sku || product.id
    const idx = items.findIndex((it) => it.productId === id)
    if (idx >= 0) items[idx] = { ...items[idx], qty: (items[idx].qty || 1) + 1 }
    else items.push({ productId: id, name: product.title || product.name, price: product.price, qty: 1 })
    const saveRes = await fetch('http://localhost:4000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items }),
    })
    if (!saveRes.ok) throw new Error('Failed to save cart')
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart:updated'))
    dialog?.alert?.('Added to cart')
  } catch (e) {
    dialog?.alert?.('Failed to add to cart: ' + (e?.message || e))
  }
}
