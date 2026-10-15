"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is my personal data, email, and private messaging history secure?",
      a: "Yes, 100%. OmniMind follows a strict Zero Data Retention (ZDR) architecture. Your emails, voice notes, and messages are processed in ephemeral memory and are never used to train public AI models. All data in transit and at rest is secured with military-grade AES-256 GCM encryption. In our Executive Vault tier, you can even run local models via Ollama completely offline.",
    },
    {
      q: "How does OmniMind connect to WhatsApp and Telegram without risking my account?",
      a: "We connect exclusively through compliant, verified mechanisms. For Telegram, we utilize the official Telegram Bot API and MTProto session protocols. For WhatsApp, we utilize the official Meta WhatsApp Cloud API or an end-to-end encrypted multi-device QR link that mirrors the official WhatsApp Web client.",
    },
    {
      q: "Does OmniMind send emails or messages automatically without my consent?",
      a: "No. By default, OmniMind runs in 'Supervised Copilot Mode'. When an action or reply is needed, the AI drafts the exact response in your voice and surfaces it in your daily digest or quick command bar. It will never dispatch a message without your explicit 1-tap approval.",
    },
    {
      q: "Which reminder and calendar apps can it sync with?",
      a: "OmniMind includes native two-way sync with Apple Reminders, Google Calendar, Microsoft Outlook 365 Calendar, Notion, and Todoist. You can also configure reminders to ping you directly in your private Telegram or WhatsApp chat.",
    },
    {
      q: "Can I connect multiple accounts (e.g. 2 Gmails and 1 Outlook)?",
      a: "Yes! The Pro plan supports all 4 primary channels, while the Executive Vault plan enables unlimited multi-account linking so you can unify personal Gmail, work Outlook, contractor email, and secondary messaging numbers into one single intelligence layer.",
    },
  ];

  return (
    <section id="faq" className="py-24 relative bg-[#08090d]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300 mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Everything you need to know about security, channel connectivity, and AI reminders.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-[#0d101c] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 transition-transform ${
                      isOpen ? "rotate-180 bg-indigo-600/30 text-indigo-300" : "text-zinc-400"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
