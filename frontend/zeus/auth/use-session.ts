// import { useQuery } from '@tanstack/react-query';

// export type SessionUser = {
//   username: string;
//   avatar_url?: string;
// };

// export function useSession() {
//   return useQuery({
//     queryKey: ['session'],
//     queryFn: async () => {
//       const res = await fetch('api/session', {
//         credentials: 'include',
//       });

//       if (!res.ok) return null;

//       const data = await res.json();
//       return data.user as SessionUser | null;
//     },
//     staleTime: 60_000,
//     refetchOnWindowFocus: true,
//   });
// }
