import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { useCurrency } from '../../lib/currency'

export default function ProductDetailPage() {
  const router = useRouter()
  const { id } = router.query || {}
  if (!id) return null
  const { format } = useCurrency()

  const q = useQuery({
    queryKey: ['product', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/products/' + id)
      if (!res.ok) throw new Error('Failed to load product')
      return res.json()
    },
  })

  return (
    <>
      <Head>
        <title>{q.data?.name ? (q.data.name + ' | nanorecipe') : 'Product Detail | nanorecipe'}</title>
        {q.data?.description && (
          <meta name="description" content={plainText(q.data.description).slice(0, 150)} />
        )}
      </Head>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {q.isLoading ? (
          <p className="text-gray-600">Loading...</p>
        ) : q.isError ? (
          <p className="text-rose-600">Failed to load product</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="relative w-full aspect-[4/3] bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                <Image src={q.data.image} alt={q.data.name} fill className="object-cover" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{q.data.name}</h1>
              <div className="mt-2 text-lg font-semibold text-gray-900">{format(q.data.price)}</div>
              {q.data.shippingFee > 0 && (
                <div className="mt-1 text-sm text-gray-600">Shipping {format(q.data.shippingFee)}</div>
              )}
              <div className="mt-4 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: q.data.description || '' }} />
              </div>
              <div className="mt-6 flex gap-3">
                <a href={'/p/' + encodeURIComponent(q.data.sku || id)} className="px-4 py-2 rounded-md bg-gray-900 text-white">View Detail</a>
                <a href="/cart" className="px-4 py-2 rounded-md bg-gray-100 text-gray-900">View Cart</a>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

function plainText(html) {
  if (!html) return ''
  const tmp = typeof window !== 'undefined' ? document.createElement('div') : null
  if (!tmp) return ''
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}
