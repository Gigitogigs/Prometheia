// backend origin for networking
const rawUrl = process.env.NEXT_PUBLIC_API_URL;
if (!rawUrl) {
  console.warn("NEXT_PUBLIC_API_URL is not defined in environment variables!");
}
export const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

export const API_BASE = `${BACKEND_ORIGIN}/api`;

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  return fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
