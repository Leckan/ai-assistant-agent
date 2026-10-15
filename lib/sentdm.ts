import SentDm from "@sentdm/sentdm";

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Sends a phone verification OTP using Sent.dm via SMS or WhatsApp.
 * Follows the official Sent.dm TypeScript SDK specification.
 */
export async function sendPhoneOtp(params: {
  phone: string;
  channel: "sms" | "whatsapp";
  otp: string;
}): Promise<SendOtpResult> {
  const { phone, channel, otp } = params;
  const apiKey = process.env.SENT_DM_API_KEY;

  const messageText = `Your OmniMind AI verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

  // If a valid live Sent.dm API key is provided, use the official SDK
  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your_sent_dm_api_key")) {
    try {
      const client = new SentDm({
        apiKey: apiKey.trim(),
        timeout: 15 * 1000,
        maxRetries: 2,
      });

      const response = await client.messages.send({
        to: [phone],
        channel: [channel],
        text: messageText,
      });

      const recipient = response.data?.recipients?.[0];
      return {
        success: true,
        messageId: recipient?.message_id || `sent_${Date.now()}`,
        status: response.data?.status || "SENT",
        simulated: false,
      };
    } catch (err: unknown) {
      console.error(`Sent.dm API Error sending ${channel} OTP:`, err);
      if (err instanceof SentDm.APIError) {
        return {
          success: false,
          error: `Sent.dm [${err.constructor.name} - ${err.status}]: ${err.message}`,
        };
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to deliver OTP via Sent.dm",
      };
    }
  }

  // Graceful Sandbox / Developer Mode (when SENT_DM_API_KEY is not yet set in production)
  console.log(`[Sent.dm Sandbox Mode] Delivered ${channel.toUpperCase()} OTP to ${phone}: Code = ${otp}`);
  return {
    success: true,
    messageId: `sandbox_${channel}_${Date.now()}`,
    status: "DELIVERED",
    simulated: true,
  };
}
