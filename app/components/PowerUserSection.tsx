"use client";

import React, { useState } from "react";
import {
  Terminal,
  Cpu,
  Zap,
  Play,
  Copy,
  Check,
  Code,
  Sliders,
  Sparkles,
  Command
} from "lucide-react";

export function PowerUserSection() {
  const [activeCommand, setActiveCommand] = useState<string>("omnimind brief --today");
  const [copied, setCopied] = useState(false);

  const commandOutputs: Record<string, { stdout: string[]; meta: string }> = {
    "omnimind brief --today": {
      meta: "EXEC: 128ms • Channels: [gmail, whatsapp, telegram, outlook]",
      stdout: [
        "[INFO] Ingested 4 streams: 18 unread emails, 12 chats, 2 calendar events",
        "[AI] Identified 2 high-priority deliverables:",
        "  -> [Gmail] Review CFO Q3 Budget deck by 15:30",
        "  -> [Outlook] Reschedule Acme Corp demo (Conflict resolved at 16:00)",
        "[DONE] 2 reminders committed to local system daemons.",
      ],
    },
    "omnimind remind --channel=whatsapp --parse": {
      meta: "NLP PIPELINE: Intent Recognition v2.4",
      stdout: [
        "[SCAN] Target: WhatsApp Voice Memo (ID: 0x98AF4)",
        "[TRANSCRIBE] 'Don't forget to book the table for Mom's anniversary on Friday.'",
        "[ENTITIES] Intent: RESERVATION | Target: Mom's Anniversary | Time: Friday 19:00",
        "[CRON] Created event in local Calendar & Apple Reminders. Status: SUCCESS.",
      ],
    },
    "omnimind sync --daemon --status": {
      meta: "DAEMON PID: 49210 • Memory: 42MB • Encryption: AES-256",
      stdout: [
        "● gmail.service: active (listening on restricted OAuth webhook)",
        "● whatsapp.bridge: active (E2E session established, zero-knowledge)",
        "● telegram.bot: active (polling 2 channels, 1 direct bot)",
        "● outlook.graph: active (calendar heartbeat: 60s)",
      ],
    },
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="unix-terminal" className="py-24 relative bg-[#06070b] border-t border-b border-white/[0.06]">
      {/* Background grid accent */}
      <div className="absolute inset-0 bg-dots-pattern opacity-30 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 mb-4">
            <Terminal className="w-3.5 h-3.5" />
            <span>UNIX & Developer Control Center</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built with UNIX Precision & Power
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Prefer terminal speed? Control your autonomous personal assistant via CLI, cron jobs, native keyboard shortcuts, or headless local daemons.
          </p>
        </div>

        {/* Terminal Container */}
        <div className="mt-12 max-w-4xl mx-auto rounded-2xl border border-white/[0.12] bg-[#0b0d14] shadow-2xl overflow-hidden">
          {/* Terminal Titlebar */}
          <div className="px-4 py-3 bg-[#11131c] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 font-mono text-xs text-zinc-400">
                zsh — omnimind@agent-core: ~ (tty1)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(activeCommand)}
                className="p-1.5 rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-white transition flex items-center gap-1.5 text-xs font-mono"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Command Presets */}
          <div className="px-4 py-2.5 bg-[#0e1018] border-b border-white/[0.06] flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-zinc-500">Quick run:</span>
            {Object.keys(commandOutputs).map((cmd) => (
              <button
                key={cmd}
                onClick={() => setActiveCommand(cmd)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeCommand === cmd
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]"
                }`}
              >
                $ {cmd.split(" ")[1]}
              </button>
            ))}
          </div>

          {/* Terminal Screen Body */}
          <div className="p-5 sm:p-6 font-mono text-xs sm:text-sm text-zinc-300 space-y-3">
            {/* Input Line */}
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <span className="text-zinc-500">❯</span>
              <span>{activeCommand}</span>
              <span className="w-2 h-4 bg-emerald-400 animate-pulse inline-block" />
            </div>

            {/* Execution Metadata */}
            <div className="text-[11px] text-zinc-500 border-b border-white/[0.06] pb-2">
              {commandOutputs[activeCommand].meta}
            </div>

            {/* Stdout Output */}
            <div className="space-y-1.5 pt-1">
              {commandOutputs[activeCommand].stdout.map((line, index) => {
                const isInfo = line.startsWith("[INFO]");
                const isAi = line.startsWith("[AI]");
                const isDone = line.startsWith("[DONE]");
                const isScan = line.startsWith("[SCAN]");
                const isCron = line.startsWith("[CRON]");

                return (
                  <div
                    key={index}
                    className={`leading-relaxed ${
                      isAi
                        ? "text-cyan-300 font-medium"
                        : isDone || isCron
                        ? "text-emerald-400 font-medium"
                        : isScan
                        ? "text-amber-300"
                        : isInfo
                        ? "text-zinc-400"
                        : "text-zinc-300 pl-4"
                    }`}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Shortcuts & UNIX Features Row */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto font-mono text-xs">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 text-white font-semibold mb-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.1] text-zinc-200">
                ⌘K
              </kbd>
              <span>Global Command Bar</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Query across all 4 channels without leaving your current window.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 text-white font-semibold mb-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.1] text-zinc-200">
                crontab
              </kbd>
              <span>Automated Cron Jobs</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Configure morning & evening synthesis delivery times via cron syntax.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 text-white font-semibold mb-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.1] text-zinc-200">
                Ollama
              </kbd>
              <span>Local LLM Engine</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Run Llama 3 or Mistral locally on your Mac/Linux box with zero cloud calls.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 text-white font-semibold mb-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.1] text-zinc-200">
                webhooks
              </kbd>
              <span>Realtime Ingestion</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Sub-50ms ingestion latency across WhatsApp, Telegram, Gmail & Outlook.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
