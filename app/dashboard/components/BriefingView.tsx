"use client";

import React, { useState } from "react";
import {
  FileText,
  Play,
  Pause,
  Volume2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Share2,
  Download,
} from "lucide-react";

export default function BriefingView() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedBriefingDate, setSelectedBriefingDate] = useState("Today, Oct 15");

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Briefing Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Large Solid Amber Icon */}
            <div className="w-16 h-16 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-xl shadow-amber-600/30 shrink-0">
              <FileText className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Executive Daily Digest
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Ready
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Generated at 08:00 AM • Synthesized across Gmail, WhatsApp, and Calendar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Audio (2:14)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Listen to Digest (2:14)</span>
                </>
              )}
            </button>
            <button
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors"
              title="Share briefing"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Briefing Category Cards with Large Solid Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category 1: Urgent Inquiries */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20">
              <AlertCircle className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Urgent Actions</h3>
              <p className="text-xs text-zinc-400">2 require your signature</p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            <li className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong>Series A Term Sheet</strong> from Sequoia requires review by 2:00 PM.
              </span>
            </li>
            <li className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong>Sent.dm API balance</strong> replenished with $100 auto-reload.
              </span>
            </li>
          </ul>
        </div>

        {/* Category 2: Schedule & Meetings */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Calendar className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Schedule Overview</h3>
              <p className="text-xs text-zinc-400">3 meetings scheduled today</p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            <li className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex items-start justify-between">
              <div>
                <p className="font-semibold text-white">Product Roadmap Review</p>
                <p className="text-[10px] text-zinc-400">11:00 AM - 11:45 AM • Google Meet</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Confirmed</span>
            </li>
            <li className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex items-start justify-between">
              <div>
                <p className="font-semibold text-white">Investor Q&A Call</p>
                <p className="text-[10px] text-zinc-400">03:30 PM - 04:00 PM • Zoom</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Confirmed</span>
            </li>
          </ul>
        </div>

        {/* Category 3: Key Market & Comms Highlights */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <TrendingUp className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Key Highlights</h3>
              <p className="text-xs text-zinc-400">Cross-channel summary</p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            <li className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>WhatsApp engagement increased 34% after agent auto-replies enabled.</span>
            </li>
            <li className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>Zero spam messages bypassed AI filter in past 48 hours.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
