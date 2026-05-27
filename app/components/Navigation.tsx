'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const adminRef = useRef<HTMLDivElement>(null);

  const { authed, allowedPages, isSuperAdmin, currentUser, login, logout } = useAdminAuth();
  const router = useRouter();

  const navLinks = [
    { href: '/blueone',     label: 'The Yacht',   bold: true },
    { href: '/destinations',label: 'Destinations',bold: false },
    { href: '/experiences', label: 'Experiences', bold: true },
    { href: '/about',       label: 'About',       bold: false },
    { href: '/availability',label: 'Availability',bold: false },
    { href: '/reviews',     label: 'Reviews',     bold: false },
    { href: '/contact',     label: 'Contact',     bold: false },
  ];

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

  return (
    <nav className="sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex flex-col items-center gap-2 group" onClick={() => setMobileOpen(false)}>
          <Image
            src="/images/boats/blueone/logo_blueone.png"
            alt="BlueOne Logo"
            width={120}
            height={60}
            className="h-16 w-auto transition-transform duration-300 group-hover:scale-105 object-contain drop-shadow-lg"
            priority
          />
          <span className="text-white/90 font-medium text-sm tracking-wide">BlueOne Luxury Yacht</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map(({ href, label, bold }) => (
            <Link
              key={href}
              href={href}
              className={`text-white ${bold ? 'font-bold' : 'font-medium text-white/90'} hover:text-blue-200 transition-colors duration-200`}
            >
              {label}
            </Link>
          ))}

          {/* Admin section */}
          <div className="relative" ref={adminRef}>
            {!authed ? (
              <div className="relative">
                <button
                  onClick={() => { setLoginOpen(p => !p); setAdminOpen(false); }}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Login
                </button>
                {loginOpen && (
                  <form
                    onSubmit={handleLogin}
                    className="absolute right-0 top-full mt-2 w-64 bg-blue-950/95 border border-white/20 rounded-xl p-4 shadow-2xl space-y-3"
                  >
                    <p className="text-white text-xs font-semibold uppercase tracking-wide">Admin Login</p>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      autoComplete="username"
                      className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-400 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-400 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                    />
                    {loginError && <p className="text-red-300 text-xs">{loginError}</p>}
                    <button
                      type="submit"
                      disabled={loggingIn}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"
                    >
                      {loggingIn ? 'Signing in…' : 'Sign In'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setAdminOpen(p => !p)}
                  className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {currentUser?.username ?? 'Admin'}
                  <svg className={`w-3 h-3 transition-transform ${adminOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {adminOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-blue-950/95 border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                    <p className="text-blue-400 text-xs px-3 py-2 border-b border-white/10 font-semibold uppercase tracking-wide">
                      {isSuperAdmin ? 'Super Admin' : 'Admin'}
                    </p>
                    {allowedPages.map(page => (
                      <Link
                        key={page}
                        href={page}
                        onClick={() => setAdminOpen(false)}
                        className="block px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors"
                      >
                        {ADMIN_PAGE_LABELS[page] ?? page}
                      </Link>
                    ))}
                    <div className="border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-xs text-red-300 hover:bg-white/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-blue-900/95 backdrop-blur-sm">
          {navLinks.map(({ href, label, bold }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`block px-6 py-3 text-white ${bold ? 'font-bold' : 'font-medium text-white/90'} hover:bg-white/10 transition-colors duration-200 border-b border-white/5`}
            >
              {label}
            </Link>
          ))}

          {/* Mobile admin section */}
          <div className="border-t border-white/20">
            {!authed ? (
              <form onSubmit={handleLogin} className="px-6 py-4 space-y-3">
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide">Admin Login</p>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-400 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-400 rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
                {loginError && <p className="text-red-300 text-xs">{loginError}</p>}
                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg"
                >
                  {loggingIn ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            ) : (
              <>
                <p className="px-6 py-2 text-blue-300 text-xs font-semibold uppercase tracking-wide">
                  {currentUser?.username} · {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </p>
                {allowedPages.map(page => (
                  <Link
                    key={page}
                    href={page}
                    onClick={() => setMobileOpen(false)}
                    className="block px-6 py-2.5 text-sm text-white hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                  >
                    {ADMIN_PAGE_LABELS[page] ?? page}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-6 py-3 text-sm text-red-300 hover:bg-white/10 transition-colors"
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
