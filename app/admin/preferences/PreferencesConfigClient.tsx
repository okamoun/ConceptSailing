'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getPreferenceConfig,
  updatePreferenceConfig,
  createSectionId,
  createFieldId,
  type PreferenceSection,
  type PreferenceField,
  type FieldType,
} from '../../../lib/preferences';

const FIELD_TYPES: { id: FieldType; label: string }[] = [
  { id: 'text',     label: 'Short text' },
  { id: 'textarea', label: 'Long text' },
  { id: 'select',   label: 'Dropdown' },
  { id: 'checkbox', label: 'Checkboxes' },
  { id: 'number',   label: 'Number' },
];

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Field editor (for custom sections only)
// ---------------------------------------------------------------------------

function FieldEditor({ field, onChange, onDelete }: {
  field: PreferenceField;
  onChange: (f: PreferenceField) => void;
  onDelete: () => void;
}) {
  const needsOptions = field.type === 'select' || field.type === 'checkbox';
  return (
    <div className="bg-white/5 border border-white/15 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={field.label}
          onChange={e => onChange({ ...field, label: e.target.value })}
          placeholder="Field label (e.g. Favourite island)"
          className="flex-1 bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
        />
        <select
          value={field.type}
          onChange={e => onChange({ ...field, type: e.target.value as FieldType })}
          className="bg-white/10 border border-white/25 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
        >
          {FIELD_TYPES.map(t => <option key={t.id} value={t.id} className="text-slate-900">{t.label}</option>)}
        </select>
        <button
          type="button"
          onClick={onDelete}
          className="w-8 h-8 flex-shrink-0 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/40 flex items-center justify-center text-sm transition-colors"
          title="Remove field"
        >
          ✕
        </button>
      </div>
      {needsOptions && (
        <input
          type="text"
          value={(field.options ?? []).join(', ')}
          onChange={e => onChange({ ...field, options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
          placeholder="Options, comma-separated (e.g. Snorkelling, Diving, Kayaking)"
          className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
        />
      )}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-blue-200 text-xs">
          <input
            type="checkbox"
            checked={field.required ?? false}
            onChange={e => onChange({ ...field, required: e.target.checked })}
            className="w-3.5 h-3.5 accent-blue-400"
          />
          Required
        </label>
        {field.type !== 'select' && field.type !== 'checkbox' && (
          <input
            type="text"
            value={field.placeholder ?? ''}
            onChange={e => onChange({ ...field, placeholder: e.target.value })}
            placeholder="Placeholder (optional)"
            className="flex-1 bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-1 text-xs focus:outline-none focus:border-blue-400"
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section card
// ---------------------------------------------------------------------------

function SectionCard({ section, index, total, onChange, onDelete, onMove }: {
  section: PreferenceSection;
  index: number;
  total: number;
  onChange: (s: PreferenceSection) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  function updateField(fieldId: string, f: PreferenceField) {
    onChange({ ...section, fields: section.fields.map(x => x.id === fieldId ? f : x) });
  }
  function addField() {
    onChange({
      ...section,
      fields: [...section.fields, { id: createFieldId(), label: '', type: 'text', required: false }],
    });
  }
  function deleteField(fieldId: string) {
    onChange({ ...section, fields: section.fields.filter(x => x.id !== fieldId) });
  }

  return (
    <div className={`rounded-2xl border p-5 space-y-3 transition-colors ${
      section.visible ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'
    }`}>
      <div className="flex items-start gap-3">
        {/* Reorder */}
        <div className="flex flex-col gap-0.5 pt-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="w-6 h-5 rounded bg-white/10 text-blue-200 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center text-xs"
            title="Move up"
          >▲</button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="w-6 h-5 rounded bg-white/10 text-blue-200 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center text-xs"
            title="Move down"
          >▼</button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {section.builtIn ? (
              <span className="text-white font-semibold text-base">{section.title}</span>
            ) : (
              <input
                type="text"
                value={section.title}
                onChange={e => onChange({ ...section, title: e.target.value })}
                placeholder="Section title"
                className="flex-1 min-w-0 bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-blue-400"
              />
            )}
            {section.builtIn ? (
              <span className="text-[10px] uppercase tracking-wide bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded-full px-2 py-0.5">Built-in</span>
            ) : (
              <span className="text-[10px] uppercase tracking-wide bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 rounded-full px-2 py-0.5">Custom</span>
            )}
          </div>
          {section.builtIn && section.description && (
            <p className="text-blue-300 text-xs mt-1">{section.description}</p>
          )}
          {!section.builtIn && (
            <input
              type="text"
              value={section.description ?? ''}
              onChange={e => onChange({ ...section, description: e.target.value })}
              placeholder="Short description shown to the client (optional)"
              className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-1.5 text-xs mt-2 focus:outline-none focus:border-blue-400"
            />
          )}
        </div>

        {/* Visibility toggle */}
        <button
          type="button"
          onClick={() => onChange({ ...section, visible: !section.visible })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
            section.visible
              ? 'bg-blue-500/20 text-blue-100 border border-blue-400/40 hover:bg-blue-500/30'
              : 'bg-white/5 text-blue-300 border border-white/15 hover:bg-white/10'
          }`}
          title={section.visible ? 'Section is shown to clients' : 'Section is hidden from clients'}
        >
          <EyeIcon open={section.visible} />
          {section.visible ? 'Visible' : 'Hidden'}
        </button>

        {!section.builtIn && (
          <button
            type="button"
            onClick={onDelete}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/40 transition-colors flex-shrink-0"
            title="Delete section"
          >
            Delete
          </button>
        )}
      </div>

      {/* Custom-section fields */}
      {!section.builtIn && (
        <div className="pl-9 space-y-2">
          {section.fields.map(f => (
            <FieldEditor
              key={f.id}
              field={f}
              onChange={nf => updateField(f.id, nf)}
              onDelete={() => deleteField(f.id)}
            />
          ))}
          <button
            type="button"
            onClick={addField}
            className="text-xs font-medium text-blue-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 transition-colors"
          >
            + Add field
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function PreferencesConfigClient() {
  const [sections, setSections] = useState<PreferenceSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const cfg = await getPreferenceConfig();
      setSections(cfg.sections);
    } catch {
      setError('Failed to load preference configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function updateSection(id: string, s: PreferenceSection) {
    setSections(prev => prev.map(x => x.id === id ? s : x));
  }

  function deleteSection(id: string) {
    const target = sections.find(s => s.id === id);
    if (target && !confirm(`Delete section "${target.title || 'Untitled'}"? Client responses for it will no longer be collected.`)) return;
    setSections(prev => prev.filter(x => x.id !== id));
  }

  function moveSection(index: number, dir: -1 | 1) {
    setSections(prev => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  }

  function addSection() {
    setSections(prev => [
      ...prev,
      {
        id: createSectionId(),
        title: '',
        description: '',
        builtIn: false,
        visible: true,
        order: prev.length,
        fields: [{ id: createFieldId(), label: '', type: 'text', required: false }],
      },
    ]);
  }

  async function handleSave() {
    // Validate custom sections
    for (const s of sections) {
      if (s.builtIn) continue;
      if (!s.title.trim()) { setError('Every custom section needs a title.'); return; }
      for (const f of s.fields) {
        if (!f.label.trim()) { setError(`Section "${s.title}" has a field with no label.`); return; }
        if ((f.type === 'select' || f.type === 'checkbox') && !(f.options ?? []).length) {
          setError(`Field "${f.label}" needs at least one option.`); return;
        }
      }
    }
    setSaving(true);
    setError('');
    try {
      await updatePreferenceConfig(sections);
      setSuccess('Preferences configuration saved.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-200 text-sm animate-pulse">Loading configuration…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Client Preferences</h1>
            <p className="text-blue-300 text-sm mt-1">
              Choose which sections appear in the client preparation space and add your own custom sections.
            </p>
          </div>
          <a
            href="/admin/preferences/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-sm font-medium text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-2 transition-colors"
          >
            Preview form ↗
          </a>
        </div>

        {error && <p className="text-red-300 text-sm my-4 bg-red-900/30 rounded-lg px-4 py-2">{error}</p>}
        {success && <p className="text-green-300 text-sm my-4 bg-green-900/30 rounded-lg px-4 py-2">{success}</p>}

        <div className="space-y-4 mt-6">
          {sections.map((s, i) => (
            <SectionCard
              key={s.id}
              section={s}
              index={i}
              total={sections.length}
              onChange={ns => updateSection(s.id, ns)}
              onDelete={() => deleteSection(s.id)}
              onMove={dir => moveSection(i, dir)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 mt-6">
          <button
            type="button"
            onClick={addSection}
            className="text-sm font-medium text-blue-100 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-2 transition-colors"
          >
            + Add section
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
