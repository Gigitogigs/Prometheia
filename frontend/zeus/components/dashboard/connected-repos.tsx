// individuals users repo
// Repo name, Active / inactive statu, Last commit time, Button: “Manage” or “Add repo”
// “pause/remove repo” = stop tracking in the app. delete removes it from the app entirely, does not delete the repo on github
'use client';

import { useState } from 'react';
import { 
  useConnectedRepos, 
  useCreateRepositoryWebhook, 
  useToggleRepoActive, 
  useDeleteRepo 
} from '@/hooks/use-api';

import { toast } from "@/lib/toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { AlertCircle, Github, Loader2, Webhook, Pause, Play, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* Simple Modal component */
function ConfirmModal({
  isOpen,
  title,
  description,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel'
}: {
  isOpen: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-card p-6 w-full max-w-sm space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="destructive" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

export function ConnectedRepos() {
  const { data: repos, isLoading, isError, refetch } = useConnectedRepos();
  const createWebhook = useCreateRepositoryWebhook();
  const toggleRepo = useToggleRepoActive();
  const deleteRepo = useDeleteRepo();

  const [repoName, setRepoName] = useState('');
  const [showError, setShowError] = useState(false);

  const [modalRepoId, setModalRepoId] = useState<number | null>(null);

  // const isValidRepoFormat = /^[\w-]+\/[\w.-]+$/.test(repoName);
  // This derived state determines if the button should be active
  const canAttemptConnect = () => {
    const input = repoName.trim();
    if (!input) return false;
    // 1. If it's a URL, we assume it's valid for now
    if (input.includes('github.com')) return true;
    // 2. If it's owner/repo or just repo, check if it contains valid characters
    // We'll be a bit more permissive here to let the 'handleConnect' do the final cleaning
      return /^[a-zA-Z0-9._\-/]+$/.test(input);
    };
  
  const isButtonDisabled = !canAttemptConnect() || createWebhook.isPending;

  const handleConnect = async () => {
    const input = repoName.trim();
    if (!input) return false;

    // Smart Extraction Logic:
    // 1. If it's a URL (contains github.com), get the last part.
    // 2. If it's "owner/repo", get the part after the slash.
    // 3. If it's just "repo", use it as is.
    let cleanName = input;

    if (input.includes('github.com')) {
      // Splits by '/' and filters out empty strings (handles trailing slashes)
      const parts = input.split('/').filter(Boolean);
      cleanName = parts[parts.length - 1]; 
    } else if (input.includes('/')) {
      cleanName = input.split('/')[1];
    }

    // Final check: repo names on GitHub can only be alphanumeric, hyphens, or dots
    const isValid = /^[a-zA-Z0-9._-]+$/.test(cleanName);

    if (!isValid) {
      toast.error("Invalid Name", "Please enter a valid repository name or GitHub URL.");
      return;
    }

    try {
      await createWebhook.mutateAsync(cleanName);
      toast.success("Connection started!");
      setRepoName('');
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong";

      // toast.error("Connect Failed", { description: message });
      toast.error("Connect Failed", message);
      setShowError(true);
    }
  

  };
  

  const confirmDelete = (repoId: number) => {
    setModalRepoId(repoId);
  };

  const handleDelete = async () => {
    if (modalRepoId === null) return;
    await deleteRepo.mutateAsync(modalRepoId);
    setModalRepoId(null);
    refetch();
  };

  /* ---------------------------- */
  /* Loading State */
  /* ---------------------------- */
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  /* ---------------------------- */
  /* Error State */
  /* ---------------------------- */
  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <p>Failed to load connected repositories.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Connected Repositories</h2>
        <p className="text-sm text-muted-foreground">
          Repositories with active GitHub webhooks
        </p>
      </div>

      {/* Empty State */}
      {repos?.length === 0 && (
        <div className="rounded-lg border border-dashed p-6 text-center space-y-3">
          <Github className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No repositories connected yet</p>
          <p className="text-sm text-muted-foreground">
            Connect a GitHub repository to start earning XP from commits.
          </p>
        </div>
      )}

      {/* Repo List */}
      {repos && repos.length > 0 && (
        <ul className="space-y-2">
          {repos.map((repo) => (
            <li
              key={repo.full_name}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{repo.full_name}</span>
              </div>

              <div className="flex gap-2">
                {/* Pause / Resume */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toggleRepo.mutate({
                      repoId: repo.id,
                      isActive: !repo.is_active,
                    })
                  }
                  disabled={toggleRepo.isPending}
                  className="gap-1"
                >
                  {repo.is_active ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Resume
                    </>
                  )}
                </Button>

                {/* Delete */}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => confirmDelete(repo.id)}
                  disabled={deleteRepo.isPending}
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Connect New Repo */}
      <div className="space-y-3">
        <Label htmlFor="repo-name">Add another repository</Label>
        <Input
          id="repo-name"
          placeholder="repository name"
          value={repoName}
          // onChange={(e) => setRepoName(e.target.value)}
          onChange={(e) => {   setRepoName(e.target.value);
            if (showError) setShowError(false); // Clear error when they start typing again
          }}
          className={cn(
            repoName.trim() && !canAttemptConnect() && 'border-destructive'
          )}
        />
        <p className="text-sm text-muted-foreground">
        Enter your github repository e.g.,
        <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
          octocat/hello-world, hello-world or paste in https://octat/hello-world
        </code>
      </p>

        {showError && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Failed to connect repository
          </p>
        )}

        <Button
          onClick={handleConnect}
          // disabled={!repoName.trim() || !canAttemptConnect() || createWebhook.isPending}
          disabled={isButtonDisabled}
          className="gap-2"
        >
          {createWebhook.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              <Webhook className="h-4 w-4" />
              Connect Repository
            </>
          )}
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={modalRepoId !== null}
        title="Confirm Deletion"
        description="Are you sure you want to delete this repository? This cannot be undone."
        onCancel={() => setModalRepoId(null)}
        onConfirm={handleDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </section>
  );
}
