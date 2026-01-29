'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  UserProfile,
  CommitLog,
  CommitLogDetail,
  PaginatedResponse,
  LeaderboardParams,
  CommitFeedParams,
  Repository,
} from '@/types/api';

/* ------------------------------------------------------------------ */
/* Infinite Leaderboard Hook - FIXED & Typed */
/* ------------------------------------------------------------------ */

export function useInfiniteLeaderboard(params: Omit<LeaderboardParams, 'page'> = {}) {
  return useInfiniteQuery<
    PaginatedResponse<UserProfile>, // data per page
    Error,                          // error type
    PaginatedResponse<UserProfile>, // select type (same)
    [string, Omit<LeaderboardParams, 'page'>], // queryKey type
    number                           // <- this is pageParam type
  >({
    queryKey: ['leaderboard', params],
    queryFn: async ({ pageParam = 1 }) => {
      // Now TypeScript knows pageParam is a number
      return api.getLeaderboard({ ...params, page: pageParam });
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.next ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
}


// export function useInfiniteLeaderboard(params: Omit<LeaderboardParams, 'page'> = {}) {
//   return useInfiniteQuery<
//     PaginatedResponse<UserProfile>, // Data per page
//     Error,                          // Error type
//     PaginatedResponse<UserProfile>, // Select type (same here)
//     [string, Omit<LeaderboardParams, 'page'>] // queryKey type - fixed to 2 elements
//   >({
//     queryKey: ['leaderboard', params], // now properly typed as 2-element tuple
//     queryFn: async ({ pageParam = 1 }) => {
//       return api.getLeaderboard({ ...params, page: pageParam });
//     },
//     getNextPageParam: (lastPage, allPages) => {
//       return lastPage.next ? allPages.length + 1 : undefined;
//     },
//     initialPageParam: 1,
//   });
// }

/* ------------------------------------------------------------------ */
/* Other hooks remain unchanged */
/* ------------------------------------------------------------------ */
export function useLeaderboard(params: LeaderboardParams = {}) {
  return useQuery<PaginatedResponse<UserProfile>, Error>({
    queryKey: ['leaderboard', params],
    queryFn: () => api.getLeaderboard(params),
  });
}

export function useCommits(params: CommitFeedParams = {}) {
  const { username } = params;
  return useQuery<PaginatedResponse<CommitLog>, Error>({
    queryKey: ['commits', username],
    queryFn: () => api.getCommits(username),
    enabled: !!username,
  });
}

export function useCommit(hash: string) {
  return useQuery<CommitLogDetail, Error>({
    queryKey: ['commit', hash],
    queryFn: () => api.getCommitDetail(hash),
    enabled: !!hash,
  });
}

export function useUserProfile(username: string) {
  return useQuery<UserProfile, Error>({
    queryKey: ['user', username],
    queryFn: () => api.getUserProfile(username),
    enabled: !!username,
  });
}

export function useUserCommits(username: string) {
  return useQuery<PaginatedResponse<CommitLog>, Error>({
    queryKey: ['user-commits', username],
    queryFn: () => api.getCommits(username),
    enabled: !!username,
  });
}

export function useCreateRepositoryWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (repoName: string) => api.createWebhook(repoName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commits'] });
    },
  });
}


/* ---------------------------- */
/* Connected Repositories Hook  */
/* ---------------------------- */

export function useConnectedRepos() {
  return useQuery<Repository[], Error>({
    queryKey: ['connected-repos'],
    queryFn: () => api.getUserRepos(),
  });
}

export function useToggleRepoActive() {
  const queryClient = useQueryClient();

  return useMutation<
    Repository,
    Error,
    { repoId: number; isActive: boolean }
  >({
    mutationFn: ({ repoId, isActive }) => api.toggleRepoActive(repoId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-repos'] });
    },
  });
}

export function useDeleteRepo() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (repoId) => api.deleteRepo(repoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-repos'] });
    },
  });
}
