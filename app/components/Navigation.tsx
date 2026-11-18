'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminAuth } from '../admin/AdminAuthContext';

const ADMIN_PAGE_LABELS: Record<string, string> = {
  '/admin':                 'Dashboard',
  '/admin/booking-summary': 'Bookings',
  '/admin/availability':    'Calendar',
  '/admin/reviews':         'Reviews',
  '/admin/photos':          'Photos',
  '/admin/users':           'Users',
};

const NAV_LINKS = [
  { href: '/blueone',      label: 'The Yacht' },
  { href: '/experiences',  label: 'Experiences' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/rates',        label: 'Rates' },
  { href: '/availability', label: 'Availability' },
  { href: '/reviews',      label: 'Reviews' },
  { href: '/about',        label: 'About' },
  { href: '/contact',      label: 'Contact' },
];

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const darkInput =
  'w-full bg-white/10 border-white/25 text-white placeholder:text-blue-200/70 rounded-lg px-3 py-2 text-base sm:text-sm focus:border-sky-400';

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const adminRef = useRef<HTMLDivElement>(null);

  const { authed, allowedPages, isSuperAdmin, currentUser, login, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname() ?? '';

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // Close admin dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) {
        setAdminOpen(false);
        setLoginOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Escape closes any open menu
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setAdminOpen(false);
        setLoginOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Close the mobile menu on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    const user = await login(username, password);
    setLoggingIn(false);
    if (user) {
      setLoginOpen(false);
      setMobileOpen(false);
      setUsername('');
      setPassword('');
      const pages = user.isSuperAdmin ? ['/admin'] : user.pages;
      const firstPage = pages[0];
      if (firstPage) router.push(firstPage);
    } else {
      setLoginError('Incorrect username or password.');
    }
  }

  function handleLogout() {
    logout();
    setAdminOpen(false);
    setMobileOpen(false);
  }

  const loginFields = (
    <>
      <input
        type="text"
        placeholder="Username"
        aria-label="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        autoComplete="username"
        className={darkInput}
      />
      <input
        type="password"
        placeholder="Password"
        aria-label="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        autoComplete="current-password"
        className={darkInput}
      />
      {loginError && <p role="alert" className="text-red-300 text-xs mb-0">{loginError}</p>}
      <button
        type="submit"
        disabled={loggingIn}
        className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
      >
        {loggingIn ? 'Signing in…' : 'Sign In'}
      </button>
    </>
  );

  return (
    <nav
      aria-label="Main"
      className="sticky top-0 z-50 bg-[#0a1f3c]/90 backdrop-blur-xl backdrop-saturate-150 border-b border-white/10 shadow-[0_8px_30px_-12px_rgba(6,20,42,0.6)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 lg:h-[72px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center shrink-0 group" aria-label="BlueOne — home">
          <Image
            src="/images/boats/blueone/logo_blueone.png"
            alt="BlueOne Logo"
            width={120}
            height={60}
            className="h-10 lg:h-11 w-auto object-contain transition-opacity group-hover:opacity-85"
            priority
          />
          <span className="sr-only">BlueOne Luxury Yacht</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative px-2.5 xl:px-3 py-2 text-[0.9375rem] font-medium rounded-full transition-colors duration-200 ${
                  active ? 'text-white' : 'text-white/75 hover:text-white'
                }`}
              >
                {label}
                <span
                  aria-hidden="true"
                  className={`absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-sky-400 transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
                />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/booking"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white text-[#0a1f3c] hover:bg-sky-100 px-4 py-2 text-sm font-semibold transition-colors"
          >
            Request a Quote
          </Link>

          {/* Admin section (desktop) */}
          <div className="relative hidden lg:block" ref={adminRef}>
            {!authed ? (
              <>
                <button
                  onClick={() => { setLoginOpen(p => !p); setAdminOpen(false); }}
                  aria-expanded={loginOpen}
                  className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium transition-colors px-2 py-2"
                >
                  <UserIcon />
                  Login
                </button>
                {loginOpen && (
                  <form
                    onSubmit={handleLogin}
                    className="absolute right-0 top-full mt-3 w-72 bg-[#0a1f3c] border border-white/15 rounded-2xl p-5 shadow-2xl space-y-3"
                  >
                    <p className="text-white text-xs font-semibold uppercase tracking-widest mb-1">Admin Login</p>
                    {loginFields}
                  </form>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setAdminOpen(p => !p)}
                  aria-expanded={adminOpen}
                  className="flex items-center gap-1.5 text-sky-200 hover:text-white text-sm font-medium transition-colors px-2 py-2"
                >
                  <UserIcon />
                  {currentUser?.username ?? 'Admin'}
                  <svg className={`w-3 h-3 transition-transform ${adminOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {adminOpen && (
                  <div className="absolute right-0 top-full mt-3 w-52 bg-[#0a1f3c] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
                    <p className="text-sky-300 text-xs px-4 py-2.5 border-b border-white/10 font-semibold uppercase tracking-widest mb-0">
                      {isSuperAdmin ? 'Super Admin' : 'Admin'}
                    </p>
                    {allowedPages.map(page => (
                      <Link
                        key={page}
                        href={page}
                        onClick={() => setAdminOpen(false)}
                        className="block px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                      >
                        {ADMIN_PAGE_LABELS[page] ?? page}
                      </Link>
                    ))}
                    <div className="border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-300 hover:bg-white/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-white p-2 -mr-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="lg:hidden border-t border-white/10 bg-[#0a1f3c] max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <div className="px-4 py-3">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-3.5 rounded-xl text-base font-medium transition-colors ${
                    active ? 'bg-white/10 text-white' : 'text-white/85 hover:bg-white/5'
                  }`}
                >
                  {label}
                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
            <Link
              href="/booking"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex items-center justify-center rounded-full bg-white text-[#0a1f3c] px-5 py-3.5 text-base font-semibold"
            >
              Request a Quote
            </Link>
          </div>

          {/* Mobile admin section */}
          <div className="border-t border-white/10 px-4 py-3">
            {!authed ? (
              <>
                <button
                  type="button"
                  onClick={() => setMobileLoginOpen(o => !o)}
                  aria-expanded={mobileLoginOpen}
                  className="flex items-center gap-2 px-3 py-2 text-white/55 hover:text-white text-xs font-semibold uppercase tracking-widest"
                >
                  <UserIcon />
                  Admin Login
                </button>
                {mobileLoginOpen && (
                  <form onSubmit={handleLogin} className="px-3 pt-2 pb-3 space-y-3">
                    {loginFields}
                  </form>
                )}
              </>
            ) : (
              <>
                <p className="px-3 py-2 text-sky-300 text-xs font-semibold uppercase tracking-widest mb-0">
                  {currentUser?.username} · {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </p>
                {allowedPages.map(page => (
                  <Link
                    key={page}
                    href={page}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-3 rounded-xl text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    {ADMIN_PAGE_LABELS[page] ?? page}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-3 text-sm text-red-300 hover:bg-white/5 rounded-xl transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
