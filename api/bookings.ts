import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import {
  generateAdminBookingAlertHtml,
  generateCustomerBookingConfirmationHtml,
} from './_emailTemplates';

function sanitize(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

function generateBookingReference(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BBD-${dateStr}-${randomPart}`;
}

const DEFAULT_BUSINESS_EMAILS = ['Sales@bbdautosng.com', 'Info@bbdautosng.com'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawBody = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const {
      serviceType,
      pickupLocation,
      dropoffLocation,
      packageDetails,
      senderName,
      senderPhone,
      senderEmail,
      receiverName,
      receiverPhone,
      deliveryInstructions,
    } = rawBody;

    const sType = sanitize(serviceType);
    const pLoc = sanitize(pickupLocation);
    const dLoc = sanitize(dropoffLocation);
    const pDetails = sanitize(packageDetails);
    const sName = sanitize(senderName);
    const sPhone = sanitize(senderPhone);
    const sEmail = sanitize(senderEmail);
    const rName = sanitize(receiverName);
    const rPhone = sanitize(receiverPhone);
    const instructions = sanitize(deliveryInstructions);

    if (!sType) {
      return res.status(400).json({ error: 'Please select a service type.' });
    }
    if (!pLoc || pLoc.length < 3) {
      return res.status(400).json({ error: 'Please enter a valid pickup address.' });
    }
    if (!dLoc || dLoc.length < 3) {
      return res.status(400).json({ error: 'Please enter a valid drop-off address.' });
    }
    if (!sName) {
      return res.status(400).json({ error: 'Please provide sender name.' });
    }
    if (!sPhone || sPhone.length < 6) {
      return res.status(400).json({ error: 'Please provide a valid sender phone number.' });
    }
    if (!sEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address to receive your confirmation.' });
    }
    if (!rName) {
      return res.status(400).json({ error: 'Please provide recipient name.' });
    }
    if (!rPhone || rPhone.length < 6) {
      return res.status(400).json({ error: 'Please provide a valid recipient phone number.' });
    }

    const bookingRef = generateBookingReference();

    // Target Admin emails
    const rawAdminEmails =
      process.env.ADMIN_EMAILS ||
      process.env.ADMIN_EMAIL ||
      process.env.BUSINESS_EMAILS ||
      process.env.BUSINESS_EMAIL ||
      process.env.CONTACT_EMAILS ||
      process.env.CONTACT_EMAIL;

    const businessEmails: string[] = rawAdminEmails
      ? rawAdminEmails
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e.length > 0 && e.includes('@'))
      : DEFAULT_BUSINESS_EMAILS;

    const fromEmail = process.env.FROM_EMAIL || 'BBD Mobility <booking@bbdmobility.com.ng>';
    const resendApiKey = process.env.RESEND_API_KEY;
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    if (resend) {
      // 1. Dispatch booking alert to business inboxes
      const adminAlertHtml = generateAdminBookingAlertHtml({
        bookingRef,
        sType,
        pLoc,
        dLoc,
        pDetails,
        sName,
        sPhone,
        sEmail,
        rName,
        rPhone,
        instructions,
        businessEmails,
      });

      const dispatchResult = await resend.emails.send({
        from: fromEmail,
        to: businessEmails,
        replyTo: sEmail && sEmail.includes('@') ? sEmail : undefined,
        subject: `[New Booking] ${bookingRef} - ${sType} (${pLoc} → ${dLoc})`,
        html: adminAlertHtml,
      });

      if (dispatchResult.error) {
        console.error('[RESEND DISPATCH ERROR]:', dispatchResult.error);
      } else {
        console.log(`[OK] Booking alert sent to: ${businessEmails.join(', ')}`);
      }

      // 2. Send confirmation to customer
      if (sEmail && sEmail.includes('@')) {
        try {
          const customerConfirmationHtml = generateCustomerBookingConfirmationHtml({
            bookingRef,
            sType,
            pLoc,
            dLoc,
            pDetails,
            sName,
            sPhone,
            sEmail,
            rName,
            rPhone,
            instructions,
            businessEmails,
          });

          const customerResult = await resend.emails.send({
            from: fromEmail,
            to: [sEmail],
            replyTo: businessEmails[0] || 'Info@bbdautosng.com',
            subject: `BBD Mobility Booking Confirmation - ${bookingRef}`,
            html: customerConfirmationHtml,
          });

          if (customerResult.error) {
            console.warn(`[CUSTOMER CONFIRMATION WARNING] (${sEmail}):`, customerResult.error);
          } else {
            console.log(`[OK] Customer confirmation delivered to: ${sEmail}`);
          }
        } catch (custErr) {
          console.warn('[CUSTOMER EMAIL EXCEPTION]:', custErr);
        }
      }
    } else {
      console.log(`[DEV MODE] Booking received: ${bookingRef} | Targets: ${businessEmails.join(', ')}`);
    }

    return res.status(200).json({
      success: true,
      bookingReference: bookingRef,
      message: 'Booking request successfully received! Our team will contact you promptly.',
      recipients: businessEmails,
      demoMode: !resend,
    });
  } catch (err: any) {
    console.error('Booking serverless function error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to process your delivery booking. Please call our hotline.',
    });
  }
}
