'use client';

import Link from 'next/link';
import Image from 'next/image';
import { GitCommit, GitBranch, Clock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CommitLog } from '@/types/api';
import { cn } from '@/lib/utils';
import { XPBadge } from '@/components/ui/xp-badge';

interface CommitCardProps {
  commit: CommitLog;
  className?: string;
}

export function CommitCard({ commit, className }: CommitCardProps) {
  const router = useRouter();
  const timeAgo = getTimeAgo(commit.timestamp);

  return (
    <Link
      href={`/commits/${commit.commit_hash}`}
      className={cn(
        'group block rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-card/80',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {/* Author Avatar */}
          <div
            onClick={(e) => {
              e.stopPropagation(); // prevents navigating to the commit page
              router.push(`/users/${commit.author_username}`);
            }}
            className="shrink-0 cursor-pointer"
          >
            <Image
              src={`https://avatar.vercel.sh/${commit.author_username}`}
              alt={commit.author_username}
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>

          {/* Commit Info */}
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/users/${commit.author_username}`);
                }}
                className="font-medium text-foreground hover:text-primary cursor-pointer"
              >
                {commit.author_username}
              </span>
              <span className="text-muted-foreground">pushed to</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                <GitBranch className="h-3 w-3" />
                {commit.repository_name}
              </span>
            </div>

            {/* Commit Message */}
            <p className="truncate text-sm text-foreground group-hover:text-primary transition-colors">
              <GitCommit className="mr-1.5 inline h-3.5 w-3.5 text-muted-foreground" />
              {commit.message}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
              <span className="font-mono">{commit.commit_hash.slice(0, 7)}</span>
            </div>
          </div>
        </div>

        {/* XP Badge or Processing Indicator */}
        <div className="shrink-0">
          {commit.is_processed ? (
            <XPBadge xp={commit.total_xp_awarded} size="sm" />
          ) : (
            <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Processing</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
