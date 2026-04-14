'use client';

import { useState, useEffect } from 'react';
import { CONTACT } from '../config/contact';
import Link from 'next/link';

interface BookingData {
  name: string;
  email: string;
  phone: string;
  boat: string;
  date: string;
  passengers: number;
  embarkationPoint: string;
  timestamp: string;
}

interface EmailStatus {
  status: string;
  message: string;
}

export default function BookingConfirmationPage() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedBooking = localStorage.getItem('pendingBooking');
    const storedEmailStatus = localStorage.getItem('emailStatus');
    
    if (storedBooking) {
      const booking = JSON.parse(storedBooking) as BookingData;
      setBookingData(booking);
    }
    
    if (storedEmailStatus) {
      const status = JSON.parse(storedEmailStatus) as EmailStatus;
      setEmailStatus(status);
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-blue-900 text-xl">Loading booking confirmation...</div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">No Booking Found</h1>
          <p className="text-gray-700 mb-6">Please complete a booking form first</p>
          <Link href="/blueone" className="text-blue-600 hover:text-blue-800 underline">
            Return to BlueOne
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/blueone" className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-2">
            &larr; Back to BlueOne
          </Link>
        </div>

        {/* Success Message */}
        <div className="glass p-8 shadow-xl border border-blue-200 mb-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-blue-600 mb-4">Information Request Received!</h1>
            <p className="text-xl text-gray-700 mb-4">
              Thank you for your interest in chartering {bookingData.boat}. Your <strong>information request</strong> has been received and our team will contact you shortly to discuss availability and pricing.
            </p>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-300">
              <p className="text-amber-700 text-sm">
                <strong>Please Note:</strong> This is not a confirmed booking. Our team will contact you to finalize details, check availability, and provide pricing before any confirmation.
              </p>
            </div>
          </div>

          {/* Email Status */}
          {emailStatus && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Email Notification</h2>
              <div className={`p-4 rounded-lg border ${
                emailStatus.status === 'success'
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    emailStatus.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {emailStatus.status === 'success' ? (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold">Booking Email</h3>
                    <p className="text-gray-600 text-sm">
                      {emailStatus.status === 'success'
                        ? 'Email sent successfully to both client and contact@nj3cruises.com'
                        : 'Failed to send booking email'
                      }
                    </p>
                    {emailStatus.message && (
                      <p className="text-gray-500 text-xs mt-1">{emailStatus.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-gray-600">Name:</span>
                  <span className="text-gray-900 font-semibold">{bookingData.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900 font-semibold">{bookingData.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-gray-600">Phone:</span>
                  <span className="text-gray-900 font-semibold">{bookingData.phone}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Charter Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-gray-600">Boat:</span>
                  <span className="text-gray-900 font-semibold">{bookingData.boat}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-gray-600">Charter Date:</span>
                  <span className="text-gray-900 font-semibold">{formatDate(bookingData.date)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-gray-600">Number of Passengers:</span>
                  <span className="text-gray-900 font-semibold">{bookingData.passengers} guests</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-gray-600">Embarkation Point:</span>
                  <span className="text-gray-900 font-semibold">{bookingData.embarkationPoint}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-gray-600">Request Submitted:</span>
                  <span className="text-gray-900 font-semibold">{formatTimestamp(bookingData.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Need to Make Changes?</h3>
            <p className="text-gray-600 mb-4">
              If you need to modify your booking request or have any questions, please don&apos;t hesitate to contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-blue-600 font-semibold mb-1">Email</div>
                <div className="text-gray-700">bookings@nj3cruises.com</div>
              </div>
              <div>
                <div className="text-blue-600 font-semibold mb-1">Phone</div>
                <div className="text-gray-700">{CONTACT.phone.formatted}</div>
              </div>
              <div>
                <div className="text-blue-600 font-semibold mb-1">Office Hours</div>
                <div className="text-gray-700">Mon-Fri 9AM-6PM EET</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/blueone"
            className="btn-primary text-center"
          >
            Back to BlueOne
          </Link>
          <Link
            href="/contact"
            className="btn-secondary text-center"
          >
            Contact Us Directly
          </Link>
        </div>
      </div>
    </main>
  );
}
