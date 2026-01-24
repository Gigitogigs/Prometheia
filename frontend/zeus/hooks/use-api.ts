'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  UserProfile,
  CommitLog,
  CommitLogDetail,
  PaginatedResponse,
  LeaderboardParams,
  CommitFeedParams,
} from '@/types/api';

// Leaderboard Hook
export function useLeaderboard(params: LeaderboardParams = {}) {
  const { page = 1 } = params;

  return useQuery<{ results: UserProfile[]; count: number }>({
    queryKey: ['leaderboard', page],
    queryFn: () => api.getLeaderboard(page),
  });
}

// Commits Feed Hook
export function useCommits(params: CommitFeedParams = {}) {
  const { username } = params;

  return useQuery<PaginatedResponse<CommitLog>>({
    queryKey: ['commits', username],
    queryFn: () => api.getCommits(username),
  });
}

// Single Commit Hook
export function useCommit(hash: string) {
  return useQuery<CommitLogDetail>({
    queryKey: ['commit', hash],
    queryFn: () => api.getCommitDetail(hash),
    enabled: !!hash,
  });
}

// User Profile Hook
export function useUserProfile(username: string) {
  return useQuery<UserProfile>({
    queryKey: ['user', username],
    queryFn: () => api.getUserProfile(username),
    enabled: !!username,
  });
}

// User Commits Hook
export function useUserCommits(username: string) {
  return useQuery<PaginatedResponse<CommitLog>>({
    queryKey: ['user-commits', username],
    queryFn: () => api.getCommits(username),
    enabled: !!username,
  });
}

// Repository Webhook Mutation
export function useCreateRepositoryWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (repoName: string) => api.createWebhook(repoName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commits'] });
    },
  });
}

// --- Session Fetch ---
export type User = {
  username: string;
  avatar_url?: string;
};

export type Session = {
  user: User | null;
};

export async function getSession(): Promise<Session> {
  const res = await fetch('/api/session/');
  if (!res.ok) throw new Error('Failed to fetch session');
  return res.json(); // should return { user: User | null }
}

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: getSession,
    staleTime: Infinity,
    refetchOnWindowFocus: true, // auto-refresh when user focuses tab
  });
}