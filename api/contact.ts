import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import {
  generateAdminContactAlertHtml,
  generateCustomerContactAckHtml,
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
    const { name, email, phone, subject, message } = rawBody;

    const sName = sanitize(name);
    const sEmail = sanitize(email);
    const sPhone = sanitize(phone);
    const sSubject = sanitize(subject) || 'General Inquiry';
    const sMessage = sanitize(message);

    if (!sName || sName.length < 2) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }
    if (!sEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!sPhone || sPhone.length < 6) {
      return res.status(400).json({ error: 'Please enter your phone number.' });
    }
    if (!sMessage || sMessage.length < 5) {
      return res.status(400).json({ error: 'Please enter your message.' });
    }

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
      // 1. Dispatch pixel-perfect admin alert
      const adminAlertHtml = generateAdminContactAlertHtml({
        name: sName,
        email: sEmail,
        phone: sPhone,
        subject: sSubject,
        message: sMessage,
        businessEmails,
      });

      const adminResult = await resend.emails.send({
        from: fromEmail,
        to: businessEmails,
        replyTo: sEmail,
        subject: `[Contact Inquiry] ${sSubject} - ${sName}`,
        html: adminAlertHtml,
      });

      if (adminResult.error) {
        console.error('[RESEND CONTACT DISPATCH ERROR]:', adminResult.error);
      } else {
        console.log(`[OK] Contact inquiry delivered to: ${businessEmails.join(', ')}`);
      }

      // 2. Dispatch customer confirmation
      if (sEmail && sEmail.includes('@')) {
        try {
          const customerAckHtml = generateCustomerContactAckHtml({
            name: sName,
            email: sEmail,
            phone: sPhone,
            subject: sSubject,
            message: sMessage,
            businessEmails,
          });

          const customerResult = await resend.emails.send({
            from: fromEmail,
            to: [sEmail],
            replyTo: businessEmails[0] || 'Info@bbdautosng.com',
            subject: `We've received your message - BBD Mobility`,
            html: customerAckHtml,
          });

          if (customerResult.error) {
            console.warn(`[CUSTOMER CONTACT ACK WARNING] (${sEmail}):`, customerResult.error);
          } else {
            console.log(`[OK] Customer contact confirmation delivered to: ${sEmail}`);
          }
        } catch (ackErr) {
          console.warn('[CUSTOMER ACK EXCEPTION]:', ackErr);
        }
      }
    } else {
      console.log(`[DEV MODE CONTACT] From: ${sName} | Targets: ${businessEmails.join(', ')}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. Our team will contact you shortly.',
      recipients: businessEmails,
    });
  } catch (err: any) {
    console.error('Contact serverless function error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to send your message. Please try again or call our hotline.',
    });
  }
}
