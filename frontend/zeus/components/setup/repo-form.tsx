'use client';

import React, { useState, useEffect } from 'react';
import { useCreateRepositoryWebhook } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/loading-skeleton';
import {
  GitBranch,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Github,
  Webhook,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/lib/queries/useSession';

function RepoInput({
  repoName,
  setRepoName,
}: {
  repoName: string;
  setRepoName: (val: string) => void;
}) {
  const isValidRepoFormat = /^[\w-]+\/[\w.-]+$/.test(repoName);

  return (
    <div className="space-y-2">
      <Label htmlFor="repo-name" className="text-base">
        Repository Name
      </Label>
      <div className="relative">
        <Github className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="repo-name"
          type="text"
          placeholder="owner/repository"
          value={repoName}
          onChange={(e) => setRepoName(e.target.value)}
          className={cn(
            'pl-10 h-12 text-base',
            repoName && !isValidRepoFormat && 'border-destructive focus-visible:ring-destructive'
          )}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Enter the full repository path, e.g.,{' '}
        <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
          octocat/hello-world
        </code>
      </p>
      {repoName && !isValidRepoFormat && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          Please use the format: owner/repository
        </p>
      )}
    </div>
  );
}

function InfoCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-border bg-secondary/30 p-4">
        <div className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Automatic Webhooks</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          We will configure GitHub webhooks to automatically process your commits.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-secondary/30 p-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <h3 className="font-medium">All Branches</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Commits from all branches will be evaluated by our AI judges.
        </p>
      </div>
    </div>
  );
}

function StatusMessage({
  success,
  showError,
  error,
}: {
  success: boolean;
  showError: boolean;
  error: unknown;
}) {
  if (showError && error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Failed to connect repository</p>
          <p className="text-sm opacity-80">
            {error instanceof Error
              ? error.message
              : 'Please check the repository name and try again.'}
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 p-4 text-primary">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Repository connected successfully!</p>
          <p className="text-sm opacity-80">
            Webhooks have been configured. Your commits will now be evaluated.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// ----------------------------
// Skeleton Component
// ----------------------------
export function RepoFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

// ----------------------------
// Main Form Component
// ----------------------------
export function RepoForm() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const [repoName, setRepoName] = useState('');
  const [success, setSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const mutation = useCreateRepositoryWebhook();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoName.trim()) return;

    setSuccess(false);
    setShowError(false);

    try {
      await mutation.mutateAsync(repoName.trim());
      setSuccess(true);
      setRepoName('');
    } catch {
      setShowError(true);
    }
  };

  useEffect(() => {
    if (success || showError) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setShowError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, showError]);

  if (sessionLoading) return <RepoFormSkeleton />;

  if (!session?.user) return null;

  const isValidRepoFormat = /^[\w-]+\/[\w.-]+$/.test(repoName);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RepoInput repoName={repoName} setRepoName={setRepoName} />
      <InfoCards />
      <StatusMessage success={success} showError={showError} error={mutation.error} />

      <Button
        type="submit"
        size="lg"
        className="w-full gap-2"
        disabled={!repoName.trim() || !isValidRepoFormat || mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Webhook className="h-5 w-5" />
            Connect Repository
          </>
        )}
      </Button>
    </form>
  );
}
