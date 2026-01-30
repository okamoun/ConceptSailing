import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About | Concept Mediterranean Sailing',
  description: 'Learn about our unique approach to Greek sailing holidays, focused on people and experiences, not just boats.'
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#101824] to-[#1f2937] py-16">
      <div className="max-w-3xl mx-auto px-4 glass p-10 shadow-xl border border-accent animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
  <Image src="/logo_cms.svg" alt="Concept Mediterranean Sailing Logo" width={140} height={140} className="mb-2" />
  <span className="text-accent font-semibold mb-2">By NJ3 cruises company</span>
  <h1 className="text-4xl font-extrabold text-accent mb-2 text-center">About Us</h1>
</div>
        <section className="text-lg text-gray-200 space-y-6">
          <p>
            <strong>Concept Mediterranean Sailing</strong> is redefining the way you experience sailing holidays in Greece. Traditionally, yacht charters have been all about the boat: its size, its luxury, its speed. But we believe the heart of a truly memorable holiday lies elsewhere.
          </p>
          <p>
            Our new approach puts <span className="text-accent font-bold">people</span> and <span className="text-accent font-bold">experiences</span> at the center. We start by getting to know you—your passions, your dreams, your idea of the perfect getaway. Then, we design a journey tailored around unique activities, inspiring destinations, and the connections you make along the way.
          </p>
          <p>
            Whether you crave adventure, wellness, culture, or family bonding, our curated themes ensure every moment is meaningful. The boat is your floating home, but the real story is written by the people on board and the experiences you share.
          </p>
          <p>
            Join us to discover a new kind of Greek sailing holiday—one where the memories you create are as important as the places you visit. Welcome aboard a journey that’s truly yours.
          </p>
        </section>
      </div>
    </main>
  );
}
