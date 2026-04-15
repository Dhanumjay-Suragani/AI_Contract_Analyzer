import * as React from 'react'
import { useTheme } from 'next-themes'
import { Laptop, Moon, Sun } from 'lucide-react'

import { cn } from '@/lib/utils'

const items = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Laptop },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = React.useState(false)

  const current =
    items.find((i) => i.id === theme) ??
    items.find((i) => i.id === 'system') ??
    items[0]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'glass inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-foreground transition-all hover:shadow-sm active:scale-[0.99]',
          open && 'ring-2 ring-ring',
        )}
        aria-label="Toggle theme"
      >
        <current.icon className="h-4 w-4 opacity-80" />
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      {open ? (
        <div
          className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-background/80 shadow-soft backdrop-blur-xl"
          role="menu"
        >
          <div className="p-1">
            {items.map((item) => {
              const Icon = item.icon
              const active = theme === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTheme(item.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-white/60 dark:hover:bg-white/[0.06]',
                    active && 'bg-white/70 dark:bg-white/[0.06]',
                  )}
                  role="menuitem"
                >
                  <Icon className="h-4 w-4 opacity-80" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

