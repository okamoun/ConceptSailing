'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

const NAV_LINKS = [
  { href: '/',             label: 'Home' },
  { href: '/experiences',  label: 'Experiences' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/boats',        label: 'Rates' },
  { href: '/about',        label: 'About' },
  { href: '/contact',      label: 'Contact' },
  { href: '/reviews',      label: 'Reviews' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, userProfile } = useAuth();

  const isAdmin = userProfile?.role === 'admin' || !!user;

  return (
    <nav className="bg-[#0a1628] border-b border-blue-900/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-bold text-xl tracking-wide hover:text-blue-300 transition-colors"
          >
            <span className="text-blue-400">Blue</span>One
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    px-3 py-2 rounded text-sm font-medium transition-colors
                    ${active
                      ? 'text-white bg-blue-800/50'
                      : 'text-blue-200 hover:text-white hover:bg-blue-900/40'}
                  `}
                >
                  {label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={`
                  px-3 py-2 rounded text-sm font-medium transition-colors
                  ${pathname.startsWith('/admin')
                    ? 'text-white bg-blue-800/50'
                    : 'text-blue-300 hover:text-white hover:bg-blue-900/40'}
                `}
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
