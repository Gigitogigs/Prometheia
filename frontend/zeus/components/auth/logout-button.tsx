'use client';

import { logout } from '@/lib/api/auth';
import { useQueryClient } from '@tanstack/react-query';

export function LogoutButton() {
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();

    // Clear all cached data (session + everything else)
    queryClient.clear();

    // Broadcast logout to other tabs
    localStorage.setItem('auth-event', Date.now().toString());
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
    >
      Logout
    </button>
  );
}

