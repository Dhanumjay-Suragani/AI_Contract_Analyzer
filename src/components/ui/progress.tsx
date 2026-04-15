import * as React from 'react'

import { cn } from '@/lib/utils'

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<'div'> & { value?: number }) {
  const v = typeof value === 'number' ? Math.min(100, Math.max(0, value)) : 0
  return (
    <div
      data-slot="progress"
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/[0.06]',
        className,
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-[linear-gradient(90deg,rgba(99,102,241,1),rgba(59,130,246,1),rgba(168,85,247,1))] transition-all duration-500"
        style={{ transform: `translateX(-${100 - v}%)` }}
      />
    </div>
  )
}

export { Progress }

