'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getAllAdminUsers,
  saveAdminUser,
  deleteAdminUser,
  ALL_ADMIN_PAGES,
  type AdminUser,
  type AdminPage,
} from '../../../lib/adminUsers';

const PAGE_LABELS: Record<AdminPage, string> = {
  '/admin': 'Dashboard',
  '/admin/booking-summary': 'Booking Summary',
  '/admin/availability': 'Calendar',
  '/admin/proposals': 'Proposals',
  '/admin/reviews': 'Reviews',
  '/admin/photos': 'Photos',
  '/admin/users': 'Users',
  '/admin/financial': 'Financial',
  '/admin/themes': 'Themes',
  '/admin/experiences': 'Experiences',
  '/admin/reconcile': 'Reconcile',
};

const EMPTY_FORM: Omit<AdminUser, 'updatedAt'> = {
  username: '',
  password: '',
  pages: ['/admin'],
  isSuperAdmin: false,
};

export default function UsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState<Omit<AdminUser, 'updatedAt'> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllAdminUsers();
      setUsers(data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function startNew() {
    setEditing({ ...EMPTY_FORM });
    setIsNew(true);
    setError('');
    setSuccess('');
  }

  function startEdit(user: AdminUser) {
    setEditing({ username: user.username, password: user.password, pages: user.pages, isSuperAdmin: user.isSuperAdmin ?? false });
    setIsNew(false);
    setError('');
    setSuccess('');
  }

  function cancelEdit() {
    setEditing(null);
    setIsNew(false);
  }

  function togglePage(page: AdminPage) {
    if (!editing) return;
    const has = editing.pages.includes(page);
    setEditing({ ...editing, pages: has ? editing.pages.filter(p => p !== page) : [...editing.pages, page] });
  }

  async function handleSave() {
    if (!editing) return;
    if (!editing.username.trim()) { setError('Username is required.'); return; }
    if (!editing.password.trim()) { setError('Password is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await saveAdminUser(editing);
      setSuccess(`User "${editing.username}" saved.`);
      setEditing(null);
      setIsNew(false);
      await load();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save user.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(username: string) {
    if (!confirm(`Delete user "${username}"?`)) return;
    try {
      await deleteAdminUser(username);
      await load();
    } catch {
      setError('Failed to delete user.');
    }
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Users</h1>
          <button
            onClick={startNew}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + New User
          </button>
        </div>

        {error && <p className="text-red-300 text-sm mb-4 bg-red-900/30 rounded-lg px-4 py-2">{error}</p>}
        {success && <p className="text-green-300 text-sm mb-4 bg-green-900/30 rounded-lg px-4 py-2">{success}</p>}

        {/* Edit / Create form */}
        {editing && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8 space-y-5">
            <h2 className="text-white font-semibold text-lg">{isNew ? 'Create User' : `Edit: ${editing.username}`}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-blue-200 text-xs font-medium block mb-1">Username</label>
                <input
                  type="text"
                  value={editing.username}
                  onChange={e => setEditing({ ...editing, username: e.target.value })}
                  disabled={!isNew}
                  className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-blue-200 text-xs font-medium block mb-1">Password</label>
                <input
                  type="text"
                  value={editing.password}
                  onChange={e => setEditing({ ...editing, password: e.target.value })}
                  className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="text-blue-200 text-xs font-medium block mb-2">Page Access</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_ADMIN_PAGES.map(page => (
                  <label key={page} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={editing.isSuperAdmin || editing.pages.includes(page)}
                      disabled={editing.isSuperAdmin ?? false}
                      onChange={() => togglePage(page)}
                      className="w-4 h-4 accent-blue-400"
                    />
                    <span className="text-white text-sm">{PAGE_LABELS[page]}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.isSuperAdmin ?? false}
                onChange={e => setEditing({ ...editing, isSuperAdmin: e.target.checked })}
                className="w-4 h-4 accent-yellow-400"
              />
              <span className="text-yellow-200 text-sm font-medium">Super Admin (all pages)</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                {saving ? 'Saving…' : 'Save User'}
              </button>
              <button
                onClick={cancelEdit}
                className="text-blue-300 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Users list */}
        {loading ? (
          <p className="text-blue-200 text-sm">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="text-blue-200 text-sm">No users yet. Create one above.</p>
        ) : (
          <div className="space-y-3">
            {users.map(user => (
              <div
                key={user.username}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">{user.username}</span>
                    {user.isSuperAdmin && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full px-2 py-0.5">Super Admin</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(user.isSuperAdmin ? ALL_ADMIN_PAGES : user.pages ?? []).map(p => (
                      <span key={p} className="text-xs bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded-full px-2 py-0.5">
                        {PAGE_LABELS[p]}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(user)}
                    className="text-xs text-blue-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.username)}
                    className="text-xs text-red-400 hover:text-red-200 px-3 py-1.5 rounded-lg hover:bg-red-900/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
