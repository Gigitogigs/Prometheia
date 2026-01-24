import { RequireAuth } from '@/components/auth/require-auth';
import { RepoForm } from './repo-form';

export default function SetupPage() {
  return (
    <RequireAuth>
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Setup Your Repository</h1>
        <p className="text-muted-foreground">
          Connect your GitHub repository to start earning XP for commits.
        </p>
        <RepoForm />
      </div>
    </RequireAuth>
  );
}
