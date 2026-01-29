// app/me/page.tsx
import { RequireAuth } from '@/components/auth/require-auth';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { UserSummary } from '@/components/dashboard/user-summary';
import { ConnectedRepos } from '@/components/dashboard/connected-repos';
import { UserCommitFeed } from '@/components/dashboard/user-commit-feed';
import { LayoutDashboard } from 'lucide-react';

export const metadata = {
  title: 'Dashboard | CodeXP',
  description: 'Your personal dashboard with XP, repositories, and recent commits.',
};

export default function MyDashboardPage() {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <LayoutDashboard className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-balance">
            Your Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground text-pretty">
            Track your XP, manage connected repositories, and review recent commits.
          </p>
        </div>

        {/* Dashboard Content */}
        <DashboardLayout>
          <UserSummary />
          <ConnectedRepos />
          <UserCommitFeed />
        </DashboardLayout>
      </div>
    </RequireAuth>
  );
}
