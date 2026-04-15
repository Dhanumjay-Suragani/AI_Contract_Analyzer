import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, updateProfile } from 'firebase/auth'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthDivider, AuthShell } from '@/pages/auth/auth-shell'
import { auth, firebaseReady, googleProvider } from '@/lib/firebase'

export function SignupPage() {
  const [show, setShow] = React.useState(false)
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const nav = useNavigate()

  return (
    <div className="h-full py-0">
      <AuthShell
        title="Create your account"
        subtitle={
          <>
            Start analyzing contracts in minutes. Premium UI, fast flow, and a chat assistant that
            stays in context.
          </>
        }
        footer={
          <div className="text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-700 hover:underline dark:text-indigo-200">
              Sign in
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
            createUserWithEmailAndPassword(auth, email.trim(), password)
              .then(async (cred) => {
                if (name.trim()) {
                  await updateProfile(cred.user, { displayName: name.trim() })
                }
                await sendEmailVerification(cred.user).catch(() => {})
                nav('/upload')
              })
              .catch((err) => setError(err?.message || 'Sign up failed'))
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
            <div className="text-xs font-medium text-muted-foreground">Full name</div>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="pl-10"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-xs font-medium text-muted-foreground">Work email</div>
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
            <div className="text-xs font-medium text-muted-foreground">Password</div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? 'text' : 'password'}
                placeholder="Create a strong password"
                className="pl-10 pr-10"
                autoComplete="new-password"
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
            <div className="text-[11px] leading-relaxed text-muted-foreground">
              By creating an account, you agree to our{' '}
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">
                Terms
              </a>{' '}
              and{' '}
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">
                Privacy Policy
              </a>
              .
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="shadow-glow bg-[linear-gradient(135deg,rgba(99,102,241,1),rgba(59,130,246,0.95),rgba(168,85,247,0.85))] hover:brightness-[1.03]"
          >
            {loading ? 'Creating…' : 'Create account'}
            <ArrowRight className="h-4 w-4" />
          </Button>

          <AuthDivider label="or" />

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

