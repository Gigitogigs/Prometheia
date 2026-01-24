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
import type { UserProfile } from '@/types/api';

// Mock data for development when API is not available
const mockLeaderboard: UserProfile[] = [
  {
    github_username: 'code_wizard',
    total_xp: 15420,
    current_level: 42,
    xp_to_next_level: 1000,
    current_streak: 15,
    last_commit_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    avatar_url: 'https://avatar.vercel.sh/code_wizard',
    title: 'Master Architect',
    rank: 1,
  },
  {
    github_username: 'dev_ninja',
    total_xp: 12850,
    current_level: 38,
    xp_to_next_level: 1000,
    current_streak: 8,
    last_commit_date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    avatar_url: 'https://avatar.vercel.sh/dev_ninja',
    title: 'Senior Paladin',
    rank: 2,
  },
  {
    github_username: 'byte_smith',
    total_xp: 11200,
    current_level: 35,
    xp_to_next_level: 1000,
    current_streak: 12,
    last_commit_date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    avatar_url: 'https://avatar.vercel.sh/byte_smith',
    title: 'Code Scribe',
    rank: 3,
  },
  {
    github_username: 'algo_master',
    total_xp: 9800,
    current_level: 32,
    xp_to_next_level: 1000,
    current_streak: 5,
    last_commit_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    avatar_url: 'https://avatar.vercel.sh/algo_master',
    title: 'Algorithm Expert',
    rank: 4,
  },
  {
    github_username: 'stack_overflow',
    total_xp: 8500,
    current_level: 28,
    xp_to_next_level: 1000,
    current_streak: 3,
    last_commit_date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    avatar_url: 'https://avatar.vercel.sh/stack_overflow',
    title: 'Debug Champion',
    rank: 5,
  },
  {
    github_username: 'git_guru',
    total_xp: 7200,
    current_level: 25,
    xp_to_next_level: 1000,
    current_streak: 7,
    last_commit_date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    avatar_url: 'https://avatar.vercel.sh/git_guru',
    title: 'Version Controller',
    rank: 6,
  },
  {
    github_username: 'react_hero',
    total_xp: 6100,
    current_level: 22,
    xp_to_next_level: 1000,
    current_streak: 4,
    last_commit_date: null,
    avatar_url: 'https://avatar.vercel.sh/react_hero',
    title: 'Frontend Warrior',
    rank: 7,
  },
];

export function LeaderboardList() {
  const [page, setPage] = useState(1);
  const [minLevel, setMinLevel] = useState<number | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useLeaderboard({
    page,
    min_level: minLevel,
    page_size: 10,
  });

  // Use mock data if no API data is available
  const users = data?.results ?? mockLeaderboard;
  const hasNext = data?.next !== null;
  const hasPrevious = data?.previous !== null || page > 1;
  const totalCount = data?.count ?? mockLeaderboard.length;

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {totalCount} developers ranked
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-level">Minimum Level</Label>
              <Input
                id="min-level"
                type="number"
                min={1}
                placeholder="e.g. 10"
                value={minLevel ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setMinLevel(val ? parseInt(val, 10) : undefined);
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

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Using demo data. Connect your API to see real rankings.</span>
        </div>
      )}

      {/* Top 3 Medal Cards */}
      {page === 1 && topThree.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Reorder for visual effect: 2nd, 1st, 3rd */}
          {topThree[1] && <MedalCard user={topThree[1]} className="md:order-1" />}
          {topThree[0] && <MedalCard user={topThree[0]} className="md:order-0 md:-mt-4" />}
          {topThree[2] && <MedalCard user={topThree[2]} className="md:order-2" />}
        </div>
      )}

      {/* Rest of the List */}
      <div className="space-y-2">
        {(page === 1 ? rest : users).map((user) => (
          <LeaderboardRow key={user.github_username} user={user} />
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
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNext}
          className="gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
