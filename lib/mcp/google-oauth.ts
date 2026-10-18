import { insforge, persistUserIntegration, fetchUserIntegrations } from "@/lib/insforge";

export const GOOGLE_GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid",
];

export interface GoogleOAuthCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  isConfigured: boolean;
}

export interface GoogleTokensResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  id_token?: string;
}

export interface GoogleUserProfile {
  id: string;
  email: string;
  verified_email?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

/**
 * Retrieve Google OAuth 2.0 Client credentials from environment variables (.env / .env.local)
 */
export function getGoogleClientCredentials(requestOrigin?: string): GoogleOAuthCredentials {
  const clientId =
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || "";

  // Priority for redirect URI: explicit env var -> dynamic request origin -> fallback
  let redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (!redirectUri) {
    const origin =
      requestOrigin ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    redirectUri = `${origin}/api/auth/google/callback`;
  }

  const isConfigured = Boolean(
    clientId &&
      clientSecret &&
      !clientId.includes("your-google-client-id") &&
      !clientSecret.includes("your-google-client-secret")
  );

  return {
    clientId,
    clientSecret,
    redirectUri,
    isConfigured,
  };
}

/**
 * Generate Google OAuth 2.0 Authorization URL for a specific user in multi-user environment
 */
export function generateGoogleAuthUrl(params: {
  userId: string;
  redirectDestination?: string;
  requestOrigin?: string;
}): { url: string; state: string; isConfigured: boolean } {
  const creds = getGoogleClientCredentials(params.requestOrigin);

  // Encode multi-user state with anti-tamper nonce
  const stateData = {
    userId: params.userId,
    redirect: params.redirectDestination || "/integrations",
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 12),
  };
  const state = Buffer.from(JSON.stringify(stateData)).toString("base64url");

  const queryParams = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: creds.redirectUri,
    response_type: "code",
    scope: GOOGLE_GMAIL_SCOPES.join(" "),
    access_type: "offline", // Request refresh_token for perpetual multi-user authorization
    prompt: "consent", // Force consent so Google always re-issues a refresh_token
    include_granted_scopes: "true",
    state,
  });

  return {
    url: `https://accounts.google.com/o/oauth2/v2/auth?${queryParams.toString()}`,
    state,
    isConfigured: creds.isConfigured,
  };
}

/**
 * Exchange authorization code for Access & Refresh tokens via Google OAuth 2.0 token endpoint
 */
export async function exchangeCodeForGoogleTokens(
  code: string,
  requestOrigin?: string
): Promise<{ success: boolean; tokens?: GoogleTokensResponse; error?: string }> {
  const creds = getGoogleClientCredentials(requestOrigin);

  if (!creds.clientId || !creds.clientSecret) {
    return {
      success: false,
      error:
        "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not configured in your .env or .env.local file.",
    };
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        redirect_uri: creds.redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error_description || data.error || "Failed to exchange authorization code",
      };
    }

    return {
      success: true,
      tokens: data as GoogleTokensResponse,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Fetch authenticated Google User Profile (email, name, picture) using the Access Token
 */
export async function fetchGoogleUserProfile(
  accessToken: string
): Promise<{ success: boolean; profile?: GoogleUserProfile; error?: string }> {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        error: `Google userinfo endpoint returned status ${res.status}: ${errText}`,
      };
    }

    const profile = (await res.json()) as GoogleUserProfile;
    return { success: true, profile };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Refresh an expired Google Access Token using the saved Refresh Token
 */
export async function refreshGoogleAccessToken(
  refreshToken: string,
  requestOrigin?: string
): Promise<{ success: boolean; tokens?: GoogleTokensResponse; error?: string }> {
  const creds = getGoogleClientCredentials(requestOrigin);

  if (!creds.clientId || !creds.clientSecret) {
    return {
      success: false,
      error: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env",
    };
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error_description || data.error || "Failed to refresh Google access token",
      };
    }

    return {
      success: true,
      tokens: data as GoogleTokensResponse,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Retrieve the active, auto-refreshed Gmail Access Token for a specific user from InsForge DB.
 * Multi-user aware: automatically looks up user's integration and refreshes token if close to expiry.
 */
export async function getUserGmailAccessToken(
  userId: string,
  requestOrigin?: string
): Promise<{
  accessToken: string | null;
  accountEmail: string | null;
  isRefreshed?: boolean;
  error?: string | null;
}> {
  if (!userId) {
    return { accessToken: null, accountEmail: null, error: "Missing userId" };
  }

  try {
    const { data: records, error } = await fetchUserIntegrations(userId);
    if (error || !records) {
      return { accessToken: null, accountEmail: null, error: error?.message || "Failed to query DB" };
    }

    const gmailRecord = records.find((r) => r.platform_id === "gmail");
    if (!gmailRecord || gmailRecord.status !== "connected") {
      return { accessToken: null, accountEmail: null, error: "Gmail is not connected for this user" };
    }

    const settings = gmailRecord.settings || {};
    let accessToken = settings.accessToken || null;
    const refreshToken = settings.refreshToken || null;
    const expiresAt = settings.expiresAt ? Number(settings.expiresAt) : null;
    const accountEmail = gmailRecord.connected_account || settings.googleEmail || null;

    // Check if token is expired or within 4 minutes of expiry
    const isExpired = expiresAt ? Date.now() > expiresAt - 4 * 60 * 1000 : false;

    if (isExpired && refreshToken) {
      // Auto-refresh token via Google OAuth 2.0 endpoint
      const refreshRes = await refreshGoogleAccessToken(refreshToken, requestOrigin);

      if (refreshRes.success && refreshRes.tokens?.access_token) {
        accessToken = refreshRes.tokens.access_token;
        const newExpiresAt = Date.now() + (refreshRes.tokens.expires_in || 3600) * 1000;

        // Persist new token back into InsForge database
        await persistUserIntegration(userId, {
          platform_id: "gmail",
          status: "connected",
          connected_account: accountEmail,
          last_synced: "Just now",
          latency_ms: gmailRecord.latency_ms || 80,
          settings: {
            ...settings,
            accessToken,
            expiresAt: newExpiresAt,
            refreshedAt: new Date().toISOString(),
          },
        });

        return {
          accessToken,
          accountEmail,
          isRefreshed: true,
          error: null,
        };
      }
    }

    return {
      accessToken,
      accountEmail,
      isRefreshed: false,
      error: null,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { accessToken: null, accountEmail: null, error: errorMsg };
  }
}
