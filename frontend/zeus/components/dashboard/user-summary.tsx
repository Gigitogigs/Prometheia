// utilizes useSession & useUserProfile(username)
// reveals Avatar, GitHub username, Rankl, Total XP, Level, Streak
'use client';

import Image from 'next/image';
import { useSession } from '@/lib/queries/useSession';
import { useUserProfile } from '@/hooks/use-api';
import { LevelBadge, RankBadge } from '@/components/ui/xp-badge';
import { Flame, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { cn } from '@/lib/utils';

export function UserSummary() {
  const { data: session } = useSession();
  const username = session?.user?.username;

  const {
    data: profile,
    isLoading,
    error,
  } = useUserProfile(username ?? '');

  if (!username || isLoading) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
        Failed to load your profile.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Avatar + Identity */}
      <div className="flex items-center gap-4">
        <Image
          src={profile.avatar_url}
          alt={profile.github_username}
          width={80}
          height={80}
          className="rounded-full"
        />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              {profile.github_username}
            </h2>
            <LevelBadge level={profile.current_level} />
          </div>

          <p className="text-sm text-muted-foreground">
            {profile.title}
          </p>
        </div>
      </div>

      {/* Right: Stats */}
      <div className="flex flex-wrap items-center gap-6">
        {/* Rank */}
        {profile.rank !== null && (
          <div className="flex items-center gap-2">
            <RankBadge rank={profile.rank} />
            <span className="text-sm text-muted-foreground">Global Rank</span>
          </div>
        )}

        {/* XP */}
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-xp" />
          <div>
            <div className="text-sm font-semibold text-xp">
              {profile.total_xp.toLocaleString()} XP
            </div>
            <div className="text-xs text-muted-foreground">
              Total XP
            </div>
          </div>
        </div>

        {/* Streak */}
        {profile.current_streak > 0 && (
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-streak" />
            <div>
              <div className="text-sm font-semibold text-streak">
                {profile.current_streak} days
              </div>
              <div className="text-xs text-muted-foreground">
                Streak
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
