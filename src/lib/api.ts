const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = String(err?.message || err?.error || 'API Error')
    const e = new Error(msg)
    ;(e as any).status = res.status
    ;(e as any).retryAfter = err?.retryAfter
    throw e
  }

  return res.json()
}