import Link from 'next/link';
import Image from 'next/image';
import type { UserProfile } from '@/types/api';
import { cn } from '@/lib/utils';
import { LevelBadge, RankBadge } from '@/components/ui/xp-badge';
import { Flame } from 'lucide-react';

interface LeaderboardRowProps {
  user: UserProfile;
  className?: string;
}

export function LeaderboardRow({ user, className }: LeaderboardRowProps) {
  return (
    <Link
      href={`/users/${user.github_username}`}
      className={cn(
        'group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-card/80',
        className
      )}
    >
      {/* Rank */}
      <RankBadge rank={user.rank} />

      {/* Avatar */}
      <Image
        src={user.avatar_url || `https://avatar.vercel.sh/${user.github_username}`}
        alt={user.github_username}
        width={40}
        height={40}
        className="rounded-full"
      />

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-foreground group-hover:text-primary transition-colors">
            {user.github_username}
          </h3>
          <LevelBadge level={user.current_level} />
        </div>
        <p className="truncate text-sm text-muted-foreground">{user.title}</p>
      </div>

      {/* Streak */}
      {user.current_streak > 0 && (
        <div className="flex items-center gap-1 rounded-md bg-streak/10 px-2 py-1 text-streak">
          <Flame className="h-4 w-4 fill-current" />
          <span className="text-sm font-medium">{user.current_streak}</span>
        </div>
      )}

      {/* XP */}
      <div className="text-right">
        <p className="text-sm font-semibold text-xp">{user.total_xp.toLocaleString()} XP</p>
      </div>
    </Link>
  );
}
