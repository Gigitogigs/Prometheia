import React from "react"
import Image from 'next/image';
import { Flame, Trophy, Zap, TrendingUp } from 'lucide-react';
import type { UserProfile } from '@/types/api';
import { XPProgress } from '@/components/ui/xp-progress';
import { LevelBadge, RankBadge } from '@/components/ui/xp-badge';

interface ProfileHeaderProps {
  user: UserProfile;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="relative">
          <Image
            src={user.avatar_url || `https://avatar.vercel.sh/${user.github_username}`}
            alt={user.github_username}
            width={96}
            height={96}
            className="rounded-full ring-2 ring-primary/30"
          />
          <RankBadge
            rank={user.rank}
            className="absolute -bottom-2 -right-2 h-10 w-10"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
            <h1 className="text-2xl font-bold">{user.github_username}</h1>
            <LevelBadge level={user.current_level} />
          </div>
          <p className="mt-1 text-muted-foreground">{user.title}</p>

          {/* XP Progress */}
          <div className="mt-4 max-w-sm">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress to Level {user.current_level + 1}</span>
              <span className="font-medium text-xp">
                {Math.round(((user.total_xp % user.xp_to_next_level) / user.xp_to_next_level) * 100)}%
              </span>
            </div>
            <XPProgress
              currentXP={user.total_xp % user.xp_to_next_level}
              xpToNextLevel={user.xp_to_next_level}
              showLabels={false}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-3 sm:gap-4">
          <StatCard
            icon={<Trophy className="h-5 w-5 text-gold" />}
            label="Rank"
            value={`#${user.rank}`}
          />
          <StatCard
            icon={<Zap className="h-5 w-5 text-xp" />}
            label="Total XP"
            value={user.total_xp.toLocaleString()}
          />
          <StatCard
            icon={<Flame className="h-5 w-5 text-streak" />}
            label="Streak"
            value={`${user.current_streak}d`}
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border bg-secondary/30 px-4 py-3 sm:px-5">
      {icon}
      <span className="mt-1 text-lg font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
