import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useContractSession } from '@/app/state/contract-session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { apiRequest } from '@/lib/api'
import { mapAnalysis } from '@/lib/mapper'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

const steps = [
  'Analyzing clauses…',
  'Detecting risks…',
  'Extracting obligations…',
  'Generating insights…',
  'Preparing dashboard…',
] as const

export function ProcessingPage() {
  const nav = useNavigate()
  const { file, extractedText, setAnalysis, setHistory } = useContractSession()
  const [i, setI] = React.useState(0)
  const [p, setP] = React.useState(12)
  const [error, setError] = React.useState<string | null>(null)
  const [retryKey, setRetryKey] = React.useState(0)

  React.useEffect(() => {
    let raf = 0
    let t = 0
    const start = Date.now()

    const loop = () => {
      const elapsed = Date.now() - start
      const target = Math.min(98, 12 + elapsed / 28)
      setP(target)
      t += 1
      if (t % 48 === 0) setI((v) => Math.min(steps.length - 1, v + 1))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  React.useEffect(() => {
    const runAnalysis = async () => {
      if (!extractedText) {
        nav('/upload', { replace: true })
        return
      }
      try {
        setError(null)
        const res = await apiRequest('/analyze', {
          method: 'POST',
          body: JSON.stringify({ text: extractedText }),
        })
        const mapped = mapAnalysis(res.data, extractedText)
        setAnalysis(mapped)

        if (db) {
          try {
            await addDoc(collection(db, 'contract_history'), {
              name: file?.name || 'Contract',
              extractedText,
              analysis: mapped,
              createdAt: serverTimestamp(),
            })

            await addDoc(collection(db, 'contracts'), {
              name: file?.name || 'Contract',
              uploadedAt: Date.now(),
              extractedText,
              analysis: mapped,
            })
          } catch (e) {
            // Non-blocking: keep app usable even if Firestore write fails
            console.warn('[firestore] write failed', e)
          }
        }

        const now = Date.now()
        const newItem = {
          id: now.toString(),
          name: file?.name || 'Contract',
          uploadedAt: now,
          extractedText,
          analysis: mapped,
        }
        setHistory((prev) => {
          const next = [newItem, ...prev].slice(0, 10)
          try {
            localStorage.setItem('contract_history', JSON.stringify(next))
          } catch {
            // ignore
          }
          return next
        })
        nav('/dashboard', { replace: true })
      } catch (err) {
        console.error(err)
        const anyErr = err as any
        const retryAfter = anyErr?.retryAfter
        if (typeof retryAfter === 'number' && Number.isFinite(retryAfter) && retryAfter > 0) {
          setError(anyErr?.message || `Analysis failed. Please retry in ${retryAfter}s.`)
        } else {
          setError(anyErr?.message || 'Analysis failed. Please retry.')
        }
      }
    }
    void runAnalysis()
  }, [extractedText, nav, setAnalysis, retryKey, file?.name, setHistory])

  return (
    <div className="mx-auto max-w-3xl pt-10">
      <Card className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 opacity-50 [background:radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.6),transparent_55%)] dark:opacity-15" />
        <div className="absolute inset-0 opacity-30 [background:linear-gradient(135deg,rgba(99,102,241,0.25),transparent_55%)]" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
            Processing
          </CardTitle>
          <div className="mt-1 text-sm text-muted-foreground">
            {file ? `Working on ${file.name}` : 'Working on your contract'}
          </div>
        </CardHeader>
        <CardContent className="relative">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/10 p-4">
              <div className="text-sm font-semibold text-red-200">Error</div>
              <div className="mt-1 text-sm text-red-200/90">{error}</div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRetryKey((k) => k + 1)}
                  className="h-10"
                >
                  Retry analysis
                </Button>
                <Button asChild variant="outline" className="h-10">
                  <a href="/upload">Back to upload</a>
                </Button>
              </div>
            </div>
          ) : null}
          <div className="grid gap-4">
            <Progress value={p} className="h-2.5" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Running AI pipeline</span>
              <span>{Math.round(p)}%</span>
            </div>

            <div className="mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={steps[i]}
                  initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="text-lg font-semibold tracking-tight"
                >
                  {steps[i]}
                </motion.div>
              </AnimatePresence>
              <div className="mt-2 text-sm text-muted-foreground">
                We’re extracting structure, scoring risk, and generating a dashboard-friendly summary.
              </div>
            </div>

            <div className="mt-6 grid gap-2">
              {steps.map((s, idx) => {
                const done = idx < i
                const active = idx === i
                return (
                  <div
                    key={s}
                    className={[
                      'flex items-center justify-between rounded-xl border border-white/10 bg-white/60 px-4 py-3 text-sm backdrop-blur dark:bg-white/[0.04]',
                      active ? 'shadow-sm' : '',
                    ].join(' ')}
                  >
                    <span className={active ? 'text-foreground' : 'text-muted-foreground'}>
                      {s}
                    </span>
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {active ? 'Running' : 'Queued'}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

