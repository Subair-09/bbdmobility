import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

interface BookingEmailData {
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

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateAdminBookingAlertHtml(
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
        <table border="0" cellpadding="0" cellspacing="0" width="682" style="width: 682px; max-width: 682px; background-color: #ffffff; margin: 0 auto;">
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/email-header.png" width="682" height="74" style="display: block; width: 682px; height: 74px;" alt="BBD Mobility" />
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 25px 10px 25px; line-height: 0;">
              <img src="${assetsBaseUrl}/email-banner.png" width="632" height="192" style="display: block; width: 632px; height: 192px; border-radius: 14px;" alt="New Booking" />
            </td>
          </tr>
          <tr>
            <td style="padding: 0 25px 12px 25px;">
              <table border="0" cellpadding="0" cellspacing="0" width="632" style="width: 632px; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
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
                ${rowsHtml}
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
          <tr>
            <td style="padding: 0 25px 22px 25px; line-height: 0;">
              <img src="${assetsBaseUrl}/email-guarantees.png" width="632" height="104" style="display: block; width: 632px; height: 104px; border-radius: 12px;" alt="Guarantees" />
            </td>
          </tr>
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/email-footer.png" width="682" height="70" style="display: block; width: 682px; height: 70px;" alt="Footer" />
            </td>
          </tr>
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/email-bottom-stripes.png" width="682" height="44" style="display: block; width: 682px; height: 44px;" alt="Stripes" />
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateCustomerBookingConfirmationHtml(
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
    { icon: 'icon-truck.png', label: 'Service Type', value: sType, actionHtml: '' },
    { icon: 'icon-pin-pickup.png', label: 'Pickup Location', value: pLoc, actionHtml: `<a href="${pMapsUrl}" target="_blank" style="color: #0284C7; text-decoration: none; font-size: 11px; font-weight: 600; margin-left: 8px;">&#x2197; Maps</a>` },
    { icon: 'icon-pin-dropoff.png', label: 'Drop-off Location', value: dLoc, actionHtml: `<a href="${dMapsUrl}" target="_blank" style="color: #0284C7; text-decoration: none; font-size: 11px; font-weight: 600; margin-left: 8px;">&#x2197; Maps</a>` },
    { icon: 'icon-box.png', label: 'Package Details', value: packageDisplay, actionHtml: '' },
    { icon: 'icon-sender.png', label: 'Sender', value: senderDisplay, actionHtml: '' },
    { icon: 'icon-recipient.png', label: 'Recipient', value: receiverDisplay, actionHtml: '' },
    {
      icon: 'receiver-icon-otp.png',
      label: 'Your Pickup OTP',
      value: `<span style="font-family: monospace; font-size: 15px; font-weight: 800; color: #092957; background: #E0F2FE; padding: 4px 12px; border-radius: 6px; letter-spacing: 2px;">${pickupOtp}</span> <span style="font-size: 11px; color: #0284C7; font-weight: 600; margin-left: 6px;">Share with rider upon pickup</span>`,
      actionHtml: ''
    },
    { icon: 'icon-doc.png', label: 'Delivery Instructions', value: instructionsDisplay, actionHtml: '' },
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
        <table border="0" cellpadding="0" cellspacing="0" width="682" style="width: 682px; max-width: 682px; background-color: #ffffff; margin: 0 auto;">
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/customer-email-header.png" width="682" height="74" style="display: block; width: 682px; height: 74px;" alt="BBD Mobility" />
            </td>
          </tr>
          <tr>
            <td style="padding: 0; background-color: #ffffff;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="width: 330px; padding: 18px 10px 14px 25px; vertical-align: top;">
                    <img src="${assetsBaseUrl}/customer-icon-mail.png" width="36" height="36" style="display: block; margin-bottom: 12px;" alt="Mail Icon" />
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
                  <td style="width: 352px; padding: 0; line-height: 0; vertical-align: top;" align="right">
                    <img src="${assetsBaseUrl}/customer-rider.jpg" width="352" height="256" style="display: block; width: 352px; height: 256px;" alt="Courier Rider" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 25px 12px 25px;">
              <table border="0" cellpadding="0" cellspacing="0" width="632" style="width: 632px; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
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
                ${rowsHtml}
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
          <tr>
            <td style="padding: 0 25px 0 25px; line-height: 0;">
              <img src="${assetsBaseUrl}/email-guarantees.png" width="632" height="104" style="display: block; width: 632px; height: 104px; border-radius: 12px;" alt="Guarantees" />
            </td>
          </tr>
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="${assetsBaseUrl}/customer-email-footer.png" width="682" height="154" style="display: block; width: 682px; height: 154px;" alt="Footer" />
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateReceiverDeliveryHtml(
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
      receiverEmail,
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
      const emailData: BookingEmailData = {
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
          console.error('[RESEND DISPATCH ERROR]:', dispatchResult.error);
        } else {
          console.log(`[OK] Booking alert sent to: ${businessEmails.join(', ')}`);
        }
      } catch (adminErr) {
        console.error('[RESEND ADMIN ALERT EXCEPTION]:', adminErr);
      }

      // 2. Dispatch Sender Confirmation Email with Pickup OTP
      if (sEmail && sEmail.includes('@')) {
        try {
          const customerConfirmationHtml = generateCustomerBookingConfirmationHtml(emailData);
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

      // 3. Dispatch Receiver Delivery Verification Email with Delivery OTP
      if (rEmail && rEmail.includes('@')) {
        try {
          const receiverDeliveryHtml = generateReceiverDeliveryHtml(emailData);
          const receiverResult = await resend.emails.send({
            from: fromEmail,
            to: [rEmail],
            replyTo: businessEmails[0] || 'Info@bbdautosng.com',
            subject: `BBD Mobility Delivery Notice - Verification Code: ${deliveryOtp} (${bookingRef})`,
            html: receiverDeliveryHtml,
          });

          if (receiverResult.error) {
            console.warn(`[RECEIVER EMAIL WARNING] (${rEmail}):`, receiverResult.error);
          } else {
            console.log(`[OK] Receiver delivery verification email delivered to: ${rEmail}`);
          }
        } catch (recErr) {
          console.warn('[RECEIVER EMAIL EXCEPTION]:', recErr);
        }
      }
    } else {
      console.log(`[DEV MODE] Booking received: ${bookingRef} | Targets: ${businessEmails.join(', ')}`);
      console.log(`Pickup OTP (Sender): ${pickupOtp} | Delivery OTP (Receiver): ${deliveryOtp}`);
    }

    return res.status(200).json({
      success: true,
      bookingReference: bookingRef,
      pickupOtp,
      deliveryOtp,
      message: 'Booking request successfully received! Confirmation and OTP codes have been dispatched.',
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
