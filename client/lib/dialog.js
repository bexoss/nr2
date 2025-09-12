import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const DialogCtx = createContext(null)

export function DialogProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [resolver, setResolver] = useState(null)

  const alertFn = useCallback((msg) => {
    setMessage(String(msg || ''))
    setResolver(() => null)
    setOpen(true)
  }, [])

  const confirmFn = useCallback((msg) => {
    setMessage(String(msg || ''))
    return new Promise((resolve) => {
      setResolver(() => resolve)
      setOpen(true)
    })
  }, [])

  const value = useMemo(() => ({ alert: alertFn, confirm: confirmFn }), [alertFn, confirmFn])

  return (
    <DialogCtx.Provider value={value}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setOpen(false); if (resolver) resolver(false) }} />
          <div className="relative bg-white rounded shadow-lg w-[90%] max-w-sm p-4">
            <div className="text-gray-900 text-sm whitespace-pre-line">{message}</div>
            <div className="mt-4 flex justify-end gap-2">
              {resolver && (
                <button className="px-3 py-1.5 rounded border border-gray-200 text-sm" onClick={() => { setOpen(false); resolver(false) }}>취소</button>
              )}
              <button className="px-3 py-1.5 rounded bg-gray-900 text-white text-sm" onClick={() => { setOpen(false); if (resolver) resolver(true) }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </DialogCtx.Provider>
  )
}

export function useDialog() {
  return useContext(DialogCtx) || { alert: () => {}, confirm: async () => false }
}
