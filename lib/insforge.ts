import { createClient, createAdminClient, type InsForgeClient } from "@insforge/sdk";

const baseUrl =
  process.env.NEXT_PUBLIC_INSFORGE_BASE_URL ||
  "https://t8gt9yje.us-east.insforge.app";
const anonKey =
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ||
  "anon_b280572127e8566ddc95997e16d32569e69bee8d25b44a158493ef58a92f0346";

// Client-side singleton for browser app operations
export const insforge: InsForgeClient = createClient({
  baseUrl,
  anonKey,
});

// Admin client helper for secure server operations
export function getInsForgeAdmin() {
  const apiKey =
    process.env.INSFORGE_API_KEY || "ik_d6e43487df828b4bb6883c63bee61e45";
  return createAdminClient({
    baseUrl,
    apiKey,
  });
}

export interface UserRecord {
  id: string;
  email: string | null;
  name: string | null;
  phone?: string | null;
  provider?: string | null;
  verification_method?: "sms" | "whatsapp" | string | null;
  avatar_url: string | null;
  providers: string[] | null;
  email_verified: boolean;
  created_at: string;
  last_login_at?: string | null;
  updated_at: string;
}

/**
 * Ensures user is verified and stored in the InsForge `public.users` table.
 * If user does not exist in `public.users`, inserts a new record (first-time sign in).
 * If user exists, synchronizes updated fields like email_verified or profile details.
 */
export async function syncUserToDatabase(user: {
  id: string;
  email: string;
  profile?: { name?: string; avatar_url?: string } | null;
  emailVerified?: boolean;
  providers?: string[];
}): Promise<{ data: UserRecord | null; error: Error | null; isFirstTime: boolean }> {
  try {
    if (!user || !user.id || !user.email) {
      return { data: null, error: new Error("Invalid user payload"), isFirstTime: false };
    }

    // 1. Check if user already exists in the `users` table
    const { data: existingRows, error: selectError } = await insforge.database
      .from("users")
      .select("*")
      .eq("id", user.id);

    if (selectError) {
      console.warn("Error querying users table:", selectError);
    }

    const existing = existingRows && existingRows.length > 0 ? (existingRows[0] as UserRecord) : null;
    const isFirstTime = !existing;

    const displayName =
      user.profile?.name ||
      (existing ? existing.name : null) ||
      user.email.split("@")[0] ||
      "User";
    const avatarUrl = user.profile?.avatar_url || (existing ? existing.avatar_url : null) || null;
    const providers = user.providers || (existing ? existing.providers : null) || ["email"];
    const isVerified = user.emailVerified === true || existing?.email_verified === true;

    if (isFirstTime) {
      // First time sign-in: insert into public.users table (array format required by InsForge)
      const newRecord: UserRecord = {
        id: user.id,
        email: user.email,
        name: displayName,
        avatar_url: avatarUrl,
        providers,
        provider: providers[0] || "email",
        email_verified: isVerified,
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error: insertError } = await insforge.database
        .from("users")
        .insert([newRecord])
        .select();

      if (insertError) {
        console.error("Failed to insert user into public.users:", insertError);
        return { data: null, error: insertError, isFirstTime: true };
      }

      return {
        data: (inserted && inserted.length > 0 ? inserted[0] : newRecord) as UserRecord,
        error: null,
        isFirstTime: true,
      };
    } else {
      // Existing user: ensure updated verification state, last login, and profile
      const updateData = {
        email: user.email,
        name: displayName,
        avatar_url: avatarUrl,
        providers,
        email_verified: isVerified,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error: updateError } = await insforge.database
        .from("users")
        .update(updateData)
        .eq("id", user.id)
        .select();

      if (updateError) {
        console.warn("Failed to update user in public.users:", updateError);
        return { data: existing, error: updateError, isFirstTime: false };
      }

      return {
        data: (updated && updated.length > 0 ? updated[0] : { ...existing, ...updateData }) as UserRecord,
        error: null,
        isFirstTime: false,
      };
    }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    console.error("syncUserToDatabase error:", errorObj);
    return { data: null, error: errorObj, isFirstTime: false };
  }
}

/**
 * Saves or updates phone-authenticated user in the InsForge `public.users` table.
 * Includes user id, name, email, phone, authentication provider, verification method,
 * created date, and last login date.
 */
export async function savePhoneUserToDatabase(params: {
  phone: string;
  verificationMethod: "sms" | "whatsapp";
  name?: string | null;
  email?: string | null;
}): Promise<{ data: UserRecord | null; error: Error | null; isFirstTime: boolean }> {
  try {
    const { phone, verificationMethod, name, email } = params;
    const admin = getInsForgeAdmin();
    const db = admin ? admin.database : insforge.database;

    // Check if user already exists with this phone number
    const { data: existingRows, error: selectError } = await db
      .from("users")
      .select("*")
      .eq("phone", phone);

    if (selectError) {
      console.warn("Error querying users table by phone:", selectError);
    }

    const existing = existingRows && existingRows.length > 0 ? (existingRows[0] as UserRecord) : null;
    const isFirstTime = !existing;

    if (isFirstTime) {
      const generatedId = `usr_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
      const displayName = name?.trim() || `User ${phone.slice(-4)}`;

      const newRecord = {
        id: generatedId,
        name: displayName,
        email: email?.trim() || null,
        phone,
        provider: "phone",
        providers: ["phone"],
        verification_method: verificationMethod,
        avatar_url: null,
        email_verified: false,
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error: insertError } = await db
        .from("users")
        .insert([newRecord])
        .select();

      if (insertError) {
        console.error("Failed to insert phone user into public.users:", insertError);
        return { data: null, error: insertError, isFirstTime: true };
      }

      return {
        data: (inserted && inserted.length > 0 ? inserted[0] : newRecord) as UserRecord,
        error: null,
        isFirstTime: true,
      };
    } else {
      // Existing user: update last_login_at, verification_method, and optional fields
      const updateData: Partial<UserRecord> = {
        last_login_at: new Date().toISOString(),
        verification_method: verificationMethod,
        updated_at: new Date().toISOString(),
      };

      if (name?.trim() && !existing.name) {
        updateData.name = name.trim();
      }
      if (email?.trim() && !existing.email) {
        updateData.email = email.trim();
      }

      // Ensure providers includes 'phone'
      if (!existing.providers?.includes("phone")) {
        updateData.providers = [...(existing.providers || []), "phone"];
      }

      const { data: updated, error: updateError } = await db
        .from("users")
        .update(updateData)
        .eq("id", existing.id)
        .select();

      if (updateError) {
        console.warn("Failed to update phone user in public.users:", updateError);
        return { data: existing, error: updateError, isFirstTime: false };
      }

      return {
        data: (updated && updated.length > 0 ? updated[0] : { ...existing, ...updateData }) as UserRecord,
        error: null,
        isFirstTime: false,
      };
    }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    console.error("savePhoneUserToDatabase error:", errorObj);
    return { data: null, error: errorObj, isFirstTime: false };
  }
}
