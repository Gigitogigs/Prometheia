import React from "react"
import { RepoForm } from '@/components/setup/repo-form';
import { Settings, Shield, Building2, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Setup Repository | CodeXP',
  description: 'Connect your GitHub repository to start earning XP for your commits.',
};

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          Connect Repository
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Link your GitHub repository to start earning XP from AI-evaluated commits.
        </p>
      </div>

      {/* How It Works */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">How It Works</h2>
        <div className="space-y-4">
          <Step
            number={1}
            title="Connect your repository"
            description="Enter your GitHub repository path below to set up webhooks."
          />
          <Step
            number={2}
            title="Push your code"
            description="Make commits and push to your repository as you normally would."
          />
          <Step
            number={3}
            title="Get evaluated"
            description="Three AI judges analyze your code for architecture, quality, and documentation."
          />
          <Step
            number={4}
            title="Earn XP"
            description="Receive XP based on your commit quality and climb the leaderboard!"
          />
        </div>
      </div>

      {/* Judge Info */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <JudgeInfo
          icon={<Building2 className="h-5 w-5" />}
          name="Architect"
          description="Evaluates code structure and design patterns"
          color="text-chart-2"
        />
        <JudgeInfo
          icon={<Shield className="h-5 w-5" />}
          name="Paladin"
          description="Assesses code quality and best practices"
          color="text-chart-4"
        />
        <JudgeInfo
          icon={<BookOpen className="h-5 w-5" />}
          name="Scribe"
          description="Reviews documentation and readability"
          color="text-chart-5"
        />
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-card p-6">
        <RepoForm />
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {number}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function JudgeInfo({
  icon,
  name,
  description,
  color,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4 text-center">
      <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-background ${color}`}>
        {icon}
      </div>
      <h3 className="font-medium">{name}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
