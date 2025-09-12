import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useCurrency } from '../lib/currency'

export default function ShopPage() {
  const { format } = useCurrency()

  const q = useQuery({
    queryKey: ['products', typeof window !== 'undefined' ? window.location.search : ''],
    queryFn: async () => {
      const query = typeof window !== 'undefined' ? window.location.search : ''
      const res = await fetch('http://localhost:4000/api/products' + query)
      if (!res.ok) throw new Error('Failed to load products')
      return res.json()
    },
  })

  const items = Array.isArray(q.data?.items) ? q.data.items : Array.isArray(q.data) ? q.data : []

  return (
    <>
      <Head>
        <title>Shop | nanorecipe</title>
        <meta name="description" content="Browse and buy nanorecipe cosmetics" />
      </Head>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Shop</h1>
        {q.isLoading ? (
          <p className="text-gray-600">Loading products...</p>
        ) : q.isError ? (
          <p className="text-rose-600">Failed to load products</p>
        ) : (
          <section aria-label="Product list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
              <article key={p.sku || p.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                <Link href={`/p/${encodeURIComponent(p.sku || p.id)}`} className="block group">
                  <div className="relative w-full h-52">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-medium text-gray-900 group-hover:underline">{p.title || p.name}</h2>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{p.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{format(p.price)}</span>
                      <span className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm">View</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  )
}
