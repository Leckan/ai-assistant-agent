import { NextResponse } from "next/server";
import { getInsForgeAdmin, insforge } from "@/lib/insforge";
import { sendPhoneOtp } from "@/lib/sentdm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, channel } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid phone number is required" },
        { status: 400 }
      );
    }

    // Clean and validate E.164 format
    const cleanedPhone = phone.trim().replace(/[^\d+]/g, "");
    if (!cleanedPhone.startsWith("+") || cleanedPhone.length < 8 || cleanedPhone.length > 17) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number must include country code starting with '+' (e.g. +14155552671)",
        },
        { status: 400 }
      );
    }

    const selectedChannel = channel === "whatsapp" ? "whatsapp" : "sms";

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    const admin = getInsForgeAdmin();
    const db = admin ? admin.database : insforge.database;

    // Record OTP in InsForge database public.phone_otps table
    const { error: dbError } = await db.from("phone_otps").insert([
      {
        phone: cleanedPhone,
        otp,
        channel: selectedChannel,
        expires_at: expiresAt,
        verified: false,
        attempts: 0,
        created_at: new Date().toISOString(),
      },
    ]);

    if (dbError) {
      console.warn("Failed to store phone OTP in database:", dbError);
    }

    // Dispatch OTP using Sent.dm SDK
    const sendResult = await sendPhoneOtp({
      phone: cleanedPhone,
      channel: selectedChannel,
      otp,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: sendResult.error || "Failed to dispatch verification code via Sent.dm",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent via ${selectedChannel === "whatsapp" ? "WhatsApp" : "SMS"}.`,
      channel: selectedChannel,
      phone: cleanedPhone,
      expiresAt,
      // Provide devOtp if in simulation/sandbox mode so developer testing is instant
      devOtp: sendResult.simulated ? otp : undefined,
      simulated: sendResult.simulated,
    });
  } catch (err: unknown) {
    console.error("send-otp error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal server error sending OTP",
      },
      { status: 500 }
    );
  }
}
