// api routes. no auth or UI logic
import { API_BASE } from './api/client';
import type {
  UserProfile,
  CommitLog,
  CommitLogDetail,
  PaginatedResponse,
  LeaderboardParams,
  Repository,
} from '@/types/api';

// csrf helper
  function getCSRFToken() {
    return document.cookie.match(/csrftoken=([^;]+)/)?.[1] || "";
  }

export const api = {
  // GET /api/leaderboard/
  getLeaderboard: async (
  params: LeaderboardParams = {}
    ): Promise<PaginatedResponse<UserProfile>> => {
      const searchParams = new URLSearchParams();

      if (params.page) searchParams.set('page', String(params.page));
      if (params.page_size) searchParams.set('page_size', String(params.page_size));
      if (params.min_level) searchParams.set('min_level', String(params.min_level));

      const res = await fetch(`${API_BASE}/leaderboard/?${searchParams.toString()}`);

      if (!res.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

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

  // POST /api/repositories/create-webhook/   repositories/webhook/
  createWebhook: async (repoName: string) => {
    const res = await fetch(`${API_BASE}/repositories/webhook/`, {
      method: 'POST',
      credentials: 'include', // CRITICAL: Sends the session cookie
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(), // CRITICAL: Django security check
      },
      body: JSON.stringify({ repo_name: repoName }),
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error('Authentication failed. Please log in again.');
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create webhook');
    }
    
    return res.json();
  },

  // GET /api/user/repos/
  getUserRepos: async (): Promise<Repository[]> => {
    const res = await fetch(`${API_BASE}/user/repos/`, {
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch connected repositories');
    }

    return res.json();
  },

  toggleRepoActive: async (repoId: number, isActive: boolean): Promise<Repository> => {
    const res = await fetch(`${API_BASE}/repositories/${repoId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: isActive }),
    });
    if (!res.ok) throw new Error('Failed to update repository status');
    return res.json();
  },

  deleteRepo: async (repoId: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/repositories/${repoId}/`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete repository');
  },

};
