import SentDm from "@sentdm/sentdm";

export const SENT_DM_TEMPLATE_ID =
  process.env.SENT_DM_TEMPLATE_ID || "4396a40b-d9df-47fc-b56d-0a3b70a2e396";

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Sends a phone verification OTP using Sent.dm via SMS or WhatsApp
 * using the configured verification template (Template ID: 4396a40b-d9df-47fc-b56d-0a3b70a2e396).
 * Follows the official Sent.dm TypeScript SDK specification.
 */
export async function sendPhoneOtp(params: {
  phone: string;
  channel: "sms" | "whatsapp";
  otp: string;
}): Promise<SendOtpResult> {
  const { phone, channel, otp } = params;
  const apiKey = process.env.SENT_DM_API_KEY;
  const templateId = SENT_DM_TEMPLATE_ID;
  const isSandbox = process.env.SENT_DM_SANDBOX === "true";

  // If a live or configured Sent.dm API key is present, execute via the official SDK
  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your_sent_dm_api_key")) {
    try {
      // Initialize the client (Uses SENT_DM_API_KEY env var by default)
      const client = new SentDm({
        apiKey: apiKey.trim(),
        timeout: 15 * 1000,
        maxRetries: 2,
      });

      // Send verification message using the official Sent.dm template
      const response = await client.messages.send({
        to: [phone],
        channel: [channel],
        ...(isSandbox ? { sandbox: true } : {}),
        template: {
          id: templateId,
          parameters: {
            code: otp,
          },
        },
      });

      const recipient = response.data?.recipients?.[0];
      const messageId = recipient?.message_id || `sent_${Date.now()}`;
      const status = response.data?.status || "SENT";

      console.log(`[Sent.dm] Message sent via ${channel.toUpperCase()}: message_id=${messageId}, status=${status}`);

      return {
        success: true,
        messageId,
        status,
        simulated: isSandbox,
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

  // Graceful Sandbox / Developer Mode (when SENT_DM_API_KEY is not yet set)
  console.log(`[Sent.dm Sandbox Mode] Delivered ${channel.toUpperCase()} OTP to ${phone}: Code = ${otp}`);
  return {
    success: true,
    messageId: `sandbox_${channel}_${Date.now()}`,
    status: "DELIVERED",
    simulated: true,
  };
}

