/**
 * Industry Standard Notification Service (TextMeBot)
 * Handles outgoing alerts for WhatsApp inquiries.
 */

export interface WhatsAppPayload {
  name: string;
  phone: string;
  email: string;
  message: string;
  category?: string;
}

/**
 * Sends a WhatsApp notification via TextMeBot
 * Includes a timeout to ensure it doesn't block server resources
 */
export async function sendWhatsAppInquiryAlert(data: WhatsAppPayload) {
  const apiKey = process.env.TEXTMEBOT_API_KEY;
  const phoneNumber = process.env.TEXTMEBOT_NOTIFICATION_PHONE;

  if (!apiKey || !phoneNumber) {
    console.warn('WhatsApp Notification skipped: TEXTMEBOT_API_KEY or TEXTMEBOT_NOTIFICATION_PHONE not set in .env');
    return;
  }

  try {
    // Construct a professional message
    const text = `*New Website Inquiry!* 🛋️\n\n` +
      `*Name:* ${data.name}\n` +
      `*Phone:* ${data.phone}\n` +
      `*Email:* ${data.email}\n` +
      `*Subject:* ${data.category || 'General Inquiry'}\n\n` +
      `*Message:* ${data.message}`;

    // TextMeBot API endpoint (switching to http as verified by user)
    // Format: http://api.textmebot.com/send.php?recipient=[RECIPIENT]&apikey=[APIKEY]&text=[TEXT]
    const url = `http://api.textmebot.com/send.php?recipient=${encodeURIComponent(phoneNumber)}&apikey=${encodeURIComponent(apiKey)}&text=${encodeURIComponent(text)}`;

    console.log(`[Notification] Attempting to send WhatsApp alert for inquiry from ${data.name}...`);

    // Set a timeout to prevent the serverless function from hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TextMeBot API responded with status ${response.status}: ${errorText}`);
    }

    console.log('[Notification] WhatsApp alert sent successfully via TextMeBot.');
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Notification] WhatsApp alert timed out after 8 seconds.');
    } else {
      console.error('[Notification] Failed to send WhatsApp notification:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
