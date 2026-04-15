import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthDivider, AuthShell } from '@/pages/auth/auth-shell'
import { auth, firebaseReady, googleProvider } from '@/lib/firebase'

export function LoginPage() {
  const [show, setShow] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const nav = useNavigate()

  return (
    <div className="h-full py-0">
      <AuthShell
        title="Welcome back"
        subtitle={
          <>
            Sign in to continue to your <span className="text-foreground/80">contract workspace</span>.
          </>
        }
        footer={
          <div className="text-xs text-muted-foreground">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-indigo-700 hover:underline dark:text-indigo-200">
              Sign up
            </Link>
          </div>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            if (!firebaseReady || !auth) {
              setError('Firebase is not configured. Add your Firebase keys to `.env` and restart Vite.')
              return
            }
            setLoading(true)
            signInWithEmailAndPassword(auth, email.trim(), password)
              .then(() => nav('/upload'))
              .catch((err) => setError(err?.message || 'Sign in failed'))
              .finally(() => setLoading(false))
          }}
          className="grid gap-4"
        >
          {error ? (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <div className="text-xs font-medium text-muted-foreground">Email</div>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@company.com"
                className="pl-10"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">Password</div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (!firebaseReady || !auth) {
                    setError('Firebase is not configured. Add your Firebase keys to `.env` and restart Vite.')
                    return
                  }
                  const mail = email.trim()
                  if (!mail) {
                    setError('Enter your email first, then click “Forgot password?”')
                    return
                  }
                  setError(null)
                  setLoading(true)
                  sendPasswordResetEmail(auth, mail)
                    .then(() => setError('Password reset email sent. Check your inbox.'))
                    .catch((err) => setError(err?.message || 'Failed to send reset email'))
                    .finally(() => setLoading(false))
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? 'text' : 'password'}
                placeholder="••••••••••"
                className="pl-10 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground dark:hover:bg-white/[0.06]"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="shadow-glow bg-[linear-gradient(135deg,rgba(99,102,241,1),rgba(59,130,246,0.95),rgba(168,85,247,0.85))] hover:brightness-[1.03]"
          >
            {loading ? 'Signing in…' : 'Sign in'}
            <ArrowRight className="h-4 w-4" />
          </Button>

          <AuthDivider label="or continue with" />

          <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.2 }} className="grid gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 justify-center"
              disabled={loading}
              onClick={() => {
                setError(null)
                if (!firebaseReady || !auth) {
                  setError('Firebase is not configured. Add your Firebase keys to `.env` and restart Vite.')
                  return
                }
                setLoading(true)
                signInWithPopup(auth, googleProvider)
                  .then(() => nav('/upload'))
                  .catch((err) => setError(err?.message || 'Google sign-in failed'))
                  .finally(() => setLoading(false))
              }}
            >
              Continue with Google
            </Button>
          </motion.div>
        </form>
      </AuthShell>
    </div>
  )
}

