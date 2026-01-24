'use client';

import { useState } from 'react';
import { useUserCommits } from '@/hooks/use-api';
import { CommitCard } from '@/components/feed/commit-card';
import { CommitFeedSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, GitCommit } from 'lucide-react';
import type { CommitLog } from '@/types/api';

interface UserCommitsProps {
  username: string;
}

// Mock data for development
const mockUserCommits: CommitLog[] = [
  {
    id: 1,
    commit_hash: 'user123abc456def789',
    message: 'feat: add new dashboard analytics widget',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    url: 'https://github.com/user/dashboard/commit/user123abc456def789',
    author_username: 'user',
    repository_name: 'dashboard',
    total_xp_awarded: 320,
    is_processed: true,
    evaluation_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 2,
    commit_hash: 'user456def789ghi012',
    message: 'fix: resolve caching issues in API layer',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    url: 'https://github.com/user/backend/commit/user456def789ghi012',
    author_username: 'user',
    repository_name: 'backend',
    total_xp_awarded: 210,
    is_processed: true,
    evaluation_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 3,
    commit_hash: 'user789ghi012jkl345',
    message: 'refactor: improve error handling across services',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    url: 'https://github.com/user/services/commit/user789ghi012jkl345',
    author_username: 'user',
    repository_name: 'services',
    total_xp_awarded: 280,
    is_processed: true,
    evaluation_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export function UserCommits({ username }: UserCommitsProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserCommits(username);

  // Use mock data if no API data available (update author_username to match)
  const commits = data?.results ?? mockUserCommits.map((c) => ({ ...c, author_username: username }));
  const hasNext = data?.next !== null;
  const hasPrevious = data?.previous !== null || page > 1;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#7000ff]/20 to-[#00f2ff]/20 backdrop-blur-sm">
            <GitCommit className="h-5 w-5 text-[#00f2ff]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">
              Latest commits and contributions
            </p>
          </div>
        </div>
        {commits.length > 0 && (
          <span className="rounded-full bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
            {commits.length} commits
          </span>
        )}
      </div>

      {isLoading ? (
        <CommitFeedSkeleton />
      ) : commits.length > 0 ? (
        <>
          <div className="space-y-3">
            {commits.map((commit) => (
              <CommitCard key={commit.commit_hash} commit={commit} />
            ))}
          </div>

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
        </>
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <GitCommit className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No commits found for this user.</p>
        </div>
      )}
    </section>
  );
}
