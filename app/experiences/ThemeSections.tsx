'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import adventures from '../adventures-data';
import type { Adventure } from '../adventures-data';
import { featureIconMap } from '../feature-icons';
import { getAllThemeMetadata, THEME_CATEGORIES } from '../../lib/themes';

type CategoryGroup = { category: string; themes: Adventure[] };

const HARDCODED_CATEGORIES: CategoryGroup[] = [
  {
    category: 'Active & Sports',
    themes: ['1', '2', '12'].map(id => adventures.find(a => a.id === id)!).filter(Boolean),
  },
  {
    category: 'Wellness & Relaxation',
    themes: ['3', '4'].map(id => adventures.find(a => a.id === id)!).filter(Boolean),
  },
  {
    category: 'Culture & History',
    themes: ['5', '9', '19', '20'].map(id => adventures.find(a => a.id === id)!).filter(Boolean),
  },
  {
    category: 'Food',
    themes: ['6', '10', '11'].map(id => adventures.find(a => a.id === id)!).filter(Boolean),
  },
  {
    category: 'Social & Family',
    themes: ['7', '8'].map(id => adventures.find(a => a.id === id)!).filter(Boolean),
  },
  {
    category: 'Celebrations & Milestones',
    themes: ['15', '16', '14'].map(id => adventures.find(a => a.id === id)!).filter(Boolean),
  },
  {
    category: 'Nature & Sea',
    themes: ['13', '17'].map(id => adventures.find(a => a.id === id)!).filter(Boolean),
  },
  {
    category: 'Lifestyle & Connoisseur',
    themes: ['18'].map(id => adventures.find(a => a.id === id)!).filter(Boolean),
  },
];

export default function ThemeSections() {
  const [categories, setCategories] = useState<CategoryGroup[]>(HARDCODED_CATEGORIES);
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getAllThemeMetadata()
      .then(meta => {
        if (!meta.length) return;

        const newFeaturedIds = new Set(meta.filter(m => m.featured).map(m => m.id));

        try {
          const adventureMap = new Map(adventures.map(a => [a.id, a]));
          const grouped = new Map<string, Adventure[]>();

          [...meta]
            .filter(m => m.visible)
            .sort((a, b) => {
              const catDiff = (a.category ?? '').localeCompare(b.category ?? '');
              return catDiff !== 0 ? catDiff : (a.order ?? 0) - (b.order ?? 0);
            })
            .forEach(m => {
              if (!m.category) return;
              const adv = adventureMap.get(m.id);
              if (!adv) return;
              if (!grouped.has(m.category)) grouped.set(m.category, []);
              grouped.get(m.category)!.push(adv);
            });

          const dynamic = THEME_CATEGORIES
            .filter(cat => (grouped.get(cat)?.length ?? 0) > 0)
            .map(cat => ({ category: cat, themes: grouped.get(cat)! }));

          setFeaturedIds(newFeaturedIds);
          if (dynamic.length > 0) setCategories(dynamic);
        } catch {
          // keep hardcoded categories already in state
        }
      })
      .catch((e) => {
        console.error('[ThemeSections] Firebase read failed, showing hardcoded fallback:', e);
      });
  }, []);

  const slug = (c: string) => 'cat-' + c.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div id="themes" className="scroll-mt-20">
      {/* Category quick-nav */}
      <nav aria-label="Experience categories" className="sticky top-16 lg:top-[72px] z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
          {categories.map(g => (
            <a
              key={g.category}
              href={`#${slug(g.category)}`}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-colors"
            >
              {g.category}
            </a>
          ))}
        </div>
      </nav>

      {categories.map((group, index) => (
        <section
          key={group.category}
          id={slug(group.category)}
          className={`scroll-mt-32 py-16 md:py-20 ${index % 2 === 0 ? 'bg-white' : 'bg-[#f6f3ee]'}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between gap-4 mb-10">
              <h2 className="text-[#0a1f3c]">{group.category}</h2>
              <span className="text-sm text-slate-500 shrink-0">
                {group.themes.length} {group.themes.length === 1 ? 'experience' : 'experiences'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.themes.map((adv) => {
                const features = adv.features ?? [];
                const shown = features.slice(0, 4);
                const extra = features.length - shown.length;
                return (
                  <article key={adv.id} className="card-modern group flex flex-col">
                    <Link href={`/themes/${adv.id}`} tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/3] overflow-hidden">
                      <Image
                        src={adv.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {featuredIds.has(adv.id) && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/95 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                          ★ Featured
                        </span>
                      )}
                    </Link>
                    <div className="flex flex-col flex-1 p-6">
                      <h3 className="text-xl font-semibold text-[#0a1f3c] mb-2">{adv.name}</h3>
                      <p className="text-slate-600 leading-relaxed mb-5 line-clamp-4">{adv.description}</p>
                      {shown.length > 0 && (
                        <ul className="mb-6 flex flex-wrap gap-1.5" aria-label="Highlights">
                          {shown.map((feature: string, idx: number) => (
                            <li key={idx} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 rounded-full px-2.5 py-1 text-xs font-medium">
                              <span aria-hidden="true">{featureIconMap[feature]}</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                          {extra > 0 && (
                            <li className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-slate-500">
                              +{extra} more
                            </li>
                          )}
                        </ul>
                      )}
                      <Link href={`/themes/${adv.id}`} className="mt-auto inline-flex items-center gap-1.5 font-semibold text-blue-700 hover:text-blue-900">
                        View Experience
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
