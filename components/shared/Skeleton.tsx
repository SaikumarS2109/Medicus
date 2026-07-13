function Bone({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="p-4 border rounded-lg shadow-sm space-y-2">
      <div className="flex justify-between">
        <Bone className="h-4 w-32" />
        <Bone className="h-5 w-20 rounded-full" />
      </div>
      <Bone className="h-3 w-48" />
      <Bone className="h-3 w-36" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-sm space-y-2">
          <Bone className="h-4 w-32" />
          <Bone className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-100 px-6 py-4 flex gap-8">
        {Array.from({ length: cols }).map((_, i) => (
          <Bone key={i} className="h-4 w-24" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 border-b flex gap-8">
          {Array.from({ length: cols }).map((_, j) => (
            <Bone key={j} className="h-4 w-24" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8 space-y-4">
        <Bone className="h-6 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Bone className="h-3 w-24" />
              <Bone className="h-9 w-full" />
            </div>
          ))}
        </div>
        <Bone className="h-10 w-full" />
      </div>
    </div>
  );
}
