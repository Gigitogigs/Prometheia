'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function AuthSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [queryClient]);

  return null;
}
