import * as React from 'react'

import { cn } from '@/lib/utils/cn'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        'bg-muted-foreground/15 animate-pulse rounded-md motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
