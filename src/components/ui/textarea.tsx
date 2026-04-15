import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[96px] w-full resize-none rounded-md border border-white/10 bg-white/60 px-3 py-2 text-sm shadow-sm backdrop-blur-xl placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.05]',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }

