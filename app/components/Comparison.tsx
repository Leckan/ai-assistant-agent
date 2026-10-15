"use client";

import React from "react";
import { X, Check, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export function Comparison() {
  const points = [
    {
      feature: "Cross-Platform Synthesis",
      before: "Jumping across 4 apps (Gmail, WhatsApp, TG, Outlook) all day",
      after: "Single unified executive brief delivered twice daily",
    },
    {
      feature: "Reminders & Action Items",
      before: "Manually copying text into Todoist/Apple Notes or forgetting",
      after: "Zero-click NLP auto-creates reminders & calendar holds",
    },
    {
      feature: "Voice Note Processing",
      before: "Listening to 3-minute rambling audio clips during meetings",
      after: "Instant transcript + 3 key bullet points in 600ms",
    },
    {
      feature: "Calendar Clashes",
      before: "Accidental double-bookings across personal & work accounts",
      after: "Proactive clash detection with auto-suggested reschedule slots",
    },
    {
      feature: "Drafting Responses",
      before: "Typing repetitive replies from scratch on a mobile keyboard",
      after: "Context-aware ghostwriting in your voice with 1-tap approval",
    },
    {
      feature: "Universal Search",
      before: "Wasting 15 mins searching 'Where did they send that PDF?'",
      after: "Semantic natural language search across all 4 channels in 50ms",
    },
  ];

  return (
    <section className="py-24 relative bg-[#090b14] border-t border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300 mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>The Efficiency Shift</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Stop Drowning in Message Fatigue
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            See how your workday transforms when an autonomous AI agent manages the signal-to-noise ratio.
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-white/[0.1] bg-[#0c0e18] shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {/* The Old Way */}
            <div className="p-6 sm:p-8 bg-red-950/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Without OmniMind
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    Fragmented, reactive chaos
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-red-500/10 flex items-start gap-3"
                  >
                    <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-mono text-zinc-400 uppercase block mb-0.5">
                        {pt.feature}
                      </span>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {pt.before}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The OmniMind Way */}
            <div className="p-6 sm:p-8 bg-indigo-950/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    With OmniMind AI
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono">
                    High signal, proactive calmness
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-indigo-950/20 border border-emerald-500/20 flex items-start gap-3"
                  >
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-mono text-cyan-300 uppercase block mb-0.5">
                        {pt.feature}
                      </span>
                      <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                        {pt.after}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
