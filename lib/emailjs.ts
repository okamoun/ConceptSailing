import emailjs from '@emailjs/browser';

// EmailJS configuration with fallbacks
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'demo_public_key';
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'demo_service';
const EMAILJS_BUSINESS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_BUSINESS_TEMPLATE_ID || 'demo_business_template';
const EMAILJS_CLIENT_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_CLIENT_TEMPLATE_ID || 'demo_client_template';

// Fallback business email for demo purposes
const BUSINESS_EMAIL = 'contact@conceptsailing.com';

export interface BookingEmailData {
  name: string;
  email: string;
  phone: string;
  boat: string;
  date: string;
  passengers: number;
  embarkationPoint: string;
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
    EMAILJS_BUSINESS_TEMPLATE_ID.includes('demo') ||
    EMAILJS_BUSINESS_TEMPLATE_ID.includes('your_business_template_id_here') ||
    EMAILJS_CLIENT_TEMPLATE_ID.includes('demo') ||
    EMAILJS_CLIENT_TEMPLATE_ID.includes('your_client_template_id_here')
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
 * Send booking notification email to business
 */
export async function sendBusinessNotificationEmail(bookingData: BookingEmailData): Promise<EmailResponse> {
  console.log('Business email request received');
  console.log('EmailJS configured:', isEmailJSConfigured());
  console.log('EmailJS initialized:', emailjsInitialized);
  
  // Check if EmailJS is properly configured and initialized
  if (!isEmailJSConfigured() || !emailjsInitialized) {
    console.log('EmailJS not configured or initialized - simulating business email');
    return {
      status: 'success',
      message: 'Business notification simulated (EmailJS not configured)'
    };
  }

  try {
    const templateParams = {
      to_email: BUSINESS_EMAIL,
      email: BUSINESS_EMAIL,
      to_name: 'Concept Sailing Team',
      from_name: bookingData.name,
      from_email: bookingData.email,
      from_phone: bookingData.phone,
      boat_name: bookingData.boat,
      charter_date: bookingData.date,
      passengers: bookingData.passengers,
      embarkation_point: bookingData.embarkationPoint,
      submission_time: new Date(bookingData.timestamp).toLocaleString(),
      reply_to: bookingData.email,
    };

    console.log('Sending business notification with params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_BUSINESS_TEMPLATE_ID,
      templateParams
    );

    console.log('Business notification response:', response);

    if (response.status === 200) {
      return {
        status: 'success',
        message: 'Business notification sent successfully'
      };
    } else {
      return {
        status: 'error',
        message: `Failed to send business notification: ${JSON.stringify(templateParams)} ${response.text || 'Unknown error'}`
      };
    }
  } catch (error: unknown) {
    console.error('Error sending business notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorText = (error as EmailJSError)?.text || errorMessage;
    return {
      status: 'error',
      message: `Error sending business notification: ${errorText}`
    };
  }
}

/**
 * Send confirmation email to client
 */
export async function sendClientConfirmationEmail(bookingData: BookingEmailData): Promise<EmailResponse> {
  console.log('Client confirmation email request received');
  console.log('EmailJS configured:', isEmailJSConfigured());
  console.log('EmailJS initialized:', emailjsInitialized);
  
  // Check if EmailJS is properly configured and initialized
  if (!isEmailJSConfigured() || !emailjsInitialized) {
    console.log('EmailJS not configured or initialized - simulating client email');
    return {
      status: 'success',
      message: 'Client confirmation simulated (EmailJS not configured)'
    };
  }

  try {
    const templateParams = {
      to_email: bookingData.email,
      email: bookingData.email,
      to_name: bookingData.name,
      boat_name: bookingData.boat,
      charter_date: bookingData.date,
      passengers: bookingData.passengers,
      embarkation_point: bookingData.embarkationPoint,
      submission_time: new Date(bookingData.timestamp).toLocaleString(),
      contact_email: BUSINESS_EMAIL,
      contact_phone: '+30 210 123 4567',
    };

    console.log('Sending client confirmation with params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_CLIENT_TEMPLATE_ID,
      templateParams
    );

    console.log('Client confirmation response:', response);

    if (response.status === 200) {
      return {
        status: 'success',
        message: 'Client confirmation sent successfully'
      };
    } else {
      return {
        status: 'error',
        message: `Failed to send client confirmation: ${response.text || 'Unknown error'}`
      };
    }
  } catch (error: unknown) {
    console.error('Error sending client confirmation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorText = (error as EmailJSError)?.text || errorMessage;
    return {
      status: 'error',
      message: `Error sending client confirmation: ${errorText}`
    };
  }
}

/**
 * Send both business notification and client confirmation emails
 */
export async function sendBookingEmails(bookingData: BookingEmailData): Promise<{
  business: EmailResponse;
  client: EmailResponse;
}> {
  const [businessResponse, clientResponse] = await Promise.all([
    sendBusinessNotificationEmail(bookingData),
    sendClientConfirmationEmail(bookingData)
  ]);

  return {
    business: businessResponse,
    client: clientResponse
  };
}
