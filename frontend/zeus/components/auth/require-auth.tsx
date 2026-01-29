//UI gate 
'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { useSession } from '@/lib/queries/useSession';
import { loginUrl } from '@/lib/api/auth';
import { AuthSync } from '@/components/auth/auth-sync';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Skeleton className="h-12 w-48 mb-2" />
        <Skeleton className="h-6 w-32" />
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <p className="text-muted-foreground">
          You must be logged in to access this page.
        </p>
        <a
          href={loginUrl}
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
