'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../../../lib/firebase';
import {
  getCharterById,
  updateCharter,
  deleteCharter,
  addBookingNote,
  addBookingDocument,
  deleteBookingDocument,
  proposalRef,
  CHARTER_STATUS_LABEL,
  type Charter,
  type CharterStatus,
  type BookingDocument,
} from '../../../../lib/availability';
import { getMarinaById } from '../../../marinas-data';
import { useAdminAuth } from '../../AdminAuthContext';

interface Props {
  id: string;
}

function DRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-blue-400 w-28 flex-shrink-0">{label}</span>
      <span className="text-white font-medium break-words">{value}</span>
    </div>
  );
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function fmtBytes(n?: number): string {
  if (n == null) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BookingDetailClient({ id }: Props) {
  const router = useRouter();
  const { currentUser } = useAdminAuth();
  const author = currentUser?.username ?? 'admin';

  const [charter, setCharter] = useState<Charter | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCharterById(id)
      .then(c => {
        if (c) setCharter(c);
        else setNotFound(true);
      })
      .catch(err => {
        console.error(err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = useCallback(async (status: CharterStatus) => {
    setSavingStatus(true);
    try {
      await updateCharter(id, { status });
      setCharter(prev => (prev ? { ...prev, status } : prev));
    } finally {
      setSavingStatus(false);
    }
  }, [id]);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError('');
    try {
      const path = `bookingDocuments/${id}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const newDoc = await addBookingDocument(id, {
        name: file.name,
        url,
        path,
        size: file.size,
        contentType: file.type,
        uploadedBy: author,
      });
      setCharter(prev =>
        prev ? { ...prev, documents: [...(prev.documents ?? []), newDoc] } : prev
      );
    } catch (err) {
      console.error(err);
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDeleteDocument(document: BookingDocument) {
    if (!confirm(`Delete "${document.name}"?`)) return;
    try {
      await deleteObject(ref(storage, document.path)).catch(() => {
        // File may already be gone; still remove the metadata below.
      });
      await deleteBookingDocument(id, document);
      setCharter(prev =>
        prev
          ? { ...prev, documents: (prev.documents ?? []).filter(d => d.id !== document.id) }
          : prev
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddNote() {
    const text = noteText.trim();
    if (!text) return;
    setAddingNote(true);
    try {
      const newNote = await addBookingNote(id, { author, text });
      setCharter(prev =>
        prev ? { ...prev, activityNotes: [...(prev.activityNotes ?? []), newNote] } : prev
      );
      setNoteText('');
    } finally {
      setAddingNote(false);
    }
  }

  async function handleDeleteCharter() {
    if (!confirm('Delete this booking? This cannot be undone.')) return;
    await deleteCharter(id);
    router.push('/admin');
  }

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <p className="text-blue-200 text-sm animate-pulse">Loading booking…</p>
      </div>
    );
  }

  if (notFound || !charter) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <button onClick={() => router.push('/admin')} className="text-blue-400 hover:text-white text-sm transition-colors">
          ← Dashboard
        </button>
        <p className="text-red-300 text-sm">Booking not found.</p>
      </div>
    );
  }

  const documents = [...(charter.documents ?? [])].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  const notes = [...(charter.activityNotes ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const delivery = getMarinaById(charter.deliveryPoint ?? '');
  const redelivery = getMarinaById(charter.redeliveryPoint ?? '');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => router.push('/admin')} className="text-blue-400 hover:text-white text-sm transition-colors">
              ← Dashboard
            </button>
            <span className="text-blue-500 text-sm font-mono">{proposalRef(charter.id)}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-blue-200">
              {CHARTER_STATUS_LABEL[charter.status]}
            </span>
          </div>
          <h1 className="text-white font-bold text-2xl mt-2">{charter.name || 'Unknown client'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-blue-400 text-xs">Status</label>
          <select
            value={charter.status}
            disabled={savingStatus}
            onChange={e => handleStatusChange(e.target.value as CharterStatus)}
            className="bg-slate-800 border border-white/25 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 disabled:opacity-50"
          >
            {(Object.keys(CHARTER_STATUS_LABEL) as CharterStatus[]).map(s => (
              <option key={s} value={s} className="bg-blue-900">{CHARTER_STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview */}
      <section className="bg-white/10 border border-white/20 rounded-xl p-5">
        <h2 className="text-white font-semibold text-base mb-3">Overview</h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5">
          {charter.email && <DRow label="Email" value={charter.email} />}
          {charter.phone && <DRow label="Phone" value={charter.phone} />}
          <DRow label="Dates" value={`${charter.startDate} → ${charter.endDate}`} />
          {charter.passengers != null && <DRow label="Passengers" value={String(charter.passengers)} />}
          {charter.boat && <DRow label="Boat" value={charter.boat} />}
          {charter.embarkationPoint && <DRow label="Embarkation" value={charter.embarkationPoint} />}
          {delivery && <DRow label="Delivery" value={delivery.name} />}
          {redelivery && <DRow label="Redelivery" value={redelivery.name} />}
          {charter.selectedTheme && <DRow label="Theme" value={charter.selectedTheme} />}
        </div>
        {charter.holidayDescription && (
          <p className="text-blue-100 text-sm italic leading-relaxed border-l-2 border-blue-500/40 pl-3 mt-4">
            &ldquo;{charter.holidayDescription}&rdquo;
          </p>
        )}
        {charter.note && (
          <p className="text-blue-300 text-sm italic mt-3">Note: {charter.note}</p>
        )}
      </section>

      {/* Proposal & Payment */}
      <section className="bg-white/10 border border-white/20 rounded-xl p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-white font-semibold text-base">Proposal &amp; Payment</h2>
            <p className="text-blue-300 text-sm mt-0.5">
              {charter.proposal ? `Proposal status: ${charter.proposal.status}` : 'No proposal created yet.'}
            </p>
          </div>
          <a
            href={`/admin/proposals/${charter.id}`}
            className="px-3 py-1.5 bg-blue-600/60 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
          >
            {charter.proposal ? 'View / Edit Proposal' : 'Create Proposal'}
          </a>
        </div>
      </section>

      {/* Documents */}
      <section className="bg-white/10 border border-white/20 rounded-xl p-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-white font-semibold text-base">Documents</h2>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              disabled={uploading}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
              className="text-xs text-blue-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-600/60 file:text-white hover:file:bg-blue-600 disabled:opacity-50"
            />
            {uploading && <span className="text-blue-300 text-xs animate-pulse">Uploading…</span>}
          </div>
        </div>
        {uploadError && <p className="text-red-300 text-xs mb-2">{uploadError}</p>}
        {documents.length === 0 ? (
          <p className="text-blue-400 text-sm">No documents attached yet.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {documents.map(d => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-200 hover:text-white text-sm font-medium truncate block transition-colors"
                  >
                    {d.name}
                  </a>
                  <p className="text-blue-500 text-xs">
                    {fmtDateTime(d.uploadedAt)} · {d.uploadedBy}{d.size ? ` · ${fmtBytes(d.size)}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteDocument(d)}
                  title="Delete document"
                  className="text-blue-400 hover:text-red-300 transition-colors flex-shrink-0 text-lg leading-none"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Notes */}
      <section className="bg-white/10 border border-white/20 rounded-xl p-5">
        <h2 className="text-white font-semibold text-base mb-3">Notes</h2>
        <div className="flex flex-col gap-2 mb-4">
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Add a note about this booking…"
            rows={3}
            className="w-full bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-2 placeholder:text-blue-400/70 focus:outline-none focus:border-blue-400"
          />
          <div className="flex justify-end">
            <button
              onClick={handleAddNote}
              disabled={addingNote || !noteText.trim()}
              className="px-4 py-1.5 bg-blue-500/60 hover:bg-blue-500/80 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {addingNote ? 'Adding…' : 'Add note'}
            </button>
          </div>
        </div>
        {notes.length === 0 ? (
          <p className="text-blue-400 text-sm">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map(n => (
              <li key={n.id} className="border-l-2 border-blue-500/40 pl-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-white text-sm font-medium">{n.author}</span>
                  <span className="text-blue-500 text-xs">{fmtDateTime(n.createdAt)}</span>
                </div>
                <p className="text-blue-100 text-sm leading-relaxed whitespace-pre-wrap">{n.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Danger zone */}
      <div className="flex justify-end">
        <button
          onClick={handleDeleteCharter}
          className="px-3 py-1.5 text-xs font-medium bg-red-600/50 hover:bg-red-500 text-white rounded-lg transition-colors"
        >
          Delete Booking
        </button>
      </div>
    </div>
  );
}
