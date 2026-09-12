// NEED ELECTRO ERP — Bangladeshi SMS & WhatsApp Multichannel Notification Engine
// Supports Greenweb BD, BulkSMS BD, WhatsApp Cloud API & Safe Simulation Fallback
import { prisma } from './prisma';

export interface NotificationPayload {
  recipientPhone: string;
  recipientName?: string;
  channel: 'SMS' | 'WHATSAPP' | 'BOTH';
  templateCode?: string;
  customMessage?: string;
  variables?: Record<string, string | number>;
  metadata?: {
    referenceType?: 'SALE' | 'EMI_PAYMENT' | 'EMI_OVERDUE' | 'SERVICE' | 'DUE_PAYMENT';
    referenceId?: string;
  };
}

export interface NotificationResult {
  success: boolean;
  smsStatus?: 'SENT' | 'FAILED' | 'SIMULATED' | 'SKIPPED';
  whatsappStatus?: 'SENT' | 'FAILED' | 'SIMULATED' | 'SKIPPED';
  message?: string;
  formattedText: string;
  recipient: string;
}

/**
 * Format standard Bangladeshi phone number to international 880 format
 */
export function formatBanglaPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+880')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('880')) {
    // already starts with 880
  } else if (cleaned.startsWith('01')) {
    cleaned = '88' + cleaned;
  }
  return cleaned;
}

/**
 * Interpolate template variables
 */
export function interpolateTemplate(template: string, vars: Record<string, string | number>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    const pattern = new RegExp(`\\{${key}\\}`, 'gi');
    result = result.replace(pattern, String(val));
  }
  return result;
}

/**
 * Send SMS via Bangladeshi Gateway (e.g. Greenweb / BulkSMS) or fallback simulation
 */
async function sendSms(formattedPhone: string, message: string): Promise<'SENT' | 'FAILED' | 'SIMULATED'> {
  const provider = process.env.SMS_PROVIDER || 'SIMULATION';
  const apiKey = process.env.SMS_API_KEY;

  // Safe Simulation Mode if no live gateway configured
  if (!apiKey || provider === 'SIMULATION' || provider === 'MOCK') {
    console.log(`[SMS SIMULATION] To: ${formattedPhone} | Message: ${message}`);
    return 'SIMULATED';
  }

  try {
    if (provider.toUpperCase() === 'GREENWEB') {
      // Greenweb SMS API BD
      const res = await fetch('http://api.greenweb.com.bd/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: apiKey,
          to: formattedPhone,
          message,
        }),
      });
      const text = await res.text();
      return text.includes('Ok') ? 'SENT' : 'FAILED';
    } else {
      // Generic HTTP POST BulkSMS API
      const endpoint = process.env.SMS_ENDPOINT || 'https://api.mobireach.com.bd/SendTextMessage';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          receiver: formattedPhone,
          message,
        }),
      });
      return res.ok ? 'SENT' : 'FAILED';
    }
  } catch (err) {
    console.error('SMS Dispatch Error:', err);
    return 'FAILED';
  }
}

/**
 * Send WhatsApp notification via WhatsApp Cloud API or fallback simulation
 */
async function sendWhatsApp(formattedPhone: string, message: string): Promise<'SENT' | 'FAILED' | 'SIMULATED'> {
  const waToken = process.env.WHATSAPP_API_KEY;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!waToken || !waPhoneId) {
    console.log(`[WHATSAPP SIMULATION] To: +${formattedPhone} | Message: ${message}`);
    return 'SIMULATED';
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${waToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: { body: message },
      }),
    });
    return res.ok ? 'SENT' : 'FAILED';
  } catch (err) {
    console.error('WhatsApp Dispatch Error:', err);
    return 'FAILED';
  }
}

/**
 * Master notification dispatcher
 */
export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const formattedPhone = formatBanglaPhone(payload.recipientPhone);
  let messageText = payload.customMessage || '';

  // 1. If templateCode provided, resolve template from Database
  if (payload.templateCode && !messageText) {
    try {
      const tpl = await prisma.notificationTemplateConfig.findUnique({
        where: { code: payload.templateCode },
      });
      if (tpl) {
        messageText = tpl.templateBn || tpl.templateEn;
      }
    } catch (e) {
      console.warn('Could not fetch template from DB:', e);
    }
  }

  // 2. Interpolate variables
  if (payload.variables && messageText) {
    messageText = interpolateTemplate(messageText, payload.variables);
  }

  if (!messageText) {
    messageText = `NEED ELECTRO: Notification for ${payload.recipientName || 'Customer'}. Phone: 01733-983752.`;
  }

  let smsStatus: 'SENT' | 'FAILED' | 'SIMULATED' | 'SKIPPED' = 'SKIPPED';
  let whatsappStatus: 'SENT' | 'FAILED' | 'SIMULATED' | 'SKIPPED' = 'SKIPPED';

  // 3. Dispatch SMS if requested
  if (payload.channel === 'SMS' || payload.channel === 'BOTH') {
    smsStatus = await sendSms(formattedPhone, messageText);
  }

  // 4. Dispatch WhatsApp if requested
  if (payload.channel === 'WHATSAPP' || payload.channel === 'BOTH') {
    whatsappStatus = await sendWhatsApp(formattedPhone, messageText);
  }

  // 5. Create Audit Log for transparency
  try {
    await prisma.auditLog.create({
      data: {
        id: 'audit-notif-' + Date.now(),
        timestamp: new Date(),
        userId: 'system-notifier',
        userName: 'Notification Engine',
        action: 'NOTIFICATION_DISPATCH',
        module: payload.metadata?.referenceType || 'SYSTEM',
        recordId: payload.metadata?.referenceId || formattedPhone,
        details: `[${payload.channel}] Recipient: ${formattedPhone} (${payload.recipientName || 'Client'}). SMS: ${smsStatus}, WA: ${whatsappStatus}. Preview: "${messageText.substring(0, 80)}..."`,
      },
    });
  } catch (e) {
    // Non-fatal if audit logging fails
  }

  return {
    success: smsStatus !== 'FAILED' && whatsappStatus !== 'FAILED',
    smsStatus,
    whatsappStatus,
    formattedText: messageText,
    recipient: formattedPhone,
  };
}
