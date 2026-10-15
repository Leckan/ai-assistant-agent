"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  Play,
  Pause,
  Check,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  Mail,
  MessageSquare,
  Send,
  Sliders,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

type ScenarioId = "morning-brief" | "voice-note" | "calendar-clash" | "vip-inbox";

interface Scenario {
  id: ScenarioId;
  title: string;
  badge: string;
  channels: string[];
  rawInput: {
    sender: string;
    channel: "Gmail" | "WhatsApp" | "Telegram" | "Outlook";
    content: string;
    time: string;
    isAudio?: boolean;
    audioDuration?: string;
  }[];
  aiDigest: string;
  reminders: {
    id: string;
    title: string;
    time: string;
    channel: string;
    type: "reminder" | "calendar" | "draft";
    actionLabel: string;
  }[];
}

const scenarios: Scenario[] = [
  {
    id: "morning-brief",
    title: "Morning Executive Brief (All 4 Channels)",
    badge: "Cross-Channel Synthesis",
    channels: ["Gmail", "WhatsApp", "Telegram", "Outlook"],
    rawInput: [
      {
        channel: "Gmail",
        sender: "Investor Relations <partner@sequoia.com>",
        content: "Please send updated Q3 churn and MRR numbers prior to our 2 PM check-in.",
        time: "07:15 AM",
      },
      {
        channel: "WhatsApp",
        sender: "Mom ❤️",
        content: "Don't forget Dad's surprise dinner reservation for Friday at 7:00 PM!",
        time: "07:42 AM",
      },
      {
        channel: "Telegram",
        sender: "Core Infrastructure Alerts",
        content: "Database read replicas scaled down safely after morning spike. All health checks green.",
        time: "08:02 AM",
      },
      {
        channel: "Outlook",
        sender: "Legal Counsel <sarah@enterprise-law.com>",
        content: "Redlined terms for the SaaS enterprise contract attached. Need initials on Section 8.",
        time: "08:18 AM",
      },
    ],
    aiDigest:
      "Good morning. Across your 4 channels, there are 2 high-priority deliverables before 2:00 PM: the investor MRR metrics (Gmail) and contract initials for Sarah (Outlook). Infra on Telegram is healthy. Friday dinner for Dad requires restaurant booking.",
    reminders: [
      {
        id: "rem-1",
        title: "Export Q3 MRR Metrics & Reply to Sequoia",
        time: "Today at 1:00 PM (1h before call)",
        channel: "Gmail",
        type: "reminder",
        actionLabel: "Schedule Reminder",
      },
      {
        id: "rem-2",
        title: "Sign Legal Redlines Section 8 for Sarah",
        time: "Today at 11:30 AM",
        channel: "Outlook",
        type: "reminder",
        actionLabel: "Schedule Reminder",
      },
      {
        id: "rem-3",
        title: "Confirm Table for 6 - Dad's Surprise Dinner",
        time: "Friday at 7:00 PM",
        channel: "WhatsApp",
        type: "calendar",
        actionLabel: "Add to Calendar",
      },
    ],
  },
  {
    id: "voice-note",
    title: "WhatsApp Voice Note to Action Items",
    badge: "Audio AI Transcription",
    channels: ["WhatsApp"],
    rawInput: [
      {
        channel: "WhatsApp",
        sender: "Alex (Design Co-founder)",
        content:
          "Voice Note: 'Hey, I just wrapped up the user testing session. We really need to fix the onboarding modal lag before Friday's launch, and also order those test iPads today if possible.'",
        time: "09:30 AM",
        isAudio: true,
        audioDuration: "1m 12s",
      },
    ],
    aiDigest:
      "Transcribed 1m 12s audio note from Alex. Two immediate action items extracted: onboarding modal performance fix for engineering, and hardware purchase order for testing.",
    reminders: [
      {
        id: "rem-vn-1",
        title: "File Engineering Ticket: Fix Onboarding Modal Lag",
        time: "Due: Thursday before Friday launch",
        channel: "WhatsApp",
        type: "reminder",
        actionLabel: "Create Task",
      },
      {
        id: "rem-vn-2",
        title: "Order Test iPads for Lab",
        time: "Today by 4:00 PM",
        channel: "WhatsApp",
        type: "reminder",
        actionLabel: "Schedule Reminder",
      },
    ],
  },
  {
    id: "calendar-clash",
    title: "Outlook Meeting Conflict Auto-Resolution",
    badge: "Smart Calendar Guard",
    channels: ["Outlook", "Gmail"],
    rawInput: [
      {
        channel: "Outlook",
        sender: "Calendar Service",
        content: "Conflict Alert: 'Series A Board Prep' (2:00 PM - 3:00 PM) overlaps with newly requested 'Client Product Demo' from Acme Corp.",
        time: "10:15 AM",
      },
    ],
    aiDigest:
      "Detected overlapping commitments at 2:00 PM. Board Prep is flagged non-negotiable. OmniMind inspected your shared calendar and identified a clean 4:00 PM opening for Acme Corp.",
    reminders: [
      {
        id: "rem-cc-1",
        title: "Auto-Drafted Email to Acme Corp: Reschedule to 4:00 PM",
        time: "Send draft with 1-click confirmation",
        channel: "Outlook",
        type: "draft",
        actionLabel: "Approve & Send",
      },
      {
        id: "rem-cc-2",
        title: "Hold 4:00 PM - 4:45 PM for Acme Corp Demo",
        time: "Today at 4:00 PM",
        channel: "Outlook",
        type: "calendar",
        actionLabel: "Hold Calendar Slot",
      },
    ],
  },
  {
    id: "vip-inbox",
    title: "VIP Urgent Message Triage & Draft",
    badge: "Autonomous Triage",
    channels: ["Gmail", "Telegram"],
    rawInput: [
      {
        channel: "Telegram",
        sender: "VIP Client: Dr. Julian Aris",
        content: "Hey, is the staging server down? Our team is presenting to our hospital board in 20 minutes.",
        time: "11:05 AM",
      },
      {
        channel: "Gmail",
        sender: "Stripe Billing",
        content: "Monthly invoice #INV-9923 paid successfully ($350.00).",
        time: "11:06 AM",
      },
    ],
    aiDigest:
      "Urgent VIP alert from Dr. Julian Aris on Telegram. OmniMind ran a quick endpoint ping (Status: 200 OK, healthy). Drafted reassurance message with direct status page link.",
    reminders: [
      {
        id: "rem-vip-1",
        title: "Send Telegram Reply to Dr. Julian (Staging Verified Active)",
        time: "Ready to deliver instantly",
        channel: "Telegram",
        type: "draft",
        actionLabel: "Send Quick Reply",
      },
      {
        id: "rem-vip-2",
        title: "Log Stripe Receipt to Accounting Folder",
        time: "Auto-filed to Drive",
        channel: "Gmail",
        type: "reminder",
        actionLabel: "Archive",
      },
    ],
  },
];

export function LiveDemoSimulator() {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>("morning-brief");
  const [completedReminders, setCompletedReminders] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const currentScenario = scenarios.find((s) => s.id === activeScenarioId)!;

  const handleScenarioChange = (id: ScenarioId) => {
    setIsProcessing(true);
    setActiveScenarioId(id);
    setTimeout(() => {
      setIsProcessing(false);
    }, 400);
  };

  const handleReminderAction = (reminderId: string) => {
    setCompletedReminders((prev) => ({
      ...prev,
      [reminderId]: !prev[reminderId],
    }));
  };

  return (
    <section id="simulator" className="py-24 relative overflow-hidden bg-[#0a0c16]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Live Simulation</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            See the AI Agent in Action
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Select a real-world scenario below and see how OmniMind instantly aggregates chaotic messages and extracts clear summaries and action items.
          </p>
        </div>

        {/* Scenario Selector Pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3">
          {scenarios.map((scenario) => {
            const isActive = activeScenarioId === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => handleScenarioChange(scenario.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center gap-2 ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30 scale-102"
                    : "bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <span>{scenario.title}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-indigo-800 text-indigo-100"
                      : "bg-white/[0.05] text-zinc-400"
                  }`}
                >
                  {scenario.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Simulator Main Display */}
        <div className="mt-10 rounded-2xl border border-white/[0.1] bg-[#0c0e18] shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-[#121524] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-medium text-white">
                Live Agent Sandbox: {currentScenario.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span>Latency: <strong className="text-emerald-400 font-mono">140ms</strong></span>
              <span>•</span>
              <span>Accuracy: <strong className="text-white">99.8%</strong></span>
            </div>
          </div>

          {/* Simulator Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            {/* Left: Raw Incoming Feeds */}
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Step 1: Incoming Raw Messages
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {currentScenario.rawInput.length} stream sources
                  </span>
                </div>

                <div className="space-y-3">
                  {currentScenario.rawInput.map((msg, index) => {
                    const channelColors: Record<string, string> = {
                      Gmail: "bg-red-500/10 text-red-400 border-red-500/30",
                      WhatsApp: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                      Telegram: "bg-sky-500/10 text-sky-400 border-sky-500/30",
                      Outlook: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                    };

                    return (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                              channelColors[msg.channel]
                            }`}
                          >
                            {msg.channel}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400">
                            {msg.time}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-zinc-300 mb-1">
                          {msg.sender}
                        </div>
                        {msg.isAudio ? (
                          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 my-2 flex items-center gap-3">
                            <button
                              onClick={() => setAudioPlaying(!audioPlaying)}
                              className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-black hover:bg-emerald-400 transition"
                              aria-label="Play sample audio"
                            >
                              {audioPlaying ? (
                                <Pause className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex justify-between text-[10px] font-mono text-emerald-300">
                                <span>Voice Memo ({msg.audioDuration})</span>
                                <span>{audioPlaying ? "Playing..." : "Tap to test audio"}</span>
                              </div>
                              <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
                                <div
                                  className={`h-full bg-emerald-400 ${
                                    audioPlaying ? "w-2/3 animate-pulse" : "w-1/4"
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                <span>Direct end-to-end webhook ingestion</span>
                <span className="text-indigo-400">Zero data retention</span>
              </div>
            </div>

            {/* Right: AI Synthesis & Extracted Reminders */}
            <div className="lg:col-span-6 p-6 sm:p-8 bg-gradient-to-br from-indigo-950/20 via-zinc-900/40 to-cyan-950/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Step 2: Autonomous AI Output
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                    Ready to Action
                  </span>
                </div>

                {/* AI Executive Digest Card */}
                <div className="p-4 rounded-xl bg-[#111424] border border-indigo-500/30 shadow-lg mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-cyan-400" />
                      Executive Summary
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Delivered via App / Bot
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                    {currentScenario.aiDigest}
                  </p>
                </div>

                {/* Extracted Reminders list */}
                <div>
                  <div className="text-xs font-mono font-semibold text-zinc-300 mb-3 uppercase tracking-wider">
                    Extracted Reminders & Automatic Tasks ({currentScenario.reminders.length}):
                  </div>

                  <div className="space-y-2.5">
                    {currentScenario.reminders.map((rem) => {
                      const isDone = !!completedReminders[rem.id];
                      return (
                        <div
                          key={rem.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            isDone
                              ? "bg-emerald-950/30 border-emerald-500/40 opacity-80"
                              : "bg-white/[0.03] border-white/[0.08] hover:border-indigo-500/40"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-1.5 rounded-lg mt-0.5 ${
                                isDone
                                  ? "bg-emerald-500 text-black"
                                  : "bg-indigo-500/20 text-indigo-300"
                              }`}
                            >
                              {rem.type === "calendar" ? (
                                <Calendar className="w-3.5 h-3.5" />
                              ) : rem.type === "draft" ? (
                                <Send className="w-3.5 h-3.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div>
                              <p
                                className={`text-xs font-semibold ${
                                  isDone ? "line-through text-zinc-400" : "text-white"
                                }`}
                              >
                                {rem.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-zinc-400">
                                <span>{rem.time}</span>
                                <span>•</span>
                                <span className="text-zinc-400">{rem.channel}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleReminderAction(rem.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                              isDone
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                            }`}
                          >
                            {isDone ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Confirmed</span>
                              </>
                            ) : (
                              <span>{rem.actionLabel}</span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Simulator Note */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400">
                  Syncs with Apple Reminders, Google Calendar & Notion
                </span>
                <a
                  href="#pricing"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Enable for My Accounts <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
