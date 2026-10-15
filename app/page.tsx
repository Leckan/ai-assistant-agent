import React from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { IntegrationsBanner } from "./components/IntegrationsBanner";
import { LiveDemoSimulator } from "./components/LiveDemoSimulator";
import { BentoGrid } from "./components/BentoGrid";
import { PowerUserSection } from "./components/PowerUserSection";
import { HowItWorks } from "./components/HowItWorks";
import { Comparison } from "./components/Comparison";
import { Testimonials } from "./components/Testimonials";
import { Pricing } from "./components/Pricing";
import { FAQ } from "./components/FAQ";
import { CtaBanner } from "./components/CtaBanner";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Sticky Glass Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* Hero Section with interactive live mockup */}
        <Hero />

        {/* 4 Connected Channels Deep-Dive (Gmail, WhatsApp, Telegram, Outlook) */}
        <IntegrationsBanner />

        {/* Interactive Live Demo & Scenario Sandbox */}
        <LiveDemoSimulator />

        {/* Bento Grid Feature Suite */}
        <BentoGrid />

        {/* Professional UNIX / Terminal CLI / Keyboard Shortcuts */}
        <PowerUserSection />

        {/* 3-Step Simple Onboarding */}
        <HowItWorks />

        {/* Before vs After Comparison Matrix */}
        <Comparison />

        {/* Verified User Testimonials */}
        <Testimonials />

        {/* Transparent Pricing Plans (Starter, Pro, Vault) */}
        <Pricing />

        {/* Interactive FAQ Accordion */}
        <FAQ />

        {/* Pre-Footer Conversion Banner */}
        <CtaBanner />
      </main>

      {/* Complete Footer */}
      <Footer />
    </div>
  );
}
