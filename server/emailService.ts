import { Resend } from 'resend';
import {
  generateAdminBookingAlertHtml,
  generateCustomerBookingConfirmationHtml,
  generateReceiverDeliveryHtml,
  generateRiderAssignmentEmailHtml,
  RiderAssignmentEmailData,
} from './emailTemplates';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.FROM_EMAIL || 'BBD Mobility <booking@bbdmobility.com.ng>';

const rawAdminEmails =
  process.env.ADMIN_EMAILS ||
  process.env.BUSINESS_EMAILS ||
  'Sales@bbdautosng.com,Info@bbdautosng.com';

const businessEmails = rawAdminEmails
  .split(',')
  .map(e => e.trim())
  .filter(e => e.includes('@'));

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Safeguard: Never dispatch real emails to official admin inboxes (Sales@bbdautosng.com, Info@bbdautosng.com)
 * or clients for any simulated, mock, or automated test bookings.
 */
function isTestPayload(sEmail?: string, rEmail?: string, sName?: string, bookingRef?: string): boolean {
  const sE = (sEmail || '').toLowerCase();
  const rE = (rEmail || '').toLowerCase();
  const sN = (sName || '').toLowerCase();
  const ref = (bookingRef || '').toUpperCase();

  return (
    sE.includes('example.com') ||
    rE.includes('example.com') ||
    sE.includes('testsender') ||
    rE.includes('testrecipient') ||
    sE.includes('@test.') ||
    sN.includes('test sender') ||
    sN.includes('test recipient') ||
    ref.includes('TEST')
  );
}

/**
 * Executes Resend email dispatch with automatic timeout (7s) and fast retry (up to 2 attempts)
 */
async function sendWithTimeoutAndRetry(sendFn: () => Promise<any>, maxRetries = 2): Promise<EmailDispatchResult> {
  let lastError = '';
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result: any = await Promise.race([
        sendFn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Resend email timeout (7s)')), 7000)),
      ]);

      if (result && !result.error) {
        return { success: true, messageId: result.data?.id };
      }

      lastError = result?.error?.message || 'Unknown email service rejection';
      console.warn(`[Resend Email Warning] Attempt ${attempt + 1} error: ${lastError}`);

      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
      }
    } catch (err: any) {
      lastError = err.message || 'Network exception communicating with Resend API';
      console.warn(`[Resend Email Exception] Attempt ${attempt + 1}: ${lastError}`);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
      }
    }
  }

  return { success: false, error: lastError };
}

export const emailService = {
  /**
   * 1. Sender Booking Confirmation Email
   */
  async sendSenderConfirmation(data: {
    bookingRef: string;
    sType: string;
    pLoc: string;
    dLoc: string;
    pDetails: string;
    sName: string;
    sPhone: string;
    sEmail: string;
    rName: string;
    rPhone: string;
    rEmail: string;
    instructions?: string;
  }): Promise<EmailDispatchResult> {
    if (isTestPayload(data.sEmail, data.rEmail, data.sName, data.bookingRef)) {
      console.log(`[TEST EMAIL SUPPRESSED] Skipping real email delivery for test booking: ${data.bookingRef}`);
      return { success: true, messageId: 'test-suppressed' };
    }

    if (!resend) {
      console.log(`[EMAIL DEV MODE] Sender Confirmation -> ${data.sEmail} for ${data.bookingRef}`);
      return { success: true, messageId: 'dev-mode' };
    }

    try {
      const html = generateCustomerBookingConfirmationHtml({
        ...data,
        verificationOtp: 'Shared with recipient',
        businessEmails
      });

      return await sendWithTimeoutAndRetry(() =>
        resend.emails.send({
          from: fromEmail,
          to: [data.sEmail],
          replyTo: businessEmails[0] || 'Info@bbdautosng.com',
          subject: `BBD Mobility Booking Confirmation - ${data.bookingRef}`,
          html
        })
      );
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * 2. Receiver Delivery Notification with 6-digit OTP
   */
  async sendReceiverDeliveryNotice(data: {
    bookingRef: string;
    otpCode: string; // Plaintext OTP code
    sType: string;
    pLoc: string;
    dLoc: string;
    pDetails: string;
    sName: string;
    sPhone: string;
    sEmail: string;
    rName: string;
    rPhone: string;
    rEmail: string;
    instructions?: string;
  }): Promise<EmailDispatchResult> {
    if (isTestPayload(data.sEmail, data.rEmail, data.sName, data.bookingRef)) {
      console.log(`[TEST EMAIL SUPPRESSED] Skipping real email delivery for test booking: ${data.bookingRef}`);
      return { success: true, messageId: 'test-suppressed' };
    }

    if (!resend) {
      console.log(`[EMAIL DEV MODE] Receiver Delivery OTP -> ${data.rEmail} | Code: ${data.otpCode} for ${data.bookingRef}`);
      return { success: true, messageId: 'dev-mode' };
    }

    try {
      const html = generateReceiverDeliveryHtml({
        ...data,
        verificationOtp: data.otpCode,
        businessEmails
      });

      return await sendWithTimeoutAndRetry(() =>
        resend.emails.send({
          from: fromEmail,
          to: [data.rEmail],
          replyTo: businessEmails[0] || 'Info@bbdautosng.com',
          subject: `BBD Mobility Delivery Notice - Verification Code: ${data.otpCode} (${data.bookingRef})`,
          html
        })
      );
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * 3. Admin New Booking Alert
   */
  async sendAdminAlert(data: {
    bookingRef: string;
    sType: string;
    pLoc: string;
    dLoc: string;
    pDetails: string;
    sName: string;
    sPhone: string;
    sEmail: string;
    rName: string;
    rPhone: string;
    rEmail: string;
    instructions?: string;
  }): Promise<EmailDispatchResult> {
    if (isTestPayload(data.sEmail, data.rEmail, data.sName, data.bookingRef)) {
      console.log(`[TEST EMAIL SUPPRESSED] Skipping real email delivery for test booking: ${data.bookingRef}`);
      return { success: true, messageId: 'test-suppressed' };
    }

    if (!resend) {
      console.log(`[EMAIL DEV MODE] Admin Alert -> ${businessEmails.join(', ')} for ${data.bookingRef}`);
      return { success: true, messageId: 'dev-mode' };
    }

    try {
      const html = generateAdminBookingAlertHtml({
        ...data,
        verificationOtp: 'Encrypted in MongoDB',
        businessEmails
      });

      return await sendWithTimeoutAndRetry(() =>
        resend.emails.send({
          from: fromEmail,
          to: businessEmails,
          replyTo: data.sEmail,
          subject: `[New Booking] ${data.bookingRef} - ${data.sType} (${data.pLoc} → ${data.dLoc})`,
          html
        })
      );
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * 4. Courier Rider Assignment Notification
   * Dispatches high-priority dispatch notice to the courier rider's inbox with complete route manifest
   */
  async sendRiderAssignmentNotice(
    payloadOrEmail: RiderAssignmentEmailData | string,
    riderName?: string,
    bookingRef?: string,
    pickup?: string,
    dropoff?: string
  ): Promise<EmailDispatchResult> {
    const data: RiderAssignmentEmailData = typeof payloadOrEmail === 'object'
      ? payloadOrEmail
      : {
          riderEmail: payloadOrEmail,
          riderName: riderName || 'Courier Rider',
          riderId: 'RID-DISPATCH',
          bookingRef: bookingRef || 'BBD-ORDER',
          serviceType: 'Standard Delivery',
          pickupAddress: pickup || 'Pickup Address',
          senderName: 'Dispatch Sender',
          senderPhone: '+234 708 753 1148',
          deliveryAddress: dropoff || 'Drop-off Address',
          receiverName: 'Recipient',
          receiverPhone: '+234 708 753 1148',
          packageDescription: 'Customer Parcel',
          paymentStatus: 'Paid',
          portalUrl: 'https://bbdmobility.com.ng/rider'
        };

    const targetEmail = data.riderEmail?.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      console.warn(`[EMAIL WARNING] Rider ${data.riderName} (${data.riderId}) has no valid email address: "${targetEmail}"`);
      return { success: false, error: 'Invalid or missing rider email address' };
    }

    if (targetEmail.includes('example.com') || targetEmail.includes('@test.') || data.bookingRef?.includes('TEST')) {
      console.log(`[TEST EMAIL SUPPRESSED] Skipping rider assignment email for test address: ${targetEmail}`);
      return { success: true, messageId: 'test-suppressed' };
    }

    if (!resend) {
      console.log(`[EMAIL DEV MODE] Rider Assignment Alert -> ${targetEmail} (${data.riderName}) for order ${data.bookingRef}`);
      return { success: true, messageId: 'dev-mode' };
    }

    try {
      const html = generateRiderAssignmentEmailHtml(data);
      return await sendWithTimeoutAndRetry(() =>
        resend.emails.send({
          from: fromEmail,
          to: [targetEmail],
          replyTo: businessEmails[0] || 'Info@bbdautosng.com',
          subject: `[New Assignment] Delivery ${data.bookingRef} - ${data.serviceType || 'BBD Mobility Dispatch'}`,
          html
        })
      );
    } catch (err: any) {
      console.error(`[EMAIL ERROR] Rider assignment email dispatch exception:`, err);
      return { success: false, error: err.message };
    }
  }
};
