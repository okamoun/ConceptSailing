'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserProfile, AdminPermission } from '../../../lib/userManagement';

const ALL_PERMISSIONS: { id: AdminPermission; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard (charters & contacts)' },
  { id: 'availability', label: 'Availability calendar' },
  { id: 'booking-summary', label: 'Booking summary' },
  { id: 'reviews', label: 'Reviews moderation' },
];

async function apiFetch(path: string, method: string, token: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? 'Request failed');
  }
  return res.json();
}

export default function UsersAdminClient() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // New user form state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'client'>('admin');
  const [newPermissions, setNewPermissions] = useState<AdminPermission[]>([]);
  const [newReviewToken, setNewReviewToken] = useState('');

  // Edit form state
  const [editRole, setEditRole] = useState<'admin' | 'client'>('admin');
  const [editPermissions, setEditPermissions] = useState<AdminPermission[]>([]);
  const [editReviewToken, setEditReviewToken] = useState('');

  async function getToken() {
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken();
  }

  async function loadUsers() {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await apiFetch('/api/admin/users', 'GET', token) as { users: UserProfile[] };
      setUsers(data.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function togglePermission(current: AdminPermission[], p: AdminPermission): AdminPermission[] {
    return current.includes(p) ? current.filter(x => x !== p) : [...current, p];
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = await getToken();
      await apiFetch('/api/admin/users', 'POST', token, {
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
        permissions: newRole === 'admin' ? newPermissions : [],
        reviewToken: newRole === 'client' && newReviewToken ? newReviewToken.trim() : undefined,
      });
      setFormOpen(false);
      setNewEmail(''); setNewPassword(''); setNewRole('admin'); setNewPermissions([]); setNewReviewToken('');
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  function openEdit(u: UserProfile) {
    setEditTarget(u);
    setEditRole(u.role);
    setEditPermissions(u.permissions ?? []);
    setEditReviewToken(u.reviewToken ?? '');
    setError('');
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    setError('');
    try {
      const token = await getToken();
      await apiFetch('/api/admin/users', 'PATCH', token, {
        uid: editTarget.uid,
        role: editRole,
        permissions: editRole === 'admin' ? editPermissions : [],
        reviewToken: editRole === 'client' ? editReviewToken.trim() : '',
      });
      setEditTarget(null);
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(uid: string) {
    setSaving(true);
    setError('');
    try {
      const token = await getToken();
      await apiFetch(`/api/admin/users?uid=${uid}`, 'DELETE', token);
      setDeleteConfirm(null);
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete user');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl">Users</h1>
            <p className="text-blue-200 text-xs mt-0.5">Manage accounts and access</p>
          </div>
          <button
            onClick={() => { setFormOpen(true); setError(''); }}
            className="px-4 py-2 text-sm font-semibold bg-blue-500/60 hover:bg-blue-500/80 text-white rounded-lg transition-colors"
          >
            + New user
          </button>
        </div>

        {error && <p className="text-red-300 text-sm">{error}</p>}

        {/* Create form */}
        {formOpen && (
          <form onSubmit={handleCreate} className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl p-6 space-y-4">
            <h2 className="text-white font-semibold text-base">New user</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email">
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className={inputCls} />
              </Field>
              <Field label="Temporary password">
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} className={inputCls} />
              </Field>
            </div>
            <Field label="Role">
              <RoleSelect value={newRole} onChange={v => { setNewRole(v); setNewPermissions([]); }} />
            </Field>
            {newRole === 'admin' && (
              <PermissionsField
                selected={newPermissions}
                onChange={p => setNewPermissions(prev => togglePermission(prev, p))}
              />
            )}
            {newRole === 'client' && (
              <Field label="Review token (from Firestore reviews collection)">
                <input type="text" value={newReviewToken} onChange={e => setNewReviewToken(e.target.value)} className={inputCls} placeholder="optional" />
              </Field>
            )}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold bg-blue-500/60 hover:bg-blue-500/80 text-white rounded-lg transition-colors disabled:opacity-50">
                {saving ? 'Creating…' : 'Create'}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm text-blue-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Edit form */}
        {editTarget && (
          <form onSubmit={handleUpdate} className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl p-6 space-y-4">
            <h2 className="text-white font-semibold text-base">Edit — {editTarget.email}</h2>
            <Field label="Role">
              <RoleSelect value={editRole} onChange={v => { setEditRole(v); setEditPermissions([]); }} />
            </Field>
            {editRole === 'admin' && (
              <PermissionsField
                selected={editPermissions}
                onChange={p => setEditPermissions(prev => togglePermission(prev, p))}
              />
            )}
            {editRole === 'client' && (
              <Field label="Review token">
                <input type="text" value={editReviewToken} onChange={e => setEditReviewToken(e.target.value)} className={inputCls} placeholder="optional" />
              </Field>
            )}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold bg-blue-500/60 hover:bg-blue-500/80 text-white rounded-lg transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditTarget(null)} className="px-4 py-2 text-sm text-blue-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Users table */}
        {loading ? (
          <p className="text-blue-200 text-sm text-center animate-pulse">Loading…</p>
        ) : (
          <div className="space-y-2">
            {users.length === 0 && (
              <p className="text-blue-200 text-sm text-center py-8">No users yet.</p>
            )}
            {users.map(u => (
              <div key={u.uid} className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-blue-500/30 text-blue-200' : 'bg-purple-500/30 text-purple-200'}`}>
                      {u.role}
                    </span>
                    {u.role === 'admin' && u.permissions.map(p => (
                      <span key={p} className="text-xs bg-white/15 text-blue-100 px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                    {u.role === 'client' && u.reviewToken && (
                      <span className="text-xs text-blue-300">token: {u.reviewToken.slice(0, 8)}…</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(u)} className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                    Edit
                  </button>
                  {deleteConfirm === u.uid ? (
                    <>
                      <button onClick={() => handleDelete(u.uid)} disabled={saving} className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50">
                        {saving ? '…' : 'Confirm'}
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 text-xs text-blue-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteConfirm(u.uid)} className="px-3 py-1.5 text-xs font-medium bg-red-600/40 hover:bg-red-600/70 text-white rounded-lg transition-colors">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const inputCls = 'w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-blue-100 text-xs font-medium block mb-1">{label}</label>
      {children}
    </div>
  );
}

function RoleSelect({ value, onChange }: { value: 'admin' | 'client'; onChange: (v: 'admin' | 'client') => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as 'admin' | 'client')}
      className="bg-slate-800 border border-white/25 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
    >
      <option value="admin">Admin</option>
      <option value="client">Client</option>
    </select>
  );
}

function PermissionsField({ selected, onChange }: { selected: AdminPermission[]; onChange: (p: AdminPermission) => void }) {
  return (
    <div>
      <p className="text-blue-100 text-xs font-medium mb-2">Permissions</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ALL_PERMISSIONS.map(({ id, label }) => (
          <label key={id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(id)}
              onChange={() => onChange(id)}
              className="rounded accent-blue-500"
            />
            <span className="text-blue-100 text-xs">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
