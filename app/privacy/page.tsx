import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT } from '../config/contact';

export const metadata: Metadata = {
  title: 'Privacy Policy | BlueOne Luxury Yacht',
  description: 'Privacy policy for BlueOne luxury yacht charter services.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 px-4 py-20">
      <div className="max-w-3xl mx-auto space-y-8">

        <div className="space-y-2">
          <Link href="/" className="text-blue-300 hover:text-white text-sm transition-colors">← Back to home</Link>
          <h1 className="text-white font-bold text-3xl mt-4">Privacy Policy</h1>
          <p className="text-blue-300 text-sm">Last updated: January 2025</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 space-y-6 text-blue-100 text-sm leading-relaxed">

          <Section title="1. Information We Collect">
            <p>When you submit a booking or contact inquiry through our website, we collect the personal information you provide, including your name, email address, phone number, and any details about your requested charter.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect solely to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Respond to your booking and contact inquiries</li>
              <li>Send you booking confirmations and relevant charter information</li>
              <li>Improve our services and website experience</li>
            </ul>
          </Section>

          <Section title="3. Data Storage">
            <p>Your data is stored securely using Google Firebase (Firestore). We do not sell, trade, or otherwise transfer your personal information to outside parties.</p>
          </Section>

          <Section title="4. Cookies">
            <p>Our website may use cookies for analytics purposes (Google Analytics) to help us understand how visitors interact with the site. You can disable cookies in your browser settings at any time.</p>
          </Section>

          <Section title="5. Third-Party Services">
            <p>We use the following third-party services to operate this website:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong className="text-white">EmailJS</strong> — to deliver booking and contact form emails</li>
              <li><strong className="text-white">Google Firebase</strong> — for secure data storage</li>
              <li><strong className="text-white">Google Maps</strong> — to display marina and destination maps</li>
              <li><strong className="text-white">Google Analytics</strong> — for anonymised site usage statistics</li>
            </ul>
            <p className="mt-2">Each of these services has its own privacy policy governing their use of data.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>We retain your personal information for as long as necessary to fulfil the purposes outlined in this policy or as required by law. You may request deletion of your data at any time by contacting us.</p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the right to access, correct, or delete the personal information we hold about you. To exercise these rights, please contact us at:</p>
            <div className="mt-3 bg-white/5 rounded-xl px-4 py-3 space-y-1">
              <p className="text-white font-medium">BlueOne Luxury Yacht</p>
              <a href={`mailto:${CONTACT.email}`} className="text-blue-300 hover:text-white transition-colors">{CONTACT.email}</a>
            </div>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>We may update this privacy policy from time to time. Any changes will be posted on this page with an updated date.</p>
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
