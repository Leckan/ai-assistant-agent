"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Sparkles,
  Check,
  Zap,
  Smartphone,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function PricingSettingsView() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Large Solid Pink Icon */}
            <div className="w-16 h-16 rounded-2xl bg-pink-600 flex items-center justify-center text-white shadow-xl shadow-pink-600/30 shrink-0">
              <CreditCard className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Pricing & Subscription Settings
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Pro Plan Active
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Manage your membership tier, model tokens, Sent.dm SMS balance, and billing details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-white/[0.12] text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                billingCycle === "yearly"
                  ? "bg-pink-600 text-white shadow-md shadow-pink-600/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Yearly</span>
              <span className="px-1.5 py-0.2 bg-white/20 text-[10px] rounded-full font-mono">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Usage & Balance Cards with Large Solid Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              AI Token Consumption
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">1.4M / 5.0M</h3>
            <p className="text-xs text-emerald-400 mt-1">72% remaining this cycle</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/25">
            <Zap className="w-7 h-7 stroke-[2]" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Sent.dm SMS/WhatsApp Balance
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">$42.80</h3>
            <p className="text-xs text-zinc-400 mt-1">Auto-reload at $10.00</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/25">
            <Smartphone className="w-7 h-7 stroke-[2]" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Next Renewal Date
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">Nov 15, 2026</h3>
            <p className="text-xs text-zinc-400 mt-1">Visa ending in 4242</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-pink-600 flex items-center justify-center text-white shadow-lg shadow-pink-600/25">
            <CreditCard className="w-7 h-7 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Pricing Tiers Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Free Starter */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.06] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-white shadow-md mb-4">
              <Zap className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-lg font-bold text-white">Starter</h4>
            <p className="text-xs text-zinc-400 mt-1">Basic email assistant</p>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-white">$0</span>
              <span className="text-xs text-zinc-400"> / month</span>
            </div>
            <ul className="mt-6 space-y-3 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1 Connected Email Inbox</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Daily morning text digest</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-500">
                <span>✕ WhatsApp & Sent.dm gateway</span>
              </li>
            </ul>
          </div>
          <button
            disabled
            className="w-full mt-6 py-2.5 rounded-xl bg-white/[0.04] text-zinc-400 text-xs font-semibold cursor-not-allowed"
          >
            Included Free
          </button>
        </div>

        {/* Pro Plan (Current Active) */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1c1833] to-[#121422] border-2 border-pink-500/60 shadow-xl shadow-pink-600/10 flex flex-col justify-between relative">
          <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-pink-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-md">
            Current Plan
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-pink-600 flex items-center justify-center text-white shadow-md shadow-pink-600/30 mb-4">
              <Sparkles className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-lg font-bold text-white">Professional</h4>
            <p className="text-xs text-zinc-300 mt-1">Autonomous multi-channel power user</p>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-white">
                {billingCycle === "yearly" ? "$29" : "$35"}
              </span>
              <span className="text-xs text-zinc-400"> / month</span>
            </div>
            <ul className="mt-6 space-y-3 text-xs text-zinc-200">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Unlimited Gmail, Outlook & Telegram</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Full Sent.dm WhatsApp & SMS bot bridge</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Audio briefing generator (2-min voice)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-pink-400 shrink-0" />
                <span>VIP Priority escalation & auto-drafting</span>
              </li>
            </ul>
          </div>
          <button className="w-full mt-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-lg shadow-pink-600/25 transition-all">
            Manage Subscription
          </button>
        </div>

        {/* Enterprise */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.06] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 mb-4">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-lg font-bold text-white">Enterprise</h4>
            <p className="text-xs text-zinc-400 mt-1">Custom team governance & on-prem SLA</p>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-white">
                {billingCycle === "yearly" ? "$99" : "$119"}
              </span>
              <span className="text-xs text-zinc-400"> / seat</span>
            </div>
            <ul className="mt-6 space-y-3 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Shared team inboxes & shared agent memory</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Dedicated PostgreSQL instance on InsForge</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Custom LLM fine-tuning & 99.99% SLA</span>
              </li>
            </ul>
          </div>
          <button className="w-full mt-6 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold transition-all">
            Upgrade to Enterprise
          </button>
        </div>
      </div>
    </div>
  );
}
