import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import {
  generateAdminBookingAlertHtml,
  generateCustomerBookingConfirmationHtml,
} from './emailTemplates.ts';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory rate limiting to prevent spam
const rateLimitMap = new Map<string, { count: number; firstRequestTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
    return next();
  }

  if (now - entry.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
    return next();
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment and try again.',
    });
  }

  entry.count++;
  next();
}

app.use(rateLimiter);

// HTML sanitize helper to prevent injection in emails
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

// Generate unique-style booking reference without database
function generateBookingReference(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BBD-${dateStr}-${randomPart}`;
}

// Resend client initialization
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Target emails for all incoming booking notifications
const DEFAULT_BUSINESS_EMAILS = ['Sales@bbdautosng.com', 'Info@bbdautosng.com'];
const businessEmails = process.env.BUSINESS_EMAILS
  ? process.env.BUSINESS_EMAILS.split(',').map((e) => e.trim()).filter(Boolean)
  : (process.env.BUSINESS_EMAIL ? [process.env.BUSINESS_EMAIL] : DEFAULT_BUSINESS_EMAILS);

const fromEmail = process.env.FROM_EMAIL || 'BBD Mobility <booking@bbdmobility.com.ng>';

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    resendConfigured: !!resendApiKey,
    recipientEmails: businessEmails,
    timestamp: new Date().toISOString(),
  });
});

// Newsletter subscription endpoint
app.post('/api/newsletter', async (req, res) => {
  try {
    const rawEmail = req.body?.email;
    if (!rawEmail || typeof rawEmail !== 'string') {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const email = sanitize(rawEmail);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (resend) {
      // 1. Send welcome email to subscriber
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

      // 2. Also notify business inbox about the new subscriber
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
    } else {
      console.log(`[NEWSLETTER DEV LOG] New subscriber: ${email}`);
      console.log(`Notification would be sent to: ${businessEmails.join(', ')}`);
    }

    return res.json({
      success: true,
      message: 'Thank you for subscribing to BBD Mobility updates!',
    });
  } catch (err: any) {
    console.error('Newsletter error:', err);
    return res.status(500).json({
      error: 'Unable to process newsletter subscription. Please try again later.',
    });
  }
});

// Booking submission endpoint
app.post('/api/bookings', async (req, res) => {
  try {
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
    } = req.body || {};

    // Validate required fields
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
      return res.status(400).json({ error: 'Please provide a valid email address to receive your booking confirmation.' });
    }
    if (!rName) {
      return res.status(400).json({ error: 'Please provide recipient name.' });
    }
    if (!rPhone || rPhone.length < 6) {
      return res.status(400).json({ error: 'Please provide a valid recipient phone number.' });
    }

    const bookingRef = generateBookingReference();

    // Prepare HTML content for emails
    const bookingDetailsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr style="background: #F4F6F8;">
          <td style="padding: 10px; font-weight: bold; width: 35%;">Booking Reference:</td>
          <td style="padding: 10px; font-weight: bold; color: #E30620;">${bookingRef}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Service Type:</td>
          <td style="padding: 10px;">${sType}</td>
        </tr>
        <tr style="background: #F4F6F8;">
          <td style="padding: 10px; font-weight: bold;">Pickup Location:</td>
          <td style="padding: 10px;">${pLoc}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Drop-off Location:</td>
          <td style="padding: 10px;">${dLoc}</td>
        </tr>
        <tr style="background: #F4F6F8;">
          <td style="padding: 10px; font-weight: bold;">Package Details:</td>
          <td style="padding: 10px;">${pDetails || 'Not specified'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Sender:</td>
          <td style="padding: 10px;">${sName} (${sPhone}${sEmail ? ` | ${sEmail}` : ''})</td>
        </tr>
        <tr style="background: #F4F6F8;">
          <td style="padding: 10px; font-weight: bold;">Recipient:</td>
          <td style="padding: 10px;">${rName} (${rPhone})</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Delivery Instructions:</td>
          <td style="padding: 10px;">${instructions || 'None'}</td>
        </tr>
      </table>
    `;

    // Attempt sending via Resend if configured
    if (resend) {
      // 1. Dispatch pixel-perfect booking alert to business inboxes: Sales@bbdautosng.com & Info@bbdautosng.com
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
        console.error('Resend dispatch email error:', dispatchResult.error);
      }

      // 2. Send pixel-perfect confirmation to customer
      if (sEmail && sEmail.includes('@')) {
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
          replyTo: 'Info@bbdautosng.com',
          subject: `BBD Mobility Booking Confirmation - ${bookingRef}`,
          html: customerConfirmationHtml,
        });

        if (customerResult.error) {
          console.error(`Resend customer confirmation email error (${sEmail}):`, customerResult.error);
        } else {
          console.log(`[OK] Customer confirmation email sent to: ${sEmail}`);
        }
      }
    } else {
      console.log('----------------------------------------------------');
      console.log(`[BOOKING DEV MODE] Reference: ${bookingRef}`);
      console.log(`Target Dispatch Inboxes: ${businessEmails.join(', ')}`);
      console.log(`Customer Confirmation Sent To: ${sEmail}`);
      console.log(`Service: ${sType} | From: ${pLoc} -> To: ${dLoc}`);
      console.log(`Sender: ${sName} (${sPhone}) | Receiver: ${rName} (${rPhone})`);
      console.log(`Package: ${pDetails || 'N/A'}`);
      console.log('To send real emails via Resend, set RESEND_API_KEY in .env');
      console.log('----------------------------------------------------');
    }

    return res.json({
      success: true,
      bookingReference: bookingRef,
      message: 'Booking request successfully received! Our team will contact you promptly.',
      recipients: businessEmails,
      demoMode: !resend,
    });
  } catch (err: any) {
    console.error('Booking submission error:', err);
    return res.status(500).json({
      error: 'Failed to process your delivery booking. Please check your network and try again, or call our direct line.',
    });
  }
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`BBD Mobility API server running at http://localhost:${port}`);
    console.log(`Booking notifications configured for: ${businessEmails.join(', ')}`);
    if (!resendApiKey) {
      console.log(`[NOTICE] RESEND_API_KEY is not set. Operating in development mode (logging bookings).`);
    } else {
      console.log(`[OK] Resend email notifications active.`);
    }
  });
}

export default app;
