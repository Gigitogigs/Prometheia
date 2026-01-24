'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Activity, Settings, Zap, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/feed', label: 'Feed', icon: Activity },
  { href: '/setup', label: 'Setup', icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    // Fetch the session from backend
    fetch('/api/session/')
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/leaderboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">Code</span>
            <span className="text-foreground">XP</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right-side GitHub / Auth */}
        <div>
          {!user ? (
            <Link
              href="/http://localhost:8000/accounts/github/login/"
              className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">Login with GitHub</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium">{user.username}</span>
              <Link
                href="/accounts/logout/"
                className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Logout
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}





// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Trophy, Activity, Settings, Zap, Github } from 'lucide-react';
// import { cn } from '@/lib/utils';

// const navItems = [
//   { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
//   { href: '/feed', label: 'Feed', icon: Activity },
//   { href: '/setup', label: 'Setup', icon: Settings },
// ];

// export function Navbar() {
//   const pathname = usePathname();

//   return (
//     <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
//       <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
//         <Link href="/leaderboard" className="flex items-center gap-2">
//           <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
//             <Zap className="h-5 w-5 text-primary-foreground" />
//           </div>
//           <span className="text-xl font-bold tracking-tight">
//             <span className="text-primary">Code</span>
//             <span className="text-foreground">XP</span>
//           </span>
//         </Link>

//         <nav className="flex items-center gap-1">
//           {navItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = pathname === item.href;
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={cn(
//                   'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
//                   isActive
//                     ? 'bg-primary/10 text-primary'
//                     : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
//                 )}
//               >
//                 <Icon className="h-4 w-4" />
//                 <span className="hidden sm:inline">{item.label}</span>
//               </Link>
//             );
//           })}
//         </nav>

//         <a
//           href="https://github.com"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
//         >
//           <Github className="h-4 w-4" />
//           <span className="hidden sm:inline">GitHub</span>
//         </a>
//       </div>
//     </header>
//   );
// }
