export interface BookingEmailData {
  bookingRef: string;
  pickupOtp: string;
  deliveryOtp: string;
  sType: string;
  pLoc: string;
  dLoc: string;
  pDetails: string;
  sName: string;
  sPhone: string;
  sEmail?: string;
  rName: string;
  rPhone: string;
  rEmail?: string;
  instructions?: string;
  businessEmails: string[];
}

export function generateAdminBookingAlertHtml(
  data: BookingEmailData,
  assetsBaseUrl: string = 'https://raw.githubusercontent.com/Subair-09/bbdmobility/main/public/assets'
): string {
  const {
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
  } = data;

  const senderDisplay = `${sName} (${sPhone}${sEmail ? ` | ${sEmail}` : ''})`;
  const receiverDisplay = `${rName} (${rPhone}${rEmail ? ` | ${rEmail}` : ''})`;
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
    {
      icon: 'receiver-icon-otp.png',
      label: 'Sender Pickup OTP',
      value: `<span style="font-family: monospace; font-size: 14px; font-weight: 800; color: #092957; background: #E0F2FE; padding: 4px 10px; border-radius: 6px; letter-spacing: 2px;">${pickupOtp}</span> <span style="font-size: 11px; color: #64748B;">(share at pickup)</span>`
    },
    {
      icon: 'receiver-icon-otp.png',
      label: 'Receiver Delivery OTP',
      value: `<span style="font-family: monospace; font-size: 14px; font-weight: 800; color: #E30620; background: #FEE2E2; padding: 4px 10px; border-radius: 6px; letter-spacing: 2px;">${deliveryOtp}</span> <span style="font-size: 11px; color: #64748B;">(verify at delivery)</span>`
    },
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
                            Assign a courier rider. Phone the customer at <strong style="color: #E30620; font-weight: 800;">${sPhone}</strong> to confirm pickup.
                            Sender Pickup OTP: <strong style="color: #092957; font-family: monospace;">${pickupOtp}</strong> | Recipient Delivery OTP: <strong style="color: #E30620; font-family: monospace;">${deliveryOtp}</strong>.
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
    pickupOtp,
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
  } = data;

  const senderDisplay = `${sName} (${sPhone}${sEmail ? ` | ${sEmail}` : ''})`;
  const receiverDisplay = `${rName} (${rPhone}${rEmail ? ` | ${rEmail}` : ''})`;
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
      icon: 'receiver-icon-otp.png',
      label: 'Your Pickup OTP',
      value: `<span style="font-family: monospace; font-size: 15px; font-weight: 800; color: #092957; background: #E0F2FE; padding: 4px 12px; border-radius: 6px; letter-spacing: 2px;">${pickupOtp}</span> <span style="font-size: 11px; color: #0284C7; font-weight: 600; margin-left: 6px;">Share with rider upon pickup</span>`,
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
                      Thank you for choosing BBD Mobility. Our dispatch team is assigning your rider. Please keep your Pickup OTP (<strong style="color: #092957; font-family: monospace;">${pickupOtp}</strong>) ready to give to the rider upon collection. A separate Delivery OTP has been dispatched to recipient <strong>${rName}</strong>.
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

export function generateReceiverDeliveryHtml(
  data: BookingEmailData,
  assetsBaseUrl: string = 'https://raw.githubusercontent.com/Subair-09/bbdmobility/main/public/assets'
): string {
  const {
    bookingRef,
    deliveryOtp,
    sType,
    pLoc,
    dLoc,
    pDetails,
    sName,
    sPhone,
  } = data;

  const otpFormatted = deliveryOtp.split('').join(' ');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BBD Mobility - Delivery Verification Code (${bookingRef})</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; -webkit-font-smoothing: antialiased; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #F8FAFC;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="682" style="width: 682px; max-width: 682px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); margin: 0 auto;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/receiver-email-header.png" width="682" height="106" style="display: block; width: 682px; height: 106px;" alt="BBD Mobility - Reliable Courier & Delivery Services in Lagos" />
            </td>
          </tr>

          <!-- Hero Banner -->
          <tr>
            <td style="padding: 10px 20px 14px 20px; line-height: 0;">
              <img src="${assetsBaseUrl}/receiver-email-hero.png" width="642" height="228" style="display: block; width: 642px; height: 228px; border-radius: 14px;" alt="Your Delivery is on the Way!" />
            </td>
          </tr>

          <!-- Booking Reference & OTP + Delivery Details Card -->
          <tr>
            <td style="padding: 0 20px 14px 20px;">
              <table border="0" cellpadding="0" cellspacing="0" width="642" style="width: 642px; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; border-collapse: separate; border-spacing: 0;">
                
                <!-- Reference and OTP Row -->
                <tr>
                  <!-- Left: Booking Reference -->
                  <td style="width: 320px; padding: 18px 20px; vertical-align: top; border-bottom: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width: 44px; vertical-align: middle; padding-right: 10px;">
                          <img src="${assetsBaseUrl}/receiver-icon-ref.png" width="34" height="36" style="display: block;" alt="Reference Icon" />
                        </td>
                        <td style="vertical-align: middle;">
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 600; color: #64748B;">
                            Booking Reference
                          </div>
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 800; color: #092957; letter-spacing: 0.5px; margin-top: 2px;">
                            ${bookingRef}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 8px;">
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #64748B;">
                            Keep this reference for your records.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Right: Delivery Verification OTP -->
                  <td style="width: 322px; padding: 18px 20px; vertical-align: top; border-bottom: 1px solid #E2E8F0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width: 44px; vertical-align: middle; padding-right: 10px;">
                          <img src="${assetsBaseUrl}/receiver-icon-otp.png" width="34" height="36" style="display: block;" alt="OTP Shield" />
                        </td>
                        <td style="vertical-align: middle;">
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 600; color: #64748B;">
                            Delivery Verification OTP
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 10px;">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #EBF5FF; border-radius: 8px;">
                            <tr>
                              <td align="center" style="padding: 8px 12px;">
                                <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace, sans-serif; font-size: 22px; font-weight: 800; color: #092957; letter-spacing: 8px; display: inline-block;">
                                  ${otpFormatted}
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 8px;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="vertical-align: middle; padding-right: 5px; font-size: 13px; color: #64748B; line-height: 1;">
                                &#x1F552;
                              </td>
                              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #64748B; line-height: 1.3;">
                                This code is valid for 30 minutes and can only be used once.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Details Header -->
                <tr>
                  <td colspan="2" style="padding: 16px 20px 10px 20px;">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 800; color: #092957;">
                      Delivery Details
                    </div>
                  </td>
                </tr>

                <!-- 2x3 Grid of Delivery Details -->
                <tr>
                  <td colspan="2" style="padding: 0 20px 18px 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <!-- Row 1 -->
                      <tr>
                        <!-- Sender -->
                        <td style="width: 50%; padding: 8px 12px 8px 0; vertical-align: top;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 42px; vertical-align: middle; padding-right: 8px;">
                                <img src="${assetsBaseUrl}/receiver-icon-shipper.png" width="34" height="34" style="display: block;" alt="Shipper" />
                              </td>
                              <td style="vertical-align: middle;">
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #64748B;">
                                  Sender (Shipper)
                                </div>
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #092957; margin-top: 1px;">
                                  ${sName}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <!-- Rider Pickup Location -->
                        <td style="width: 50%; padding: 8px 0 8px 12px; vertical-align: top;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 42px; vertical-align: middle; padding-right: 8px;">
                                <img src="${assetsBaseUrl}/receiver-icon-loc.png" width="34" height="34" style="display: block;" alt="Location" />
                              </td>
                              <td style="vertical-align: middle;">
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #64748B;">
                                  Rider Pickup Location
                                </div>
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #092957; margin-top: 1px;">
                                  ${pLoc}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Row 2 -->
                      <tr>
                        <!-- Sender Phone -->
                        <td style="width: 50%; padding: 8px 12px 8px 0; vertical-align: top;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 42px; vertical-align: middle; padding-right: 8px;">
                                <img src="${assetsBaseUrl}/receiver-icon-phone.png" width="34" height="34" style="display: block;" alt="Phone" />
                              </td>
                              <td style="vertical-align: middle;">
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #64748B;">
                                  Sender Phone
                                </div>
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #092957; margin-top: 1px;">
                                  ${sPhone}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <!-- Delivery Address -->
                        <td style="width: 50%; padding: 8px 0 8px 12px; vertical-align: top;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 42px; vertical-align: middle; padding-right: 8px;">
                                <img src="${assetsBaseUrl}/receiver-icon-dest.png" width="34" height="34" style="display: block;" alt="Destination" />
                              </td>
                              <td style="vertical-align: middle;">
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #64748B;">
                                  Delivery Address
                                </div>
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #092957; margin-top: 1px;">
                                  ${dLoc}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Row 3 -->
                      <tr>
                        <!-- Package Description -->
                        <td style="width: 50%; padding: 8px 12px 8px 0; vertical-align: top;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 42px; vertical-align: middle; padding-right: 8px;">
                                <img src="${assetsBaseUrl}/receiver-icon-pkg.png" width="34" height="34" style="display: block;" alt="Package" />
                              </td>
                              <td style="vertical-align: middle;">
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #64748B;">
                                  Package Description
                                </div>
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #092957; margin-top: 1px;">
                                  ${pDetails || 'Standard Package'}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <!-- Expected Delivery -->
                        <td style="width: 50%; padding: 8px 0 8px 12px; vertical-align: top;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 42px; vertical-align: middle; padding-right: 8px;">
                                <img src="${assetsBaseUrl}/receiver-icon-time.png" width="34" height="34" style="display: block;" alt="Expected Delivery" />
                              </td>
                              <td style="vertical-align: middle;">
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #64748B;">
                                  Expected Delivery
                                </div>
                                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #092957; margin-top: 1px;">
                                  ${sType || 'Standard Delivery'}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- How to Receive Your Package Card -->
          <tr>
            <td style="padding: 0 20px 14px 20px; line-height: 0;">
              <img src="${assetsBaseUrl}/receiver-how-to-receive.png" width="642" height="102" style="display: block; width: 642px; height: 102px; border-radius: 14px;" alt="How to Receive Your Package" />
            </td>
          </tr>

          <!-- Thank You Banner -->
          <tr>
            <td style="padding: 0 20px 20px 20px; line-height: 0;">
              <img src="${assetsBaseUrl}/receiver-thank-you.png" width="642" height="80" style="display: block; width: 642px; height: 80px; border-radius: 12px;" alt="Thank you for choosing BBD Mobility!" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/receiver-email-footer.png" width="682" height="148" style="display: block; width: 682px; height: 148px;" alt="Footer" />
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
 * Matches exact pixel mockup in media_1793111266377_9ee708f3.png.
 */
export function generateAdminContactAlertHtml(
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
        <!-- 682px Main Container matching exact design mockup -->
        <table border="0" cellpadding="0" cellspacing="0" width="682" style="width: 682px; max-width: 682px; background-color: #F4F6F8; margin: 0 auto;">
          
          <!-- Top Header Bar -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/contact-email-header.png" width="682" height="105" style="display: block; width: 682px; height: 105px;" alt="BBD Mobility - Move What Matters • Dispatch Desk" />
            </td>
          </tr>

          <!-- Main White Card Container -->
          <tr>
            <td style="padding: 24px 28px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 18px rgba(9, 41, 87, 0.04);">
                <tr>
                  <td style="padding: 28px 28px 26px 28px;">
                    
                    <!-- Card Header Row: Icon + Title + New Inquiry Badge -->
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

                    <!-- Contact Details Table -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; border-collapse: separate; overflow: hidden;">
                      
                      <!-- 1. Full Name -->
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

                      <!-- 2. Email Address -->
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

                      <!-- 3. Phone Number -->
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

                      <!-- 4. Subject -->
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

                      <!-- 5. Date & Time -->
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

                    <!-- Customer's Message Box -->
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

                    <!-- Action CTA Buttons: Reply & Call -->
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

          <!-- Deep Navy Footer -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/admin-email-footer.png" width="682" height="278" style="display: block; width: 682px; height: 278px;" alt="BBD Mobility - Move What Matters" />
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
 * Matches exact pixel mockup in media_1793111668138_fb92c585.png.
 */
export function generateCustomerContactAckHtml(
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
        <!-- 682px Container matching exact customer mockup -->
        <table border="0" cellpadding="0" cellspacing="0" width="682" style="width: 682px; max-width: 682px; background-color: #FFFFFF; margin: 0 auto; box-shadow: 0 4px 20px rgba(9, 41, 87, 0.05);">
          
          <!-- Top Header Bar -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/contact-email-header.png" width="682" height="105" style="display: block; width: 682px; height: 105px;" alt="BBD Mobility - Move What Matters • Dispatch Desk" />
            </td>
          </tr>

          <!-- Main Content Section -->
          <tr>
            <td style="padding: 36px 36px 28px 36px; text-align: center;">
              
              <!-- Celebration Checkmark Icon -->
              <div style="margin: 0 auto 16px auto; text-align: center; line-height: 0;">
                <img src="${assetsBaseUrl}/customer-contact-check.png" width="122" height="60" style="display: inline-block; margin: 0 auto;" alt="Success" />
              </div>

              <!-- Main Heading & Name -->
              <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800; color: #092957; line-height: 1.25;">
                Thank You for Contacting Us,
              </h1>
              <div style="font-size: 26px; font-weight: 900; color: #E30620; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 18px;">
                ${upperName}!
              </div>

              <!-- Descriptive Paragraph -->
              <p style="margin: 0 auto; max-width: 530px; font-size: 14px; line-height: 1.6; color: #334155;">
                We have successfully received your inquiry regarding <strong style="color: #092957;">"${subject}"</strong>. Our logistics and customer support team in <strong style="color: #092957;">Lagos</strong> is reviewing your note and will be in touch shortly.
              </p>

              <!-- Summary of your message Box -->
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

              <!-- Urgent Same-Day Delivery Box -->
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
                        For urgent dispatch requests, call our hotline directly at <a href="tel:+2348123456789" style="color: #E30620; font-weight: 800; text-decoration: none;">+234 812 345 6789</a> or email us at <a href="mailto:Info@bbdautosng.com" style="color: #0284C7; font-weight: 700; text-decoration: underline;">Info@bbdautosng.com</a>.
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- 4 Feature Guarantees Strip -->
              <div style="margin: 0 auto; text-align: center; line-height: 0;">
                <img src="${assetsBaseUrl}/customer-contact-guarantees.png" width="622" height="104" style="display: block; width: 622px; height: 104px; margin: 0 auto;" alt="Fast Delivery • Safe &amp; Secure • Wide Coverage • 24/7 Support" />
              </div>

            </td>
          </tr>

          <!-- Deep Navy Footer -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/customer-contact-footer.png" width="682" height="170" style="display: block; width: 682px; height: 170px;" alt="BBD Mobility - Fast • Safe • Reliable Logistics Across Lagos" />
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
 * Generates an HTML welcome email sent to newsletter subscribers.
 * Matches exact pixel mockup in media_1793119025457_7e8178ea.jpg.
 */
export function generateSubscriberWelcomeHtml(
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

