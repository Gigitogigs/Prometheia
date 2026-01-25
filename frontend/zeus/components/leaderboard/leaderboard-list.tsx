'use client';

import { useState } from 'react';
import { useLeaderboard } from '@/hooks/use-api';
import { MedalCard } from './medal-card';
import { LeaderboardRow } from './leaderboard-row';
import { LeaderboardSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Filter, AlertCircle } from 'lucide-react';

export function LeaderboardList() {
  const [page, setPage] = useState(1);
  const [minLevel, setMinLevel] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useLeaderboard({
    page,
    page_size: 10,
    min_level: minLevel,
  });

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load leaderboard.</span>
      </div>
    );
  }

  const { results, count, next, previous } = data;

  const topThree = page === 1 ? results.slice(0, 3) : [];
  const rest = page === 1 ? results.slice(3) : results;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {count} developers ranked
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
                onChange={(e) => {
                  const value = e.target.value;
                  setMinLevel(value ? Number(value) : undefined);
                  setPage(1);
                }}
                className="w-32"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMinLevel(undefined);
                setPage(1);
              }}
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

      {/* List */}
      <div className="space-y-2">
        {rest.map((user) => (
          <LeaderboardRow key={user.github_username} user={user} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={!previous}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">Page {page}</span>

        <Button
          variant="outline"
          size="sm"
          disabled={!next}
          onClick={() => setPage((p) => p + 1)}
          className="gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
