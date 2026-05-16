import { cn } from '@/shared/lib/cn'

interface PageTitleProps {
  children: React.ReactNode
  label?: string
  className?: string
}

export default function PageTitle({ children, label, className }: PageTitleProps) {
  return (
    <div className={cn('mb-8', className)}>
      {label && (
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--am-text-3)' }}>
          {label}
        </span>
      )}
      <h1 className="text-[28px] lg:text-[36px] font-bold tracking-tight leading-tight mt-1" style={{ color: 'var(--am-text)', fontFamily: 'var(--font-display)' }}>
        {children}
      </h1>
    </div>
  )
}
