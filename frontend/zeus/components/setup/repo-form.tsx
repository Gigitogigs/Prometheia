'use client';

import React from "react"

import { useState } from 'react';
import { useCreateRepositoryWebhook } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  GitBranch,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Github,
  Webhook,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function RepoForm() {
  const [repoName, setRepoName] = useState('');
  const [success, setSuccess] = useState(false);

  const mutation = useCreateRepositoryWebhook();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoName.trim()) return;

    setSuccess(false);
    try {
      await mutation.mutateAsync(repoName.trim());
      setSuccess(true);
      setRepoName('');
    } catch {
      // Error is handled by mutation.error
    }
  };

  const isValidRepoFormat = /^[\w-]+\/[\w.-]+$/.test(repoName);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Repository Input */}
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
            onChange={(e) => {
              setRepoName(e.target.value);
              setSuccess(false);
            }}
            className={cn(
              'pl-10 h-12 text-base',
              repoName && !isValidRepoFormat && 'border-destructive focus-visible:ring-destructive'
            )}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Enter the full repository path, e.g., <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">octocat/hello-world</code>
        </p>
        {repoName && !isValidRepoFormat && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Please use the format: owner/repository
          </p>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Automatic Webhooks</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            We'll configure GitHub webhooks to automatically process your commits.
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

      {/* Error Message */}
      {mutation.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Failed to connect repository</p>
            <p className="text-sm opacity-80">
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'Please check the repository name and try again.'}
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 p-4 text-primary">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Repository connected successfully!</p>
            <p className="text-sm opacity-80">
              Webhooks have been configured. Your commits will now be evaluated.
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
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
