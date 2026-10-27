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

function generateSubscriberWelcomeHtml(
  email: string,
  assetsBaseUrl: string = 'https://raw.githubusercontent.com/Subair-09/bbdmobility/main/public/assets'
): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to BBD Mobility Newsletter</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F6F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #F4F6F8; margin: 0; padding: 20px 0;">
    <tr>
      <td align="center" style="margin: 0; padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="682" style="width: 682px; max-width: 682px; background-color: #FFFFFF; margin: 0 auto; box-shadow: 0 4px 20px rgba(9, 41, 87, 0.05);">
          
          <!-- Top Header Bar -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/newsletter-email-header.png" width="682" height="162" style="display: block; width: 682px; height: 162px;" alt="BBD Mobility - Move What Matters" />
            </td>
          </tr>

          <!-- Main Content Section -->
          <tr>
            <td style="padding: 32px 36px 20px 36px; text-align: center;">
              
              <!-- Celebration Envelope Icon -->
              <div style="margin: 0 auto 16px auto; text-align: center; line-height: 0;">
                <img src="${assetsBaseUrl}/newsletter-icon-envelope.png" width="170" height="90" style="display: inline-block; margin: 0 auto;" alt="Subscription Confirmed" />
              </div>

              <!-- Main Heading: Thank You for Subscribing! -->
              <h1 style="margin: 0 0 4px 0; font-size: 28px; font-weight: 800; color: #092957; line-height: 1.25;">
                Thank You for
              </h1>
              <div style="font-size: 34px; font-weight: 900; color: #E30620; letter-spacing: -0.5px; margin-bottom: 16px;">
                Subscribing!
              </div>

              <!-- Introductory Paragraphs -->
              <p style="margin: 0 auto 8px auto; max-width: 530px; font-size: 14px; line-height: 1.6; color: #1E293B; font-weight: 500;">
                You are now subscribed to <strong style="color: #092957;">BBD Mobility updates</strong>, exclusive shipping tips, and special delivery promotions.
              </p>
              <p style="margin: 0 auto; max-width: 530px; font-size: 13px; line-height: 1.5; color: #64748B;">
                Stay safe and swift with our trusted courier network.
              </p>

              <!-- 4 Feature Cards Container -->
              <div style="margin: 24px auto 0 auto; text-align: center; line-height: 0;">
                <img src="${assetsBaseUrl}/newsletter-features-card.png" width="632" height="182" style="display: block; width: 632px; height: 182px; margin: 0 auto;" alt="Latest Updates • Shipping Tips • Special Promotions • Trusted Delivery" />
              </div>

            </td>
          </tr>

          <!-- Middle Partner Banner ("More Than Delivery. We're a Partner in Your Journey.") -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/newsletter-partner-banner.png" width="682" height="197" style="display: block; width: 682px; height: 197px;" alt="More Than Delivery. We're a Partner in Your Journey." />
            </td>
          </tr>

          <!-- Bottom Navy Footer -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/newsletter-email-footer.png" width="682" height="139" style="display: block; width: 682px; height: 139px;" alt="BBD Mobility - Fast • Safe • Reliable Logistics Across Lagos" />
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
      // 1. Send pixel-perfect welcome email to subscriber
      const subscriberHtml = generateSubscriberWelcomeHtml(email);
      const subResult = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: 'Welcome to BBD Mobility Updates',
        html: subscriberHtml,
      });

      if (subResult.error) {
        console.warn(`[NEWSLETTER WELCOME WARNING] (${email}):`, subResult.error);
      } else {
        console.log(`[OK] Newsletter welcome delivered to: ${email}`);
      }

      // 2. Also notify business inboxes about the new subscriber
      try {
        await resend.emails.send({
          from: fromEmail,
          to: businessEmails,
          replyTo: email,
          subject: `[New Newsletter Subscriber] ${email}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #092957;">
              <h2>New Newsletter Subscriber</h2>
              <p>A new visitor has subscribed to the BBD Mobility newsletter:</p>
              <p style="font-size: 16px; font-weight: bold; color: #E30620;">${email}</p>
              <p style="color: #64748B; font-size: 12px;">Received on ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}</p>
            </div>
          `,
        });
      } catch (adminErr) {
        console.warn('[NEWSLETTER ADMIN NOTIFY EXCEPTION]:', adminErr);
      }
    } else {
      console.log(`[DEV MODE NEWSLETTER] New subscriber: ${email} | Targets: ${businessEmails.join(', ')}`);
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
