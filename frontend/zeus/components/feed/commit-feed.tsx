'use client';

import { useCommits } from '@/hooks/use-api';
import { CommitCard } from './commit-card';
import { CommitFeedSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CommitFeed() {
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useCommits({});

  const commits = data?.results ?? [];

  if (isLoading) {
    return <CommitFeedSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Header / Refresh */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw
            className={cn('h-4 w-4', isFetching && 'animate-spin')}
          />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load commits.</span>
        </div>
      )}

      {/* Commit List */}
      <div className="space-y-3">
        {commits.map((commit) => (
          <CommitCard
            key={commit.commit_hash}
            commit={commit}
          />
        ))}
      </div>

      {/* Empty State */}
      {commits.length === 0 && !error && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No commits yet.
          </p>
        </div>
      )}
    </div>
  );
}
