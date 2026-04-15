import * as React from 'react'
import { AlertTriangle, ArrowRight, FileUp, ShieldCheck, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useContractSession } from '@/app/state/contract-session'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

function riskBadge(score: number) {
  if (score >= 75) return { label: 'High risk', variant: 'danger' as const, icon: ShieldAlert }
  if (score >= 45) return { label: 'Medium risk', variant: 'warning' as const, icon: AlertTriangle }
  return { label: 'Low risk', variant: 'success' as const, icon: ShieldCheck }
}

function clauseColor(risk: 'low' | 'medium' | 'high') {
  if (risk === 'high') return 'border-red-400/25 bg-red-500/10'
  if (risk === 'medium') return 'border-amber-400/25 bg-amber-500/10'
  return 'border-emerald-400/25 bg-emerald-500/10'
}

export function DashboardPage() {
  const { analysis, file } = useContractSession()
  React.useEffect(() => {
    // triggers re-render when analysis changes
  }, [analysis])
  if (!analysis) {
    return (
      <div className="pb-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dashboard
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Contract overview
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Upload a contract to generate summary, risk score, and clause breakdown.
            </p>
          </div>
          <Button asChild>
            <Link to="/upload">
              <FileUp className="h-4 w-4" />
              Upload Contract
            </Link>
          </Button>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Nothing analyzed yet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="glass rounded-xl p-4">
                <div className="text-xs text-muted-foreground">Risk score</div>
                <div className="mt-1 text-lg font-semibold tracking-tight">—</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-xs text-muted-foreground">Clause count</div>
                <div className="mt-1 text-lg font-semibold tracking-tight">—</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-xs text-muted-foreground">Risk level</div>
                <div className="mt-1 text-lg font-semibold tracking-tight">—</div>
              </div>
            </div>
            <div className="mt-5 text-sm text-muted-foreground">
              Tip: upload a PDF or TXT, click <span className="text-foreground/80">Analyze Contract</span>,
              then come back here.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const rb = riskBadge(analysis.riskScore)
  const RiskIcon = rb.icon

  const chart = [
    { name: 'Low', value: analysis.clauses.filter((c) => c.risk === 'low').length },
    { name: 'Medium', value: analysis.clauses.filter((c) => c.risk === 'medium').length },
    { name: 'High', value: analysis.clauses.filter((c) => c.risk === 'high').length },
  ]

  return (
    <div className="pb-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Dashboard
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Contract overview
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {file ? file.name : 'Your contract'} • AI-generated insights and risk posture
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/upload">
              <FileUp className="h-4 w-4" />
              Upload another
            </Link>
          </Button>
          <Button asChild>
            <Link to="/chat" className="group">
              Ask the assistant
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span>AI Summary</span>
                <div className="flex items-center gap-2">
                  {typeof analysis.confidenceScore === 'number' ? (
                    <Badge variant="success">AI confidence: {analysis.confidenceScore}%</Badge>
                  ) : null}
                  <Badge variant="info">Executive brief</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {analysis.summary}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.deadlines.length ? (
                  <ul className="grid gap-2 text-sm text-muted-foreground">
                    {analysis.deadlines.map((d, idx) => (
                      <li key={`${d}-${idx}`} className="glass rounded-xl p-3">
                        {d}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">No explicit deadlines found.</div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Obligations</CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.obligations.length ? (
                  <ul className="grid gap-2 text-sm text-muted-foreground">
                    {analysis.obligations.map((o, idx) => (
                      <li key={`${o}-${idx}`} className="glass rounded-xl p-3">
                        {o}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">No obligations extracted.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span>Risk score</span>
                <Badge variant={rb.variant} className="inline-flex items-center gap-2">
                  <RiskIcon className="h-3.5 w-3.5" />
                  {rb.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-semibold tracking-tight">
                    {analysis.riskScore}
                    <span className="text-base text-muted-foreground">/100</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Weighted by clause language + operational triggers
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  Risk level: <span className="text-foreground/80">{analysis.metrics.riskLevel}</span>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={analysis.riskScore} className="h-2.5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Key insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3">
                {analysis.insights.map((ins) => (
                  <li
                    key={ins.label}
                    className="glass rounded-xl p-4 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold">{ins.label}</div>
                      <Badge
                        variant={
                          ins.tone === 'danger'
                            ? 'danger'
                            : ins.tone === 'warning'
                              ? 'warning'
                              : ins.tone === 'success'
                                ? 'success'
                                : 'default'
                        }
                      >
                        {ins.tone ?? 'neutral'}
                      </Badge>
                    </div>
                    {ins.value && ins.value !== 'Potential legal/financial risk detected' ? (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/80">Why this is risky:</span>{' '}
                        {ins.value}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-muted-foreground">{ins.value}</div>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { k: 'Clause count', v: analysis.metrics.clauseCount },
                  { k: 'Word count', v: analysis.metrics.wordCount.toLocaleString() },
                  { k: 'Risk level', v: analysis.metrics.riskLevel },
                ].map((m) => (
                  <div key={m.k} className="glass rounded-xl p-4">
                    <div className="text-xs text-muted-foreground">{m.k}</div>
                    <div className="mt-1 text-lg font-semibold tracking-tight">{m.v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/40 p-4 backdrop-blur-xl dark:bg-white/[0.03]">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">Clause risk distribution</div>
                  <div className="text-xs text-muted-foreground">counts</div>
                </div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart} barSize={34}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'rgba(148,163,184,0.9)', fontSize: 12 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'rgba(148,163,184,0.9)', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.85)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 12,
                          color: 'white',
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar
                        dataKey="value"
                        fill="rgba(99,102,241,0.9)"
                        radius={[12, 12, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-sm font-semibold tracking-tight">Clause breakdown</div>
            <div className="text-sm text-muted-foreground">
              High-risk clauses are highlighted and prioritized for review.
            </div>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {analysis.clauses.map((c) => (
            <Card
              key={c.id}
              className={[
                'group rounded-2xl border transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-glow',
                clauseColor(c.risk),
              ].join(' ')}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>{c.title}</span>
                  <Badge
                    variant={c.risk === 'high' ? 'danger' : c.risk === 'medium' ? 'warning' : 'success'}
                  >
                    {c.risk.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{c.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.tags.map((t) => (
                    <Badge key={t} variant="default" className="bg-white/55 dark:bg-white/[0.06]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

