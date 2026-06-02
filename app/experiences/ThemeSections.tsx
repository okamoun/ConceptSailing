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
    themes: ['5', '9'].map(id => adventures.find(a => a.id === id)!).filter(Boolean),
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
      .catch(() => {
        // Firebase unavailable — keep hardcoded categories already in state
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {categories.map((group, index) => (
        <section key={group.category} className={`py-16 ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/5'}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-16 text-center animate-fade-in-up">
              {group.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {group.themes.map((adv) => (
                <div
                  key={adv.id}
                  className="card-modern p-8 text-center animate-fade-in-up hover:bg-white/15 transition-all duration-300"
                  style={{ animationDelay: `${Math.min(0.1 + Number(adv.id) * 0.07, 0.35)}s` }}
                >
                  <div className="relative h-56 w-full mb-6">
                    <Image
                      src={adv.image}
                      alt={adv.name}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                  {featuredIds.has(adv.id) && (
                    <div className="inline-flex items-center gap-1 bg-yellow-400/20 border border-yellow-400/40 text-yellow-200 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                      ★ Featured
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {adv.name}
                  </h3>
                  <p className="mb-6 text-gray-600 text-lg leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.28s' }}>
                    {adv.description}
                  </p>
                  {adv.features && adv.features.length > 0 && (
                    <ul className="mb-6 flex flex-wrap gap-2 justify-center animate-fade-in-up" style={{ animationDelay: '0.32s' }}>
                      {adv.features.map((feature: string, idx: number) => (
                        <li key={idx} className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold border border-blue-200">
                          <span>{featureIconMap[feature]}</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href={`/themes/${adv.id}`}
                    className="btn-secondary mt-auto animate-fade-in-up"
                    style={{ animationDelay: '0.35s' }}
                  >
                    View Experience
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
