import Image from 'next/image';
import type { ReactNode } from 'react';

type PageHeroProps = {
  title: string;
  eyebrow?: string;
  subtitle?: ReactNode;
  image?: string;
  imageAlt?: string;
  /** 'md' for content pages, 'lg' for landing-style pages */
  size?: 'md' | 'lg';
  children?: ReactNode;
};

/**
 * Consistent photo header for interior pages: dark gradient over a yacht
 * photo, left-aligned eyebrow + serif title + subtitle, optional CTAs.
 */
export default function PageHero({
  title,
  eyebrow,
  subtitle,
  image = '/images/boats/blueone/External_sailing.jpg',
  imageAlt = '',
  size = 'md',
  children,
}: PageHeroProps) {
  return (
    <section
      className={`relative overflow-hidden bg-[#0a1f3c] flex items-end ${
        size === 'lg' ? 'min-h-[70svh]' : 'min-h-[340px] md:min-h-[420px]'
      }`}
    >
      <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06142a]/95 via-[#06142a]/55 to-[#06142a]/20" />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 md:pb-16">
        <div className="max-w-3xl animate-fade-in-up">
          {eyebrow && <p className="eyebrow text-sky-300 mb-3">{eyebrow}</p>}
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl mb-4">{title}</h1>
          {subtitle && (
            <div className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl">{subtitle}</div>
          )}
          {children && <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">{children}</div>}
        </div>
      </div>
    </section>
  );
}
