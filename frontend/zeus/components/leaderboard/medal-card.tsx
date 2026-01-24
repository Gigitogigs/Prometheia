import Link from 'next/link';
import Image from 'next/image';
import { Crown, Medal } from 'lucide-react';
import type { UserProfile } from '@/types/api';
import { cn } from '@/lib/utils';
import { XPProgress } from '@/components/ui/xp-progress';
import { LevelBadge } from '@/components/ui/xp-badge';

interface MedalCardProps {
  user: UserProfile;
  className?: string;
}

export function MedalCard({ user, className }: MedalCardProps) {
  const getMedalStyles = () => {
    switch (user.rank) {
      case 1:
        return {
          border: 'border-gold/50',
          glow: 'shadow-[0_0_30px_-5px] shadow-gold/30',
          icon: <Crown className="h-6 w-6 text-gold" />,
          bg: 'bg-gradient-to-b from-gold/10 to-transparent',
          ringColor: 'ring-gold/50',
        };
      case 2:
        return {
          border: 'border-silver/50',
          glow: 'shadow-[0_0_25px_-5px] shadow-silver/25',
          icon: <Medal className="h-5 w-5 text-silver" />,
          bg: 'bg-gradient-to-b from-silver/10 to-transparent',
          ringColor: 'ring-silver/50',
        };
      case 3:
        return {
          border: 'border-bronze/50',
          glow: 'shadow-[0_0_20px_-5px] shadow-bronze/20',
          icon: <Medal className="h-5 w-5 text-bronze" />,
          bg: 'bg-gradient-to-b from-bronze/10 to-transparent',
          ringColor: 'ring-bronze/50',
        };
      default:
        return {
          border: 'border-border',
          glow: '',
          icon: null,
          bg: '',
          ringColor: 'ring-border',
        };
    }
  };

  const styles = getMedalStyles();

  return (
    <Link
      href={`/users/${user.github_username}`}
      className={cn(
        'group relative flex flex-col items-center gap-4 rounded-xl border bg-card p-6 transition-all hover:scale-[1.02]',
        styles.border,
        styles.glow,
        styles.bg,
        className
      )}
    >
      {/* Rank Badge */}
      <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1">
        {styles.icon}
        <span className="text-sm font-bold">#{user.rank}</span>
      </div>

      {/* Avatar */}
      <div className={cn('relative mt-2 rounded-full ring-2', styles.ringColor)}>
        <Image
          src={user.avatar_url || `https://avatar.vercel.sh/${user.github_username}`}
          alt={user.github_username}
          width={80}
          height={80}
          className="rounded-full"
        />
      </div>

      {/* User Info */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {user.github_username}
        </h3>
        <p className="text-sm text-muted-foreground">{user.title}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3">
        <LevelBadge level={user.current_level} />
        <span className="text-sm font-medium text-xp">
          {user.total_xp.toLocaleString()} XP
        </span>
      </div>

      {/* Progress to Next Level */}
      <div className="w-full">
        <XPProgress
          currentXP={user.total_xp % user.xp_to_next_level}
          xpToNextLevel={user.xp_to_next_level}
          showLabels={false}
        />
      </div>
    </Link>
  );
}
