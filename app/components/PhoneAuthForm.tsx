"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  MessageSquare,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface PhoneAuthFormProps {
  mode: "sign-in" | "sign-up";
  onSuccess?: () => void;
}

export function PhoneAuthForm({ mode, onSuccess }: PhoneAuthFormProps) {
  const router = useRouter();
  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("sms");
  const [step, setStep] = useState<"input" | "verify">("input");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    let clean = phone.trim().replace(/[^\d+]/g, "");
    if (!clean.startsWith("+")) {
      clean = "+" + clean;
    }

    if (clean.length < 9) {
      setErrorMsg("Please enter a valid phone number with country code (e.g. +14155552671).");
      return;
    }

    setSending(true);
    const res = await sendPhoneOtp(clean, channel);
    setSending(false);

    if (res.success) {
      setStep("verify");
      setSuccessMsg(
        `Verification code dispatched via ${channel === "whatsapp" ? "WhatsApp" : "SMS"} to ${clean}`
      );
      setCooldown(60);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
    } else {
      setErrorMsg(res.error || "Failed to send verification code. Please check the phone number.");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setErrorMsg("Please enter the verification code.");
      return;
    }

    setVerifying(true);
    setErrorMsg(null);

    let clean = phone.trim().replace(/[^\d+]/g, "");
    if (!clean.startsWith("+")) clean = "+" + clean;

    const res = await verifyPhoneOtp({
      phone: clean,
      otp,
      channel,
      name: name.trim() || undefined,
    });

    setVerifying(false);

    if (res.success) {
      setSuccessMsg("Phone authenticated successfully! Redirecting to dashboard...");
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard");
        }
      }, 700);
    } else {
      setErrorMsg(res.error || "Invalid or expired verification code.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-3.5 text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 rounded-xl animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-3 p-3.5 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {step === "input" ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          {mode === "sign-up" && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                Full Name (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Phone Number Input */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
              Phone Number (with Country Code)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1 font-mono">
              Include country code e.g. +1 (US), +44 (UK), +91 (India)
            </p>
          </div>

          {/* Verification Method: SMS vs WhatsApp */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-2">
              Select Verification Delivery Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* SMS Option */}
              <button
                type="button"
                onClick={() => setChannel("sms")}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  channel === "sms"
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-600/15 ring-1 ring-indigo-500"
                    : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  {channel === "sms" && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white">SMS OTP</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">Sent.dm SMS Gateway</div>
                </div>
              </button>

              {/* WhatsApp Option */}
              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  channel === "whatsapp"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-600/15 ring-1 ring-emerald-500"
                    : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </div>
                  {channel === "whatsapp" && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white">WhatsApp OTP</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">Sent.dm WhatsApp API</div>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={sending || !phone}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Code via {channel === "whatsapp" ? "WhatsApp" : "SMS"}...</span>
              </>
            ) : (
              <>
                <span>Send {channel === "whatsapp" ? "WhatsApp" : "SMS"} Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* OTP Verification Step */
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px] mx-auto mb-2.5">
              <div className="w-full h-full bg-white dark:bg-[#0d0f18] rounded-[11px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <div className="text-xs text-slate-600 dark:text-zinc-400">
              Code sent via{" "}
              <strong className="text-slate-900 dark:text-white">
                {channel === "whatsapp" ? "WhatsApp" : "SMS"}
              </strong>{" "}
              to <strong className="text-indigo-600 dark:text-indigo-300 font-mono">{phone}</strong>
            </div>
          </div>

          {/* Dev OTP Helper */}
          {devOtp && (
            <div
              onClick={() => setOtp(devOtp)}
              className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 text-xs font-mono text-cyan-700 dark:text-cyan-300 flex items-center justify-between cursor-pointer hover:bg-cyan-100 dark:hover:bg-cyan-950/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Sent.dm Sandbox OTP: <strong>{devOtp}</strong></span>
              </div>
              <span className="text-[10px] underline">Click to autofill</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-[0.35em] font-mono text-2xl py-3 px-4 rounded-xl bg-white dark:bg-black/50 border border-slate-300 dark:border-white/[0.12] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={verifying || otp.length < 4}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying & Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Verify & Authenticate</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Actions & Resend */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => handleSendCode()}
              disabled={cooldown > 0 || sending}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-zinc-600 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cooldown > 0 ? "animate-spin" : ""}`} />
              <span>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("input");
                setOtp("");
                setErrorMsg(null);
              }}
              className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
            >
              Change number or method
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
