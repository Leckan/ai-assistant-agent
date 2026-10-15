"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  insforge,
  syncUserToDatabase,
  type UserRecord,
} from "@/lib/insforge";
import { AuthChangeEvent } from "@insforge/sdk";

export interface AuthUser {
  id: string;
  email: string | null;
  phone?: string | null;
  emailVerified: boolean;
  providers?: string[];
  provider?: string;
  verification_method?: string;
  profile?: {
    name?: string;
    avatar_url?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  metadata?: Record<string, unknown>;
}

interface AuthContextType {
  user: AuthUser | null;
  dbUser: UserRecord | null;
  isLoading: boolean;
  isFirstTime: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{
    success: boolean;
    requireEmailVerification?: boolean;
    error?: string;
  }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  instantVerify: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  sendPhoneOtp: (phone: string, channel: "sms" | "whatsapp") => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    devOtp?: string;
    simulated?: boolean;
  }>;
  verifyPhoneOtp: (params: {
    phone: string;
    otp: string;
    channel: "sms" | "whatsapp";
    name?: string;
    email?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [dbUser, setDbUser] = useState<UserRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Sync email/OAuth user with InsForge public.users table
  const handleUserSync = useCallback(async (rawUser: unknown) => {
    if (!rawUser) {
      setUser(null);
      setDbUser(null);
      return;
    }

    const authUser = rawUser as AuthUser;
    setUser(authUser);

    try {
      if (authUser.email) {
        const { data: syncedRecord, isFirstTime: firstTime } = await syncUserToDatabase({
          id: authUser.id,
          email: authUser.email,
          profile: authUser.profile,
          emailVerified: authUser.emailVerified,
          providers: authUser.providers,
        });

        if (syncedRecord) {
          setDbUser(syncedRecord);
          setIsFirstTime(firstTime);
        }
      }
    } catch (err) {
      console.error("Failed to sync user to database:", err);
    }
  }, []);

  // Fetch current user from session on mount and listen to auth changes
  const refreshUser = useCallback(async () => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (!error && data?.user) {
        await handleUserSync(data.user);
        return;
      }

      // Check for phone user session in localStorage
      if (typeof window !== "undefined") {
        const storedPhoneUser = localStorage.getItem("omnimind_phone_user");
        if (storedPhoneUser) {
          try {
            const parsed = JSON.parse(storedPhoneUser);
            if (parsed?.id) {
              const { data: dbRows } = await insforge.database
                .from("users")
                .select("*")
                .eq("id", parsed.id);

              if (dbRows && dbRows.length > 0) {
                const record = dbRows[0] as UserRecord;
                setDbUser(record);
                setUser({
                  id: record.id,
                  email: record.email,
                  phone: record.phone,
                  emailVerified: record.email_verified,
                  providers: record.providers || ["phone"],
                  provider: record.provider || "phone",
                  verification_method: record.verification_method || undefined,
                  profile: {
                    name: record.name || undefined,
                    avatar_url: record.avatar_url || undefined,
                  },
                  createdAt: record.created_at,
                  updatedAt: record.updated_at,
                  lastLoginAt: record.last_login_at || undefined,
                });
                return;
              }
            }
          } catch (e) {
            console.warn("Failed to parse stored phone user:", e);
          }
        }
      }

      setUser(null);
      setDbUser(null);
    } catch (err) {
      console.warn("Failed to retrieve current user:", err);
      setUser(null);
      setDbUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [handleUserSync]);

  useEffect(() => {
    refreshUser();

    // Subscribe to auth state changes from InsForge SDK
    const unsubscribe = insforge.auth.onAuthStateChange(async (event: AuthChangeEvent) => {
      if (event === AuthChangeEvent.SIGNED_OUT) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("omnimind_phone_user");
        }
        setUser(null);
        setDbUser(null);
        setIsLoading(false);
      } else {
        await refreshUser();
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [refreshUser, handleUserSync]);

  // Sign In with email and password
  const signInWithPassword = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setIsLoading(false);
        return {
          success: false,
          error: error.message || (error as { nextActions?: string }).nextActions || "Invalid credentials",
        };
      }

      if (data?.user) {
        await handleUserSync(data.user);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: "Unable to sign in. Please try again." };
    } catch (err: unknown) {
      setIsLoading(false);
      return {
        success: false,
        error: err instanceof Error ? err.message : "An unexpected error occurred during sign in",
      };
    }
  };

  // Sign Up with email, password, and name
  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await insforge.auth.signUp({
        email: email.trim(),
        password,
        name: name?.trim() || undefined,
        redirectTo: `${origin}/sign-in`,
      });

      if (error) {
        setIsLoading(false);
        return {
          success: false,
          error: error.message || (error as { nextActions?: string }).nextActions || "Failed to create account",
        };
      }

      if (data?.requireEmailVerification) {
        setIsLoading(false);
        return {
          success: true,
          requireEmailVerification: true,
        };
      }

      if (data?.user) {
        await handleUserSync(data.user);
      }

      setIsLoading(false);
      return { success: true, requireEmailVerification: false };
    } catch (err: unknown) {
      setIsLoading(false);
      return {
        success: false,
        error: err instanceof Error ? err.message : "An unexpected error occurred during sign up",
      };
    }
  };

  // Sign in / Sign up with Google OAuth (Gmail)
  const signInWithGoogle = async (redirectTo?: string) => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const targetUrl = redirectTo || `${origin}/auth/callback`;

      const { data, error } = await insforge.auth.signInWithOAuth("google", {
        redirectTo: targetUrl,
        additionalParams: { prompt: "select_account" },
        skipBrowserRedirect: false,
      });

      if (error) {
        return { success: false, error: error.message || "Failed to initiate Google authentication" };
      }

      // If browser didn't auto redirect, navigate manually
      if (data?.url && typeof window !== "undefined") {
        window.location.href = data.url;
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error initiating Google authentication",
      };
    }
  };

  // Verify Email OTP Code
  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email: email.trim(),
        otp: otp.trim(),
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message || "Invalid or expired verification code" };
      }

      if (data?.user) {
        await handleUserSync(data.user);
      } else {
        await refreshUser();
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to verify email code",
      };
    }
  };

  // Instant Verification fallback (marks user verified in Postgres)
  const instantVerify = async (email: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await insforge.database.rpc("verify_user_by_email", {
        target_email: email.trim(),
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message || "Failed to verify user" };
      }

      await refreshUser();
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to verify user",
      };
    }
  };

  // Resend OTP email
  const resendVerificationEmail = async (email: string) => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await insforge.auth.resendVerificationEmail({
        email: email.trim(),
        redirectTo: `${origin}/sign-in`,
      });

      if (error) {
        return { success: false, error: error.message || "Failed to resend verification email" };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to resend verification code",
      };
    }
  };

  // Send Phone OTP via Sent.dm (SMS or WhatsApp)
  const sendPhoneOtp = async (phone: string, channel: "sms" | "whatsapp") => {
    try {
      const res = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, channel }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to send verification code" };
      }
      return {
        success: true,
        message: data.message,
        devOtp: data.devOtp,
        simulated: data.simulated,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error requesting phone verification",
      };
    }
  };

  // Verify Phone OTP and complete authentication
  const verifyPhoneOtp = async (params: {
    phone: string;
    otp: string;
    channel: "sms" | "whatsapp";
    name?: string;
    email?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/phone/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.user) {
        setIsLoading(false);
        return { success: false, error: data.error || "Failed to verify code" };
      }

      const savedUser: UserRecord = data.user;
      setDbUser(savedUser);
      setIsFirstTime(!!data.isFirstTime);

      const authUser: AuthUser = {
        id: savedUser.id,
        email: savedUser.email,
        phone: savedUser.phone,
        emailVerified: savedUser.email_verified,
        providers: savedUser.providers || ["phone"],
        provider: "phone",
        verification_method: savedUser.verification_method || params.channel,
        profile: {
          name: savedUser.name || undefined,
          avatar_url: savedUser.avatar_url || undefined,
        },
        createdAt: savedUser.created_at,
        updatedAt: savedUser.updated_at,
        lastLoginAt: savedUser.last_login_at || undefined,
      };

      setUser(authUser);

      // Save phone session in localStorage for persistent login
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "omnimind_phone_user",
          JSON.stringify({ id: savedUser.id, phone: savedUser.phone })
        );
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to verify phone OTP",
      };
    }
  };

  // Sign Out
  const signOut = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("omnimind_phone_user");
      }
      await insforge.auth.signOut();
      setUser(null);
      setDbUser(null);
    } catch (err) {
      console.warn("Sign out error:", err);
      setUser(null);
      setDbUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        isLoading,
        isFirstTime,
        signInWithPassword,
        signUp,
        signInWithGoogle,
        verifyOtp,
        instantVerify,
        resendVerificationEmail,
        sendPhoneOtp,
        verifyPhoneOtp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
