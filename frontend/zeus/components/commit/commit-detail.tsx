'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCommit } from '@/hooks/use-api';
import { JudgeCard } from './judge-card';
import { CommitDetailSkeleton } from '@/components/ui/loading-skeleton';
import { XPBadge } from '@/components/ui/xp-badge';
import { Button } from '@/components/ui/button';
import {
  GitCommit,
  GitBranch,
  Clock,
  ArrowLeft,
  AlertCircle,
  Scale,
  Loader2,
} from 'lucide-react';
import type { CommitLogDetail, JudgeEvaluation } from '@/types/api';

interface CommitDetailProps {
  hash: string;
}

// Mock data for development
const mockCommit: CommitLogDetail = {
  id: 1,
  commit_hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  message: 'feat: implement user authentication with OAuth2 and session management',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  url: 'https://github.com/user/repo/commit/a1b2c3d',
  author_username: 'code_wizard',
  repository_name: 'auth-service',
  total_xp_awarded: 450,
  is_processed: true,
  evaluation_count: 3,
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  raw_diff: `diff --git a/src/auth/oauth.ts b/src/auth/oauth.ts
new file mode 100644
index 0000000..e5f6g7h
--- /dev/null
+++ b/src/auth/oauth.ts
@@ -0,0 +1,45 @@
+import { Strategy } from './strategy';
+import { TokenStore } from './token-store';
+
+export class OAuthProvider implements Strategy {
+  private tokenStore: TokenStore;
+
+  constructor(tokenStore: TokenStore) {
+    this.tokenStore = tokenStore;
+  }
+
+  async authenticate(code: string): Promise<User> {
+    const tokens = await this.exchangeCode(code);
+    await this.tokenStore.save(tokens);
+    return this.getUserFromToken(tokens.access_token);
+  }
+}`,
  evaluations: [
    {
      id: 1,
      judge_type: 'ARCHITECT',
      xp_awarded: 180,
      reasoning: `**Excellent architectural decisions!**

- Clean separation of concerns with dedicated auth module
- Proper use of the **Strategy Pattern** for OAuth providers
- Well-structured middleware chain for session validation
- Good use of dependency injection for testability`,
      proof_url: 'https://opik.ai/trace/abc123',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 2,
      judge_type: 'PALADIN',
      xp_awarded: 150,
      reasoning: `**Strong code quality!**

- Input validation on all endpoints
- Proper error handling with meaningful messages
- Secure token storage with encryption
- Rate limiting implemented correctly`,
      proof_url: 'https://opik.ai/trace/def456',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 3,
      judge_type: 'SCRIBE',
      xp_awarded: 120,
      reasoning: `**Good documentation standards!**

- Clear JSDoc comments on public methods
- README updated with setup instructions
- Inline comments explaining complex logic
- Type definitions are comprehensive`,
      proof_url: 'https://opik.ai/trace/ghi789',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ],
};

export function CommitDetail({ hash }: CommitDetailProps) {
  const { data, isLoading, error } = useCommit(hash);

  // Use mock data if no API data available
  const commit = data ?? mockCommit;

  if (isLoading) {
    return <CommitDetailSkeleton />;
  }

  const formattedDate = new Date(commit.timestamp).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link href="/feed">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>
      </Button>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Using demo data. Connect your API to see real commit details.</span>
        </div>
      )}

      {/* Commit Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            {/* Commit Message */}
            <h1 className="text-xl font-semibold text-foreground">
              <GitCommit className="mr-2 inline h-5 w-5 text-muted-foreground" />
              {commit.message}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Link
                href={`/users/${commit.author_username}`}
                className="flex items-center gap-2 hover:text-primary"
              >
                <Image
                  src={`https://avatar.vercel.sh/${commit.author_username}`}
                  alt={commit.author_username}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span>{commit.author_username}</span>
              </Link>

              <span className="flex items-center gap-1">
                <GitBranch className="h-4 w-4" />
                {commit.repository_name}
              </span>

              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formattedDate}
              </span>

              <code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs">
                {commit.commit_hash.slice(0, 7)}
              </code>
            </div>
          </div>

          {/* XP Badge */}
          <div className="shrink-0">
            {commit.is_processed ? (
              <XPBadge xp={commit.total_xp_awarded} size="lg" />
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raw Diff */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-3">
          <h2 className="font-semibold">Raw Diff</h2>
        </div>
        <div className="overflow-x-auto">
          <pre className="p-4 text-sm font-mono text-muted-foreground leading-relaxed">
            <code>{commit.raw_diff}</code>
          </pre>
        </div>
      </div>

      {/* Judges' Verdict */}
      {commit.is_processed && commit.evaluations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Judges&apos; Verdict</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {commit.evaluations.map((evaluation) => (
              <JudgeCard key={evaluation.judge_type} evaluation={evaluation} />
            ))}
          </div>
        </div>
      )}

      {/* Processing State */}
      {!commit.is_processed && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <h3 className="mt-4 text-lg font-semibold">AI Judges Evaluating...</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The Architect, Paladin, and Scribe are reviewing this commit.
            <br />
            Check back soon for the verdict!
          </p>
        </div>
      )}
    </div>
  );
}
