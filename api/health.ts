import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_BUSINESS_EMAILS = ['Sales@bbdautosng.com', 'Info@bbdautosng.com'];

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

  return res.status(200).json({
    status: 'ok',
    resendConfigured: !!process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'BBD Mobility <booking@bbdmobility.com.ng>',
    recipientEmails: businessEmails,
    timestamp: new Date().toISOString(),
    environment: 'vercel-serverless',
  });
}
