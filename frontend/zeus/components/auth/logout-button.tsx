'use client';

import { useLogout } from '@/auth/logout';

export function LogoutButton() {
  const logout = useLogout();

  return (
    <button
      onClick={logout}
      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
    >
      Logout
    </button>
  );
}
