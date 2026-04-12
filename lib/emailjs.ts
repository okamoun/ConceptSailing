import emailjs from '@emailjs/browser';
import { CONTACT } from '../app/config/contact';

// EmailJS configuration with fallbacks
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'demo_public_key';
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'demo_service';
const EMAILJS_BOOKING_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_BUSINESS_TEMPLATE_ID || 'demo_booking_template';
const EMAILJS_CONTACT_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_CLIENT_TEMPLATE_ID || 'demo_contact_template';

// Fallback business email for demo purposes
const BUSINESS_EMAIL = 'contact@nj3cruises.com';

export interface BookingEmailData {
  name: string;
  email: string;
  phone: string;
  boat: string;
  date: string;
  passengers: number;
  embarkationPoint: string;
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
  console.log('Contact Template ID:', EMAILJS_CONTACT_TEMPLATE_ID);
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
    const templateParams = {
      // Recipients - both client and business will receive this email
      to_email: BUSINESS_EMAIL, // Business email as primary recipient
      cc_email: bookingData.email, // Client email as CC
      email: bookingData.email,
      // Client information
      client_name: bookingData.name,
      client_email: bookingData.email,
      client_phone: bookingData.phone,
      
      // Booking details
      boat_name: bookingData.boat,
      charter_date: bookingData.date,
      passengers: bookingData.passengers,
      embarkation_point: bookingData.embarkationPoint,
      
      // Additional details
      comment: bookingData.holidayDescription,
      theme: bookingData.selectedTheme,
      submission_time: new Date(bookingData.timestamp).toLocaleString(),
      
      // Business contact information
      business_email: BUSINESS_EMAIL,
      business_phone: CONTACT.phone.formatted,
      
      // Reply to client for easy communication
      reply_to: bookingData.email,
    };

    console.log('Sending booking email with params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_BOOKING_TEMPLATE_ID,
      templateParams
    );

    console.log('Booking email response:', response);

    if (response.status === 200) {
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
    const templateParams = {
      // Contact information
      from_name: contactData.name,
      from_email: contactData.email,
      from_phone: contactData.phone || 'Not provided',
      email : contactData.email,
      // Message details
      message: contactData.message,
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
      EMAILJS_CONTACT_TEMPLATE_ID,
      templateParams
    );

    console.log('Contact email response:', response);

    if (response.status === 200) {
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
