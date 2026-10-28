import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

interface ContactEmailData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  businessEmails?: string[];
  submittedAt?: string;
}

function generateAdminContactAlertHtml(
  data: ContactEmailData,
  assetsBaseUrl: string = 'https://raw.githubusercontent.com/Subair-09/bbdmobility/main/public/assets'
): string {
  const { name, email, phone, subject, message, submittedAt } = data;
  const timeStr = submittedAt || new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' });
  const firstName = (name || 'Customer').trim().split(' ')[0];

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Incoming Customer Inquiry - ${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F6F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #F4F6F8; margin: 0; padding: 20px 0;">
    <tr>
      <td align="center" style="margin: 0; padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="682" style="width: 682px; max-width: 682px; background-color: #F4F6F8; margin: 0 auto;">
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/contact-email-header.png" width="682" height="105" style="display: block; width: 682px; height: 105px;" alt="BBD Mobility - Move What Matters" />
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 28px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 18px rgba(9, 41, 87, 0.04);">
                <tr>
                  <td style="padding: 28px 28px 26px 28px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width: 54px; vertical-align: top;">
                          <img src="${assetsBaseUrl}/icon-contact-mail-circle.png" width="52" height="52" style="display: block;" alt="Mail Icon" />
                        </td>
                        <td style="padding-left: 14px; vertical-align: top;">
                          <h2 style="margin: 0 0 4px 0; font-size: 21px; font-weight: 800; color: #092957; letter-spacing: -0.2px; line-height: 1.2;">
                            Incoming Customer Inquiry
                          </h2>
                          <p style="margin: 0; font-size: 13px; color: #64748B; line-height: 1.4;">
                            A visitor submitted a new message through the BBD Mobility website contact form.
                          </p>
                        </td>
                        <td align="right" style="vertical-align: top; width: 125px;">
                          <img src="${assetsBaseUrl}/pill-new-inquiry.png" width="118" height="32" style="display: block;" alt="New Inquiry" />
                        </td>
                      </tr>
                    </table>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; border-collapse: separate; overflow: hidden;">
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; width: 24px; vertical-align: middle;">
                          <img src="${assetsBaseUrl}/icon-contact-user.png" width="20" height="20" style="display: block;" alt="Name" />
                        </td>
                        <td style="padding: 12px 6px; border-bottom: 1px solid #E2E8F0; width: 135px; font-size: 13px; font-weight: 700; color: #64748B; vertical-align: middle;">
                          Full Name:
                        </td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 14px; font-weight: 700; color: #0F172A; vertical-align: middle;">
                          ${name}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; width: 24px; vertical-align: middle;">
                          <img src="${assetsBaseUrl}/icon-contact-email.png" width="20" height="20" style="display: block;" alt="Email" />
                        </td>
                        <td style="padding: 12px 6px; border-bottom: 1px solid #E2E8F0; width: 135px; font-size: 13px; font-weight: 700; color: #64748B; vertical-align: middle;">
                          Email Address:
                        </td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 14px; vertical-align: middle;">
                          <a href="mailto:${email}" style="color: #0284C7; text-decoration: underline; font-weight: 600;">${email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; width: 24px; vertical-align: middle;">
                          <img src="${assetsBaseUrl}/icon-contact-phone.png" width="20" height="20" style="display: block;" alt="Phone" />
                        </td>
                        <td style="padding: 12px 6px; border-bottom: 1px solid #E2E8F0; width: 135px; font-size: 13px; font-weight: 700; color: #64748B; vertical-align: middle;">
                          Phone Number:
                        </td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 14px; font-weight: 700; color: #0F172A; vertical-align: middle;">
                          <a href="tel:${phone}" style="color: #0F172A; text-decoration: none;">${phone}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; width: 24px; vertical-align: middle;">
                          <img src="${assetsBaseUrl}/icon-contact-subject.png" width="20" height="20" style="display: block;" alt="Subject" />
                        </td>
                        <td style="padding: 12px 6px; border-bottom: 1px solid #E2E8F0; width: 135px; font-size: 13px; font-weight: 700; color: #64748B; vertical-align: middle;">
                          Subject:
                        </td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0; font-size: 14px; font-weight: 600; color: #0F172A; vertical-align: middle;">
                          ${subject}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; width: 24px; vertical-align: middle;">
                          <img src="${assetsBaseUrl}/icon-contact-calendar.png" width="20" height="20" style="display: block;" alt="Date" />
                        </td>
                        <td style="padding: 12px 6px; width: 135px; font-size: 13px; font-weight: 700; color: #64748B; vertical-align: middle;">
                          Date &amp; Time:
                        </td>
                        <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #334155; vertical-align: middle;">
                          ${timeStr} (West Africa Time)
                        </td>
                      </tr>
                    </table>

                    <div style="margin-top: 20px; background-color: #F1F5F9; border-radius: 12px; padding: 18px 20px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="width: 32px; vertical-align: middle;">
                            <img src="${assetsBaseUrl}/icon-contact-chat.png" width="26" height="26" style="display: block;" alt="Chat" />
                          </td>
                          <td style="font-size: 14px; font-weight: 700; color: #092957; vertical-align: middle; padding-left: 8px;">
                            Customer's Message:
                          </td>
                        </tr>
                      </table>
                      <div style="margin-top: 10px; font-size: 14px; font-weight: 600; color: #0F172A; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">
${message}
                      </div>
                    </div>

                    <div style="margin-top: 24px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td width="50%" style="padding-right: 8px; vertical-align: middle;">
                            <a href="mailto:${email}?subject=Re:%20${encodeURIComponent(subject)}" style="background-color: #E30620; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 20px; border-radius: 10px; display: block; text-align: center; box-sizing: border-box;">
                              &#x21A9;&nbsp; Reply to ${firstName} &rarr;
                            </a>
                          </td>
                          <td width="50%" style="padding-left: 8px; vertical-align: middle;">
                            <a href="tel:${phone}" style="background-color: #FFFFFF; color: #092957; border: 1.5px solid #092957; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 20px; border-radius: 10px; display: block; text-align: center; box-sizing: border-box;">
                              &#x1F4DE;&nbsp; Call ${phone}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/admin-email-footer.png" width="682" height="278" style="display: block; width: 682px; height: 278px;" alt="Footer" />
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateCustomerContactAckHtml(
  data: ContactEmailData,
  assetsBaseUrl: string = 'https://raw.githubusercontent.com/Subair-09/bbdmobility/main/public/assets'
): string {
  const { name, subject, message } = data;
  const upperName = (name || 'Valued Customer').trim().toUpperCase();

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thank You for Contacting Us - BBD Mobility</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F6F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #F4F6F8; margin: 0; padding: 20px 0;">
    <tr>
      <td align="center" style="margin: 0; padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="682" style="width: 682px; max-width: 682px; background-color: #FFFFFF; margin: 0 auto; box-shadow: 0 4px 20px rgba(9, 41, 87, 0.05);">
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/contact-email-header.png" width="682" height="105" style="display: block; width: 682px; height: 105px;" alt="BBD Mobility" />
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 28px 36px; text-align: center;">
              <div style="margin: 0 auto 16px auto; text-align: center; line-height: 0;">
                <img src="${assetsBaseUrl}/customer-contact-check.png" width="122" height="60" style="display: inline-block; margin: 0 auto;" alt="Success" />
              </div>
              <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800; color: #092957; line-height: 1.25;">
                Thank You for Contacting Us,
              </h1>
              <div style="font-size: 26px; font-weight: 900; color: #E30620; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 18px;">
                ${upperName}!
              </div>
              <p style="margin: 0 auto; max-width: 530px; font-size: 14px; line-height: 1.6; color: #334155;">
                We have successfully received your inquiry regarding <strong style="color: #092957;">"${subject}"</strong>. Our logistics and customer support team in <strong style="color: #092957;">Lagos</strong> is reviewing your note and will be in touch shortly.
              </p>
              <div style="margin: 28px 0 20px 0; background-color: #F1F5F9; border-radius: 14px; padding: 20px 24px; text-align: left;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="width: 70px; vertical-align: top;">
                      <img src="${assetsBaseUrl}/icon-summary-chat.png" width="60" height="46" style="display: block;" alt="Chat" />
                    </td>
                    <td style="padding-left: 14px; vertical-align: top;">
                      <div style="font-size: 15px; font-weight: 800; color: #092957; margin-bottom: 8px;">
                        Summary of your message:
                      </div>
                      <div style="background-color: #E2E8F0; border-radius: 8px; padding: 12px 18px; font-size: 13px; font-weight: 600; color: #1E293B; line-height: 1.5; white-space: pre-wrap; word-break: break-word;">
${message}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
              <div style="margin: 16px 0 28px 0; background-color: #FEF2F2; border-radius: 14px; padding: 18px 24px; text-align: left;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="width: 80px; vertical-align: middle;">
                      <img src="${assetsBaseUrl}/icon-urgent-phone.png" width="76" height="58" style="display: block;" alt="Urgent Phone" />
                    </td>
                    <td style="padding-left: 16px; border-left: 2px solid #E30620; vertical-align: middle;">
                      <div style="font-size: 15px; font-weight: 800; color: #E30620; margin-bottom: 4px;">
                        Need Urgent Same-Day Delivery?
                      </div>
                      <div style="font-size: 13px; color: #334155; line-height: 1.5;">
                        For urgent dispatch requests, call our hotline directly at <a href="tel:+2347087531198" style="color: #E30620; font-weight: 800; text-decoration: none;">+234 708 753 1198</a> or email us at <a href="mailto:Info@bbdautosng.com" style="color: #0284C7; font-weight: 700; text-decoration: underline;">Info@bbdautosng.com</a>.
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
              <div style="margin: 0 auto; text-align: center; line-height: 0;">
                <img src="${assetsBaseUrl}/customer-contact-guarantees.png" width="622" height="104" style="display: block; width: 622px; height: 104px; margin: 0 auto;" alt="Guarantees" />
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/customer-contact-footer.png" width="682" height="170" style="display: block; width: 682px; height: 170px;" alt="Footer" />
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
