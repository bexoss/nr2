import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'

export default function ProductDetail() {
  const router = useRouter()
  const { pid } = router.query
  const q = useQuery({
    queryKey: ['product', pid],
    enabled: !!pid,
    queryFn: async () => {
      const res = await fetch(`http://localhost:4000/api/products/${encodeURIComponent(pid)}`)
      if (!res.ok) throw new Error('Not found')
      return res.json()
    },
  })
  if (!pid) return null
  if (q.isLoading) return <main className="max-w-4xl mx-auto px-4 py-8">Loading...</main>
  if (q.isError) return <main className="max-w-4xl mx-auto px-4 py-8">상품을 찾을 수 없습니다.</main>
  const p = q.data
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">{p.title}</h1>
      <div className="prose" dangerouslySetInnerHTML={{ __html: p.content }} />
    </main>
  )
}
