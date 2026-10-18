import { NextRequest, NextResponse } from "next/server";
import { generateGoogleAuthUrl, getGoogleClientCredentials } from "@/lib/mcp/google-oauth";

/**
 * Initiates the multi-user Google OAuth 2.0 flow for Gmail integration.
 * Accepts:
 *  - userId: The active user ID
 *  - redirect: Destination URL to return to after authorization (default: /integrations)
 *  - mode: If "json", returns { url, isConfigured, clientId } instead of 302 redirect
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr_guest_demo92418";
    const redirectDestination = searchParams.get("redirect") || "/integrations";
    const mode = searchParams.get("mode");

    const origin = req.nextUrl.origin;
    const creds = getGoogleClientCredentials(origin);

    if (!creds.isConfigured) {
      if (mode === "json") {
        return NextResponse.json(
          {
            isConfigured: false,
            message:
              "Google OAuth 2.0 credentials are missing. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env or .env.local file.",
            clientId: creds.clientId ? `${creds.clientId.substring(0, 8)}...` : null,
            redirectUri: creds.redirectUri,
          },
          { status: 400 }
        );
      }

      // If user navigated directly, send them back to the integrations page with an informative query param
      const errorUrl = new URL(redirectDestination, origin);
      errorUrl.searchParams.set("error", "google_oauth_not_configured");
      return NextResponse.redirect(errorUrl);
    }

    const { url, state } = generateGoogleAuthUrl({
      userId,
      redirectDestination,
      requestOrigin: origin,
    });

    if (mode === "json") {
      return NextResponse.json({
        isConfigured: true,
        url,
        state,
        redirectUri: creds.redirectUri,
      });
    }

    // Direct browser redirect to Google OAuth 2.0 Consent Screen
    return NextResponse.redirect(url);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to initiate Google OAuth flow", details: errorMsg },
      { status: 500 }
    );
  }
}
