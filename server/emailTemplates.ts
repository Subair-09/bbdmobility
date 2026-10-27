export interface BookingEmailData {
  bookingRef: string;
  sType: string;
  pLoc: string;
  dLoc: string;
  pDetails: string;
  sName: string;
  sPhone: string;
  sEmail?: string;
  rName: string;
  rPhone: string;
  instructions?: string;
  businessEmails: string[];
}

export function generateAdminBookingAlertHtml(
  data: BookingEmailData,
  assetsBaseUrl: string = 'https://raw.githubusercontent.com/Subair-09/bbdmobility/main/public/assets'
): string {
  const {
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
  } = data;

  const senderDisplay = `${sName} (${sPhone}${sEmail ? ` | ${sEmail}` : ''})`;
  const receiverDisplay = `${rName} (${rPhone})`;
  const instructionsDisplay = instructions || 'None';
  const packageDisplay = pDetails || 'N/A';

  const rows = [
    { icon: 'icon-tag.png', label: 'Booking Reference', value: bookingRef },
    { icon: 'icon-truck.png', label: 'Service Type', value: sType },
    { icon: 'icon-pin-pickup.png', label: 'Pickup Location', value: pLoc },
    { icon: 'icon-pin-dropoff.png', label: 'Drop-off Location', value: dLoc },
    { icon: 'icon-box.png', label: 'Package Details', value: packageDisplay },
    { icon: 'icon-sender.png', label: 'Sender', value: senderDisplay },
    { icon: 'icon-recipient.png', label: 'Recipient', value: receiverDisplay },
    { icon: 'icon-doc.png', label: 'Delivery Instructions', value: instructionsDisplay },
  ];

  const rowsHtml = rows
    .map(
      (row, index) => `
        <tr>
          <td style="padding: 6px 16px; border-bottom: ${index === rows.length - 1 ? 'none' : '1px solid #F1F5F9'}; width: 195px; vertical-align: middle;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
              <tr>
                <td style="width: 28px; vertical-align: middle; padding-right: 10px;">
                  <img src="${assetsBaseUrl}/${row.icon}" width="26" height="26" style="display: block; border-radius: 50%;" alt="${row.label}" />
                </td>
                <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #092957; white-space: nowrap;">
                  ${row.label}
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 6px 16px; border-bottom: ${index === rows.length - 1 ? 'none' : '1px solid #F1F5F9'}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; color: #334155; vertical-align: middle; line-height: 1.4;">
            ${row.value}
          </td>
        </tr>
      `
    )
    .join('');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BBD Mobility Dispatch - New Delivery Booking</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 0; margin: 0;">
        <!-- 682px Container matching exact pixel mockup -->
        <table border="0" cellpadding="0" cellspacing="0" width="682" style="width: 682px; max-width: 682px; background-color: #ffffff; margin: 0 auto;">
          
          <!-- Top Header Bar -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/email-header.png" width="682" height="74" style="display: block; width: 682px; height: 74px;" alt="BBD Mobility - Fast, Safe, Reliable" />
            </td>
          </tr>

          <!-- Hero Banner Section -->
          <tr>
            <td style="padding: 10px 25px 10px 25px; line-height: 0;">
              <img src="${assetsBaseUrl}/email-banner.png" width="632" height="192" style="display: block; width: 632px; height: 192px; border-radius: 14px;" alt="New Delivery Booking Received - BBD Mobility Dispatch" />
            </td>
          </tr>

          <!-- Booking Details Card -->
          <tr>
            <td style="padding: 0 25px 12px 25px;">
              <table border="0" cellpadding="0" cellspacing="0" width="632" style="width: 632px; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
                
                <!-- Card Header -->
                <tr>
                  <td colspan="2" style="padding: 10px 16px; background-color: #F8FAFC; border-bottom: 1px solid #EEF2F6;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left" style="vertical-align: middle;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-right: 10px; vertical-align: middle;">
                                <img src="${assetsBaseUrl}/icon-header-box.png" width="28" height="28" style="display: block;" alt="Icon" />
                              </td>
                              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 800; color: #092957; letter-spacing: 0.6px; vertical-align: middle;">
                                BOOKING DETAILS
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td align="right" style="vertical-align: middle;">
                          <table border="0" cellpadding="0" cellspacing="0" style="display: inline-table;">
                            <tr>
                              <td style="background-color: #E30620; border-radius: 6px; padding: 6px 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">
                                ${bookingRef}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Details Rows -->
                ${rowsHtml}

                <!-- Action Required Box -->
                <tr>
                  <td colspan="2" style="padding: 10px 16px 12px 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 12px; border-collapse: separate;">
                      <tr>
                        <td style="width: 50px; padding: 10px 0 10px 14px; vertical-align: middle;" align="center">
                          <img src="${assetsBaseUrl}/icon-phone.png" width="40" height="40" style="display: block; border-radius: 50%;" alt="Action Required" />
                        </td>
                        <td style="padding: 10px 14px 10px 10px; vertical-align: middle;">
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 800; color: #E30620; margin-bottom: 2px;">
                            Action Required
                          </div>
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #334155; line-height: 1.4;">
                            Please assign a courier rider and phone the customer at <strong style="color: #E30620; font-weight: 800;">${sPhone}</strong> to confirm the pickup schedule.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- 4 Guarantees Strip -->
          <tr>
            <td style="padding: 0 25px 22px 25px; line-height: 0;">
              <img src="${assetsBaseUrl}/email-guarantees.png" width="632" height="104" style="display: block; width: 632px; height: 104px; border-radius: 12px;" alt="Trusted Riders • Fast Delivery • Secure Handling • 24/7 Support" />
            </td>
          </tr>

          <!-- Navy Footer -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/email-footer.png" width="682" height="70" style="display: block; width: 682px; height: 70px;" alt="BBD Mobility Automated Dispatch System - Move What Matters" />
            </td>
          </tr>

          <!-- Bottom Diagonal Stripes -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/email-bottom-stripes.png" width="682" height="44" style="display: block; width: 682px; height: 44px;" alt="BBD Mobility Brand Stripes" />
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateCustomerBookingConfirmationHtml(
  data: BookingEmailData,
  assetsBaseUrl: string = 'https://raw.githubusercontent.com/Subair-09/bbdmobility/main/public/assets'
): string {
  const {
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
  } = data;

  const senderDisplay = `${sName} (${sPhone}${sEmail ? ` | ${sEmail}` : ''})`;
  const receiverDisplay = `${rName} (${rPhone})`;
  const instructionsDisplay = instructions || 'None';
  const packageDisplay = pDetails || 'N/A';

  const pMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pLoc)}`;
  const dMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dLoc)}`;

  const rows = [
    {
      icon: 'icon-truck.png',
      label: 'Service Type',
      value: sType,
      actionHtml: '',
    },
    {
      icon: 'icon-pin-pickup.png',
      label: 'Pickup Location',
      value: pLoc,
      actionHtml: `<a href="${pMapsUrl}" target="_blank" style="color: #0284C7; text-decoration: none; font-size: 11px; font-weight: 600; margin-left: 8px; white-space: nowrap;">&#x2197; View on Maps</a>`,
    },
    {
      icon: 'icon-pin-dropoff.png',
      label: 'Drop-off Location',
      value: dLoc,
      actionHtml: `<a href="${dMapsUrl}" target="_blank" style="color: #0284C7; text-decoration: none; font-size: 11px; font-weight: 600; margin-left: 8px; white-space: nowrap;">&#x2197; View on Maps</a>`,
    },
    {
      icon: 'icon-box.png',
      label: 'Package Details',
      value: packageDisplay,
      actionHtml: '',
    },
    {
      icon: 'icon-sender.png',
      label: 'Sender',
      value: senderDisplay,
      actionHtml: '',
    },
    {
      icon: 'icon-recipient.png',
      label: 'Recipient',
      value: receiverDisplay,
      actionHtml: '',
    },
    {
      icon: 'icon-doc.png',
      label: 'Delivery Instructions',
      value: instructionsDisplay,
      actionHtml: '',
    },
  ];

  const rowsHtml = rows
    .map(
      (row, index) => `
        <tr>
          <td style="padding: 6px 16px; border-bottom: ${index === rows.length - 1 ? 'none' : '1px solid #F1F5F9'}; width: 195px; vertical-align: middle;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
              <tr>
                <td style="width: 28px; vertical-align: middle; padding-right: 10px;">
                  <img src="${assetsBaseUrl}/${row.icon}" width="26" height="26" style="display: block; border-radius: 50%;" alt="${row.label}" />
                </td>
                <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #092957; white-space: nowrap;">
                  ${row.label}
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 6px 16px; border-bottom: ${index === rows.length - 1 ? 'none' : '1px solid #F1F5F9'}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; color: #334155; vertical-align: middle; line-height: 1.4;">
            ${row.value} ${row.actionHtml}
          </td>
        </tr>
      `
    )
    .join('');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BBD Mobility - Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 0; margin: 0;">
        <!-- 682px Container matching exact pixel mockup -->
        <table border="0" cellpadding="0" cellspacing="0" width="682" style="width: 682px; max-width: 682px; background-color: #ffffff; margin: 0 auto;">
          
          <!-- Top Header Bar (Navy with Move What Matters & Stripes) -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/customer-email-header.png" width="682" height="74" style="display: block; width: 682px; height: 74px;" alt="BBD Mobility - Move What Matters" />
            </td>
          </tr>

          <!-- Hero Section: Dynamic Greeting on Left + Courier Rider Graphic on Right -->
          <tr>
            <td style="padding: 0; background-color: #ffffff;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Left Text Column -->
                  <td style="width: 330px; padding: 18px 10px 14px 25px; vertical-align: top;">
                    <img src="${assetsBaseUrl}/customer-icon-mail.png" width="36" height="36" style="display: block; margin-bottom: 12px;" alt="Booking Notification" />
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 800; font-style: italic; color: #092957; line-height: 1.15;">
                      We've Received Your
                    </div>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 800; font-style: italic; color: #E30620; line-height: 1.15; margin-bottom: 14px;">
                      Booking Request!
                    </div>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 800; color: #092957; margin-bottom: 8px;">
                      Hello ${sName},
                    </div>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #334155; line-height: 1.5;">
                      Thank you for choosing BBD Mobility. Our dispatch team is reviewing your delivery request and our assigned rider will contact you promptly at <strong style="color: #092957; font-weight: 800;">${sPhone}</strong> to coordinate pickup.
                    </div>
                  </td>

                  <!-- Right Rider Graphic -->
                  <td style="width: 352px; padding: 0; line-height: 0; vertical-align: top;" align="right">
                    <img src="${assetsBaseUrl}/customer-rider.jpg" width="352" height="256" style="display: block; width: 352px; height: 256px;" alt="BBD Mobility Courier Rider" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Booking Details Card -->
          <tr>
            <td style="padding: 0 25px 12px 25px;">
              <table border="0" cellpadding="0" cellspacing="0" width="632" style="width: 632px; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
                
                <!-- Card Header (Dark Navy #092957) -->
                <tr>
                  <td colspan="2" style="padding: 10px 16px; background-color: #092957; border-bottom: 1px solid #092957;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left" style="vertical-align: middle;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-right: 10px; vertical-align: middle;">
                                <img src="${assetsBaseUrl}/customer-icon-cube.png" width="24" height="26" style="display: block;" alt="Icon" />
                              </td>
                              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; vertical-align: middle;">
                                Booking Details
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td align="right" style="vertical-align: middle;">
                          <table border="0" cellpadding="0" cellspacing="0" style="display: inline-table;">
                            <tr>
                              <td style="background-color: #E30620; border-radius: 6px; padding: 5px 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">
                                ${bookingRef} &nbsp;&#x2398;
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Details Rows (7 items with Maps links) -->
                ${rowsHtml}

                <!-- Need Immediate Assistance Box -->
                <tr>
                  <td colspan="2" style="padding: 10px 16px 12px 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 12px; border-collapse: separate;">
                      <tr>
                        <td style="width: 50px; padding: 10px 0 10px 14px; vertical-align: middle;" align="center">
                          <img src="${assetsBaseUrl}/icon-phone.png" width="40" height="40" style="display: block; border-radius: 50%;" alt="Assistance" />
                        </td>
                        <td style="padding: 10px 14px 10px 10px; vertical-align: middle;">
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 800; color: #E30620; margin-bottom: 2px;">
                            Need Immediate Assistance?
                          </div>
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #334155; line-height: 1.4;">
                            Call our dispatch hotline at <strong style="color: #092957; font-weight: 800;">+234 812 345 6789</strong> or reply to this email (<strong style="color: #092957; font-weight: 800;">Info@bbdautosng.com</strong>) with your reference: <strong style="color: #092957; font-weight: 800;">${bookingRef}</strong>.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- 4 Guarantees Strip -->
          <tr>
            <td style="padding: 0 25px 0 25px; line-height: 0;">
              <img src="${assetsBaseUrl}/email-guarantees.png" width="632" height="104" style="display: block; width: 632px; height: 104px; border-radius: 12px;" alt="Trusted Riders • Fast Delivery • Secure Handling • 24/7 Support" />
            </td>
          </tr>

          <!-- Customer Footer with Hotline, Email & Social Icons -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/customer-email-footer.png" width="682" height="154" style="display: block; width: 682px; height: 154px;" alt="BBD Mobility - Move What Matters" />
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface ContactEmailData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  businessEmails?: string[];
  submittedAt?: string;
}

/**
 * Generates an HTML notification email sent to the Admin / Business Inboxes
 * whenever a user submits the Contact Us form.
 */
export function generateAdminContactAlertHtml(
  data: ContactEmailData,
  assetsBaseUrl: string = 'https://raw.githubusercontent.com/Subair-09/bbdmobility/main/public/assets'
): string {
  const { name, email, phone, subject, message, businessEmails = [], submittedAt } = data;
  const timeStr = submittedAt || new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' });

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Form Inquiry - ${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #F1F5F9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="640" style="width: 100%; max-width: 640px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(9, 41, 87, 0.08); border: 1px solid #E2E8F0;">
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #092957; padding: 28px 32px; text-align: left; border-bottom: 4px solid #E30620;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; display: block;">
                      BBD MOBILITY
                    </span>
                    <span style="font-size: 11px; font-weight: 700; color: #E30620; letter-spacing: 1.5px; text-transform: uppercase;">
                      MOVE WHAT MATTERS &bull; DISPATCH DESK
                    </span>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="background-color: #E30620; color: #ffffff; font-size: 11px; font-weight: 800; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.8px; display: inline-block;">
                      New Inquiry
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title Banner -->
          <tr>
            <td style="padding: 28px 32px 10px 32px;">
              <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #092957;">
                Incoming Customer Inquiry
              </h1>
              <p style="margin: 0; font-size: 13px; color: #64748B;">
                A visitor submitted a new message through the BBD Mobility website contact form.
              </p>
            </td>
          </tr>

          <!-- Contact Details Table -->
          <tr>
            <td style="padding: 16px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; border-collapse: separate; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; width: 130px; font-size: 13px; font-weight: 700; color: #092957;">
                    Full Name:
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; font-weight: 600; color: #0F172A;">
                    ${name}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; font-weight: 700; color: #092957;">
                    Email Address:
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #E30620; font-weight: 600;">
                    <a href="mailto:${email}" style="color: #E30620; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; font-weight: 700; color: #092957;">
                    Phone Number:
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #092957; font-weight: 600;">
                    <a href="tel:${phone}" style="color: #092957; text-decoration: none;">${phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13px; font-weight: 700; color: #092957;">
                    Subject:
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; font-weight: 700; color: #092957;">
                    ${subject}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 700; color: #092957;">
                    Date &amp; Time:
                  </td>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748B;">
                    ${timeStr} (West Africa Time)
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Callout Box -->
          <tr>
            <td style="padding: 10px 32px 24px 32px;">
              <div style="font-size: 13px; font-weight: 700; color: #092957; margin-bottom: 8px;">
                Customer's Message:
              </div>
              <div style="background-color: #FFFFFF; border: 2px solid #E2E8F0; border-left: 5px solid #E30620; border-radius: 8px; padding: 18px 20px; font-size: 14px; line-height: 1.6; color: #1E293B; white-space: pre-wrap;">
${message}
              </div>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <a href="mailto:${email}?subject=Re:%20${encodeURIComponent(subject)}" style="background-color: #E30620; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 22px; border-radius: 8px; display: inline-block;">
                      Reply to ${name} &rarr;
                    </a>
                    &nbsp;&nbsp;
                    <a href="tel:${phone}" style="background-color: #092957; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 20px; border-radius: 8px; display: inline-block;">
                      Call ${phone}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Metadata -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 18px 32px; text-align: center; font-size: 11px; color: #94A3B8;">
              <p style="margin: 0 0 4px 0;">
                Delivered automatically to BBD Mobility Admin Inboxes: <strong style="color: #64748B;">${businessEmails.join(', ')}</strong>
              </p>
              <p style="margin: 0;">
                &copy; ${new Date().getFullYear()} BBD Mobility &bull; Powered by Resend API
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generates an HTML auto-acknowledgement email sent to the Customer
 * confirming that their contact message has reached BBD Mobility.
 */
export function generateCustomerContactAckHtml(
  data: ContactEmailData,
  assetsBaseUrl: string = 'https://raw.githubusercontent.com/Subair-09/bbdmobility/main/public/assets'
): string {
  const { name, subject, message } = data;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>We received your message - BBD Mobility</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #F1F5F9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="640" style="width: 100%; max-width: 640px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(9, 41, 87, 0.08); border: 1px solid #E2E8F0;">
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #092957; padding: 28px 32px; text-align: center; border-bottom: 4px solid #E30620;">
              <span style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; display: block;">
                BBD MOBILITY
              </span>
              <span style="font-size: 11px; font-weight: 700; color: #E30620; letter-spacing: 1.5px; text-transform: uppercase;">
                MOVE WHAT MATTERS
              </span>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #092957;">
                Thank You for Contacting Us, ${name}!
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                We have successfully received your inquiry regarding <strong style="color: #092957;">"${subject}"</strong>. Our logistics and customer support team in Lagos is reviewing your note and will be in touch shortly.
              </p>
              
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #092957; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748B; margin-bottom: 6px;">
                  Summary of your message:
                </div>
                <div style="font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-wrap;">
${message}
                </div>
              </div>

              <!-- Urgent Contact Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 10px; margin-top: 24px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <div style="font-size: 13px; font-weight: 800; color: #E30620; margin-bottom: 4px;">
                      Need Urgent Same-Day Delivery?
                    </div>
                    <div style="font-size: 12px; color: #475569; line-height: 1.5;">
                      For urgent dispatch requests, call our hotline directly at <a href="tel:+2348123456789" style="color: #092957; font-weight: 800; text-decoration: none;">+234 812 345 6789</a> or email us at <a href="mailto:Info@bbdautosng.com" style="color: #E30620; font-weight: 700; text-decoration: none;">Info@bbdautosng.com</a>.
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 32px; text-align: center; font-size: 11px; color: #94A3B8;">
              <p style="margin: 0 0 6px 0; color: #64748B; font-weight: 600;">
                BBD Mobility &bull; Fast &bull; Safe &bull; Reliable Logistics Across Lagos
              </p>
              <p style="margin: 0;">
                &copy; ${new Date().getFullYear()} BBD Mobility. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

