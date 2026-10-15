"use client";

import React from "react";
import {
  Link2,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Shield,
  Bell,
  Sparkles
} from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Connect Your Accounts in 60s",
      description:
        "Authenticate Gmail and Outlook with official OAuth 2.0. Scan a private QR code for WhatsApp and link your Telegram bot in one click. No passwords stored, ever.",
      badge: "Zero Password Storage",
      icon: Link2,
      metrics: "60-second onboarding",
    },
    {
      number: "02",
      title: "AI Analyzes, Prioritizes & Extracts",
      description:
        "Our specialized NLP models continuously parse incoming emails, audio voice notes, and chat threads. It distinguishes true urgency from channel noise.",
      badge: "Local or Vault LLM",
      icon: Cpu,
      metrics: "99.8% precision rate",
    },
    {
      number: "03",
      title: "Receive Executive Briefs & Reminders",
      description:
        "Get your consolidated briefing delivered where you want it. Commitments become calendar holds, voice notes become bulleted tasks, and drafts wait for 1-click approval.",
      badge: "Zero-Click Followups",
      icon: CheckCircle2,
      metrics: "Save 12+ hrs / week",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative bg-[#08090d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Effortless Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How OmniMind Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            From setup to your first executive briefing in less than three minutes.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 -translate-y-8 pointer-events-none" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-[#0d101c] border border-white/[0.08] hover:border-indigo-500/30 transition-all flex flex-col justify-between relative group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-3xl font-black text-white/20 group-hover:text-indigo-400 transition-colors">
                      {step.number}
                    </span>
                    <span className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </span>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                    {step.badge}
                  </span>

                  <h3 className="text-xl font-bold text-white mt-3 group-hover:text-indigo-200 transition-colors">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span className="text-emerald-400 font-medium">{step.metrics}</span>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
