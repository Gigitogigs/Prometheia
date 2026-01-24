// lib/api.ts
import type {
  UserProfile,
  CommitLog,
  CommitLogDetail,
  PaginatedResponse,
} from '@/types/api';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = {
  // GET /api/leaderboard/
  getLeaderboard: async (
    page = 1
  ): Promise<{ results: UserProfile[]; count: number }> => {
    const res = await fetch(`${API_BASE}/leaderboard/?page=${page}`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
  },

  // GET /api/commits/
  getCommits: async (
    username?: string
  ): Promise<PaginatedResponse<CommitLog>> => {
    const url = username
      ? `${API_BASE}/commits/?username=${username}`
      : `${API_BASE}/commits/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch commits');
    return res.json();
  },

  // GET /api/commits/{hash}/
  getCommitDetail: async (hash: string): Promise<CommitLogDetail> => {
    const res = await fetch(`${API_BASE}/commits/${hash}/`);
    if (!res.ok) throw new Error('Commit not found');
    return res.json();
  },

  // GET /api/users/{username}/
  getUserProfile: async (username: string): Promise<UserProfile> => {
    const res = await fetch(`${API_BASE}/users/${username}/`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  },

  // POST /api/repositories/create-webhook/
  createWebhook: async (repoName: string) => {
    const res = await fetch(`${API_BASE}/repositories/create-webhook/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_name: repoName }),
    });
    if (!res.ok) throw new Error('Failed to create webhook');
    return res.json();
  },
};
