"use client";

import React, { useState } from "react";
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export function Pricing() {
  const [annualBilling, setAnnualBilling] = useState(true);

  const tiers = [
    {
      name: "Starter",
      tagline: "For individuals testing AI inbox management",
      priceMonthly: "$0",
      priceAnnual: "$0",
      period: "forever free",
      badge: null,
      highlight: false,
      features: [
        "2 Connected Channels (Gmail + Telegram)",
        "Daily 8:00 AM Executive Brief",
        "Up to 30 Smart Reminders / month",
        "Standard Webhook Ingestion (5-min poll)",
        "Community Support",
      ],
      cta: "Get Started Free",
      ctaStyle: "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.1]",
    },
    {
      name: "Pro Assistant",
      tagline: "For busy founders, professionals & creators",
      priceMonthly: "$24",
      priceAnnual: "$19",
      period: "/ month",
      badge: "Most Popular",
      highlight: true,
      features: [
        "All 4 Channels (Gmail, WhatsApp, TG, Outlook)",
        "Unlimited Morning & Evening Executive Briefs",
        "Unlimited Zero-Click Reminders & Calendar Holds",
        "WhatsApp & Telegram Voice Note Transcription",
        "Outlook & Google Calendar Clash Resolver",
        "Tone-Matching Ghostwritten Replies",
        "Universal Cross-Platform Semantic Search",
        "Apple Reminders, Todoist & Notion Sync",
      ],
      cta: "Start 14-Day Free Trial",
      ctaStyle:
        "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30",
    },
    {
      name: "Executive Vault",
      tagline: "For executives, lawyers & privacy-first users",
      priceMonthly: "$59",
      priceAnnual: "$49",
      period: "/ month",
      badge: "Maximum Security",
      highlight: false,
      features: [
        "Everything in Pro",
        "Unlimited Multi-Accounts (e.g., 3 Gmails + 2 Outlooks)",
        "Zero-Knowledge Vault with BYOK (Bring Your Own Key)",
        "Local LLM Support (Ollama / Llama-3 / Mistral)",
        "Custom UNIX Daemon & Cron Automations",
        "Direct 24/7 Priority Support & 99.99% SLA",
      ],
      cta: "Get Executive Vault",
      ctaStyle: "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.1]",
    },
  ];

  return (
    <section id="pricing" className="py-24 relative bg-[#090b14] border-t border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300 mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Invest in Peace of Mind
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Reclaim 15+ hours every week. Cancel anytime with a 1-click guarantee.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !annualBilling
                  ? "bg-white/[0.1] text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                annualBilling
                  ? "bg-indigo-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-mono bg-emerald-400 text-black px-1.5 py-0.5 rounded-full font-bold">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-3xl flex flex-col justify-between transition-all relative ${
                tier.highlight
                  ? "bg-[#0f1324] border-2 border-indigo-500/60 shadow-2xl shadow-indigo-600/10 scale-105 z-10"
                  : "bg-[#0d101c] border border-white/[0.08] hover:border-white/[0.15]"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                  {tier.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-6">{tier.tagline}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">
                    {annualBilling ? tier.priceAnnual : tier.priceMonthly}
                  </span>
                  <span className="text-sm font-mono text-zinc-400">
                    {tier.period}
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-zinc-300 leading-relaxed">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06]">
                <a
                  href="#pricing"
                  className={`w-full py-3 px-4 rounded-xl text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${tier.ctaStyle}`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
