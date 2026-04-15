import * as React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Clock, FileUp, LayoutDashboard, MessageSquareText, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAvatar } from '@/components/user-avatar'
import { Separator } from '@/components/ui/separator'
import { AnimatedBackdrop } from '@/components/visual/animated-backdrop'

const nav = [
  { to: '/upload', label: 'Upload', icon: FileUp },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/chat', label: 'Chat', icon: MessageSquareText },
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const isAuth = location.pathname === '/login' || location.pathname === '/signup'

  React.useEffect(() => {
    if (!isAuth) return
    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [isAuth])

  return (
    <div className="min-h-screen">
      <AnimatedBackdrop />

      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-white/60 dark:hover:bg-white/[0.06]"
            >
              <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,rgba(99,102,241,1),rgba(59,130,246,1),rgba(168,85,247,1))] shadow-soft">
                <Sparkles className="h-5 w-5 text-white" />
                <span className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.65),transparent_55%)]" />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">AI Contract Analyzer</div>
                <div className="text-xs text-muted-foreground">Smart Agreement Assistant</div>
              </div>
            </Link>
          </div>

          <nav className={cn('hidden items-center gap-1 md:flex', isLanding && 'opacity-90')}>
            {nav.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-white/60 hover:text-foreground dark:hover:bg-white/[0.06]',
                      isActive && 'text-foreground bg-white/70 dark:bg-white/[0.06] shadow-sm',
                    )
                  }
                >
                  <Icon className="h-4 w-4 opacity-80 transition-opacity group-hover:opacity-100" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Separator orientation="vertical" className="hidden h-7 sm:block" />
              <UserAvatar />
            </div>
          </div>
        </div>
      </header>

      <main
        className={cn(
          'mx-auto max-w-7xl px-6 lg:px-8',
          isAuth
            ? 'grid h-[calc(100vh-72px)] place-items-center overflow-hidden pt-10 pb-0 sm:pt-12'
            : 'pb-16 pt-8',
        )}
      >
        {children}
      </main>
    </div>
  )
}

