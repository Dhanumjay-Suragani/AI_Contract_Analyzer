import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-white/60 text-foreground dark:bg-white/[0.06]',
        info:
          'bg-indigo-500/10 text-indigo-700 dark:text-indigo-200 border-indigo-400/20',
        warning:
          'bg-amber-500/10 text-amber-700 dark:text-amber-200 border-amber-400/20',
        danger: 'bg-red-500/10 text-red-700 dark:text-red-200 border-red-400/20',
        success:
          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 border-emerald-400/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

