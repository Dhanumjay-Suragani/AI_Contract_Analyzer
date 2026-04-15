import { motion } from 'framer-motion'
import { ArrowRight, Brain, FileSearch, ShieldAlert, Sparkles, Wand2 } from 'lucide-react'
import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useContractSession } from '@/app/state/contract-session'
import { db } from '@/lib/firebase'
import { cn } from '@/lib/utils'

const features = [
  {
    title: 'AI Summarization',
    desc: 'Instant executive briefs with obligations, deadlines, and carve-outs.',
    icon: Brain,
    accent: 'from-indigo-500/35 to-sky-400/20',
  },
  {
    title: 'Risk Detection',
    desc: 'Spot renewal traps, liability cliffs, and non-standard language in seconds.',
    icon: ShieldAlert,
    accent: 'from-fuchsia-500/30 to-indigo-500/15',
  },
  {
    title: 'Clause Extraction',
    desc: 'Auto-categorize clauses for fast review and clean internal sharing.',
    icon: FileSearch,
    accent: 'from-sky-400/25 to-emerald-400/10',
  },
  {
    title: 'Smart Chat',
    desc: 'Ask questions in plain English with context-aware answers.',
    icon: Wand2,
    accent: 'from-indigo-500/25 to-fuchsia-400/15',
  },
] as const

function GlowDivider() {
  return (
    <div className="relative my-10 h-px w-full overflow-hidden">
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.75),rgba(59,130,246,0.65),rgba(168,85,247,0.55),transparent)] opacity-80 blur-sm" />
    </div>
  )
}

export function LandingPage() {
  const nav = useNavigate()
  const { history, setAnalysis, setExtractedText } = useContractSession()
  const [remote, setRemote] = React.useState<any[]>([])

  React.useEffect(() => {
    if (!db) return
    const q = query(collection(db, 'contracts'), orderBy('uploadedAt', 'desc'), limit(3))
    const unsub = onSnapshot(q, (snap) => {
      setRemote(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })),
      )
    })
    return () => unsub()
  }, [])

  const recent = remote.length ? remote : history.slice(0, 3)

  return (
    <div className="pb-10">
      <section className="relative">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur dark:bg-white/[0.06]"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
              Production-grade contract intelligence
              <span className="ml-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-indigo-700 dark:text-indigo-200">
                AI-Powered Contract Intelligence
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            >
              <span className="block">Understand Contracts</span>
              <span className="block">
                <span className="gradient-text text-[1.05em]">Instantly</span> with AI
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
            >
              Upload a contract, let GenAI extract clauses, detect risks, and generate a clean
              executive summary. Then chat with the agreement like it’s a teammate.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button
                asChild
                size="lg"
                className="shadow-glow bg-[linear-gradient(135deg,rgba(99,102,241,1),rgba(59,130,246,0.95),rgba(168,85,247,0.85))] hover:brightness-[1.03]"
              >
                <Link to="/upload" className="group">
                  Upload Contract
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <a
                href="#features"
                className="inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground dark:hover:bg-white/[0.06]"
              >
                Explore Features
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-10 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"
            >
              <span className="rounded-full border border-white/10 bg-white/60 px-3 py-1 backdrop-blur dark:bg-white/[0.06]">
                SOC2-ready UX patterns
              </span>
              <span className="rounded-full border border-white/10 bg-white/60 px-3 py-1 backdrop-blur dark:bg-white/[0.06]">
                Explainable risk flags
              </span>
              <span className="rounded-full border border-white/10 bg-white/60 px-3 py-1 backdrop-blur dark:bg-white/[0.06]">
                Recruiter-grade polish
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:mt-6"
          >
            <div className="glass-strong relative overflow-hidden rounded-2xl p-6">
              <div className="absolute inset-0 opacity-50 [background:radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.65),transparent_55%)]" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Contract Health Snapshot</div>
                  <span className="rounded-full border border-white/10 bg-white/60 px-2.5 py-1 text-xs text-muted-foreground dark:bg-white/[0.06]">
                    Live preview
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    { k: 'Risk Score', v: '68', hint: 'Medium', bar: 68 },
                    { k: 'Clauses', v: '24', hint: 'Detected', bar: 52 },
                    { k: 'Renewal Trap', v: 'Found', hint: '30-day window', bar: 74 },
                  ].map((row) => (
                    <div
                      key={row.k}
                      className="rounded-xl border border-white/10 bg-white/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl dark:bg-white/[0.04]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground">{row.k}</div>
                          <div className="mt-1 text-xl font-semibold tracking-tight">{row.v}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{row.hint}</div>
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/[0.06]">
                        <div
                          className="h-full bg-[linear-gradient(90deg,rgba(99,102,241,1),rgba(59,130,246,1),rgba(168,85,247,1))]"
                          style={{ width: `${row.bar}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { title: 'Export-ready', desc: 'Shareable summary & clause list' },
                    { title: 'Explainable AI', desc: 'Reasoning + risk drivers' },
                  ].map((x) => (
                    <div
                      key={x.title}
                      className="rounded-xl border border-white/10 bg-white/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl dark:bg-white/[0.04]"
                    >
                      <div className="text-sm font-semibold">{x.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{x.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />
          </motion.div>
        </div>

        <GlowDivider />
      </section>

      <section className="scroll-mt-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recent Analyses
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Recent Analyses</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Reopen past contract insights instantly — stored locally in your browser.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-4">
          {recent.map((item) => (
            <Card key={item.id} className="rounded-2xl">
              <CardHeader className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.uploadedAt || Date.now()).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="h-10"
                    onClick={() => {
                      setAnalysis(item.analysis)
                      setExtractedText(item.extractedText)
                      nav('/dashboard')
                    }}
                  >
                    View
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-sm text-muted-foreground">
                  Open the latest dashboard view for this contract.
                </div>
              </CardContent>
            </Card>
          ))}

          {recent.length === 0 ? (
            <Card className="rounded-2xl">
              <CardHeader className="p-6">
                <CardTitle className="text-base">No analyses yet</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-sm text-muted-foreground">
                  Upload a contract to generate your first analysis. Your recent analyses will appear here.
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <GlowDivider />
      </section>

      <section id="features" className="scroll-mt-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Capabilities
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for speed, clarity, and confidence
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Every surface is tuned for premium SaaS feel: glass depth, subtle motion, clean
              hierarchy, and recruiter-grade polish.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, idx) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card
                  className={cn(
                    'group relative flex h-full flex-col overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-glow',
                  )}
                >
                  <div className={cn('absolute inset-0 opacity-60 bg-gradient-to-br', f.accent)} />
                  <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.55),transparent_55%)] dark:opacity-30" />
                  <CardHeader className="relative p-6">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/70 shadow-sm backdrop-blur dark:bg-white/[0.07]">
                        <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                      </span>
                      <CardTitle className="text-base">{f.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="relative flex flex-1 flex-col justify-between p-6 pt-0">
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-indigo-700 dark:text-indigo-200">
                      Learn more
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

