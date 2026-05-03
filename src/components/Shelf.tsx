import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface ShelfProps {
  title: string
  href?: string
  children: React.ReactNode
  className?: string
}

export default function Shelf({ title, href, children, className }: ShelfProps) {
  return (
    <section className={cn('mb-10', className)}>
      <div className="flex items-baseline justify-between mb-4 px-5 lg:px-8">
        <h2 className="text-[22px] font-bold tracking-tight">{title}</h2>
        {href && (
          <Link
            to={href}
            className="text-[13px] font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--am-accent)' }}
          >
            See All
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 px-5 lg:px-8 scrollbar-hide">
        {children}
      </div>
    </section>
  )
}
