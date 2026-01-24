'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { getSession, Session } from '@/hooks/use-api';
import { AuthSync } from '@/components/auth/auth-sync';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useQuery<Session>({
    queryKey: ['session'],
    queryFn: getSession,
    staleTime: Infinity,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Skeleton className="h-12 w-48 mb-2" />
        <Skeleton className="h-6 w-32" />
      </div>
    );
  }

  if (isError || !data?.user) {
    const githubLoginUrl =
      process.env.NEXT_PUBLIC_GITHUB_LOGIN_URL ||
      'http://localhost:8000/accounts/github/login/'; // fallback

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <p className="text-muted-foreground">
          You must be logged in to access this page.
        </p>
        <a
          href={githubLoginUrl}
          className="rounded-lg bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 transition-colors"
        >
          Login with GitHub
        </a>
      </div>
    );
  }

  // Session exists → render protected content
  return (
    <>
      <AuthSync />
      {children}
    </>
  );
}


// 'use client';

// import React from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { Skeleton } from '@/components/ui/loading-skeleton';
// import { getSession, Session } from '@/hooks/use-api';
// import { AuthSync } from '@/components/auth/auth-sync';

// export function RequireAuth({ children }: { children: React.ReactNode }) {
//   const { data, isLoading, isError } = useQuery<Session>({
//     queryKey: ['session'],
//     queryFn: getSession, // TS now knows this returns Session
//     staleTime: Infinity,
//     refetchOnWindowFocus: true,
//   });

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center p-8 text-center">
//         <Skeleton className="h-12 w-48 mb-2" />
//         <Skeleton className="h-6 w-32" />
//       </div>
//     );
//   }

//   if (isError || !data?.user) {
//     return (
//       <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
//         <p className="text-muted-foreground">
//           You must be logged in to access this page.
//         </p>
//         <a
//           href="http://localhost:8000/accounts/github/login/"
//           className="rounded-lg bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 transition-colors"
//         >
//           Login with GitHub
//         </a>
//       </div>
//     );
//   }

//   // Session exists → render protected content
//   return (
//     <>
//       <AuthSync />
//       {children}
//     </>
//   );
// }





// 'use client';

// import React from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { Skeleton } from '@/components/ui/loading-skeleton';
// import { getSession } from '@/hooks/use-api';
// import { AuthSync } from '@/components/auth/auth-sync';

// type User = {
//   username: string;
//   avatar_url?: string;
// };

// type Session = {
//   user: User | null;
// };

// export function RequireAuth({ children }: { children: React.ReactNode }) {
//   // Fetch session
//   const { data, isLoading, isError } = useQuery<Session>(
//     ['session'],
//     getSession,
//     {
//       staleTime: Infinity,          // session stays cached until invalidated
//       refetchOnWindowFocus: true,   // refresh when tab gains focus
//     }
//   );

//   // Show loading skeleton while auth state is loading
//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center p-8 text-center">
//         <Skeleton className="h-12 w-48 mb-2" />
//         <Skeleton className="h-6 w-32" />
//       </div>
//     );
//   }

//   // If session fetch failed or no user, show login prompt
//   if (isError || !data?.user) {
//     return (
//       <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
//         <p className="text-muted-foreground">
//           You must be logged in to access this page.
//         </p>
//         <a
//           href="http://localhost:8000/accounts/github/login/"
//           className="rounded-lg bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 transition-colors"
//         >
//           Login with GitHub
//         </a>
//       </div>
//     );
//   }

//   // Session exists → render protected content
//   return (
//     <>
//       <AuthSync /> {/* ensures cross-tab session updates */}
//       {children}
//     </>
//   );
// }



// 'use client';

// import { ReactNode, useEffect } from 'react';
// import { useSession } from '@/auth/use-session';

// type Props = {
//   children: ReactNode;
// };

// export function RequireAuth({ children }: Props) {
//   const { data: user, isLoading } = useSession();

//   useEffect(() => {
//     if (!isLoading && !user) {
//       window.location.href =
//         'http://localhost:8000/accounts/github/login/';
//     }
//   }, [isLoading, user]);

//   if (isLoading) {
//     return null; // or a full-page skeleton
//   }

//   if (!user) {
//     return null;
//   }

//   return <>{children}</>;
// }
