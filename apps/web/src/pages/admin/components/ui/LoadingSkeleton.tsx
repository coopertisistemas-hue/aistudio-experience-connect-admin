function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-sand-200 rounded-lg animate-pulse ${className ?? ''}`}></div>;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white border border-sand-100 rounded-xl">
          <SkeletonBlock className="w-8 h-8 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-3.5 w-1/3" />
            <SkeletonBlock className="h-3 w-1/2" />
          </div>
          <SkeletonBlock className="h-6 w-20 rounded-full" />
          <SkeletonBlock className="h-3.5 w-16 hidden sm:block" />
        </div>
      ))}
    </div>
  );
}

export function KPISkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-sand-100 rounded-2xl p-5 space-y-3">
          <SkeletonBlock className="w-9 h-9 rounded-xl" />
          <div className="space-y-1.5">
            <SkeletonBlock className="h-7 w-16" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-sand-100 rounded-2xl p-5 space-y-4">
          <SkeletonBlock className="w-full h-24 rounded-xl" />
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/2" />
          </div>
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <KPISkeleton />
      <TableSkeleton />
    </div>
  );
}