'use client';

import { ExternalLink, Shield, BookOpen, Building2 } from 'lucide-react';
import type { JudgeEvaluation, JudgeType } from '@/types/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { XPBadge } from '@/components/ui/xp-badge';
import ReactMarkdown from 'react-markdown';

interface JudgeCardProps {
  evaluation: JudgeEvaluation;
  className?: string;
}

const judgeConfig: Record<
  JudgeType,
  { name: string; icon: typeof Shield; color: string; description: string }
> = {
  ARCHITECT: {
    name: 'Architect',
    icon: Building2,
    color: 'text-chart-2',
    description: 'Evaluates code structure and design patterns',
  },
  PALADIN: {
    name: 'Paladin',
    icon: Shield,
    color: 'text-chart-4',
    description: 'Assesses code quality and best practices',
  },
  SCRIBE: {
    name: 'Scribe',
    icon: BookOpen,
    color: 'text-chart-5',
    description: 'Reviews documentation and readability',
  },
};

export function JudgeCard({ evaluation, className }: JudgeCardProps) {
  const config = judgeConfig[evaluation.judge_type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-border bg-card overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg bg-background',
              config.color
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{config.name}</h3>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <XPBadge xp={evaluation.xp_awarded} size="md" />
      </div>

      {/* Reasoning */}
      <div className="flex-1 p-4">
        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="text-foreground font-semibold">{children}</strong>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-2">
                  {children}
                </ul>
              ),
              li: ({ children }) => <li>{children}</li>,
              code: ({ children }) => (
                <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-primary">
                  {children}
                </code>
              ),
            }}
          >
            {evaluation.reasoning}
          </ReactMarkdown>
        </div>
      </div>

      {/* Footer with Proof Link */}
      {evaluation.proof_url && (
        <div className="border-t border-border px-4 py-3">
          <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent" asChild>
            <a href={evaluation.proof_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              View AI Trace (Opik)
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
