interface Props {
  className?: string;
  lines?: number;
  circle?: boolean;
}

export default function Skeleton({ className = '', lines = 1, circle = false }: Props) {
  if (circle) {
    return <div className={`skeleton rounded-full ${className}`} />;
  }
  if (lines === 1) {
    return <div className={`skeleton h-4 rounded-lg ${className}`} />;
  }
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton h-4 rounded-lg ${i === lines - 1 ? 'w-3/4' : 'w-full'} ${className}`}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded-lg" />
          <div className="skeleton h-3 w-1/2 rounded-lg" />
        </div>
      </div>
      <div className="skeleton h-3 w-full rounded-lg" />
      <div className="skeleton h-3 w-5/6 rounded-lg" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="card p-4 space-y-2">
      <div className="skeleton h-3 w-16 rounded-lg" />
      <div className="skeleton h-7 w-12 rounded-lg" />
    </div>
  );
}
