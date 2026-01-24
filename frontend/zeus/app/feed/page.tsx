import { CommitFeed } from '@/components/feed/commit-feed';
import { Activity } from 'lucide-react';

export const metadata = {
  title: 'Commit Feed | CodeXP',
  description: 'View the latest commits and XP awards across all repositories.',
};

export default function FeedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Activity className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          Global Commit Feed
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Real-time activity stream of commits being evaluated by the AI judges.
        </p>
      </div>

      {/* Feed */}
      <CommitFeed />
    </div>
  );
}
