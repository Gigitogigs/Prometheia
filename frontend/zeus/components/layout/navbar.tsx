'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Trophy,
  Activity,
  Settings,
  Zap,
  Github,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/lib/queries/useSession';
import { loginUrl, BACKEND_ORIGIN } from '@/lib/api/auth';
// import { BACKEND_ORIGIN } from '@/lib/api/client'
import { AuthSkeleton } from '@/components/ui/loading-skeleton';
import { LogoutButton } from '@/components/auth/logout-button';
import { useState } from 'react';
import { toast } from "@/lib/toast"

const navItems = [
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/feed', label: 'Feed', icon: Activity },
];

export function Navbar() {
  const pathname = usePathname();
  const { data, isLoading } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const isAuthed = Boolean(data?.user);

  // const handleLogin = () => {
  //   window.location.href = loginUrl;
  //   };
  const handleLogin = async () => {
      setIsRedirecting(true);
      if (!BACKEND_ORIGIN) {
        toast.error("Configuration Error", "Backend URL is not defined.");
        return;
      }
      
      const controller = new AbortController();
      // Assign timeoutId and use it to clear the timeout later
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      try {
        // Pre-flight check
        await fetch(BACKEND_ORIGIN, { mode: 'no-cors', signal: controller.signal });
        
        // Clear the timeout since the fetch finished successfully
        clearTimeout(timeoutId);
        
        // If server is up, proceed
        window.location.href = loginUrl;
      } catch (error) { // Prefix with _ to ignore "unused variable" warning
        clearTimeout(timeoutId); // Ensure cleanup on error too
        
        // toast.error(
        //   "System Offline", 
        //   "The authentication server is currently under maintenance. Please try again later."
        // );
        // Checking if the error was specifically the timeout
        const isTimeout = error instanceof Error && error.name === 'AbortError';
        const description = isTimeout 
          ? "The server took too long to respond. Check your connection."
          : "The authentication server is currently under maintenance.";

        toast.error("System Offline", description);
      } finally {
        setIsRedirecting(false);
      }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href={isAuthed ? '/me' : '/leaderboard'} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">Code</span>
            <span className="text-foreground">XP</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {/* Public links */}
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}

          {/* Auth-only links */}
          {isAuthed && (
            <>
              <Link
                href="/me"
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === '/me'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                href="/setup"
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === '/setup'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Setup</span>
              </Link>
            </>
          )}
        </nav>

        {/* Auth */}
        <div>
          {isLoading ? (
            <AuthSkeleton />
           ) : !data?.user ? 
          //  (
          //   <a
          //     href={loginUrl}
          //     className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
          //   >
          //     <Github className="h-4 w-4" />
          //     Login with GitHub
          //   </a>
          // ) 
          (
          // <button
          //   onClick={handleLogin}
          //   className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
          // >
          //   <Github className="h-4 w-4" />
          //   Login with GitHub
          // </button>
          <button
              onClick={handleLogin}
              disabled={isRedirecting} // This uses the variable!
              className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Github className={cn("h-4 w-4", isRedirecting && "animate-spin")} />
              {isRedirecting ? "Checking..." : "Login with GitHub"}
            </button>
        )
          : (
            <div className="flex items-center gap-3">
              <Image
                src={
                  data.user.avatar_url ??
                  `https://avatar.vercel.sh/${data.user.username}`
                }
                alt={data.user.username}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="hidden sm:inline text-sm font-medium">
                {data.user.username}
              </span>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
