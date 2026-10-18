"use client";

import React, { useState } from "react";
import {
  Settings,
  User,
  Key,
  Save,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { type UserRecord } from "@/lib/insforge";
import { useTheme } from "@/lib/theme-context";

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
  const { theme, preference, setTheme } = useTheme();
  const [name, setName] = useState(dbData?.name || user.profile?.name || "");
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
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-slate-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          {/* Large Solid Slate Icon */}
          <div className="w-16 h-16 rounded-2xl bg-slate-600 flex items-center justify-center text-white shadow-xl shadow-slate-600/30 shrink-0">
            <Settings className="w-8 h-8 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Account & System Settings
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
              Manage your InsForge identity, theme appearance, communication thresholds, and agent configuration
            </p>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 text-xs font-mono text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Theme & Appearance Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 stroke-[2]" />
              ) : (
                <Sun className="w-5 h-5 stroke-[2]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Theme & Appearance</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Choose between Light mode, Dark mode, or automatic OS synchronization
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                preference === "light"
                  ? "bg-amber-50/90 dark:bg-amber-950/30 border-amber-400 dark:border-amber-500/50 ring-1 ring-amber-400/30"
                  : "bg-slate-50 dark:bg-black/30 border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12]"
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Clean daylight contrast</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                preference === "dark"
                  ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500/50 ring-1 ring-indigo-400/30"
                  : "bg-slate-50 dark:bg-black/30 border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12]"
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Deep obsidian canvas</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                preference === "system"
                  ? "bg-violet-50/90 dark:bg-violet-950/40 border-violet-400 dark:border-violet-500/50 ring-1 ring-violet-400/30"
                  : "bg-slate-50 dark:bg-black/30 border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12]"
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">System Default</p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                  Currently {theme}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">User Profile</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">InsForge database public.users synchronizer</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-300 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Account Identifier
                </label>
                <input
                  type="text"
                  disabled
                  value={dbData?.email || user.email || dbData?.phone || user.phone || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-zinc-400 text-xs cursor-not-allowed font-mono"
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
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md">
              <Key className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Assistant Automation</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Briefing schedules & auto-pilot rules</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/[0.06]">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Morning Briefing Delivery Time</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">When your daily summary is synthesized</p>
              </div>
              <input
                type="time"
                value={dailyBriefingTime}
                onChange={(e) => setDailyBriefingTime(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/60 border border-slate-300 dark:border-white/[0.1] text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/[0.06]">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Autonomous Reply Drafting</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Draft responses for common inquiries automatically</p>
              </div>
              <button
                onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  autoReplyEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-zinc-700"
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
