'use client';

import { useState } from 'react';
import PageHero from '../components/PageHero';
import { CONTACT } from '../config/contact';
import { sendContactEmail } from '../../lib/emailjs';

export default function ContactClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await sendContactEmail({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      });

      if (response.status === 'success') {
        setSubmitted(true);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        setError(response.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError('An unexpected error occurred. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldCls = 'w-full';
  const labelCls = 'block text-sm font-semibold text-slate-800 mb-1.5';

  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Get in touch"
        title="Contact Us"
        subtitle="We'd love to help you plan your perfect Greek sailing adventure. Reach out for bookings, questions, or custom requests."
      />

      <section className="section-pad bg-[#f6f3ee]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
            {submitted ? (
              <div role="status" className="text-center py-10">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl text-[#0a1f3c] mb-2">Message Sent!</h2>
                <p className="text-slate-600">
                  Thank you for reaching out. We&apos;ll get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-secondary mt-4"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <h2 className="text-2xl md:text-3xl text-[#0a1f3c] mb-2">Send us a message</h2>
                <p className="text-sm text-slate-500">Fields marked <span className="text-red-600">*</span> are required.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className={labelCls}>Name <span className="text-red-600" aria-hidden="true">*</span></label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      autoComplete="name"
                      className={fieldCls}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelCls}>Email <span className="text-red-600" aria-hidden="true">*</span></label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className={fieldCls}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className={labelCls}>Phone <span className="font-normal text-slate-500">(optional)</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    autoComplete="tel"
                    className={fieldCls}
                    placeholder="+44 7700 900000"
                  />
                </div>
                <div>
                  <label htmlFor="message" className={labelCls}>Message <span className="text-red-600" aria-hidden="true">*</span></label>
                  <textarea
                    id="message"
                    name="message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={6}
                    required
                    className={`${fieldCls} resize-y`}
                    placeholder="Tell us about your ideal sailing holiday — dates, group size, interests…"
                  />
                </div>

                {error && (
                  <div role="alert" className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Sending…
                    </>
                  ) : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Contact methods */}
          <aside className="lg:col-span-2 space-y-4">
            {[
              { label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}`, icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
              { label: 'Phone', value: CONTACT.phone.display, href: CONTACT.phone.href, icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
              { label: 'WhatsApp', value: 'Message us', href: 'https://wa.me/message/FFC4UTH5AZZEC1', external: true, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
              { label: 'Facebook', value: 'Follow us', href: 'https://www.facebook.com/share/1LhPdDZXd1/?mibextid=wwXIfr', external: true, icon: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5' },
              { label: 'Central Agent', value: 'Athenian Yachts', href: 'https://athenian-yachts.gr/', external: true, icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <span className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon} />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-widest text-slate-500">{item.label}</span>
                  <span className="block font-semibold text-[#0a1f3c] group-hover:text-blue-700 break-words">{item.value}</span>
                </span>
              </a>
            ))}
            <div className="rounded-2xl bg-[#0a1f3c] text-white p-6">
              <p className="font-semibold mb-1">BlueOne Luxury Yacht Charters</p>
              <p className="text-white/70 text-sm mb-0">{CONTACT.company.location} · {CONTACT.businessHours}</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
