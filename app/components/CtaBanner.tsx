"use client";

import React, { useState } from "react";
import { ArrowRight, Sparkles, Check, ShieldCheck, Lock } from "lucide-react";

export function CtaBanner() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
      }, 4000);
    }
  };

  return (
    <section className="py-20 relative bg-[#08090d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-[#101426] to-purple-950/50 p-8 sm:p-14 text-center shadow-2xl">
          {/* Background decorative glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.15] text-xs font-mono text-cyan-300 mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Setup • No Credit Card Required</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Reclaim 12+ Hours Every Week From Message Overload
            </h2>

            <p className="mt-4 text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto">
              Connect your Gmail, WhatsApp, Telegram, and Outlook in 60 seconds. Wake up tomorrow with an autonomous executive briefing and zero missed reminders.
            </p>

            {/* Email Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work or personal email..."
                className="flex-1 px-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.15] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400 backdrop-blur-md font-sans"
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
              >
                {submitted ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Invite Sent!</span>
                  </>
                ) : (
                  <>
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Micro badges below CTA */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                14-Day Free Trial
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Zero-Knowledge Privacy
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Cancel in 1 Click
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
