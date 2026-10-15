"use client";

import React from "react";
import { Bot, Shield, Terminal, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#050609] pt-16 pb-12 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/[0.08]">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <a href="#" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1px] flex items-center justify-center">
                  <div className="w-full h-full bg-[#0d0f18] rounded-[11px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Omni<span className="text-indigo-400">Mind</span>
                </span>
              </a>

              <p className="mt-4 text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed">
                The autonomous AI personal assistant uniting your Gmail, WhatsApp, Telegram, and Outlook into a calm, proactive stream of daily briefs and zero-effort reminders.
              </p>
            </div>

            {/* System Status Pill */}
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs font-mono text-emerald-300 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational • 99.99% Uptime</span>
            </div>
          </div>

          {/* Links Column 1: Integrations */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white mb-4">
              Integrations
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#channels" className="hover:text-white transition-colors">
                  Gmail Inbox Synthesis
                </a>
              </li>
              <li>
                <a href="#channels" className="hover:text-white transition-colors">
                  WhatsApp Voice & Chats
                </a>
              </li>
              <li>
                <a href="#channels" className="hover:text-white transition-colors">
                  Telegram Bot & Channels
                </a>
              </li>
              <li>
                <a href="#channels" className="hover:text-white transition-colors">
                  Outlook & Office 365
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Google Calendar & Apple Reminders
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Notion & Todoist Bridge
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Product */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white mb-4">
              Capabilities
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Executive Daily Briefings
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Zero-Click Reminders
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Voice Note Audio Parser
                </a>
              </li>
              <li>
                <a href="#unix-terminal" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>UNIX CLI & Daemon</span>
                  <span className="text-[10px] font-mono px-1 rounded bg-white/[0.08] text-emerald-400">
                    CLI
                  </span>
                </a>
              </li>
              <li>
                <a href="#simulator" className="hover:text-white transition-colors">
                  Interactive Simulator
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Trust & Legal */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white mb-4">
              Security & Trust
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#features" className="hover:text-white transition-colors flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Zero Data Retention</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  SOC-2 Type II Certification
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Local LLM (Ollama) Mode
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Security Whitepaper
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>
            © 2026 OmniMind AI Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-300 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-zinc-300 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-zinc-300 transition-colors">
              Security
            </a>
            <a href="#" className="hover:text-zinc-300 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
