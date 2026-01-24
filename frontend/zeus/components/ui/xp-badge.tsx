import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface XPBadgeProps {
  xp: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function XPBadge({ xp, size = 'md', showIcon = true, className }: XPBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        'bg-gradient-to-r from-xp/20 to-xp/10 text-xp',
        'border border-xp/30',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Zap className={cn(iconSizes[size], 'fill-current')} />}
      <span>+{xp.toLocaleString()} XP</span>
    </span>
  );
}

interface LevelBadgeProps {
  level: number;
  className?: string;
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        'bg-primary/10 text-primary border border-primary/20',
        className
      )}
    >
      Lvl {level}
    </span>
  );
}

interface RankBadgeProps {
  rank: number;
  className?: string;
}

export function RankBadge({ rank, className }: RankBadgeProps) {
  const getMedalColor = () => {
    switch (rank) {
      case 1:
        return 'text-gold bg-gold/10 border-gold/30';
      case 2:
        return 'text-silver bg-silver/10 border-silver/30';
      case 3:
        return 'text-bronze bg-bronze/10 border-bronze/30';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold',
        getMedalColor(),
        className
      )}
    >
      #{rank}
    </span>
  );
}
