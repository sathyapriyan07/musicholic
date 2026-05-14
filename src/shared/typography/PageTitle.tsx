import { cn } from '@/shared/lib/cn'

interface PageTitleProps {
  children: React.ReactNode
  className?: string
  label?: string
}

export default function PageTitle({ children, className, label }: PageTitleProps) {
  return (
    <div className={cn('mb-8', className)}>
      {label && (
        <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--am-accent)' }}>
          {label}
        </p>
      )}
      <h1 className="editorial-title">{children}</h1>
    </div>
  )
}
