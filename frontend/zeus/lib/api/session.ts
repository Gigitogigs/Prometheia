// backend contract
import { apiFetch } from './client';

export type SessionUser = {
  username: string;
  avatar_url?: string | null;
};

export type SessionResponse = {
  user: SessionUser | null;
};

export async function getSession(): Promise<SessionResponse | null> {
  const res = await apiFetch('/session/');
  if (!res.ok) return null;    //not authenticated
  return res.json();
}
