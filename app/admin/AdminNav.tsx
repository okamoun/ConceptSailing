'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from './AdminAuthContext';

const NAV_LINKS = [
  { href: '/admin',                   label: 'Dashboard' },
  { href: '/admin/booking-summary',   label: 'Booking Summary' },
  { href: '/admin/availability',      label: 'Calendar' },
  { href: '/admin/proposals',         label: 'Proposals' },
  { href: '/admin/reviews',           label: 'Reviews' },
  { href: '/admin/photos',            label: 'Photos' },
  { href: '/admin/users',             label: 'Users' },
  { href: '/admin/financial',         label: 'Financial' },
  { href: '/admin/themes',            label: 'Themes' },
  { href: '/admin/experiences',       label: 'Experiences' },
  { href: '/admin/reconcile',         label: 'Reconcile' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const { logout, allowedPages, currentUser } = useAdminAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-12 bg-blue-950/90 backdrop-blur-md border-b border-white/10 flex items-center px-4 gap-1">
      {/* Brand */}
      <span className="text-white font-bold text-sm mr-3 flex-shrink-0">
        ⚓ Admin
      </span>

      {/* Nav links */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {NAV_LINKS.filter(({ href }) => allowedPages.includes(href as never)).map(({ href, label }) => {
          const active = href === '/admin' ? pathname === '/admin' : (pathname?.startsWith(href) ?? false);
          return (
            <Link
              key={href}
              href={href}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                active
                  ? 'bg-white/20 text-white'
                  : 'text-blue-300 hover:text-white hover:bg-white/10',
              ].join(' ')}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Current user + Logout */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {currentUser && (
          <span className="text-blue-400 text-xs hidden sm:inline">{currentUser.username}</span>
        )}
        <button
          onClick={logout}
          className="text-blue-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
