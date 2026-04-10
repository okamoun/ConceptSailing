import emailjs from '@emailjs/browser';

// EmailJS configuration with fallbacks
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'demo_public_key';
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'demo_service';
const EMAILJS_BOOKING_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_BOOKING_TEMPLATE_ID || 'demo_booking_template';

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
    EMAILJS_SERVICE_ID.includes('demo') ||
    EMAILJS_SERVICE_ID.includes('your_service_id_here') ||
    EMAILJS_BOOKING_TEMPLATE_ID.includes('demo') ||
    EMAILJS_BOOKING_TEMPLATE_ID.includes('your_booking_template_id_here')
  );
}

// Initialize EmailJS only if properly configured
let emailjsInitialized = false;
try {
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
    console.log('EmailJS not configured or initialized - simulating booking email');
    return {
      status: 'success',
      message: 'Booking email simulated (EmailJS not configured)'
    };
  }

  try {
    const templateParams = {
      // Recipients - both client and business will receive this email
      to_email: BUSINESS_EMAIL, // Business email as primary recipient
      cc_email: bookingData.email, // Client email as CC
      
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
      business_phone: '+30 210 123 4567',
      
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
