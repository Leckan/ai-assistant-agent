import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForGoogleTokens,
  fetchGoogleUserProfile,
  GOOGLE_GMAIL_SCOPES,
} from "@/lib/mcp/google-oauth";
import { persistUserIntegration, insforge } from "@/lib/insforge";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Parse state
  let userId = "usr_guest_demo92418";
  let redirectDestination = "/integrations";

  if (stateRaw) {
    try {
      const decodedJson = Buffer.from(stateRaw, "base64url").toString("utf-8");
      const stateObj = JSON.parse(decodedJson);
      if (stateObj.userId) userId = stateObj.userId;
      if (stateObj.redirect) redirectDestination = stateObj.redirect;
    } catch (e) {
      console.warn("Failed to decode OAuth state:", e);
    }
  }

  const destinationUrl = new URL(redirectDestination, origin);

  // Handle Google OAuth access rejection / error
  if (errorParam) {
    destinationUrl.searchParams.set("error", errorDescription || errorParam);
    destinationUrl.searchParams.set("platform", "gmail");
    return NextResponse.redirect(destinationUrl);
  }

  if (!code) {
    destinationUrl.searchParams.set("error", "Missing authorization code from Google");
    destinationUrl.searchParams.set("platform", "gmail");
    return NextResponse.redirect(destinationUrl);
  }

  const startTime = performance.now();

  try {
    // 1. Exchange authorization code for Access & Refresh tokens
    const exchangeRes = await exchangeCodeForGoogleTokens(code, origin);

    if (!exchangeRes.success || !exchangeRes.tokens) {
      destinationUrl.searchParams.set(
        "error",
        exchangeRes.error || "Failed to exchange Google OAuth code"
      );
      destinationUrl.searchParams.set("platform", "gmail");
      return NextResponse.redirect(destinationUrl);
    }

    const { tokens } = exchangeRes;

    // 2. Fetch Google profile (email, name, picture) using the fresh access token
    const profileRes = await fetchGoogleUserProfile(tokens.access_token);
    const googleProfile = profileRes.profile;
    const accountEmail = googleProfile?.email || "gmail.user@google.com";
    const latency = Math.round(performance.now() - startTime);

    const expiresAt = Date.now() + (tokens.expires_in || 3600) * 1000;

    // 3. Persist connection and tokens into InsForge database `user_integrations` table
    const { error: dbError } = await persistUserIntegration(userId, {
      platform_id: "gmail",
      status: "connected",
      connected_account: accountEmail,
      last_synced: "Just now",
      latency_ms: latency,
      settings: {
        authType: "Google OAuth 2.0 (Multi-User)",
        endpoint: "https://gmailmcp.googleapis.com/mcp/v1",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiresAt,
        tokenType: tokens.token_type || "Bearer",
        scopes: tokens.scope ? tokens.scope.split(" ") : GOOGLE_GMAIL_SCOPES,
        googleEmail: accountEmail,
        googleName: googleProfile?.name || null,
        googlePicture: googleProfile?.picture || null,
        connectedAt: new Date().toISOString(),
      },
    });

    if (dbError) {
      console.warn("Failed to persist Google OAuth tokens in InsForge DB:", dbError.message);
    }

    // 4. Also sync user snapshot in public.users if authenticated
    try {
      const { data: userRows } = await insforge.database
        .from("users")
        .select("id, integrations")
        .eq("id", userId);

      if (userRows && userRows.length > 0) {
        const existingIntegrations = Array.isArray(userRows[0].integrations)
          ? userRows[0].integrations
          : [];

        const updated = existingIntegrations.filter((i: any) => i.id !== "gmail");
        updated.push({
          id: "gmail",
          status: "connected",
          connectedAccount: accountEmail,
          lastSynced: "Just now",
          latencyMs: latency,
          authType: "Google OAuth 2.0",
        });

        await insforge.database
          .from("users")
          .update({
            integrations: updated,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }
    } catch (userSyncErr) {
      console.warn("Could not sync integrations to users table:", userSyncErr);
    }

    // 5. Redirect back to destination with success query parameters
    destinationUrl.searchParams.set("connected", "gmail");
    destinationUrl.searchParams.set("account", accountEmail);
    if (googleProfile?.name) {
      destinationUrl.searchParams.set("name", googleProfile.name);
    }
    destinationUrl.searchParams.set("ts", Date.now().toString());

    return NextResponse.redirect(destinationUrl);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    destinationUrl.searchParams.set("error", errorMsg);
    destinationUrl.searchParams.set("platform", "gmail");
    return NextResponse.redirect(destinationUrl);
  }
}
