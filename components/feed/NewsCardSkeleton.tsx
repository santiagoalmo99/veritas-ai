export function NewsCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden flex flex-col animate-pulse">
      {/* Image skeleton */}
      <div className="skeleton h-48 rounded-none" />

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        {/* Outlet line */}
        <div className="flex items-center gap-2">
          <div className="skeleton w-4 h-4 rounded-full" />
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-3 w-16 rounded ml-auto" />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="skeleton h-4 w-4/6 rounded" />
        </div>

        {/* Techniques */}
        <div className="flex gap-2">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-24 rounded-full" />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1 border-t border-[var(--border-subtle)]">
          <div className="skeleton h-8 w-16 rounded-md" />
          <div className="skeleton h-8 flex-1 rounded-md" />
          <div className="skeleton h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  )
}
