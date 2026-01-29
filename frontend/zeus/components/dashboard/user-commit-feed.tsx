// utilizes useCommits({ username })
// Shows Commit message , Branch, Time, XP / Processing
'use client';

import { useState } from 'react';
import { useSession } from '@/lib/queries/useSession';
import { useCommits } from '@/hooks/use-api';
import { CommitCard } from '@/components/feed/commit-card';
import { CommitFeedSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export function UserCommitFeed() {
  const { data: session } = useSession();
  const username = session?.user?.username;

  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useCommits({
    username,
    page,
  });

  if (!username) {
    return null; // RequireAuth guards this
  }

  if (isLoading) {
    return <CommitFeedSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load your commits.</span>
      </div>
    );
  }

  const commits = data?.results ?? [];
  const hasNext = Boolean(data?.next);
  const hasPrevious = Boolean(data?.previous);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your recent commits</h3>
        <span className="text-sm text-muted-foreground">
          {commits.length} shown
        </span>
      </div>

      {/* Commit list */}
      <div className="space-y-3">
        {commits.map((commit) => (
          <CommitCard
            key={commit.commit_hash}
            commit={commit}
          />
        ))}
      </div>

      {commits.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          No commits evaluated yet.
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!hasPrevious || isFetching}
        >
          Newer
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {page}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNext || isFetching}
        >
          Older
        </Button>
      </div>
    </div>
  );
}
