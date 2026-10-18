"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Zap,
  RefreshCw,
  Phone,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { PhoneAuthForm } from "@/app/components/PhoneAuthForm";

function SignUpContent() {
  const router = useRouter();
  const {
    user,
    signUp,
    signInWithGoogle,
    verifyOtp,
    instantVerify,
    resendVerificationEmail,
    isLoading,
  } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    const result = await signUp(email, password, name);
    setSubmitting(false);

    if (result.success) {
      if (result.requireEmailVerification) {
        setIsVerifying(true);
        setSuccessMsg("Account created! Enter the 6-digit verification code to complete setup.");
        setResendCooldown(60);
      } else {
        setSuccessMsg("Account created successfully! Loading your dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } else {
      setErrorMsg(result.error || "Failed to create account. Please check your details.");
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    const res = await signInWithGoogle();
    if (!res.success && res.error) {
      setErrorMsg(res.error);
      setGoogleLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg("Please enter the 6-digit code.");
      return;
    }

    setVerifyingOtp(true);
    setErrorMsg(null);

    const res = await verifyOtp(email, otpCode);
    setVerifyingOtp(false);

    if (res.success) {
      setSuccessMsg("Email verified! Your profile is saved in the InsForge database. Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    } else {
      setErrorMsg(res.error || "Invalid or expired verification code.");
    }
  };

  const handleInstantVerify = async () => {
    setVerifyingOtp(true);
    setErrorMsg(null);

    const res = await instantVerify(email);
    if (res.success) {
      setSuccessMsg("User verified and saved in InsForge database! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/sign-in?verified=true");
      }, 900);
    } else {
      setVerifyingOtp(false);
      setErrorMsg(res.error || "Instant verification failed.");
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg(null);
    const res = await resendVerificationEmail(email);
    if (res.success) {
      setSuccessMsg("A new verification code has been sent!");
      setResendCooldown(60);
    } else {
      setErrorMsg(res.error || "Failed to resend code.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090d] text-slate-900 dark:text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Top-right Theme Toggle */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-zinc-300 shadow-xs transition-colors"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>
      </div>

      {/* Background Gradients & Atmospheric Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-indigo-600/15 via-violet-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 left-10 w-[500px] h-[350px] bg-indigo-600/10 blur-[100px] pointer-events-none" />

      {/* Header / Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-3 group mb-6">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
            <div className="w-full h-full bg-slate-950 dark:bg-[#0d0f18] rounded-[15px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Omni<span className="text-indigo-600 dark:text-indigo-400">Mind</span>
          </span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
          Connect Gmail, WhatsApp, Telegram & Outlook with InsForge
        </p>
      </div>

      {/* Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl relative">
          {/* Alerts */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-3 p-3.5 text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 rounded-xl animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-start gap-3 p-3.5 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Method Selector Tabs */}
          {!isVerifying && (
            <div className="flex rounded-xl bg-slate-100 dark:bg-black/40 p-1 border border-slate-200 dark:border-white/[0.08] mb-6">
              <button
                type="button"
                onClick={() => setAuthMethod("email")}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                  authMethod === "email"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email / Gmail</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("phone")}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                  authMethod === "phone"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone (SMS / WhatsApp)</span>
              </button>
            </div>
          )}

          {authMethod === "phone" ? (
            <PhoneAuthForm mode="sign-up" />
          ) : isVerifying ? (
            /* OTP Verification Screen */
            <div className="space-y-5">
              <div className="text-center p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/15 dark:bg-indigo-600/20 border border-indigo-300 dark:border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Verify Your Email</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                  Enter the 6-digit code sent to{" "}
                  <strong className="text-slate-900 dark:text-zinc-200">{email}</strong> to verify your account and save your profile in the InsForge database.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.35em] font-mono text-2xl py-3 px-4 rounded-xl bg-white dark:bg-black/40 border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifyingOtp || otpCode.length < 4}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-zinc-600 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? "animate-spin" : ""}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-300"
                >
                  Change email
                </button>
              </div>

              {/* Instant Verification Fallback */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={handleInstantVerify}
                  disabled={verifyingOtp}
                  className="w-full py-2.5 px-3 text-xs font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/30 hover:bg-cyan-100 dark:hover:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-500/30 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Instant Verify (Test Mode / 1-Click)</span>
                </button>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500 text-center mt-1.5 font-mono">
                  Bypasses email delivery to verify user directly in InsForge database
                </p>
              </div>
            </div>
          ) : (
            /* Sign Up Form */
            <div className="space-y-6">
              {/* Google / Gmail OAuth Button */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading || submitting}
                  className="w-full py-3 px-4 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] active:bg-slate-100 dark:active:bg-white/[0.1] border border-slate-300 dark:border-white/[0.12] hover:border-slate-400 dark:hover:border-white/[0.22] text-slate-900 dark:text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-3 group relative shadow-xs"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Sign up with Gmail / Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-white/[0.08] w-full" />
                <span className="bg-white dark:bg-[#0e101a] px-3 text-xs font-mono uppercase text-slate-400 dark:text-zinc-500 tracking-wider shrink-0">
                  or register with email
                </span>
                <div className="border-t border-slate-200 dark:border-white/[0.08] w-full" />
              </div>

              {/* Form */}
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1 block">
                    Must be at least 6 characters.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || googleLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer link to Sign In */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/[0.08] text-center">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Home link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5"
          >
            ← Back to OmniMind AI
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#08090d] flex items-center justify-center text-slate-500 dark:text-zinc-500">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
