import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { useContractSession } from '@/app/state/contract-session'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ContractDoc = {
  id: string
  name?: string
  uploadedAt?: number
  extractedText?: string
  analysis?: any
}

function short(s: string, max = 140) {
  const t = String(s || '').trim().replace(/\s+/g, ' ')
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

export function HistoryPage() {
  const nav = useNavigate()
  const { setAnalysis, setExtractedText } = useContractSession()
  const [items, setItems] = React.useState<ContractDoc[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!db) {
      setLoading(false)
      setError('Firebase is not configured. Add your Firebase env vars and reload.')
      return
    }

    setLoading(true)
    setError(null)

    const q = query(collection(db, 'contracts'), orderBy('uploadedAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          })),
        )
        setLoading(false)
      },
      (e) => {
        console.error(e)
        setError('Unable to load history right now.')
        setLoading(false)
      },
    )

    return () => unsub()
  }, [])

  return (
    <div className="pb-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            History
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Contract history
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Real-time Firestore history from the <span className="text-foreground/80">contracts</span>{' '}
            collection.
          </p>
        </div>
        <Button asChild variant="outline" className="h-10">
          <Link to="/upload">Upload Contract</Link>
        </Button>
      </div>

      {error ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Couldn’t load history</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">{error}</div>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Loading…</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Fetching contracts from Firestore in real time.
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-4">
          {items.map((item) => {
            const summary = String(item?.analysis?.summary || '')
            const riskScore = item?.analysis?.riskScore ?? item?.analysis?.risk_score
            const clauseCount =
              item?.analysis?.metrics?.clauseCount ?? (Array.isArray(item?.analysis?.clauses) ? item.analysis.clauses.length : undefined)

            return (
              <Card key={item.id} className="rounded-2xl">
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">{item.name || 'Contract'}</CardTitle>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {item.uploadedAt ? new Date(item.uploadedAt).toLocaleString() : '—'}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="h-10"
                      onClick={() => {
                        setAnalysis(item.analysis || null)
                        setExtractedText(String(item.extractedText || ''))
                        nav('/dashboard')
                      }}
                    >
                      View
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="info">Risk: {typeof riskScore === 'number' ? riskScore : '—'}</Badge>
                    <Badge variant="default">Clauses: {typeof clauseCount === 'number' ? clauseCount : '—'}</Badge>
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">{short(summary)}</div>
                </CardContent>
              </Card>
            )
          })}

          {items.length === 0 ? (
            <Card className="rounded-2xl">
              <CardHeader className="p-6">
                <CardTitle className="text-base">No contracts yet</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-sm text-muted-foreground">
                  Upload and analyze a contract to see it appear here instantly.
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}