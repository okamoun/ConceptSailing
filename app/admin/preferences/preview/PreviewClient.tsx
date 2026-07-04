'use client';

import { useEffect, useState } from 'react';
import {
  getPreferenceConfig,
  visibleSections,
  type PreferenceSection,
  type PreferenceField,
} from '../../../../lib/preferences';

function FieldPreview({ field }: { field: PreferenceField }) {
  const label = (
    <label className="block text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">
      {field.label || 'Untitled field'}{field.required ? ' *' : ''}
    </label>
  );
  const base = 'w-full bg-transparent border-b border-blue-300/60 py-1.5 text-xs text-blue-900 placeholder:text-blue-300/70 focus:outline-none';

  switch (field.type) {
    case 'textarea':
      return <div>{label}<textarea disabled rows={3} placeholder={field.placeholder} className={`${base} resize-none`} /></div>;
    case 'number':
      return <div>{label}<input disabled type="number" placeholder={field.placeholder} className={base} /></div>;
    case 'select':
      return (
        <div>{label}
          <select disabled className={base}>
            <option>Select…</option>
            {(field.options ?? []).map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      );
    case 'checkbox':
      return (
        <div>{label}
          <div className="flex flex-wrap gap-1.5">
            {(field.options ?? []).map(o => (
              <span key={o} className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-white border-blue-200 text-blue-600">{o}</span>
            ))}
          </div>
        </div>
      );
    case 'text':
    default:
      return <div>{label}<input disabled type="text" placeholder={field.placeholder} className={base} /></div>;
  }
}

const BUILT_IN_ICON = '⛵';

export default function PreviewClient() {
  const [sections, setSections] = useState<PreferenceSection[] | null>(null);

  useEffect(() => {
    getPreferenceConfig()
      .then(cfg => setSections(cfg.sections))
      .catch(() => setSections([]));
  }, []);

  if (sections === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 100%)' }}>
        <p className="text-white/60 text-sm animate-pulse">Loading preview…</p>
      </div>
    );
  }

  const visible = visibleSections(sections);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div>
          <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold">Client Form Preview</p>
          <h1 className="text-white text-2xl font-bold mt-1">Holiday Preparation</h1>
          <p className="text-blue-200 text-sm mt-1">
            This is the order and content the client sees. Hidden sections are omitted.
          </p>
        </div>

        {/* Step tabs preview */}
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-blue-700">Your Charter</span>
          {visible.map(s => (
            <span key={s.id} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
              {s.title || 'Additional Details'}
            </span>
          ))}
        </div>

        {visible.length === 0 && (
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 text-center text-blue-200 text-sm">
            No sections are currently visible. Enable at least one section in the configuration.
          </div>
        )}

        {visible.map(section => (
          <div key={section.id} className="bg-white/85 backdrop-blur-sm border border-blue-100 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide">{section.title || 'Additional Details'}</h2>
              {section.builtIn && (
                <span className="text-[10px] uppercase tracking-wide bg-blue-100 text-blue-600 rounded-full px-2 py-0.5">Built-in</span>
              )}
            </div>
            {section.description && <p className="text-xs text-blue-500">{section.description}</p>}
            {section.builtIn ? (
              <p className="text-xs text-blue-400 italic flex items-center gap-2">
                <span>{BUILT_IN_ICON}</span>
                Standard preparation questions are collected in this section.
              </p>
            ) : section.fields.length === 0 ? (
              <p className="text-xs text-blue-400 italic">This section has no questions yet.</p>
            ) : (
              <div className="space-y-3">
                {section.fields.map(f => <FieldPreview key={f.id} field={f} />)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
