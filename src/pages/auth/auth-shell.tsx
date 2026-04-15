import * as React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_420px]">
      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong relative overflow-hidden rounded-3xl p-8"
        >
          <div className="absolute inset-0 opacity-50 [background:radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.6),transparent_55%)] dark:opacity-15" />
          <div className="absolute inset-0 opacity-60 [background:linear-gradient(135deg,rgba(99,102,241,0.18),transparent_55%)]" />
          <div className="relative">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Secure workspace
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-tight">
              Review contracts with the polish of a top-tier legal ops stack.
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Upload → analyze → dashboard → chat. Everything is designed for clarity, speed, and
              confidence.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                { k: 'Clause extraction', v: 'Structured in seconds' },
                { k: 'Risk detection', v: 'Explainable red flags' },
                { k: 'Smart chat', v: 'Context-aware answers' },
              ].map((x) => (
                <div
                  key={x.k}
                  className="rounded-2xl border border-white/10 bg-white/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl dark:bg-white/[0.04]"
                >
                  <div className="text-sm font-semibold">{x.k}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{x.v}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-xs text-muted-foreground">
              New here?{' '}
              <Link to="/signup" className="text-indigo-700 hover:underline dark:text-indigo-200">
                Create an account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 opacity-50 [background:radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.6),transparent_55%)] dark:opacity-15" />
          <CardHeader className="relative p-7">
            <CardTitle className="text-xl font-semibold tracking-tight">{title}</CardTitle>
            <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div>
          </CardHeader>
          <CardContent className="relative p-7 pt-0">
            {children}
            {footer ? <div className="mt-6">{footer}</div> : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative my-5">
      <div className="h-px w-full bg-white/10" />
      <div
        className={cn(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-background/70 px-2 py-0.5 text-[11px] text-muted-foreground backdrop-blur',
        )}
      >
        {label}
      </div>
    </div>
  )
}

