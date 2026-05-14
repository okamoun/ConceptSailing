import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT } from '../config/contact';

export const metadata: Metadata = {
  title: 'Terms of Service | BlueOne Luxury Yacht',
  description: 'Terms and conditions for BlueOne luxury yacht charter services.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 px-4 py-20">
      <div className="max-w-3xl mx-auto space-y-8">

        <div className="space-y-2">
          <Link href="/" className="text-blue-300 hover:text-white text-sm transition-colors">← Back to home</Link>
          <h1 className="text-white font-bold text-3xl mt-4">Terms of Service</h1>
          <p className="text-blue-300 text-sm">Last updated: January 2025</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 space-y-6 text-blue-100 text-sm leading-relaxed">

          <Section title="1. Acceptance of Terms">
            <p>By submitting a booking inquiry or using this website, you agree to these terms and conditions. If you do not agree, please do not use our services.</p>
          </Section>

          <Section title="2. Charter Bookings">
            <p>All charter bookings are subject to availability and formal confirmation by BlueOne. A booking is only confirmed once you receive a written confirmation and a deposit has been received.</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>A deposit of 50% is required to secure your charter dates</li>
              <li>The remaining balance is due 30 days before the charter start date</li>
              <li>All prices are quoted in EUR unless otherwise stated</li>
            </ul>
          </Section>

          <Section title="3. Cancellation Policy">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">More than 60 days before departure:</strong> Full deposit refunded minus administrative fees</li>
              <li><strong className="text-white">30–60 days before departure:</strong> 50% of the total charter fee is forfeited</li>
              <li><strong className="text-white">Less than 30 days before departure:</strong> 100% of the total charter fee is forfeited</li>
            </ul>
            <p className="mt-2">We strongly recommend purchasing travel insurance to cover unforeseen cancellations.</p>
          </Section>

          <Section title="4. Skipper and Safety">
            <p>All charters are conducted with a qualified, licensed skipper. Guests are required to follow the skipper&apos;s instructions at all times for safety reasons. The skipper reserves the right to alter the itinerary due to adverse weather or safety concerns.</p>
          </Section>

          <Section title="5. Conduct and Liability">
            <p>Guests are responsible for any damage to the vessel caused by negligence or misconduct. BlueOne reserves the right to terminate a charter without refund if guests fail to comply with safety rules or engage in disruptive behaviour.</p>
          </Section>

          <Section title="6. Force Majeure">
            <p>BlueOne is not liable for cancellations or alterations caused by circumstances beyond our control, including severe weather, port closures, mechanical failure, or other force majeure events. In such cases, we will work with you to reschedule at no additional charge where possible.</p>
          </Section>

          <Section title="7. Governing Law">
            <p>These terms are governed by Greek law. Any disputes shall be resolved in the courts of Athens, Greece.</p>
          </Section>

          <Section title="8. Contact">
            <p>For questions about these terms, please contact us:</p>
            <div className="mt-3 bg-white/5 rounded-xl px-4 py-3 space-y-1">
              <p className="text-white font-medium">BlueOne Luxury Yacht</p>
              <a href={`mailto:${CONTACT.email}`} className="text-blue-300 hover:text-white transition-colors">{CONTACT.email}</a>
              <p className="text-blue-200">{CONTACT.phone.formatted}</p>
            </div>
          </Section>

        </div>

      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-white font-semibold text-base">{title}</h2>
      <div className="text-blue-100">{children}</div>
    </div>
  );
}
