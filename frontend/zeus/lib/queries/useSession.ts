// state management
import { useQuery } from '@tanstack/react-query';
import { getSession, SessionResponse } from '@/lib/api/session';

/**
 * Custom hook to manage user session.
 * - Automatically fetches session on mount.
 * - Refetches when window gains focus.
 * - Stays in sync across tabs via AuthSync.
 */
export function useSession() {
  return useQuery<SessionResponse | null>({
    queryKey: ['session'],
    queryFn: getSession,
    staleTime: Infinity,            // never consider session stale on its own
    refetchOnWindowFocus: true,     // refetch session if user switches tabs
    retry: false,                   // don't retry failed session fetch
    refetchOnReconnect: true,       // refetch if browser reconnects
  });
}

