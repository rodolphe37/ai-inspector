import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`rounded-md bg-surface-2 ${className}`}
      style={{
        background:
          'linear-gradient(90deg, rgb(var(--color-surface-2)) 25%, rgb(var(--color-border)) 50%, rgb(var(--color-surface-2)) 75%)',
        backgroundSize: '1000px 100%',
        animation: 'shimmer 1.5s linear infinite',
      }}
    />
  );
}

export function ScoreSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Skeleton className="h-48 w-48 rounded-full" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="surface p-5"
        >
          <Skeleton className="h-5 w-24 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </motion.div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="surface p-6">
      <Skeleton className="h-5 w-40 mb-6" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
