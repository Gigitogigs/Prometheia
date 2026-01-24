import React from "react"
import Image from 'next/image';
import { Flame, Trophy, Zap, TrendingUp, Calendar } from 'lucide-react';
import type { UserProfile } from '@/types/api';
import { XPProgress } from '@/components/ui/xp-progress';
import { LevelBadge, RankBadge } from '@/components/ui/xp-badge';
import { cn } from '@/lib/utils';

interface ProfileHeroProps {
  user: UserProfile;
}

export function ProfileHero({ user }: ProfileHeroProps) {
  const xpInCurrentLevel = user.total_xp % user.xp_to_next_level;
  const progressPercent = Math.round(
    (xpInCurrentLevel / user.xp_to_next_level) * 100
  );

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl">
      {/* Background gradient effect */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#7000ff]/10 via-transparent to-[#00f2ff]/10" />  {/*bg-gradient-to-br */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#7000ff]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#00f2ff]/20 blur-3xl" />

      <div className="relative p-6 sm:p-8 lg:p-10">
        {/* Top Section: Avatar + Info */}
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Avatar with glow */}
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full bg-linear-to-br from-[#7000ff] to-[#00f2ff] opacity-50 blur-md" />  {/*bg-gradient-to-br */}
            <Image
              src={
                user.avatar_url ||
                `https://avatar.vercel.sh/${user.github_username || "/placeholder.svg"}`
              }
              alt={user.github_username}
              width={128}
              height={128}
              className="relative rounded-full ring-2 ring-border/50"
            />
            {user.rank && (
              <RankBadge
                rank={user.rank}
                className="absolute -bottom-2 -right-2 h-12 w-12"
              />
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center lg:text-left">
            {/* Username and Level */}
            <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {user.github_username}
              </h1>
               <LevelBadge level={user.current_level} /> {/* size="lg" /> */}
            </div>

            {/* Title */}
            <p className="mt-2 text-lg text-muted-foreground">{user.title}</p>

            {/* XP Progress Bar - Cyberpunk style */}
            <div className="mx-auto mt-6 max-w-lg lg:mx-0">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Progress to Level {user.current_level + 1}
                </span>
                <span
                  className="font-mono text-sm font-semibold"
                  style={{
                    background: 'linear-gradient(to right, #7000ff, #00f2ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {progressPercent}%
                </span>
              </div>
              <XPProgress
                currentXP={xpInCurrentLevel}
                xpToNextLevel={user.xp_to_next_level}
                showLabels={false}
                // size="lg"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{xpInCurrentLevel.toLocaleString()} XP</span>
                <span>{user.xp_to_next_level.toLocaleString()} XP needed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatCard
            icon={<Trophy className="h-5 w-5 text-gold" />}
            label="Global Rank"
            value={user.rank ? `#${user.rank}` : 'Unranked'}
            highlight
          />
          <StatCard
            icon={<Zap className="h-5 w-5 text-[#00f2ff]" />}
            label="Total XP"
            value={user.total_xp.toLocaleString()}
          />
          <StatCard
            icon={<Flame className="h-5 w-5 text-streak" />}
            label="Current Streak"
            value={`${user.current_streak} days`}
            isStreak
            streakValue={user.current_streak}
          />
          <StatCard
            icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
            label="Last Commit"
            value={
              user.last_commit_date
                ? formatRelativeTime(user.last_commit_date)
                : 'Never'
            }
          />
        </div>
      </div>
    </section>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  isStreak?: boolean;
  streakValue?: number;
}

function StatCard({
  icon,
  label,
  value,
  highlight,
  isStreak,
  streakValue = 0,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/50 bg-secondary/30 p-4 backdrop-blur-sm transition-all hover:border-border hover:bg-secondary/50',
        highlight && 'border-gold/30 bg-gold/5'
      )}
    >
      {/* Streak fire animation for high streaks */}
      {isStreak && streakValue >= 7 && (
        <div className="pointer-events-none absolute -top-4 -right-4 h-16 w-16 rounded-full bg-streak/20 blur-xl animate-pulse" />
      )}

      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div
        className={cn(
          'mt-2 text-xl font-bold tracking-tight sm:text-2xl',
          isStreak && streakValue >= 7 && 'text-streak'
        )}
      >
        {value}
      </div>
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}
