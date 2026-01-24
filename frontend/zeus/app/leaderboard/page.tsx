import { LeaderboardList } from '@/components/leaderboard/leaderboard-list';
import { Trophy } from 'lucide-react';

export const metadata = {
  title: 'Leaderboard | CodeXP',
  description: 'See the top developers ranked by XP earned from code contributions.',
};

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          Developer Leaderboard
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Top contributors ranked by XP earned through code quality, architecture, and documentation.
        </p>
      </div>

      {/* Leaderboard */}
      <LeaderboardList />
    </div>
  );
}
