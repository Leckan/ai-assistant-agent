import { NextResponse } from "next/server";
import { getInsForgeAdmin, insforge, savePhoneUserToDatabase } from "@/lib/insforge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp, channel, name, email } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: "Phone number and verification OTP code are required" },
        { status: 400 }
      );
    }

    const cleanedPhone = phone.trim().replace(/[^\d+]/g, "");
    const cleanedOtp = otp.trim().replace(/\D/g, "");

    const admin = getInsForgeAdmin();
    const db = admin ? admin.database : insforge.database;

    // 1. Verify OTP in InsForge database public.phone_otps table
    const { data: otpRecords, error: otpError } = await db
      .from("phone_otps")
      .select("*")
      .eq("phone", cleanedPhone)
      .eq("otp", cleanedOtp)
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (otpError) {
      console.warn("Error querying phone_otps:", otpError);
    }

    // Check if matching OTP record found
    const isValid = otpRecords && otpRecords.length > 0;

    if (!isValid) {
      // Increment attempt counter for security
      await db
        .from("phone_otps")
        .update({ attempts: 1 })
        .eq("phone", cleanedPhone);

      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code. Please request a new one." },
        { status: 401 }
      );
    }

    // 2. Mark OTP as verified
    const matchedRecord = otpRecords[0];
    await db
      .from("phone_otps")
      .update({ verified: true })
      .eq("id", matchedRecord.id);

    // 3. Save or update user in InsForge database public.users table
    const selectedMethod = (channel === "whatsapp" ? "whatsapp" : "sms") as "sms" | "whatsapp";
    const { data: savedUser, error: saveError, isFirstTime } = await savePhoneUserToDatabase({
      phone: cleanedPhone,
      verificationMethod: selectedMethod,
      name: name || null,
      email: email || null,
    });

    if (saveError || !savedUser) {
      return NextResponse.json(
        {
          success: false,
          error: saveError?.message || "Failed to persist user profile into InsForge database",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully!",
      user: savedUser,
      isFirstTime,
    });
  } catch (err: unknown) {
    console.error("verify-otp error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal server error verifying OTP",
      },
      { status: 500 }
    );
  }
}
