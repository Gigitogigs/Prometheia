import { cn } from '@/lib/utils';

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Top 3 Medal Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6"
          >
            <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      {/* List Items */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
          >
            <div className="h-6 w-6 animate-pulse rounded bg-muted" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommitFeedSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-64 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 sm:flex-row sm:items-start">
        <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="mx-auto h-6 w-40 animate-pulse rounded bg-muted sm:mx-0" />
          <div className="mx-auto h-4 w-24 animate-pulse rounded bg-muted sm:mx-0" />
          <div className="h-3 w-full max-w-xs animate-pulse rounded-full bg-muted" />
        </div>
        <div className="flex gap-4">
          <div className="h-16 w-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-16 w-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-16 w-20 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
      {/* Commits */}
      <CommitFeedSkeleton />
    </div>
  );
}

export function CommitDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="space-y-3">
          <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
          <div className="flex gap-4">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
      {/* Diff */}
      <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      {/* Judges */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded bg-muted', className)} />
  );
}


export function AuthSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}


// import { Skeleton } from "@/components/ui/skeleton";

// export function LeaderboardSkeleton() {
//   return (
//     <div className="space-y-4">
//       <Skeleton className="h-6 w-40" />

//       <div className="space-y-2">
//         {Array.from({ length: 5 }).map((_, i) => (
//           <div key={i} className="flex items-center gap-4">
//             <Skeleton className="h-8 w-8 rounded-full" />
//             <Skeleton className="h-4 w-full" />
//             <Skeleton className="h-4 w-12" />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
