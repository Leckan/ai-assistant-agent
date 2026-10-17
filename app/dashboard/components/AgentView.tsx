"use client";

import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Zap,
  Play,
  Pause,
  Shield,
  Sliders,
  Cpu,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function AgentView() {
  const [isRunning, setIsRunning] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [autonomyLevel, setAutonomyLevel] = useState("semi-auto");
  const [isTriggering, setIsTriggering] = useState(false);
  const [agentLogs, setAgentLogs] = useState([
    {
      id: "1",
      time: "10:42 AM",
      source: "Gmail",
      action: "Filtered high-priority contract from TechCorp into urgent digest",
      type: "success",
      iconBg: "bg-blue-600",
    },
    {
      id: "2",
      time: "10:35 AM",
      source: "WhatsApp",
      action: "Drafted polite scheduling reply for Sarah Jenkins via Sent.dm",
      type: "success",
      iconBg: "bg-emerald-600",
    },
    {
      id: "3",
      time: "09:15 AM",
      source: "Telegram",
      action: "Detected suspicious phishing link and blocked sender webhook",
      type: "shield",
      iconBg: "bg-rose-600",
    },
    {
      id: "4",
      time: "08:00 AM",
      source: "System",
      action: "Generated daily morning executive briefing audio & text digest",
      type: "briefing",
      iconBg: "bg-amber-600",
    },
  ]);

  const triggerLiveSweep = () => {
    setIsTriggering(true);
    setTimeout(() => {
      setIsTriggering(false);
      setAgentLogs((prev) => [
        {
          id: String(Date.now()),
          time: "Just now",
          source: "AI Agent",
          action: "Manual inbox sweep executed. 4 unread messages prioritized.",
          type: "success",
          iconBg: "bg-violet-600",
        },
        ...prev,
      ]);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Agent Control Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Large Solid-Colored Icon */}
            <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-600/30 shrink-0">
              <Bot className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  OmniMind AI Agent
                </h2>
                <span
                  className={`px-2.5 py-0.5 text-xs font-mono rounded-full border ${
                    isRunning
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  {isRunning ? "● Running 24/7" : "○ Paused"}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Autonomous multi-channel triage, smart replies, and executive digests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isRunning
                  ? "bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1]"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 text-amber-400" />
                  <span>Pause Agent</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Resume Agent</span>
                </>
              )}
            </button>

            <button
              onClick={triggerLiveSweep}
              disabled={isTriggering}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTriggering ? "animate-spin" : ""}`} />
              <span>{isTriggering ? "Sweeping Inboxes..." : "Execute Sweep"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Capabilities with Large Solid-Colored Icons */}
      <div>
        <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-300 mb-4">
          Core Capabilities Active
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/[0.08]">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 mb-4">
              <Mail className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-sm font-bold text-white">VIP Email Triage</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Classifies high-stakes emails from investors, clients, and team leads.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/[0.08]">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 mb-4">
              <Zap className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-sm font-bold text-white">Smart Auto-Drafts</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Prepares draft replies matching your personalized communication tone.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/[0.08]">
            <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20 mb-4">
              <Calendar className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-sm font-bold text-white">Calendar Shield</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Proactively extracts dates, confirms invite links, and protects focus blocks.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/[0.08]">
            <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20 mb-4">
              <Shield className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-sm font-bold text-white">Phishing Defense</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Validates sender SPF/DKIM and flags social engineering attacks instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Model & Autonomy Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
              <Cpu className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Intelligence Model</h4>
              <p className="text-xs text-zinc-400">Select inference engine</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {[
              { id: "gpt-4o", name: "GPT-4o Omnimodal", desc: "Fastest response & natural tone" },
              { id: "claude-3-5", name: "Claude 3.5 Sonnet", desc: "Best for nuanced email drafting" },
              { id: "gemini-1-5", name: "Gemini 1.5 Pro", desc: "Massive context window for long threads" },
            ].map((model) => (
              <label
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedModel === model.id
                    ? "bg-violet-950/40 border-violet-500/50 text-white"
                    : "bg-black/20 border-white/[0.06] text-zinc-400 hover:border-white/[0.12]"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-white">{model.name}</p>
                  <p className="text-[10px] text-zinc-400">{model.desc}</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedModel === model.id
                      ? "border-violet-400 bg-violet-600 text-white"
                      : "border-zinc-600"
                  }`}
                >
                  {selectedModel === model.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Live Activity Stream */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Live Agent Activity Log</h4>
                  <p className="text-xs text-zinc-400">Real-time decisions and events</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                Live Stream
              </span>
            </div>

            <div className="space-y-3">
              {agentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-start gap-3"
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${log.iconBg} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
                  >
                    {log.source[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-200">
                        {log.source}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {log.time}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{log.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
