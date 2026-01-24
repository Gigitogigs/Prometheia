import { useQuery } from '@tanstack/react-query';

export type SessionUser = {
  username: string;
  avatar_url?: string | null;
};

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch('/api/session/', {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Not authenticated');
      }

      return res.json();
    },
    retry: false,
    staleTime: 60_000, // 1 minute
  });
}
