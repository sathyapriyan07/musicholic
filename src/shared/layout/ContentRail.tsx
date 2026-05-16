'use client'

import { cn } from '@/shared/lib/cn'

interface ContentRailProps {
  children: React.ReactNode
  className?: string
  title?: string
  titleClassName?: string
  padding?: boolean
}

export default function ContentRail({ children, className, title, titleClassName, padding = true }: ContentRailProps) {
  return (
    <section className={cn('relative', className)}>
      {title && (
        <h2 className={cn(
          'text-[22px] font-bold tracking-tight mb-5',
          padding && 'px-5 lg:px-8',
          titleClassName
        )}
        style={{ color: 'var(--am-text)' }}
        >
          {title}
        </h2>
      )}
      <div
        className={cn(
          'flex gap-3 overflow-x-auto',
          padding && 'px-5 lg:px-8',
          'scrollbar-hide snap-x snap-mandatory'
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
    </section>
  )
}
