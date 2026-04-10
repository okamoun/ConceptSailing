'use client';

import { useState, useEffect } from 'react';
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
      <div className="min-h-screen bg-gradient-to-br from-[#101824] to-[#1f2937] flex items-center justify-center">
        <div className="text-white text-xl">Loading booking confirmation...</div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#101824] to-[#1f2937] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">No Booking Found</h1>
          <p className="text-white mb-6">Please complete a booking form first</p>
          <Link href="/boats" className="text-accent hover:text-accent/80 underline">
            Return to Boats
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
    <main className="min-h-screen bg-gradient-to-br from-[#101824] to-[#1f2937] py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/boats" className="text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-2">
            &larr; Back to Boats
          </Link>
        </div>

        {/* Success Message */}
        <div className="glass p-8 shadow-xl mb-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-accent mb-4">Information Request Received!</h1>
            <p className="text-xl text-gray-200 mb-4">
              Thank you for your interest in chartering {bookingData.boat}. Your <strong>information request</strong> has been received and our team will contact you shortly to discuss availability and pricing.
            </p>
            <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
              <p className="text-yellow-300 text-sm">
                <strong>Please Note:</strong> This is not a confirmed booking. Our team will contact you to finalize details, check availability, and provide pricing before any confirmation.
              </p>
            </div>
          </div>

          {/* Email Status */}
          {emailStatus && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-accent mb-4">Email Notification</h2>
              <div className={`p-4 rounded-lg border ${
                emailStatus.status === 'success' 
                  ? 'bg-green-500/20 border-green-500/50' 
                  : 'bg-red-500/20 border-red-500/50'
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
                    <h3 className="text-white font-semibold">Booking Email</h3>
                    <p className="text-gray-300 text-sm">
                      {emailStatus.status === 'success' 
                        ? 'Email sent successfully to both client and contact@nj3cruises.com'
                        : 'Failed to send booking email'
                      }
                    </p>
                    {emailStatus.message && (
                      <p className="text-gray-400 text-xs mt-1">{emailStatus.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-accent mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white font-semibold">{bookingData.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white font-semibold">{bookingData.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white font-semibold">{bookingData.phone}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-accent mb-4">Charter Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-400">Boat:</span>
                  <span className="text-white font-semibold">{bookingData.boat}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-400">Charter Date:</span>
                  <span className="text-white font-semibold">{formatDate(bookingData.date)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-400">Number of Passengers:</span>
                  <span className="text-white font-semibold">{bookingData.passengers} guests</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-400">Embarkation Point:</span>
                  <span className="text-white font-semibold">{bookingData.embarkationPoint}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-400">Request Submitted:</span>
                  <span className="text-white font-semibold">{formatTimestamp(bookingData.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-6 bg-accent/10 rounded-lg border border-accent/30">
            <h3 className="text-xl font-semibold text-accent mb-4">Need to Make Changes?</h3>
            <p className="text-gray-300 mb-4">
              If you need to modify your booking request or have any questions, please don&apos;t hesitate to contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-accent font-semibold mb-1">Email</div>
                <div className="text-gray-300">bookings@nj3cruises.com</div>
              </div>
              <div>
                <div className="text-accent font-semibold mb-1">Phone</div>
                <div className="text-gray-300">+1 (555) 123-4567</div>
              </div>
              <div>
                <div className="text-accent font-semibold mb-1">Office Hours</div>
                <div className="text-gray-300">Mon-Fri 9AM-6PM AST</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/boats"
            className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors text-center"
          >
            Browse More Boats
          </Link>
          <Link
            href="/contact"
            className="border border-accent text-accent px-8 py-3 rounded-lg font-semibold hover:bg-accent/10 transition-colors text-center"
          >
            Contact Us Directly
          </Link>
        </div>
      </div>
    </main>
  );
}
