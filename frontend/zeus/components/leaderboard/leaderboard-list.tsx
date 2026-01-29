'use client';

import { useState, useMemo } from 'react';
import { useInfiniteLeaderboard } from '@/hooks/use-api';
import { MedalCard } from './medal-card';
import { LeaderboardRow } from './leaderboard-row';
import { LeaderboardSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, AlertCircle } from 'lucide-react';
import type { UserProfile, PaginatedResponse } from '@/types/api';
import type { InfiniteData } from '@tanstack/react-query';

export function LeaderboardList() {
  const [minLevel, setMinLevel] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteLeaderboard({
    min_level: minLevel,
  });

  /* --------------------------------------------
   * Explicitly type infinite data
   * -------------------------------------------- */
  const infiniteData = data as InfiniteData<PaginatedResponse<UserProfile>> | undefined;

  /* --------------------------------------------
   * Flatten pages
   * -------------------------------------------- */
  const users: UserProfile[] = useMemo(() => {
    return infiniteData?.pages.flatMap(
      (page: PaginatedResponse<UserProfile>) => page.results
    ) ?? [];
  }, [infiniteData]);

  /* --------------------------------------------
   * Top 3 (from page 1 only)
   * -------------------------------------------- */
  const topThree: UserProfile[] = useMemo(() => {
    return infiniteData?.pages[0]?.results.slice(0, 3) ?? [];
  }, [infiniteData]);

  /* --------------------------------------------
   * Remaining users
   * -------------------------------------------- */
  const restUsers = useMemo(() => {
    const topUsernames = new Set(
      topThree.map((u: UserProfile) => u.github_username)
    );
    return users.filter(
      (u: UserProfile) => !topUsernames.has(u.github_username)
    );
  }, [users, topThree]);

  /* --------------------------------------------
   * Loading / Error states
   * -------------------------------------------- */
  if (status === 'pending') {
    return <LeaderboardSkeleton />;
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span>{error?.message || 'Failed to load leaderboard.'}</span>
      </div>
    );
  }

  /* --------------------------------------------
   * Render
   * -------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {users.length} developers ranked
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-level">Minimum Level</Label>
              <Input
                id="min-level"
                type="number"
                min={1}
                value={minLevel ?? ''}
                onChange={(e) =>
                  setMinLevel(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-32"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMinLevel(undefined)}
            >
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Top 3 */}
      {topThree.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {topThree[1] && <MedalCard user={topThree[1]} />}
          {topThree[0] && <MedalCard user={topThree[0]} className="md:-mt-4" />}
          {topThree[2] && <MedalCard user={topThree[2]} />}
        </div>
      )}

      {/* Rows */}
      <div className="space-y-2">
        {restUsers.map((user: UserProfile) => (
          <LeaderboardRow
            key={user.github_username}
            user={user}
          />
        ))}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
