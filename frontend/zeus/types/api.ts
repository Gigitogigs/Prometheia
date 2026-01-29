export type JudgeType = 'ARCHITECT' | 'PALADIN' | 'SCRIBE';

export interface JudgeEvaluation {
  id: number;
  judge_type: JudgeType;
  xp_awarded: number;
  reasoning: string; // Markdown supported
  proof_url: string; // Link to Opik trace
  created_at: string;
}

export interface UserProfile {
  github_username: string;
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  current_streak: number;
  last_commit_date: string | null;
  avatar_url: string;
  title: string;
  rank: number | null; // Calculated by LeaderboardView
}

export interface CommitLog {
  id: number;
  commit_hash: string;
  message: string;
  timestamp: string;
  url: string;
  author_username: string;
  repository_name: string;
  total_xp_awarded: number;
  is_processed: boolean;
  evaluation_count: number;
  created_at: string;
}

export interface CommitLogDetail extends CommitLog {
  raw_diff: string; // Used for the "Audit Trail" view
  evaluations: JudgeEvaluation[];
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LeaderboardParams {
  min_level?: number;
  page?: number;
  page_size?: number;
}

export interface CommitFeedParams {
  username?: string;
  page?: number;
  page_size?: number;
}


export interface Repository {
  id: number;
  name: string;           // repo name like "octocat/hello-world"
  full_name: string;
  owner: string;          // optional, if returned, has repo owner
  is_active: boolean;
  created_at: string;
  // updated_at: string;
}

