'use client';

import { useState } from 'react';
import { useCommits } from '@/hooks/use-api';
import { CommitCard } from './commit-card';
import { CommitFeedSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import type { CommitLog } from '@/types/api';

// Mock data for development
const mockCommits: CommitLog[] = [
  {
    id: 1,
    commit_hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    message: 'feat: implement user authentication with OAuth2',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    url: 'https://github.com/code_wizard/auth-service/commit/a1b2c3d',
    author_username: 'code_wizard',
    repository_name: 'auth-service',
    total_xp_awarded: 450,
    is_processed: true,
    evaluation_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 2,
    commit_hash: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
    message: 'fix: resolve memory leak in connection pool',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    url: 'https://github.com/dev_ninja/backend-api/commit/b2c3d4e',
    author_username: 'dev_ninja',
    repository_name: 'backend-api',
    total_xp_awarded: 280,
    is_processed: true,
    evaluation_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 3,
    commit_hash: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
    message: 'docs: add comprehensive API documentation',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    url: 'https://github.com/byte_smith/docs/commit/c3d4e5f',
    author_username: 'byte_smith',
    repository_name: 'docs',
    total_xp_awarded: 0,
    is_processed: false,
    evaluation_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 4,
    commit_hash: 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9',
    message: 'refactor: optimize database queries for better performance',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    url: 'https://github.com/algo_master/data-layer/commit/d4e5f6g',
    author_username: 'algo_master',
    repository_name: 'data-layer',
    total_xp_awarded: 520,
    is_processed: true,
    evaluation_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 5,
    commit_hash: 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    message: 'test: add unit tests for payment module',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    url: 'https://github.com/stack_overflow/payments/commit/e5f6g7h',
    author_username: 'stack_overflow',
    repository_name: 'payments',
    total_xp_awarded: 180,
    is_processed: true,
    evaluation_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 6,
    commit_hash: 'f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
    message: 'feat: add dark mode support across all components',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    url: 'https://github.com/react_hero/ui-library/commit/f6g7h8i',
    author_username: 'react_hero',
    repository_name: 'ui-library',
    total_xp_awarded: 390,
    is_processed: true,
    evaluation_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export function CommitFeed() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch, isFetching } = useCommits({});

  // Use mock data if no API data available
  const commits = data?.results ?? mockCommits;
  const hasNext = data?.next !== null;
  const hasPrevious = data?.previous !== null || page > 1;

  if (isLoading) {
    return <CommitFeedSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Using demo data. Connect your API to see real commits.</span>
        </div>
      )}

      {/* Commit List */}
      <div className="space-y-3">
        {commits.map((commit) => (
          <CommitCard key={commit.commit_hash} commit={commit} />
        ))}
      </div>

      {commits.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No commits found.</p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!hasPrevious}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Newer
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNext}
          className="gap-2"
        >
          Older
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
