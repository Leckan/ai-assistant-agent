"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, CheckCircle2, AlertCircle, Loader2, Sparkles, Database } from "lucide-react";
import { insforge, syncUserToDatabase } from "@/lib/insforge";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"processing" | "saving" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ email: string; name?: string; isFirstTime?: boolean } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleCallback() {
      try {
        const errorParam = searchParams.get("error") || searchParams.get("insforge_error");
        if (errorParam) {
          if (mounted) {
            setStatus("error");
            setErrorMessage(decodeURIComponent(errorParam));
          }
          return;
        }

        setStatus("processing");

        // Wait a brief tick to allow SDK's detectAuthCallback to process
        await new Promise((r) => setTimeout(r, 400));

        // Get current authenticated user
        const { data, error } = await insforge.auth.getCurrentUser();

        if (error || !data?.user) {
          // If not found yet, give it one more quick attempt
          await new Promise((r) => setTimeout(r, 800));
          const retry = await insforge.auth.getCurrentUser();
          if (retry.error || !retry.data?.user) {
            if (mounted) {
              setStatus("error");
              setErrorMessage(
                error?.message || retry.error?.message || "Failed to finalize authentication session."
              );
            }
            return;
          }
          data.user = retry.data.user;
        }

        if (mounted) {
          setStatus("saving");
        }

        // Save user to InsForge database under public.users table (first time sign-in check)
        const user = data.user;
        const { data: dbRecord, isFirstTime, error: syncError } = await syncUserToDatabase({
          id: user.id,
          email: user.email,
          profile: user.profile,
          emailVerified: true, // OAuth is verified by provider
          providers: user.providers || ["google"],
        });

        if (syncError) {
          console.warn("Could not save to users table:", syncError);
        }

        if (mounted) {
          setUserInfo({
            email: user.email,
            name: dbRecord?.name || user.profile?.name || user.email.split("@")[0],
            isFirstTime,
          });
          setStatus("success");

          // Smoothly redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard");
          }, 1200);
        }
      } catch (err: unknown) {
        if (mounted) {
          setStatus("error");
          setErrorMessage(err instanceof Error ? err.message : "Unexpected authentication error.");
        }
      }
    }

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/15 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full glass-panel rounded-2xl p-8 text-center relative z-10 border border-white/[0.08] shadow-2xl backdrop-blur-xl">
        {/* Brand Icon */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 mx-auto mb-6">
          <div className="w-full h-full bg-[#0d0f18] rounded-[15px] flex items-center justify-center">
            <Bot className="w-7 h-7 text-indigo-400 animate-pulse" />
          </div>
        </div>

        {status === "processing" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              <span>Verifying Authentication</span>
            </h2>
            <p className="text-sm text-zinc-400">
              Exchanging credentials and verifying your Google session with InsForge...
            </p>
          </div>
        )}

        {status === "saving" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Database className="w-5 h-5 text-cyan-400 animate-bounce" />
              <span>Updating InsForge Database</span>
            </h2>
            <p className="text-sm text-zinc-400">
              Checking users table and saving your verified account information...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {userInfo?.isFirstTime ? "Welcome to OmniMind AI!" : "Welcome back!"}
            </h2>
            <p className="text-sm text-zinc-300">
              Signed in as <strong className="text-indigo-400">{userInfo?.email}</strong>.
            </p>
            <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs font-mono text-indigo-300 inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>User record synchronized in InsForge database</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Redirecting to your dashboard...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-5 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Authentication Failed</h2>
            <p className="text-sm text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-500/20">
              {errorMessage || "An unexpected error occurred during sign-in callback."}
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push("/sign-in")}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-sm hover:from-indigo-500 hover:to-violet-500 transition-all shadow-md shadow-indigo-600/30"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090d] flex items-center justify-center text-zinc-500">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
