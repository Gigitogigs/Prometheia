import { cn } from '@/lib/utils';

interface XPProgressProps {
  currentXP: number;
  xpToNextLevel: number;
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function XPProgress({
  currentXP,
  xpToNextLevel,
  className,
  showLabels = true,
  size = 'sm',
}: XPProgressProps) {
  const progress = Math.min((currentXP / xpToNextLevel) * 100, 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabels && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentXP.toLocaleString()} XP</span>
          <span>{xpToNextLevel.toLocaleString()} XP</span>
        </div>
      )}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-secondary/50',
          sizeClasses[size]
        )}
      >
        {/* Main progress bar with Cyberpunk gradient */}
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(to right, #7000ff, #00f2ff)',
          }}
        />
        {/* Glow effect */}
        <div
          className="absolute top-0 h-full rounded-full opacity-60 blur-sm"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(to right, #7000ff, #00f2ff)',
          }}
        />
        {/* Animated shine effect */}
        <div
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{ width: `${progress}%` }}
        >
          <div className="animate-pulse absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}
