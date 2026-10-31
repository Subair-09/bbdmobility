import dotenv from 'dotenv';

dotenv.config();

export interface SmsDispatchResult {
  success: boolean;
  devMode?: boolean;
  messageId?: string;
  messageText?: string;
  recipients?: string;
  error?: string;
  data?: any;
}

export interface BookingSenderSmsData {
  senderPhone: string;
  senderName: string;
  bookingRef: string;
  pickupAddress: string;
  deliveryAddress: string;
  receiverName: string;
  receiverPhone: string;
  packageDescription: string;
  serviceType?: string;
  totalAmount?: number;
}

export interface BookingReceiverSmsData {
  receiverPhone: string;
  receiverName: string;
  senderName: string;
  senderPhone: string;
  bookingRef: string;
  deliveryAddress: string;
  packageDescription: string;
  otpCode: string;
}

export interface RiderAssignmentSmsData {
  riderPhone: string;
  riderName: string;
  bookingRef: string;
  pickupAddress: string;
  deliveryAddress: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  packageDescription: string;
  dispatchNote?: string;
  portalUrl?: string;
}

export interface RiderAssignedCustomerSmsData {
  senderPhone: string;
  receiverPhone: string;
  senderName: string;
  receiverName: string;
  bookingRef: string;
  riderName: string;
  riderPhone: string;
}

export interface ReceiverResendOtpSmsData {
  receiverPhone: string;
  receiverName: string;
  bookingRef: string;
  otpCode: string;
}

/**
 * Decodes HTML entities recursively, normalizes spaces and removes multi-dots/ellipses
 */
export function cleanSmsText(str: string | undefined | null): string {
  if (!str) return '';
  let cleaned = String(str).trim();
  let prev = '';
  // Recursively unescape any HTML entities (e.g. &amp;amp; -> &amp; -> &)
  while (cleaned !== prev && /&[a-z0-9#]+;/i.test(cleaned)) {
    prev = cleaned;
    cleaned = cleaned
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#039;|&apos;/gi, "'");
  }
  return cleaned
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\.{2,}/g, '')
    .trim();
}

/**
 * Cleanly shortens addresses by normalizing street types (Street -> St, Road -> Rd),
 * stripping redundant "Lagos", and trimming cleanly at whole word boundaries up to max length.
 */
export function formatAddress(addr: string | undefined | null, max = 28): string {
  let clean = cleanSmsText(addr);
  if (!clean) return '';
  
  clean = clean
    .replace(/\bStreet\b/gi, 'St')
    .replace(/\bRoad\b/gi, 'Rd')
    .replace(/\bAvenue\b/gi, 'Ave')
    .replace(/\bClose\b/gi, 'Cl')
    .replace(/\bCrescent\b/gi, 'Cres')
    .replace(/\bExpressway\b/gi, 'Exp')
    .replace(/,\s*Lagos(\s*State)?/gi, '')
    .replace(/\s+Lagos$/gi, '')
    .trim();

  if (clean.length <= max) return clean;

  const slice = clean.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 8 ? slice.slice(0, lastSpace) : slice).trim();
}

/**
 * Formats item description cleanly without cut-off words or ellipses
 */
export function formatItem(item: string | undefined | null, max = 24): string {
  const clean = cleanSmsText(item);
  if (!clean) return 'Parcel';
  if (clean.length <= max) return clean;

  const slice = clean.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 6 ? slice.slice(0, lastSpace) : slice).trim();
}

/**
 * Formats names cleanly (can extract first name for friendly, concise mobile SMS)
 */
export function formatName(name: string | undefined | null, preferFirst = false): string {
  const clean = cleanSmsText(name);
  if (!clean) return 'Customer';
  if (preferFirst) {
    return clean.split(' ')[0];
  }
  if (clean.length > 20) {
    const parts = clean.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
  }
  return clean;
}

/**
 * Formats phone numbers into Nigerian international standard format (234XXXXXXXXXX)
 * Suitable for KudiSMS API recipients parameter.
 */
export function formatNigerianPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  // Strip all non-digit characters except leading +
  let cleaned = phone.trim().replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  // Handle standard Nigerian 11-digit local mobile numbers: 080..., 070..., 090..., 081..., 091...
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '234' + cleaned.slice(1);
  }

  // Handle 10-digit format without leading 0: 80..., 70..., 90...
  if (cleaned.length === 10 && ['7', '8', '9'].includes(cleaned.charAt(0))) {
    return '234' + cleaned;
  }

  // Handle numbers already in 234 format
  if (cleaned.startsWith('234')) {
    return cleaned;
  }

  return cleaned;
}

/**
 * Test/Dummy detector to avoid wasting real SMS credits on simulations
 */
function isTestRecipient(phone?: string, ref?: string, name?: string): boolean {
  const p = (phone || '').replace(/\D/g, '');
  const r = (ref || '').toUpperCase();
  const n = (name || '').toLowerCase();

  return (
    p.includes('0000000') ||
    p === '1234567890' ||
    p === '2348000000000' ||
    r.includes('TEST') ||
    n.includes('test recipient') ||
    n.includes('test sender')
  );
}

/**
 * Core KudiSMS API Dispatcher
 * Sends SMS via https://my.kudisms.net/api/sms
 */
export async function sendKudiSms(options: {
  recipients: string | string[];
  message: string;
  senderId?: string;
  gateway?: string;
  bookingRef?: string;
  recipientName?: string;
}): Promise<SmsDispatchResult> {
  const { message, bookingRef, recipientName } = options;

  // 1. Normalize and format recipients
  const rawList = Array.isArray(options.recipients) ? options.recipients : [options.recipients];
  const formattedRecipients = rawList
    .map(p => formatNigerianPhone(p))
    .filter(p => p.length >= 10);

  if (formattedRecipients.length === 0) {
    console.warn('[KudiSMS] No valid recipient phone number provided.');
    return { success: false, error: 'No valid recipient phone number provided', messageText: message };
  }

  const recipientsJoined = formattedRecipients.join(',');

  // 2. Safeguard: suppress real SMS for simulated/test payloads
  if (isTestRecipient(recipientsJoined, bookingRef, recipientName)) {
    console.log(`[TEST SMS SUPPRESSED] Skipping real KudiSMS delivery for test recipient: ${recipientsJoined} (Ref: ${bookingRef || 'N/A'})`);
    return {
      success: true,
      messageId: 'test-suppressed',
      messageText: message,
      recipients: recipientsJoined,
    };
  }

  // 3. Environment configuration
  const apiKey = (process.env.KUDISMS_API_KEY || process.env.KUDISMS_TOKEN || '').trim();
  // KudiSMS sender ID maximum allowed length is 11 alphanumeric characters
  const senderID = (options.senderId || process.env.KUDISMS_SENDER_ID || 'BBDMobility').trim().slice(0, 11);
  const gateway = (options.gateway || process.env.KUDISMS_GATEWAY || '').trim();

  // 4. Dev mode fallback when credentials are not yet configured
  if (!apiKey || apiKey === 'your_kudisms_api_key_here') {
    console.log(`[KUDISMS DEV MODE] Sender: ${senderID} | To: ${recipientsJoined} | Gateway: ${gateway || 'Default'}\nMessage:\n${message}\n--------------------------------------------------`);
    return {
      success: true,
      devMode: true,
      messageId: `dev-${Date.now()}`,
      messageText: message,
      recipients: recipientsJoined,
      data: { status: 'dev-mode', note: 'KudiSMS API key not configured. Message logged to console.' },
    };
  }

  // 5. Send HTTP POST request to KudiSMS API
  try {
    const requestPayload: Record<string, any> = {
      token: apiKey,
      senderID,
      recipients: recipientsJoined,
      message,
    };
    if (gateway) {
      requestPayload.gateway = gateway;
    }

    const response = await fetch('https://my.kudisms.net/api/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    const responseText = await response.text();
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      console.error(`[KudiSMS HTTP Error] Status ${response.status}:`, responseData);
      return {
        success: false,
        error: `HTTP ${response.status}: ${responseData?.msg || responseData?.message || responseText}`,
        messageText: message,
        recipients: recipientsJoined,
        data: responseData,
      };
    }

    // KudiSMS JSON status check
    const status = (responseData?.status || '').toString().toLowerCase();
    const isSuccess =
      status === 'success' ||
      responseData?.error_code === '000' ||
      responseData?.code === 100 ||
      responseData?.code === 200 ||
      (!status.includes('error') && !responseData?.error_code);

    if (!isSuccess && status.includes('error')) {
      console.error('[KudiSMS API Error]:', responseData);
      return {
        success: false,
        error: responseData?.msg || responseData?.message || 'KudiSMS rejected request',
        messageText: message,
        recipients: recipientsJoined,
        data: responseData,
      };
    }

    const messageId =
      responseData?.data?.[0]?.split('|')[1] ||
      responseData?.batch_id ||
      responseData?.id ||
      `kudi-${Date.now()}`;

    console.log(`[KudiSMS Success] Message dispatched to ${recipientsJoined} (MsgID: ${messageId}) for ${bookingRef || 'SMS'}`);
    return {
      success: true,
      messageId,
      messageText: message,
      recipients: recipientsJoined,
      data: responseData,
    };
  } catch (error: any) {
    console.error('[KudiSMS Network Exception]:', error.message || error);
    return {
      success: false,
      error: error.message || 'Network exception communicating with KudiSMS API',
      messageText: message,
      recipients: recipientsJoined,
    };
  }
}

/**
 * High-Level KudiSMS Service Methods
 */
export const kudiSmsService = {
  /**
   * 1. Sender Booking Confirmation SMS
   * Informs sender that booking has been registered, confirms route and recipient details.
   */
  async sendBookingSenderSms(data: BookingSenderSmsData): Promise<SmsDispatchResult> {
    const sender = formatName(data.senderName, true);
    const pickup = formatAddress(data.pickupAddress, 26);
    const dropoff = formatAddress(data.deliveryAddress, 26);
    const recipient = cleanSmsText(data.receiverName);
    const recvPhone = cleanSmsText(data.receiverPhone);
    const item = formatItem(data.packageDescription, 24);

    const message = 
      `Hello ${sender}, your delivery ${data.bookingRef} is confirmed.\n` +
      `Route: ${pickup} -> ${dropoff}\n` +
      `Recipient: ${recipient} (${recvPhone})\n` +
      `Item: ${item}\n` +
      `Track: bbdmobility.com.ng | Tel: 07087531148`;

    return sendKudiSms({
      recipients: data.senderPhone,
      message,
      bookingRef: data.bookingRef,
      recipientName: data.senderName,
    });
  },

  /**
   * 2. Receiver Delivery Notice & Security Passkey SMS
   * Dispatches parcel arrival details, sender contact, and delivery verification passkey to receiver.
   * Note: Uses "Delivery Passkey" instead of "OTP" or "Code" to comply with Nigerian NCC/telco anti-fraud filters.
   */
  async sendBookingReceiverSms(data: BookingReceiverSmsData): Promise<SmsDispatchResult> {
    const receiver = cleanSmsText(data.receiverName) || 'Recipient';
    const sender = cleanSmsText(data.senderName) || 'Sender';
    const senderPhone = cleanSmsText(data.senderPhone);
    const dropoff = formatAddress(data.deliveryAddress, 28);
    const item = formatItem(data.packageDescription, 24);

    const message = 
      `Hello ${receiver}, a parcel (${item}) from ${sender} (${senderPhone}) is heading to you at ${dropoff}.\n` +
      `Ref: ${data.bookingRef}\n` +
      `Delivery Passkey: ${data.otpCode}\n` +
      `Present this passkey to the rider upon delivery.`;

    return sendKudiSms({
      recipients: data.receiverPhone,
      message,
      bookingRef: data.bookingRef,
      recipientName: data.receiverName,
    });
  },

  /**
   * 3. Courier Rider Assignment Alert SMS
   * Dispatches complete ride manifest to rider when admin assigns them an order.
   */
  async sendRiderAssignmentSms(data: RiderAssignmentSmsData): Promise<SmsDispatchResult> {
    const rider = formatName(data.riderName, true);
    const pickup = formatAddress(data.pickupAddress, 26);
    const dropoff = formatAddress(data.deliveryAddress, 26);
    const sender = formatName(data.senderName, true);
    const receiver = cleanSmsText(data.receiverName);
    const item = formatItem(data.packageDescription, 24);
    const note = data.dispatchNote ? cleanSmsText(data.dispatchNote) : '';
    const noteLine = note && note !== 'Parcel' && note !== 'Standard' ? `Note: ${formatItem(note, 28)}\n` : '';

    const message = 
      `Hello ${rider}, new delivery assigned: ${data.bookingRef}\n` +
      `Pickup: ${pickup} - ${sender} (${data.senderPhone})\n` +
      `Dropoff: ${dropoff} - ${receiver} (${data.receiverPhone})\n` +
      `Item: ${item}\n` +
      noteLine +
      `Accept on portal: bbdmobility.com.ng/rider`;

    return sendKudiSms({
      recipients: data.riderPhone,
      message,
      bookingRef: data.bookingRef,
      recipientName: data.riderName,
    });
  },

  /**
   * 4. Customer Rider Assignment Alert SMS
   * Notifies sender and receiver that a courier rider has been assigned and is en route.
   */
  async sendRiderAssignedToCustomerSms(data: RiderAssignedCustomerSmsData): Promise<{
    senderResult?: SmsDispatchResult;
    receiverResult?: SmsDispatchResult;
  }> {
    const rider = formatName(data.riderName);
    const senderMessage = 
      `Rider ${rider} (${data.riderPhone}) has been assigned to your order ${data.bookingRef}. Pickup is underway. Tel: 07087531148`;

    const receiverMessage = 
      `Rider ${rider} (${data.riderPhone}) has been assigned to deliver order ${data.bookingRef} from ${data.senderName}. Have your Delivery Passkey ready for arrival.`;

    const [senderResult, receiverResult] = await Promise.all([
      sendKudiSms({
        recipients: data.senderPhone,
        message: senderMessage,
        bookingRef: data.bookingRef,
        recipientName: data.senderName,
      }).catch(err => ({ success: false, error: err.message })),

      sendKudiSms({
        recipients: data.receiverPhone,
        message: receiverMessage,
        bookingRef: data.bookingRef,
        recipientName: data.receiverName,
      }).catch(err => ({ success: false, error: err.message })),
    ]);

    return { senderResult, receiverResult };
  },

  /**
   * 5. Receiver Resend Passkey SMS
   * Triggered when admin regenerates delivery verification passkey.
   */
  async sendReceiverResendOtpSms(data: ReceiverResendOtpSmsData): Promise<SmsDispatchResult> {
    const receiver = cleanSmsText(data.receiverName) || 'Recipient';
    const message = 
      `Hello ${receiver}, your new Delivery Passkey for parcel ${data.bookingRef} is: ${data.otpCode}.\n` +
      `Present this passkey to your rider upon arrival to complete delivery.`;

    return sendKudiSms({
      recipients: data.receiverPhone,
      message,
      bookingRef: data.bookingRef,
      recipientName: data.receiverName,
    });
  },

  /**
   * 6. Proof of Pickup Customer Alert SMS
   * Dispatches updates when rider picks up item from sender and begins transit to receiver.
   */
  async sendPickupCustomerSms(data: {
    senderPhone: string;
    receiverPhone: string;
    senderName: string;
    receiverName: string;
    bookingRef: string;
    riderName: string;
    riderPhone: string;
    deliveryAddress: string;
  }): Promise<{ senderResult?: SmsDispatchResult; receiverResult?: SmsDispatchResult }> {
    const rider = formatName(data.riderName);
    const dropoff = formatAddress(data.deliveryAddress, 26);
    const receiver = cleanSmsText(data.receiverName);

    const senderMessage = 
      `Order ${data.bookingRef} has been picked up by rider ${rider} and is en route to ${data.receiverName}. Track at bbdmobility.com.ng`;

    const receiverMessage = 
      `Hello ${receiver}, your parcel ${data.bookingRef} from ${data.senderName} has been picked up by rider ${rider} (${data.riderPhone}) heading to ${dropoff}. Have your Delivery Passkey ready.`;

    const [senderResult, receiverResult] = await Promise.all([
      sendKudiSms({
        recipients: data.senderPhone,
        message: senderMessage,
        bookingRef: data.bookingRef,
        recipientName: data.senderName,
      }).catch(err => ({ success: false, error: err.message })),

      sendKudiSms({
        recipients: data.receiverPhone,
        message: receiverMessage,
        bookingRef: data.bookingRef,
        recipientName: data.receiverName,
      }).catch(err => ({ success: false, error: err.message })),
    ]);

    return { senderResult, receiverResult };
  },

  /**
   * 7. Delivery Completed Customer Alert SMS
   * Dispatches confirmation when delivery is verified and completed.
   */
  async sendDeliveryCompletedCustomerSms(data: {
    senderPhone: string;
    receiverPhone: string;
    senderName: string;
    receiverName: string;
    bookingRef: string;
  }): Promise<{ senderResult?: SmsDispatchResult; receiverResult?: SmsDispatchResult }> {
    const senderMessage = 
      `Order ${data.bookingRef} has been safely delivered to ${data.receiverName}. Thank you for choosing BBD Mobility!`;

    const receiverMessage = 
      `Hello ${data.receiverName}, your parcel ${data.bookingRef} from ${data.senderName} has been delivered. Thank you for choosing BBD Mobility!`;

    const [senderResult, receiverResult] = await Promise.all([
      sendKudiSms({
        recipients: data.senderPhone,
        message: senderMessage,
        bookingRef: data.bookingRef,
        recipientName: data.senderName,
      }).catch(err => ({ success: false, error: err.message })),

      sendKudiSms({
        recipients: data.receiverPhone,
        message: receiverMessage,
        bookingRef: data.bookingRef,
        recipientName: data.receiverName,
      }).catch(err => ({ success: false, error: err.message })),
    ]);

    return { senderResult, receiverResult };
  },

  /**
   * 6. Check approval status of Sender ID on KudiSMS
   */
  async checkSenderIdStatus(senderId?: string): Promise<{ approved: boolean; status: string; msg: string; balance?: string }> {
    const apiKey = (process.env.KUDISMS_API_KEY || process.env.KUDISMS_TOKEN || '').trim();
    const idToCheck = (senderId || process.env.KUDISMS_SENDER_ID || 'BBDMobility').trim();

    if (!apiKey) {
      return { approved: false, status: 'not_configured', msg: 'KudiSMS API key not configured' };
    }

    try {
      const [statusRes, balanceRes] = await Promise.all([
        fetch('https://my.kudisms.net/api/check_senderID', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: apiKey, senderID: idToCheck })
        }),
        fetch('https://my.kudisms.net/api/balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: apiKey })
        })
      ]);

      const statusData: any = await statusRes.json().catch(() => ({}));
      const balanceData: any = await balanceRes.json().catch(() => ({}));

      const isApproved = statusData?.status === 'success' || statusData?.error_code === '000';
      return {
        approved: isApproved,
        status: statusData?.status || 'unknown',
        msg: statusData?.msg || 'Pending operator review',
        balance: balanceData?.msg || undefined
      };
    } catch (err: any) {
      return { approved: false, status: 'error', msg: err.message };
    }
  },
};
