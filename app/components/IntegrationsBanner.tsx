"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  Send,
  Calendar,
  CheckCircle,
  ExternalLink,
  Shield,
  Zap,
  ArrowRight,
  Layers,
  Sparkles
} from "lucide-react";

export function IntegrationsBanner() {
  const [activeTab, setActiveTab] = useState<"gmail" | "whatsapp" | "telegram" | "outlook">("gmail");

  const integrations = [
    {
      id: "gmail" as const,
      name: "Gmail",
      tagline: "Inbox Zero Without Reading 100+ Emails",
      color: "#EA4335",
      badgeColor: "bg-red-500/10 text-red-300 border-red-500/30",
      accentBg: "from-red-500/20 to-orange-500/10",
      icon: Mail,
      authMethod: "Google OAuth 2.0 (Restricted Scopes)",
      features: [
        "Executive Morning Thread Summaries",
        "Autonomous VIP Client Triage",
        "Newsletter & Promo Auto-Filtering",
        "Ghostwritten Reply Drafts Matching Your Style",
      ],
      sampleOutput: {
        title: "Gmail Synthesis Output",
        detail: "14 unread emails condensed into 2 bullet points. 1 action item: approve Q3 marketing invoice ($4,200).",
        latency: "180ms",
      },
    },
    {
      id: "whatsapp" as const,
      name: "WhatsApp",
      tagline: "Voice Note Intelligence & Group Chat Triage",
      color: "#25D366",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      accentBg: "from-emerald-500/20 to-teal-500/10",
      icon: MessageCircle,
      authMethod: "Encrypted QR Bridge / Official Cloud API",
      features: [
        "Voice Note Audio Transcription (40+ Languages)",
        "Group Chat Noise Isolation (Extracts only actionable tasks)",
        "Automated Reminder Sync from Chat Promises",
        "Family vs Work Chat Separation",
      ],
      sampleOutput: {
        title: "WhatsApp Audio Transcribed",
        detail: "2m 14s voice message from Project Lead parsed: 'Send API docs by Thursday 3pm' -> Reminder scheduled.",
        latency: "340ms",
      },
    },
    {
      id: "telegram" as const,
      name: "Telegram",
      tagline: "Channel Monitoring & Conversational Assistant",
      color: "#229ED9",
      badgeColor: "bg-sky-500/10 text-sky-300 border-sky-500/30",
      accentBg: "from-sky-500/20 to-blue-500/10",
      icon: Send,
      authMethod: "Telegram Bot API / MTProto Session",
      features: [
        "Multi-Channel News & Crypto Highlights",
        "Saved Messages to Task Manager Pipeline",
        "Two-Way Interactive Bot Command Center",
        "Instant Briefing Dispatch to Your Telegram Chat",
      ],
      sampleOutput: {
        title: "Telegram Channel Digest",
        detail: "Synthesized 8 developer & announcement channels into a 30-second bulleted update at 9:00 AM.",
        latency: "120ms",
      },
    },
    {
      id: "outlook" as const,
      name: "Outlook & Office 365",
      tagline: "Corporate Email & Calendar Harmonizer",
      color: "#0078D4",
      badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/30",
      accentBg: "from-blue-500/20 to-indigo-500/10",
      icon: Calendar,
      authMethod: "Microsoft Azure AD / Microsoft Graph API",
      features: [
        "Intelligent Meeting Double-Booking Resolver",
        "Cross-Calendar Sync (Personal vs Corporate)",
        "Pre-Meeting Brief Dossiers with Participant Context",
        "Contract & Attachment Auto-Index",
      ],
      sampleOutput: {
        title: "Outlook Meeting Conflict Resolved",
        detail: "Detected conflict between Client Demo & Team Retrospective. Auto-drafted polite reschedule proposal.",
        latency: "210ms",
      },
    },
  ];

  const currentIntegration = integrations.find((item) => item.id === activeTab)!;

  return (
    <section id="channels" className="py-24 relative border-t border-b border-white/[0.06] bg-[#090b12]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300 mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Unified Platform Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Connect the 4 Pillars of Your Daily Communication
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            No more switching tabs or losing critical threads. OmniMind sits securely across your core channels, extracting signal from noise in milliseconds.
          </p>
        </div>

        {/* Channel Selection Tabs */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {integrations.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-white/[0.08] text-white border-white/[0.25] shadow-lg shadow-black/40 scale-105"
                    : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.05] hover:text-zinc-200"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.name}</span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Integration Showcase Box */}
        <div className="mt-10 rounded-2xl border border-white/[0.1] bg-[#0d101d] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Capabilities List */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${currentIntegration.badgeColor}`}>
                    {currentIntegration.name} Integration
                  </span>
                  <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    {currentIntegration.authMethod}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-4">
                  {currentIntegration.tagline}
                </h3>

                <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
                  OmniMind links directly with {currentIntegration.name} via high-speed, secure webhooks. The AI reads incoming threads, detects urgency, flags follow-ups, and turns conversations into actionable reminders.
                </p>

                {/* Features Checkpoints */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {currentIntegration.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-xs sm:text-sm text-zinc-300 font-medium">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center justify-between">
                <div className="text-xs text-zinc-400 font-mono">
                  Setup time: <strong className="text-white">Under 60 seconds</strong>
                </div>
                <Link
                  href="/integrations"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Connect {currentIntegration.name} Now
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Live Simulated Extraction Card */}
            <div className={`lg:col-span-5 p-6 sm:p-10 bg-gradient-to-br ${currentIntegration.accentBg} border-t lg:border-t-0 lg:border-l border-white/[0.08] flex flex-col justify-center`}>
              <div className="p-5 rounded-xl bg-[#090b14]/90 border border-white/[0.1] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-semibold text-white">
                      {currentIntegration.sampleOutput.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                    ⚡ {currentIntegration.sampleOutput.latency}
                  </span>
                </div>

                <div className="text-xs text-zinc-300 leading-relaxed font-mono bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">
                  {currentIntegration.sampleOutput.detail}
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Encrypted Payload
                  </span>
                  <span className="text-zinc-500">Zero Model Training</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
