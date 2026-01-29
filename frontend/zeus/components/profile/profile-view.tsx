// uses useUserProfile(username) to fetch API data. Fetches user data and renders the profile page.
'use client';

import Link from 'next/link';
import { useUserProfile } from '@/hooks/use-api';
import { ProfileHeader } from './profile-header';
import { UserCommits } from './user-commits';
import { ProfileSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, UserX } from 'lucide-react';
import type { UserProfile } from '@/types/api';

interface ProfileViewProps {
  username: string;
}

// Mock data for development
const mockProfile: UserProfile = {
  github_username: 'code_wizard',
  total_xp: 15420,
  current_level: 42,
  xp_to_next_level: 1000,
  current_streak: 15,
  last_commit_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  avatar_url: 'https://avatar.vercel.sh/code_wizard',
  title: 'Master Architect',
  rank: 1,
};

export function ProfileView({ username }: ProfileViewProps) {
  const { data, isLoading, error } = useUserProfile(username);

  // Use mock data if no API data available (update username to match)
  const user = data ?? { ...mockProfile, github_username: username };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link href="/leaderboard">
          <ArrowLeft className="h-4 w-4" />
          Back to Leaderboard
        </Link>
      </Button>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Using demo data. Connect your API to see real profile data.</span>
        </div>
      )}

      {/* Profile Header */}
      <ProfileHeader user={user} />

      {/* User's Commits */}
      <UserCommits username={username} />
    </div>
  );
}
