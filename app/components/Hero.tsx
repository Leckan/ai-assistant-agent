"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Check,
  Play,
  RotateCcw,
  Zap,
  Lock,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export function Hero() {
  const [approvedAction, setApprovedAction] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleApprove = (idx: number) => {
    setApprovedAction(idx);
    setTimeout(() => {
      setApprovedAction(null);
    }, 2500);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background radial gradients & glow meshes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] md:w-[900px] md:h-[500px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-cyan-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Grid line texture overlay */}
      <div className="absolute inset-0 bg-grid-white opacity-40 pointer-events-none -z-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Announcement Pill */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-zinc-300 backdrop-blur-md mb-8 hover:border-indigo-500/40 transition-colors shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="font-mono text-cyan-300 font-medium">New v2.5</span>
            <span className="text-zinc-500">•</span>
            <span>Autonomous Cross-Channel AI Assistant</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12]">
            One AI Brain for Your{" "}
            <span className="gradient-accent">
              Gmail, WhatsApp, Telegram & Outlook
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-zinc-300 max-w-2xl leading-relaxed">
            Stop drowning in 300+ fragmented notifications. OmniMind connects
            your communications, filters noise, creates daily executive
            summaries, and automatically schedules reminders before things slip.
          </p>

          {/* Channel Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EA4335]/10 border border-[#EA4335]/30 text-xs font-medium text-red-200">
              <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
              Gmail Integrated
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-xs font-medium text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
              WhatsApp Synced
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#229ED9]/10 border border-[#229ED9]/30 text-xs font-medium text-sky-200">
              <span className="w-2 h-2 rounded-full bg-[#229ED9]" />
              Telegram Connected
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0078D4]/10 border border-[#0078D4]/30 text-xs font-medium text-blue-200">
              <span className="w-2 h-2 rounded-full bg-[#0078D4]" />
              Outlook Synced
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Connect Channels Free</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <a
              href="#simulator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-medium text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] transition-all backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Try Live Interactive Demo</span>
            </a>
          </div>

          {/* Trust Metrics */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              SOC-2 Type II Certified
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-400" />
              Zero-Knowledge Vault
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              99.8% Reminder Accuracy
            </span>
          </div>
        </div>

        {/* HERO INTERACTIVE MOCKUP SHOWCASE */}
        <div className="mt-14 relative mx-auto max-w-5xl">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/30 via-violet-500/20 to-cyan-500/30 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

          {/* Main App Container */}
          <div className="rounded-2xl border border-white/[0.12] bg-[#0c0e17]/90 shadow-2xl backdrop-blur-xl overflow-hidden">
            {/* Window Top Bar (Unix / macOS / Window controls) */}
            <div className="px-4 py-3 bg-[#111422] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="ml-3 font-mono text-xs text-zinc-400 hidden sm:inline">
                  omnimind-agent — daemon://live-inbox-synthesis
                </span>
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>4 Channels Live</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-400">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Next Brief: 08:00 AM</span>
                </div>
              </div>
            </div>

            {/* Main Interactive Workspace Area */}
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Live Multi-Channel Stream (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    Incoming Unified Feeds
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    Real-time (4 unread)
                  </span>
                </div>

                {/* Feed item 1: Gmail */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/30 transition-all flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-red-400">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Gmail • Marcus Vance (CFO)
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      2m ago
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 font-medium">
                    "Urgent: Q3 Budget deck sign-off needed before the 4:00 PM board call."
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/50 text-red-300 border border-red-500/30">
                      Priority: Urgent
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Attachment: Q3_Financials.pdf
                    </span>
                  </div>
                </div>

                {/* Feed item 2: WhatsApp Voice Note */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 transition-all flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      WhatsApp • Elena (Design Lead)
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      8m ago
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="p-1 rounded bg-emerald-500 text-black hover:bg-emerald-400 transition"
                      aria-label="Play audio"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-emerald-300">
                        <span>Voice Memo (0:48)</span>
                        <span>Auto-Transcribed</span>
                      </div>
                      <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full bg-emerald-400 ${
                            isPlayingAudio ? "w-3/4 animate-pulse" : "w-1/3"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 italic">
                    "Hey! Can you review the mobile flow Figma before noon and confirm if we're lunching Thursday?"
                  </p>
                </div>

                {/* Feed item 3: Telegram Alert */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-sky-500/30 transition-all flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-sky-400">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      Telegram • DevOps Deployment Bot
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      15m ago
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Release v2.8.1 deployed to Production successfully. 0 downtime.
                  </p>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 w-fit">
                    Tagged: Automated Digest
                  </span>
                </div>

                {/* Feed item 4: Outlook Calendar */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/30 transition-all flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Outlook • Microsoft 365
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      24m ago
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200">
                    Schedule conflict: "Series B Partner Sync" overlaps with "Design Review" at 3:00 PM.
                  </p>
                </div>
              </div>

              {/* Right Column: AI Synthesis & Autonomous Reminders (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {/* Agent Header banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-cyan-950/40 border border-indigo-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/40">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          OmniMind Autonomous Synthesis
                        </span>
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300">
                        Synthesizing across 4 connected channels in 180ms
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block text-xs font-mono text-zinc-400">
                    High Signal: 96%
                  </span>
                </div>

                {/* Synthesis Output Box */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#111422] border border-white/[0.08] flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-indigo-400 uppercase">
                        Executive Summary Brief
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        (Today, 8:45 AM)
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 font-mono">
                      <Check className="w-3.5 h-3.5" />
                      3 Actions Ready
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                    You have <strong className="text-white">1 critical approval</strong> from Marcus Vance on Gmail before 4 PM. Elena left a 48s WhatsApp voice note requesting Figma feedback by noon. In Outlook, an afternoon calendar clash was detected and an optimal rescheduling slot was prepared.
                  </p>

                  {/* Extracted Reminders & Actions List */}
                  <div className="mt-2 flex flex-col gap-2.5">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Proactively Extracted Reminders & Actions:
                    </div>

                    {/* Action 1 */}
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3 hover:bg-white/[0.04] transition">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-md bg-red-500/20 text-red-400 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">
                            Review CFO Budget Deck & Send Sign-off
                          </p>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            Deadline: Today at 3:30 PM • Auto-syncs to Apple Reminders
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleApprove(1)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          approvedAction === 1
                            ? "bg-emerald-600 text-white"
                            : "bg-indigo-600/80 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        {approvedAction === 1 ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Scheduled
                          </>
                        ) : (
                          "Add Reminder"
                        )}
                      </button>
                    </div>

                    {/* Action 2 */}
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3 hover:bg-white/[0.04] transition">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">
                            Lunch with Elena on Thursday (1:00 PM)
                          </p>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            Extracted from WhatsApp audio • Slot holds open in Outlook
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleApprove(2)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          approvedAction === 2
                            ? "bg-emerald-600 text-white"
                            : "bg-indigo-600/80 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        {approvedAction === 2 ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Saved
                          </>
                        ) : (
                          "Confirm Hold"
                        )}
                      </button>
                    </div>

                    {/* Action 3 */}
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3 hover:bg-white/[0.04] transition">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-400 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">
                            Auto-Draft Reply to Marcus (Gmail)
                          </p>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            "Marcus, reviewing Section 4 now. Feedback by 3 PM."
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleApprove(3)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          approvedAction === 3
                            ? "bg-emerald-600 text-white"
                            : "bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200"
                        }`}
                      >
                        {approvedAction === 3 ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Sent
                          </>
                        ) : (
                          "Send Draft"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Summary bar footnote */}
                  <div className="mt-2 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>Summary sent via Telegram Bot & Email Digest</span>
                    <span className="text-indigo-400 font-medium cursor-pointer hover:underline">
                      Configure Delivery Settings →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
