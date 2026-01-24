/**
 * Logs the user out via Django (allauth) using a CSRF-safe POST request.
 * Works with session authentication.
 */
export async function logout(): Promise<void> {
  const csrfToken = getCSRFToken();

  const headers: HeadersInit = {};
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }

  await fetch('http://localhost:8000/accounts/logout/', {
    method: 'POST',
    credentials: 'include', // IMPORTANT: send session + csrf cookies
    headers,
  });

  // Force a clean UI reset (safe + simple)
  window.location.reload();
}

/**
 * Reads the CSRF token from cookies (Django default: csrftoken)
 */
function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}
