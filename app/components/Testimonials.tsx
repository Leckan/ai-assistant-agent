"use client";

import React from "react";
import { Star, Quote, CheckCircle2 } from "lucide-react";

export function Testimonials() {
  const reviews = [
    {
      name: "Sarah Lin",
      role: "Founder & CEO, HyperScale",
      channels: "Gmail + WhatsApp + Telegram",
      quote:
        "I was juggling 5 Telegram dev chats, 30 investor threads on Gmail, and client pings on WhatsApp. OmniMind's morning executive brief cut my screen time by 2.5 hours every day. It feels like having a seasoned chief of staff.",
      rating: 5,
      timeSaved: "14 hrs / wk saved",
    },
    {
      name: "Dr. Marcus Vance",
      role: "Clinic Director & Surgeon",
      channels: "WhatsApp + Outlook",
      quote:
        "My clinical team sends voice notes on WhatsApp while hospital administration uses Outlook. OmniMind transcribes clinical action items and puts scheduled reminders on my watch automatically without me touching a screen.",
      rating: 5,
      timeSaved: "10 hrs / wk saved",
    },
    {
      name: "David Ross",
      role: "Managing Director, Global Ventures",
      channels: "Outlook + Gmail + WhatsApp",
      quote:
        "The smart meeting conflict resolver alone is worth 10x the price. When two partner syncs clashed between my personal Google Calendar and corporate 365, OmniMind drafted polite alternatives in 2 seconds.",
      rating: 5,
      timeSaved: "18 hrs / wk saved",
    },
  ];

  return (
    <section className="py-24 relative bg-[#08090d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300 mb-4">
            <Star className="w-3.5 h-3.5 fill-current text-cyan-400" />
            <span>Trusted by 45,000+ Power Users</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Loved by Founders, Executives & Creators
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            See how high-performing individuals reclaim their sanity from notification overload.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#0d101c] border border-white/[0.08] hover:border-indigo-500/30 transition-all flex flex-col justify-between shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                    {r.timeSaved}
                  </span>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed italic">
                  "{r.quote}"
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                    {r.name}
                  </h3>
                  <p className="text-xs text-zinc-500">{r.role}</p>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded">
                  {r.channels}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
