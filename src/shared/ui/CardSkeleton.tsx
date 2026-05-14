interface CardSkeletonProps {
  count?: number
}

export default function CardSkeleton({ count = 6 }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="aspect-square rounded-2xl" style={{ background: 'var(--am-surface-2)' }} />
          <div className="mt-3 space-y-2">
            <div className="h-3 rounded-full w-3/4" style={{ background: 'var(--am-surface-2)' }} />
            <div className="h-2.5 rounded-full w-1/2" style={{ background: 'var(--am-surface-2)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
