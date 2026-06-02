'use client';

import { useState, type ReactNode } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import AdminNav from './AdminNav';

const bg = 'min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900';

function AdminShell({ children }: { children: ReactNode }) {
  const { authed, login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = await login(username, password);
    if (!user) setError('Incorrect username or password.');
    else setError('');
  }

  if (!authed) {
    return (
      <div className={`flex items-center justify-center px-4 ${bg}`}>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl p-8 space-y-4"
        >
          <h1 className="text-white font-bold text-xl text-center">Admin</h1>
          <div>
            <label className="text-blue-100 text-xs font-medium block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              autoFocus
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-blue-100 text-xs font-medium block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-red-300 text-xs">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3 text-sm">
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={bg}>
      <AdminNav />
      {/* pt-12 clears the fixed nav (h-12 = 48px) */}
      <div className="pt-12">
        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
