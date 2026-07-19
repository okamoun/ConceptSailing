import emailjs from '@emailjs/browser';
import { CONTACT } from '../app/config/contact';
import { trackEvent } from './analytics';
import { saveContactSubmission } from './submissions';

// EmailJS configuration with fallbacks
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'demo_public_key';
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'demo_service';
const EMAILJS_BOOKING_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_BUSINESS_TEMPLATE_ID || 'demo_booking_template';
// "Simple" body-only template used for the AI-phrased information-request confirmation
const EMAILJS_SIMPLE_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_SIMPLE_TEMPLATE_ID || 'template_simple';

// Fallback business email for demo purposes
const BUSINESS_EMAIL = 'contact@nj3cruises.com';

export interface BookingEmailData {
  name: string;
  email: string;
  phone: string;
  boat: string;
  date: string;
  endDate?: string;
  passengers: number;
  passengerDetails?: string;
  embarkationPoint: string;
  deliveryPoint?: string;
  redeliveryPoint?: string;
  holidayDescription?: string;
  selectedTheme?: string;
  timestamp: string;
}

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  timestamp: string;
}

export interface EmailResponse {
  status: 'success' | 'error';
  message: string;
}

interface EmailJSError {
  text?: string;
  message?: string;
}

/**
 * Check if EmailJS is properly configured
 */
function isEmailJSConfigured(): boolean {
  return !(
    EMAILJS_PUBLIC_KEY.includes('demo') ||
    EMAILJS_PUBLIC_KEY.includes('your_public_key_here') ||
    EMAILJS_BOOKING_TEMPLATE_ID.includes('demo') ||
    EMAILJS_BOOKING_TEMPLATE_ID.includes('your_booking_template_id_here') 
  )
}

// Initialize EmailJS only if properly configured
let emailjsInitialized = false;
try {
  // Debug: Show configuration values
  console.log('EmailJS Configuration Debug:');
  console.log('Public Key:', EMAILJS_PUBLIC_KEY);
  console.log('Service ID:', EMAILJS_SERVICE_ID);
  console.log('Booking Template ID:', EMAILJS_BOOKING_TEMPLATE_ID);
  console.log('Simple Template ID:', EMAILJS_SIMPLE_TEMPLATE_ID);
  console.log('Is Configured:', isEmailJSConfigured());
  
  if (isEmailJSConfigured()) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    emailjsInitialized = true;
    console.log('EmailJS initialized successfully');
  } else {
    console.log('EmailJS not configured - will simulate emails');
  }
} catch (error) {
  console.warn('EmailJS initialization failed:', error);
}

/**
 * Send booking notification email to both client and business
 */
export async function sendBookingEmail(bookingData: BookingEmailData): Promise<EmailResponse> {
  console.log('Booking email request received');
  console.log('EmailJS configured:', isEmailJSConfigured());
  console.log('EmailJS initialized:', emailjsInitialized);
  
  // Check if EmailJS is properly configured and initialized
  if (!isEmailJSConfigured() || !emailjsInitialized) {
    console.error('EmailJS not configured or initialized - cannot send booking email');
    return {
      status: 'error',
      message: 'Email service is not properly configured. Please contact support.'
    };
  }

  try {
    const embarkation = bookingData.deliveryPoint || bookingData.embarkationPoint;
    const redelivery = bookingData.redeliveryPoint || bookingData.deliveryPoint || bookingData.embarkationPoint;

    // Human-readable summary of the request, used both to phrase the AI
    // confirmation and as a fallback body.
    const details = [
      `Boat: ${bookingData.boat}`,
      `Dates: ${bookingData.date}${bookingData.endDate ? ` to ${bookingData.endDate}` : ''}`,
      `Guests: ${bookingData.passengerDetails || bookingData.passengers}`,
      `Embarkation: ${embarkation}`,
      redelivery && redelivery !== embarkation ? `Disembarkation: ${redelivery}` : '',
      bookingData.selectedTheme ? `Theme: ${bookingData.selectedTheme}` : '',
      bookingData.holidayDescription ? `Notes: ${bookingData.holidayDescription}` : '',
    ].filter(Boolean).join('\n');

    const confirmationMessage = await buildConfirmationMessage({
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      details,
    });

    const templateParams = {
      // Recipients — confirmation goes to the guest, with the business copied in
      to_email: bookingData.email,
      cc_email: BUSINESS_EMAIL,
      email: bookingData.email,

      // AI-phrased confirmation body rendered by the "simple" template
      message: confirmationMessage,

      // Client information
      from_name: bookingData.name,
      client_name: bookingData.name,
      client_email: bookingData.email,
      client_phone: bookingData.phone,

      // Booking details (structured — kept for the business copy / template use)
      boat_name: bookingData.boat,
      charter_date: bookingData.date,
      charter_end_date: bookingData.endDate || bookingData.date,
      passengers: bookingData.passengers,
      embarkation_point: embarkation,
      delivery_point: embarkation,
      redelivery_point: redelivery,
      passenger_details: bookingData.passengerDetails || '',
      comment: bookingData.holidayDescription,
      theme: bookingData.selectedTheme,
      request_details: details,
      submission_time: new Date(bookingData.timestamp).toLocaleString(),

      // Business contact information
      business_email: BUSINESS_EMAIL,
      business_phone: CONTACT.phone.formatted,

      // Reply to client for easy communication
      reply_to: bookingData.email,
    };

    console.log('Sending booking email with params :', templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_SIMPLE_TEMPLATE_ID,
      templateParams
    );

    console.log('Booking email response:', response);

    if (response.status === 200) {
      trackEvent('booking_submitted', { boat: bookingData.boat, theme: bookingData.selectedTheme || '' });
      return {
        status: 'success',
        message: 'Booking email sent successfully to both client and business'
      };
    } else {
      return {
        status: 'error',
        message: `Failed to send booking email: ${response.text || 'Unknown error'}`
      };
    }
  } catch (error: unknown) {
    console.error('Error sending booking email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorText = (error as EmailJSError)?.text || errorMessage;
    return {
      status: 'error',
      message: `Error sending booking email: ${errorText}`
    };
  }
}

interface ConfirmationInput {
  name: string;
  email: string;
  phone?: string;
  /** Free-text message the guest typed (contact form / holiday notes). */
  message?: string;
  /** Structured summary of a quote / information request (dates, boat, guests…). */
  details?: string;
}

/**
 * Ask the server-side OpenAI route to phrase a warm, on-brand confirmation that
 * the information request was received. Falls back to a sensible static message
 * so the guest always gets an acknowledgment even if AI generation fails.
 */
async function buildConfirmationMessage(input: ConfirmationInput): Promise<string> {
  const firstName = input.name.trim().split(/\s+/)[0] || input.name;
  const reference = input.details
    ? `For reference, here are the details of your request:\n${input.details}`
    : input.message
      ? `For reference, here is the message you sent us:\n"${input.message}"`
      : '';
  const fallback =
    `Dear ${firstName},\n\n` +
    `Thank you for reaching out to BlueOne. We have received your request and a member of our team will get back to you shortly.\n\n` +
    (reference ? `${reference}\n\n` : '') +
    `Warm regards,\nThe BlueOne Team\n${CONTACT.phone.formatted} · ${CONTACT.email}`;

  try {
    const res = await fetch('/api/contact-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
        details: input.details,
      }),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as { message?: string };
    return data.message?.trim() || fallback;
  } catch (err) {
    console.warn('AI confirmation generation failed, using fallback message:', err);
    return fallback;
  }
}

/**
 * Send contact form email
 */
export async function sendContactEmail(contactData: ContactEmailData): Promise<EmailResponse> {
  console.log('Contact email request received');
  console.log('EmailJS configured:', isEmailJSConfigured());
  console.log('EmailJS initialized:', emailjsInitialized);

  // Check if EmailJS is properly configured and initialized
  if (!isEmailJSConfigured() || !emailjsInitialized) {
    console.error('EmailJS not configured or initialized - cannot send contact email');
    return {
      status: 'error',
      message: 'Email service is not properly configured. Please contact support.'
    };
  }

  try {
    const confirmationMessage = await buildConfirmationMessage(contactData);

    const templateParams = {
      // Recipients — confirmation goes to the guest, with the business copied in
      to_email: contactData.email,
      cc_email: BUSINESS_EMAIL,
      email: contactData.email,

      // AI-phrased confirmation body rendered by the "simple" template
      message: confirmationMessage,

      // Contact information (structured details for the business copy / template use)
      from_name: contactData.name,
      from_email: contactData.email,
      from_phone: contactData.phone || 'Not provided',
      client_name: contactData.name,
      client_email: contactData.email,
      client_phone: contactData.phone || 'Not provided',
      client_message: contactData.message,
      submission_time: new Date(contactData.timestamp).toLocaleString(),

      // Business contact information
      business_email: BUSINESS_EMAIL,
      business_phone: CONTACT.phone.formatted,

      // Reply to client for easy communication
      reply_to: contactData.email,
    };

    console.log('Sending contact email with params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_SIMPLE_TEMPLATE_ID,
      templateParams
    );

    console.log('Contact email response:', response);

    if (response.status === 200) {
      trackEvent('contact_submitted');
      saveContactSubmission({
        type: 'contact',
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        message: contactData.message,
      }).catch(err => console.warn('Failed to save contact to DB:', err));
      return {
        status: 'success',
        message: 'Contact email sent successfully'
      };
    } else {
      return {
        status: 'error',
        message: `Failed to send contact email: ${response.text || 'Unknown error'}`
      };
    }
  } catch (error: unknown) {
    console.error('Error sending contact email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorText = (error as EmailJSError)?.text || errorMessage;
    return {
      status: 'error',
      message: `Error sending contact email: ${errorText}`
    };
  }
}

/**
 * Legacy function for backward compatibility - now uses single email
 * @deprecated Use sendBookingEmail instead
 */
export async function sendBookingEmails(bookingData: BookingEmailData): Promise<{
  business: EmailResponse;
  client: EmailResponse;
}> {
  const response = await sendBookingEmail(bookingData);
  
  // Return the same response for both business and client for backward compatibility
  return {
    business: response,
    client: response
  };
}
