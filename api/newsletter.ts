import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

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
    const rawEmail = rawBody?.email;
    if (!rawEmail || typeof rawEmail !== 'string') {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const email = sanitize(rawEmail);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
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
      await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: 'Welcome to BBD Mobility Newsletter',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #092957;">
            <div style="background-color: #092957; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">BBD MOBILITY</h1>
              <p style="color: #E30620; margin: 4px 0 0 0; font-weight: bold;">Move What Matters</p>
            </div>
            <div style="padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0;">
              <h2>Thank You for Subscribing!</h2>
              <p>You are now subscribed to BBD Mobility updates, exclusive shipping tips, and special delivery promotions.</p>
              <p>Stay safe and swift with our trusted courier network.</p>
            </div>
            <div style="text-align: center; font-size: 12px; color: #64748B; padding: 16px;">
              &copy; ${new Date().getFullYear()} BBD Mobility. All rights reserved.
            </div>
          </div>
        `,
      });

      await resend.emails.send({
        from: fromEmail,
        to: businessEmails,
        subject: `[New Newsletter Subscriber] ${email}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #092957;">
            <h2>New Newsletter Subscriber</h2>
            <p>A new visitor has subscribed to the BBD Mobility newsletter:</p>
            <p style="font-size: 16px; font-weight: bold; color: #E30620;">${email}</p>
            <p style="color: #64748B; font-size: 12px;">Received on ${new Date().toLocaleString()}</p>
          </div>
        `,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you for subscribing to BBD Mobility updates!',
    });
  } catch (err: any) {
    console.error('Newsletter serverless error:', err);
    return res.status(500).json({
      error: 'Unable to process newsletter subscription. Please try again later.',
    });
  }
}
