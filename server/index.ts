import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import {
  generateAdminBookingAlertHtml,
  generateCustomerBookingConfirmationHtml,
  generateReceiverDeliveryHtml,
  generateAdminContactAlertHtml,
  generateCustomerContactAckHtml,
  generateSubscriberWelcomeHtml,
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

// Generate 6-digit random OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Resend client initialization
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Target admin emails for all incoming bookings, inquiries, and contact messages
// Automatically supports ADMIN_EMAILS, ADMIN_EMAIL, BUSINESS_EMAILS, BUSINESS_EMAIL, CONTACT_EMAILS, CONTACT_EMAIL
const DEFAULT_BUSINESS_EMAILS = ['Sales@bbdautosng.com', 'Info@bbdautosng.com'];
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
      // 1. Send pixel-perfect welcome email to subscriber
      const subscriberHtml = generateSubscriberWelcomeHtml(email);
      await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: 'Welcome to BBD Mobility Updates',
        html: subscriberHtml,
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

// Contact form message submission endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};
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

    if (resend) {
      // 1. Generate and send high-fidelity notification email to Admin / Business Inboxes
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
        console.error('[RESEND CONTACT INQUIRY ERROR]:', adminResult.error);
      } else {
        console.log(`[OK] Contact inquiry delivered to admin inboxes (${businessEmails.join(', ')}): id=${adminResult.data?.id}`);
      }

      // 2. Also send automated professional acknowledgement to the customer
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
            console.log(`[OK] Customer contact acknowledgement delivered to: ${sEmail}`);
          }
        } catch (ackErr) {
          console.warn('[CUSTOMER ACK EXCEPTION]:', ackErr);
        }
      }
    } else {
      console.log('----------------------------------------------------');
      console.log(`[CONTACT FORM DEV LOG] New Contact Message Received:`);
      console.log(`From: ${sName} | Email: ${sEmail} | Phone: ${sPhone}`);
      console.log(`Subject: ${sSubject}`);
      console.log(`Message: ${sMessage}`);
      console.log(`Target Admin Inboxes: ${businessEmails.join(', ')}`);
      console.log('To send real emails via Resend, set RESEND_API_KEY in .env');
      console.log('----------------------------------------------------');
    }

    return res.json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. Our team will contact you shortly.',
      recipients: businessEmails,
    });
  } catch (err: any) {
    console.error('Contact submission error:', err);
    return res.status(500).json({
      error: 'Failed to send your message. Please try again or call our direct line.',
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
      receiverEmail,
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
    const rEmail = sanitize(receiverEmail);
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
      return res.status(400).json({ error: 'Please provide a valid sender email address.' });
    }
    if (!rName) {
      return res.status(400).json({ error: 'Please provide recipient name.' });
    }
    if (!rPhone || rPhone.length < 6) {
      return res.status(400).json({ error: 'Please provide a valid recipient phone number.' });
    }
    if (!rEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rEmail)) {
      return res.status(400).json({ error: 'Please provide a valid recipient email address for delivery verification.' });
    }

    const bookingRef = generateBookingReference();

    // Generate distinct, dynamic 6-digit OTPs for Sender (pickup) and Receiver (delivery)
    const pickupOtp = generateOtp();
    let deliveryOtp = generateOtp();
    while (deliveryOtp === pickupOtp) {
      deliveryOtp = generateOtp();
    }

    const emailData = {
      bookingRef,
      pickupOtp,
      deliveryOtp,
      sType,
      pLoc,
      dLoc,
      pDetails,
      sName,
      sPhone,
      sEmail,
      rName,
      rPhone,
      rEmail,
      instructions,
      businessEmails,
    };

    // Attempt sending via Resend if configured
    if (resend) {
      // 1. Dispatch Admin Alert Email with both OTPs
      try {
        const adminAlertHtml = generateAdminBookingAlertHtml(emailData);
        const dispatchResult = await resend.emails.send({
          from: fromEmail,
          to: businessEmails,
          replyTo: sEmail && sEmail.includes('@') ? sEmail : undefined,
          subject: `[New Booking] ${bookingRef} - ${sType} (${pLoc} → ${dLoc})`,
          html: adminAlertHtml,
        });

        if (dispatchResult.error) {
          console.error('Resend dispatch email error:', dispatchResult.error);
        } else {
          console.log(`[OK] Booking alert sent to: ${businessEmails.join(', ')}`);
        }
      } catch (adminErr) {
        console.error('Resend admin dispatch exception:', adminErr);
      }

      // 2. Dispatch Customer Confirmation with Pickup OTP to Sender
      if (sEmail && sEmail.includes('@')) {
        try {
          const customerConfirmationHtml = generateCustomerBookingConfirmationHtml(emailData);
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
        } catch (custErr) {
          console.error('Resend customer email exception:', custErr);
        }
      }

      // 3. Dispatch Delivery Notice with Delivery Verification OTP to Recipient
      if (rEmail && rEmail.includes('@')) {
        try {
          const receiverDeliveryHtml = generateReceiverDeliveryHtml(emailData);
          const receiverResult = await resend.emails.send({
            from: fromEmail,
            to: [rEmail],
            replyTo: 'Info@bbdautosng.com',
            subject: `BBD Mobility Delivery Notice - Verification Code: ${deliveryOtp} (${bookingRef})`,
            html: receiverDeliveryHtml,
          });

          if (receiverResult.error) {
            console.error(`Resend receiver email error (${rEmail}):`, receiverResult.error);
          } else {
            console.log(`[OK] Receiver delivery verification email delivered to: ${rEmail}`);
          }
        } catch (recErr) {
          console.error('Resend receiver email exception:', recErr);
        }
      }
    } else {
      console.log('----------------------------------------------------');
      console.log(`[BOOKING DEV MODE] Reference: ${bookingRef}`);
      console.log(`Target Dispatch Inboxes: ${businessEmails.join(', ')}`);
      console.log(`Sender: ${sName} (${sPhone} | ${sEmail}) -> Pickup OTP: ${pickupOtp}`);
      console.log(`Receiver: ${rName} (${rPhone} | ${rEmail}) -> Delivery OTP: ${deliveryOtp}`);
      console.log(`Service: ${sType} | From: ${pLoc} -> To: ${dLoc}`);
      console.log(`Package: ${pDetails || 'N/A'}`);
      console.log('To send real emails via Resend, set RESEND_API_KEY in .env');
      console.log('----------------------------------------------------');
    }

    return res.json({
      success: true,
      bookingReference: bookingRef,
      pickupOtp,
      deliveryOtp,
      message: 'Booking request successfully received! Confirmation and OTP codes have been dispatched.',
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
