// auth urls
import { BACKEND_ORIGIN } from './client'; 
export { BACKEND_ORIGIN }; // This makes it available to the Navbar


const loginPath = process.env.NEXT_PUBLIC_GITHUB_LOGIN_PATH;

export const loginUrl = `${BACKEND_ORIGIN}/${loginPath}`;

/**
 * Logs the user out via Django (allauth) session auth
 * - Sends credentials (cookies) for session logout
 * - Optional CSRF header if required
 * - Does NOT reload the page; rely on React Query + AuthSync to update state
 */
export async function logout(): Promise<void> {
  const csrfToken = getCSRFToken();

  const headers: HeadersInit = csrfToken ? { 'X-CSRFToken': csrfToken } : {};

  const res = await fetch(`${BACKEND_ORIGIN}/accounts/logout/`, {
    method: 'POST',
    credentials: 'include',
    headers,
  });

  if (!res.ok) {
    console.warn('Logout failed:', res.status, res.statusText);
  }
}

/**
 * Reads Django CSRF token from cookies
 * - Default cookie name: csrftoken
 */
function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

