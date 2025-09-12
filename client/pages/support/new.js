import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'

function useToken() { if (typeof window==='undefined') return null; return localStorage.getItem('auth_token') }

export default function SupportNewPage() {
  const token = useToken()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const mutation = useMutation({
    mutationFn: async ({ subject, category, priority, message }) => {
      const res = await fetch('http://localhost:4000/api/support/tickets', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: Bearer  },
        body: JSON.stringify({ subject, category, priority, message })
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: (t) => router.push(/support/)
  })

  if (!mounted) return <main className="max-w-4xl mx-auto px-4 py-6">Loading...</main>
  if (!token) return <main className="max-w-4xl mx-auto px-4 py-6">Login required</main>

  function submit(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const subject = String(form.get('subject') || '').trim()
    const category = String(form.get('category') || 'general')
    const priority = String(form.get('priority') || 'normal')
    const message = String(form.get('message') || '').trim()
    if (!subject || !message) return alert('Please enter subject and message')
    mutation.mutate({ subject, category, priority, message })
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">New Ticket</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700">Subject</label>
          <input name="subject" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Category</label>
            <select name="category" className="w-full border rounded px-3 py-2">
              <option value="order">order</option>
              <option value="product">product</option>
              <option value="payment">payment</option>
              <option value="account">account</option>
              <option value="general">general</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Priority</label>
            <select name="priority" className="w-full border rounded px-3 py-2">
              <option value="low">low</option>
              <option value="normal">normal</option>
              <option value="high">high</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Message</label>
          <textarea name="message" className="w-full border rounded px-3 py-2 min-h-[120px]" />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-gray-900 text-white" type="submit">Create</button>
          <a href="/support" className="px-4 py-2 rounded bg-gray-100 text-gray-900">Cancel</a>
        </div>
      </form>
    </main>
  )
}
