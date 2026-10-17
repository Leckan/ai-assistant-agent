"use client";

import React, { useState } from "react";
import {
  Settings,
  User,
  Key,
  Shield,
  Bell,
  Save,
  CheckCircle2,
  RefreshCw,
  Lock,
  Smartphone,
  Mail,
  Database,
} from "lucide-react";
import { type UserRecord } from "@/lib/insforge";

interface SettingsViewProps {
  user: {
    id: string;
    email: string | null;
    phone?: string | null;
    provider?: string;
    profile?: { name?: string; avatar_url?: string } | null;
  };
  dbData: UserRecord | null;
  onUpdateName: (name: string) => Promise<void>;
  savingName: boolean;
  feedbackMsg: string | null;
}

export default function SettingsView({
  user,
  dbData,
  onUpdateName,
  savingName,
  feedbackMsg,
}: SettingsViewProps) {
  const [name, setName] = useState(dbData?.name || user.profile?.name || "");
  const [smsThreshold, setSmsThreshold] = useState("10");
  const [dailyBriefingTime, setDailyBriefingTime] = useState("08:00");
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await onUpdateName(name);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Top Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-slate-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          {/* Large Solid Slate Icon */}
          <div className="w-16 h-16 rounded-2xl bg-slate-600 flex items-center justify-center text-white shadow-xl shadow-slate-600/30 shrink-0">
            <Settings className="w-8 h-8 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Account & System Settings
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Manage your InsForge identity, communication thresholds, and agent configuration
            </p>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs font-mono text-indigo-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">User Profile</h3>
              <p className="text-xs text-zinc-400">InsForge database public.users synchronizer</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  Account Identifier
                </label>
                <input
                  type="text"
                  disabled
                  value={dbData?.email || user.email || dbData?.phone || user.phone || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 border border-white/[0.06] text-zinc-400 text-xs cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingName}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {savingName ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Assistant Automation Preferences */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md">
              <Key className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Assistant Automation</h3>
              <p className="text-xs text-zinc-400">Briefing schedules & auto-pilot rules</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/[0.06]">
              <div>
                <h4 className="text-xs font-semibold text-white">Morning Briefing Delivery Time</h4>
                <p className="text-[11px] text-zinc-400">When your daily summary is synthesized</p>
              </div>
              <input
                type="time"
                value={dailyBriefingTime}
                onChange={(e) => setDailyBriefingTime(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/[0.1] text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/[0.06]">
              <div>
                <h4 className="text-xs font-semibold text-white">Autonomous Reply Drafting</h4>
                <p className="text-[11px] text-zinc-400">Draft responses for common inquiries automatically</p>
              </div>
              <button
                onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  autoReplyEnabled ? "bg-indigo-600" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    autoReplyEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
