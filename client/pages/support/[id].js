import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

function useToken() { if (typeof window==='undefined') return null; return localStorage.getItem('auth_token') }

export default function SupportTicketDetail() {
  const token = useToken()
  const router = useRouter()
  const { id } = router.query
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['support','ticket', id],
    enabled: mounted && !!token && !!id,
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/api/support/tickets/' + id, { headers: { Authorization: Bearer  } })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    }
  })

  const post = useMutation({
    mutationFn: async ({ text }) => {
      const res = await fetch('http://localhost:4000/api/support/tickets/' + id + '/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: Bearer  }, body: JSON.stringify({ text })
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support','ticket', id] })
  })

  const close = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:4000/api/support/tickets/' + id + '/close', { method: 'PATCH', headers: { Authorization: Bearer  } })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support','ticket', id] })
  })

  if (!mounted) return <main className="max-w-4xl mx-auto px-4 py-6">Loading...</main>
  if (!token) return <main className="max-w-4xl mx-auto px-4 py-6">Login required</main>

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-3"><a href="/support" className="text-gray-700 underline">Back to list</a></div>
      {q.isLoading ? 'Loading...' : q.isError ? 'Error' : (
        <div>
          <h1 className="text-2xl font-semibold mb-1">{q.data.subject}</h1>
          <div className="text-sm text-gray-600 mb-4">{q.data.status} · {q.data.category} · {q.data.priority}</div>
          <div className="space-y-3">
            {q.data.messages?.map((m, i) => (
              <div key={i} className={'rounded p-2 ' + (m.author==='admin' ? 'bg-blue-50' : 'bg-gray-50')}>
                <div className="text-xs text-gray-500">{m.author} · {new Date(m.createdAt).toLocaleString()}</div>
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.attachments?.length>0 && (
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {m.attachments.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer" className="underline text-sm">Attachment {idx+1}</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <form className="mt-4 space-y-2" onSubmit={(e) => { e.preventDefault(); const text = e.currentTarget.message.value; if (!text) return; post.mutate({ text }); e.currentTarget.reset(); }}>
            <textarea name="message" className="w-full border rounded px-3 py-2 min-h-[100px]" placeholder="Type your message" />
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-gray-900 text-white" type="submit">Send</button>
              {q.data.status!=='closed' && <button className="px-4 py-2 rounded bg-gray-100 text-gray-900" type="button" onClick={() => close.mutate()}>Close Ticket</button>}
            </div>
          </form>
        </div>
      )}
    </main>
  )
}