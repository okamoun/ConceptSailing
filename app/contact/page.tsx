import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Contact | Concept Mediterranean Sailing',
  description: 'Contact Concept Mediterranean Sailing for inquiries, bookings, and personalized sailing experiences in Greece.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#101824] to-[#1f2937] py-16">
      <div className="max-w-3xl mx-auto px-4 glass p-10 shadow-xl border border-accent animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo_white_no_bg.png" alt="Concept Mediterranean Sailing Logo" width={80} height={80} className="mb-4" />
          <h1 className="text-4xl font-extrabold text-accent mb-2 text-center">Contact Us</h1>
          <p className="text-lg text-gray-200 text-center max-w-xl">We&apos;d love to help you plan your perfect Greek sailing adventure. Reach out for bookings, questions, or custom requests!</p>
        </div>
        <form className="space-y-6 mt-6">
          <div>
            <label htmlFor="name" className="block text-lg font-semibold text-accent mb-1">Name</label>
            <input type="text" id="name" name="name" required className="w-full px-4 py-2 rounded bg-[#101824] border border-accent text-white focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label htmlFor="email" className="block text-lg font-semibold text-accent mb-1">Email</label>
            <input type="email" id="email" name="email" required className="w-full px-4 py-2 rounded bg-[#101824] border border-accent text-white focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label htmlFor="message" className="block text-lg font-semibold text-accent mb-1">Message</label>
            <textarea id="message" name="message" rows={5} required className="w-full px-4 py-2 rounded bg-[#101824] border border-accent text-white focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <button type="submit" className="button-premium w-full py-3 text-lg font-bold rounded">Send Message</button>
        </form>
        <div className="mt-10 text-center text-gray-300">
          <p>Email: <a href="mailto:info@windsurfcruises.com" className="text-accent underline">info@windsurfcruises.com</a></p>
          <p>Phone: +30 123 456 7890</p>
        </div>
      </div>
    </main>
  );
}
