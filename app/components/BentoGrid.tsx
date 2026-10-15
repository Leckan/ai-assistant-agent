"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  Bell,
  Clock,
  Mic,
  ShieldCheck,
  Search,
  CheckCircle,
  ArrowUpRight,
  Sliders,
  Send,
  Zap,
  Lock,
  Layers,
  ChevronRight,
  Volume2
} from "lucide-react";

export function BentoGrid() {
  const [toneSelection, setToneSelection] = useState<"casual" | "executive" | "concise">("executive");
  const [searchQuery, setSearchQuery] = useState("flight confirmation to Munich");

  return (
    <section id="features" className="py-24 relative bg-[#08090e]">
      {/* Subtle glow background */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300 mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Autonomous Intelligence Suite</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered For Pure Focus
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            A cohesive suite of autonomous agent capabilities that turn communication chaos into structured, proactive intelligence.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* CARD 1: Autonomous Executive Briefings (Col 8) */}
          <div className="md:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#0e111d] border border-white/[0.08] hover:border-indigo-500/30 transition-all shadow-xl flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Bot className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Runs Every Day at 8:00 AM & 6:00 PM
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-200 transition-colors">
                Autonomous Executive Daily Briefings
              </h3>
              <p className="mt-2 text-sm text-zinc-400 max-w-xl leading-relaxed">
                Stop spending the first 45 minutes of every morning reading disjointed emails and chats. OmniMind digests all 4 channels into a 2-minute actionable audio & text brief.
              </p>
            </div>

            {/* Visual Widget Preview */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#141827] border border-white/[0.08] flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-white/[0.06] pb-2.5">
                <span className="flex items-center gap-2 text-white font-semibold">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  Morning Digest Preview • Read in 1m 40s
                </span>
                <span className="text-cyan-400">Signal: 98%</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-white">Gmail:</strong> 3 client responses received. Sequoia requested Q3 metrics before 2 PM.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-white">WhatsApp:</strong> Elena requested lunch sync on Thursday; reminder hold placed.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-white">Outlook:</strong> 3 PM conflict rescheduled cleanly with Acme Corp.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Zero-Effort Reminder Engine (Col 4) */}
          <div className="md:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#0e111d] border border-white/[0.08] hover:border-emerald-500/30 transition-all shadow-xl flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Bell className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono text-zinc-400">NLP Entity Parser</span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-emerald-200 transition-colors">
                Zero-Click Smart Reminders
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                OmniMind detects implicit commitments like "I'll wire the funds Friday" or "Let's review the mockups tomorrow at 3" and automatically sets reminders in your favorite calendar.
              </p>
            </div>

            {/* Visual Widget Preview */}
            <div className="mt-6 p-4 rounded-xl bg-[#141827] border border-emerald-500/20 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                Detected Commitment
              </span>
              <p className="text-xs text-zinc-200 italic">
                "Sure thing, I'll send the signed NDA by 5 PM today."
              </p>
              <div className="mt-1 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Auto-Created
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Today, 4:45 PM</span>
              </div>
            </div>
          </div>

          {/* CARD 3: Voice Note Intelligence (Col 4) */}
          <div className="md:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#0e111d] border border-white/[0.08] hover:border-cyan-500/30 transition-all shadow-xl flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Mic className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono text-cyan-300">40+ Languages</span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-cyan-200 transition-colors">
                Voice Note Intelligence
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Dread receiving 3-minute rambling voice notes? OmniMind transcribes WhatsApp & Telegram voice memos and extracts key takeaways instantly.
              </p>
            </div>

            {/* Visual Waveform + Points */}
            <div className="mt-6 p-4 rounded-xl bg-[#141827] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
                <span>02:41 Audio Note</span>
                <span>Transcribed (0.6s)</span>
              </div>
              <div className="flex items-center gap-1 h-5 py-1">
                {[12, 24, 18, 30, 40, 25, 15, 35, 45, 20, 10, 28, 38, 22, 14].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-cyan-400/80 rounded-full"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-zinc-300 mt-1">
                ✓ Extracted 2 action items & deadline
              </p>
            </div>
          </div>

          {/* CARD 4: Tone-Matching Ghostwriter (Col 4) */}
          <div className="md:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#0e111d] border border-white/[0.08] hover:border-purple-500/30 transition-all shadow-xl flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Send className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono text-purple-300">Style Adaptive</span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors">
                Context-Aware Ghostwriter
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Pre-drafts context-aware replies ready for your 1-tap confirmation. Adapts tone automatically for friends, clients, and investors.
              </p>
            </div>

            {/* Tone Selector */}
            <div className="mt-6 p-3 rounded-xl bg-[#141827] border border-white/[0.08]">
              <div className="flex gap-1.5 p-1 bg-black/40 rounded-lg">
                {(["casual", "executive", "concise"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setToneSelection(t)}
                    className={`flex-1 py-1 text-[11px] font-mono capitalize rounded-md transition-all ${
                      toneSelection === t
                        ? "bg-purple-600 text-white font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-300 mt-2.5 italic">
                {toneSelection === "casual" && '"Hey! Sounds awesome, see you at 7pm 👋"'}
                {toneSelection === "executive" && '"Thank you. I have reviewed the deliverables and approve proceeding."'}
                {toneSelection === "concise" && '"Confirmed for 7pm. Looking forward."'}
              </p>
            </div>
          </div>

          {/* CARD 5: Bank-Grade Privacy & Vault (Col 4) */}
          <div className="md:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#0e111d] border border-white/[0.08] hover:border-amber-500/30 transition-all shadow-xl flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono text-amber-300">SOC-2 Type II</span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
                Bank-Grade Privacy Vault
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Zero data retention policy. Your private messages never train public LLMs. Encrypted using AES-256 GCM with optional local Ollama host mode.
              </p>
            </div>

            {/* Cipher Visual */}
            <div className="mt-6 p-4 rounded-xl bg-[#141827] border border-white/[0.08] flex items-center justify-between font-mono text-[11px]">
              <div className="flex items-center gap-2 text-amber-300">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero-Knowledge Vault</span>
              </div>
              <span className="text-zinc-400">AES-256 GCM</span>
            </div>
          </div>

          {/* CARD 6: Universal Semantic Cross-Inbox Search (Col 12 - Wide) */}
          <div className="md:col-span-12 p-6 sm:p-8 rounded-3xl bg-[#0e111d] border border-white/[0.08] hover:border-indigo-500/30 transition-all shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 group relative overflow-hidden">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Search className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">
                  Universal Cross-Channel Search
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white group-hover:text-indigo-200 transition-colors">
                Ask Questions Across All 4 Apps Simultaneously
              </h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                "Where is the hotel reservation code?" or "What was the PDF contract Dave emailed last Wednesday?" OmniMind scans Gmail, WhatsApp, Telegram & Outlook in parallel, returning exact answers with direct links.
              </p>
            </div>

            {/* Search Input Mockup */}
            <div className="w-full md:w-[420px] p-4 rounded-2xl bg-[#141827] border border-white/[0.1] shadow-lg flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/40 border border-white/[0.08]">
                <Search className="w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-full font-mono"
                  placeholder="Ask anything across your messages..."
                />
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-zinc-200 font-medium">Lufthansa LH 452 (Gmail)</span>
                </div>
                <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                  Found in 42ms
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
