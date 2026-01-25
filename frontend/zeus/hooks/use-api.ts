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

/* ------------------------------------------------------------------ */
/* Mock Leaderboard (DEV ONLY)                                         */
/* ------------------------------------------------------------------ */

const mockLeaderboard: UserProfile[] = [
  {
    github_username: 'code_wizard',
    total_xp: 15420,
    current_level: 42,
    xp_to_next_level: 1000,
    current_streak: 15,
    last_commit_date: new Date().toISOString(),
    avatar_url: 'https://avatar.vercel.sh/code_wizard',
    title: 'Master Architect',
    rank: 1,
  },
  {
    github_username: 'dev_ninja',
    total_xp: 12850,
    current_level: 38,
    xp_to_next_level: 1000,
    current_streak: 8,
    last_commit_date: new Date().toISOString(),
    avatar_url: 'https://avatar.vercel.sh/dev_ninja',
    title: 'Senior Paladin',
    rank: 2,
  },
  {
    github_username: 'byte_smith',
    total_xp: 11200,
    current_level: 35,
    xp_to_next_level: 1000,
    current_streak: 12,
    last_commit_date: new Date().toISOString(),
    avatar_url: 'https://avatar.vercel.sh/byte_smith',
    title: 'Code Scribe',
    rank: 3,
  },
];

function getMockLeaderboard(page: number, pageSize = 10) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    count: mockLeaderboard.length,
    next: end < mockLeaderboard.length ? 'mock-next' : null,
    previous: page > 1 ? 'mock-prev' : null,
    results: mockLeaderboard.slice(start, end),
  };
}

/* ------------------------------------------------------------------ */
/* Leaderboard Hook                                                    */
/* ------------------------------------------------------------------ */

export function useLeaderboard(params: LeaderboardParams = {}) {
  const { page = 1 } = params;

  return useQuery({
    queryKey: ['leaderboard', params],
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        return getMockLeaderboard(page);
      }

      return api.getLeaderboard(params);
      
    },
  });
}

/* ------------------------------------------------------------------ */
/* Commits Feed Hook                                                   */
/* ------------------------------------------------------------------ */

export function useCommits(params: CommitFeedParams = {}) {
  const { username } = params;

  return useQuery<PaginatedResponse<CommitLog>>({
    queryKey: ['commits', username],
    queryFn: () => api.getCommits(username),
  });
}

/* ------------------------------------------------------------------ */
/* Single Commit Hook                                                  */
/* ------------------------------------------------------------------ */

export function useCommit(hash: string) {
  return useQuery<CommitLogDetail>({
    queryKey: ['commit', hash],
    queryFn: () => api.getCommitDetail(hash),
    enabled: !!hash,
  });
}

/* ------------------------------------------------------------------ */
/* User Profile Hook                                                   */
/* ------------------------------------------------------------------ */

export function useUserProfile(username: string) {
  return useQuery<UserProfile>({
    queryKey: ['user', username],
    queryFn: () => api.getUserProfile(username),
    enabled: !!username,
  });
}

/* ------------------------------------------------------------------ */
/* User Commits Hook                                                   */
/* ------------------------------------------------------------------ */

export function useUserCommits(username: string) {
  return useQuery<PaginatedResponse<CommitLog>>({
    queryKey: ['user-commits', username],
    queryFn: () => api.getCommits(username),
    enabled: !!username,
  });
}

/* ------------------------------------------------------------------ */
/* Repository Webhook Mutation                                         */
/* ------------------------------------------------------------------ */

export function useCreateRepositoryWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (repoName: string) => api.createWebhook(repoName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commits'] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Session Hook                                                        */
/* ------------------------------------------------------------------ */

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
  return res.json();
}

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: getSession,
    staleTime: Infinity,
    refetchOnWindowFocus: true,
  });
}




// 'use client';

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '@/lib/api';
// import type {
//   UserProfile,
//   CommitLog,
//   CommitLogDetail,
//   PaginatedResponse,
//   LeaderboardParams,
//   CommitFeedParams,
// } from '@/types/api';

// // Leaderboard Hook
// export function useLeaderboard(params: LeaderboardParams = {}) {
//   const { page = 1 } = params;

//   return useQuery<{ results: UserProfile[]; count: number }>({
//     queryKey: ['leaderboard', page],
//     queryFn: () => api.getLeaderboard(page),
//   });
// }

// // Commits Feed Hook
// export function useCommits(params: CommitFeedParams = {}) {
//   const { username } = params;

//   return useQuery<PaginatedResponse<CommitLog>>({
//     queryKey: ['commits', username],
//     queryFn: () => api.getCommits(username),
//   });
// }

// // Single Commit Hook
// export function useCommit(hash: string) {
//   return useQuery<CommitLogDetail>({
//     queryKey: ['commit', hash],
//     queryFn: () => api.getCommitDetail(hash),
//     enabled: !!hash,
//   });
// }

// // User Profile Hook
// export function useUserProfile(username: string) {
//   return useQuery<UserProfile>({
//     queryKey: ['user', username],
//     queryFn: () => api.getUserProfile(username),
//     enabled: !!username,
//   });
// }

// // User Commits Hook
// export function useUserCommits(username: string) {
//   return useQuery<PaginatedResponse<CommitLog>>({
//     queryKey: ['user-commits', username],
//     queryFn: () => api.getCommits(username),
//     enabled: !!username,
//   });
// }

// // Repository Webhook Mutation
// export function useCreateRepositoryWebhook() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (repoName: string) => api.createWebhook(repoName),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['commits'] });
//     },
//   });
// }

// // --- Session Fetch ---
// export type User = {
//   username: string;
//   avatar_url?: string;
// };

// export type Session = {
//   user: User | null;
// };

// export async function getSession(): Promise<Session> {
//   const res = await fetch('/api/session/');
//   if (!res.ok) throw new Error('Failed to fetch session');
//   return res.json(); // should return { user: User | null }
// }

// export function useSession() {
//   return useQuery({
//     queryKey: ['session'],
//     queryFn: getSession,
//     staleTime: Infinity,
//     refetchOnWindowFocus: true, // auto-refresh when user focuses tab
//   });
// }