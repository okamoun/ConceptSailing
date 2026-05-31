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
  const [scrolled, setScrolled] = useState(false);
  const adminRef = useRef<HTMLDivElement>(null);

  const { authed, allowedPages, isSuperAdmin, currentUser, login, logout } = useAdminAuth();
  const router = useRouter();

  const navLinks = [
    { href: '/blueone',      label: 'The Yacht' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/experiences',  label: 'Experiences' },
    { href: '/about',        label: 'About' },
    { href: '/availability', label: 'Availability' },
    { href: '/reviews',      label: 'Reviews' },
    { href: '/contact',      label: 'Contact' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled || mobileOpen
          ? 'border-b border-white/5'
          : 'border-b border-transparent'
      }`}
      style={{
        background: scrolled || mobileOpen
          ? 'rgba(5, 15, 29, 0.97)'
          : 'transparent',
        backdropFilter: scrolled || mobileOpen ? 'blur(20px)' : 'none',
      }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="flex flex-col items-center gap-1.5 group"
          onClick={() => setMobileOpen(false)}
        >
          <Image
            src="/images/boats/blueone/logo_blueone.png"
            alt="BlueOne Logo"
            width={110}
            height={55}
            className="h-14 w-auto transition-opacity duration-300 group-hover:opacity-80 object-contain drop-shadow-lg"
            priority
          />
          <span
            className="text-xs tracking-[0.2em] uppercase font-medium"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            BlueOne Luxury Yacht
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.78)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.78)')}
            >
              {label}
            </Link>
          ))}

          {/* Book CTA */}
          <Link
            href="/booking"
            className="text-xs font-bold tracking-[0.08em] uppercase px-4 py-2 rounded transition-all duration-200"
            style={{
              background: 'var(--gold)',
              color: 'var(--ocean-deep)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--gold-light)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--gold)';
            }}
          >
            Book Now
          </Link>

          {/* Admin section */}
          <div className="relative" ref={adminRef}>
            {!authed ? (
              <div className="relative">
                <button
                  onClick={() => { setLoginOpen(p => !p); setAdminOpen(false); }}
                  className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Login
                </button>
                {loginOpen && (
                  <form
                    onSubmit={handleLogin}
                    className="absolute right-0 top-full mt-2 w-60 rounded-xl p-4 shadow-2xl space-y-3"
                    style={{ background: 'rgba(9, 24, 40, 0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <p className="text-white text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>Admin Login</p>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      autoComplete="username"
                      className="w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                    />
                    {loginError && <p className="text-red-300 text-xs">{loginError}</p>}
                    <button
                      type="submit"
                      disabled={loggingIn}
                      className="w-full disabled:opacity-50 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                      style={{ background: 'var(--gold)', color: 'var(--ocean-deep)' }}
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
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{ color: 'var(--gold)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {currentUser?.username ?? 'Admin'}
                  <svg className={`w-3 h-3 transition-transform ${adminOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {adminOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl overflow-hidden"
                    style={{ background: 'rgba(9, 24, 40, 0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <p className="text-xs px-3 py-2 border-b font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)', borderColor: 'rgba(255,255,255,0.08)' }}>
                      {isSuperAdmin ? 'Super Admin' : 'Admin'}
                    </p>
                    {allowedPages.map(page => (
                      <Link
                        key={page}
                        href={page}
                        onClick={() => setAdminOpen(false)}
                        className="block px-3 py-2 text-xs text-white hover:bg-white/5 transition-colors"
                      >
                        {ADMIN_PAGE_LABELS[page] ?? page}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-xs text-red-300 hover:bg-white/5 transition-colors"
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
          className="md:hidden p-1 text-white/70"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block px-6 py-3.5 text-sm font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.78)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              {label}
            </Link>
          ))}

          {/* Mobile Book CTA */}
          <div className="px-6 py-4">
            <Link
              href="/booking"
              onClick={() => setMobileOpen(false)}
              className="block text-center text-xs font-bold tracking-[0.08em] uppercase px-4 py-3 rounded transition-all"
              style={{ background: 'var(--gold)', color: 'var(--ocean-deep)' }}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile admin section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {!authed ? (
              <form onSubmit={handleLogin} className="px-6 py-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>Admin Login</p>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                />
                {loginError && <p className="text-red-300 text-xs">{loginError}</p>}
                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full text-xs font-semibold py-2 rounded-lg disabled:opacity-50"
                  style={{ background: 'var(--gold)', color: 'var(--ocean-deep)' }}
                >
                  {loggingIn ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            ) : (
              <>
                <p className="px-6 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--gold)' }}>
                  {currentUser?.username} · {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </p>
                {allowedPages.map(page => (
                  <Link
                    key={page}
                    href={page}
                    onClick={() => setMobileOpen(false)}
                    className="block px-6 py-2.5 text-sm text-white hover:bg-white/5 transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    {ADMIN_PAGE_LABELS[page] ?? page}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-6 py-3 text-sm text-red-300 hover:bg-white/5 transition-colors"
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
