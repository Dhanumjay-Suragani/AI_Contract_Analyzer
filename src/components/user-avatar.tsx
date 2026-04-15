import { UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/app/providers/auth-provider'

export function UserAvatar() {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return (
      <div className="glass inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm opacity-70">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/70 text-foreground dark:bg-white/[0.06]">
          <UserRound className="h-4 w-4 opacity-80" />
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-xs text-muted-foreground">Account</span>
          <span className="block text-sm font-medium">Loading…</span>
        </span>
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="glass group inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm transition-all hover:shadow-sm active:scale-[0.99]"
        aria-label="Login"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/70 text-foreground dark:bg-white/[0.06]">
          <UserRound className="h-4 w-4 opacity-80" />
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-xs text-muted-foreground">Account</span>
          <span className="block text-sm font-medium">Login</span>
        </span>
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="glass group inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm transition-all hover:shadow-sm active:scale-[0.99]"
      aria-label="Logout"
      title="Click to log out"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/70 text-foreground dark:bg-white/[0.06]">
        <UserRound className="h-4 w-4 opacity-80" />
      </span>
      <span className="hidden text-left leading-tight sm:block">
        <span className="block text-xs text-muted-foreground">Account</span>
        <span className="block text-sm font-medium">
          {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
        </span>
      </span>
    </button>
  )
}

