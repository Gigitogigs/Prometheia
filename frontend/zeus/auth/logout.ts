// import { useQueryClient } from '@tanstack/react-query';

// export function useLogout() {
//   const queryClient = useQueryClient();

//   return async () => {
//     await fetch('/api/logout/', { method: 'POST' });
//     queryClient.invalidateQueries({ queryKey: ['session'] });

//     // Broadcast logout to other tabs
//     localStorage.setItem('auth-event', Date.now().toString());
//   };
// }
