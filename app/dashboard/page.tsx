"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { insforge, type UserRecord } from "@/lib/insforge";
import Sidebar, { NavTabId } from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import AgentView from "./components/AgentView";
import BriefingView from "./components/BriefingView";
import IntegrationsView from "./components/IntegrationsView";
import AlertsView from "./components/AlertsView";
import SettingsView from "./components/SettingsView";
import PricingSettingsView from "./components/PricingSettingsView";
import { X, Sparkles, LogIn } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, dbUser, isLoading, signOut, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<NavTabId>("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live InsForge database state
  const [dbData, setDbData] = useState<UserRecord | null>(dbUser);
  const [loadingDb, setLoadingDb] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Load sidebar collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("omnimind_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("omnimind_sidebar_collapsed", String(next));
      } catch {
        // Ignore localStorage error
      }
      return next;
    });
  };

  // Keyboard shortcut listener (Cmd/Ctrl + B or [ )
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        handleToggleCollapse();
      } else if (e.key === "[" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        handleToggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (dbUser) {
      setDbData(dbUser);
    }
  }, [dbUser]);

  // Fetch live fresh record directly from InsForge database public.users table
  const fetchLiveDatabaseRecord = async () => {
    if (!user) return;
    setLoadingDb(true);
    setFeedbackMsg(null);
    try {
      const { data, error } = await insforge.database
        .from("users")
        .select("*")
        .eq("id", user.id);

      if (!error && data && data.length > 0) {
        setDbData(data[0] as UserRecord);
        setFeedbackMsg("Database record reloaded successfully!");
      }
    } catch (err) {
      console.error("Failed to query users table:", err);
    } finally {
      setLoadingDb(false);
    }
  };

  const handleUpdateName = async (newName: string) => {
    if (!newName.trim()) return;
    setSavingName(true);
    setFeedbackMsg(null);

    try {
      if (user) {
        // 1. Update in InsForge database public.users table
        const { error: dbError } = await insforge.database
          .from("users")
          .update({
            name: newName.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        // 2. Also update profile on auth object
        await insforge.auth.setProfile({ name: newName.trim() });

        if (dbError) {
          setFeedbackMsg(`Error updating name: ${dbError.message}`);
        } else {
          setFeedbackMsg("Display name updated and saved in InsForge database!");
          await refreshUser();
          await fetchLiveDatabaseRecord();
        }
      } else {
        // Demo mode state update
        setDbData((prev) => (prev ? { ...prev, name: newName.trim() } : null));
        setFeedbackMsg("Display name updated (Demo Mode)");
      }
    } catch (err: unknown) {
      setFeedbackMsg(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSavingName(false);
    }
  };

  const handleSignOut = async () => {
    if (user) {
      await signOut();
    }
    router.push("/");
  };

  // Provide fallback demo user if no active user session (so dashboard preview is immediately accessible)
  const displayUser = user || {
    id: "usr_guest_demo92418",
    email: "alex.mercer@omnimind.ai",
    phone: "+1 (555) 234-5678",
    emailVerified: true,
    provider: "email",
    providers: ["email", "google", "phone"],
    profile: {
      name: "Alex Mercer",
      avatar_url: undefined,
    },
  };

  const displayDbData: UserRecord = dbData || {
    id: displayUser.id,
    email: displayUser.email,
    phone: displayUser.phone,
    name: displayUser.profile?.name || "Alex Mercer",
    provider: displayUser.provider || "email",
    providers: ["email", "google", "phone"],
    verification_method: "phone_otp",
    avatar_url: null,
    email_verified: true,
    created_at: "2026-10-08T08:00:00.000Z",
    last_login_at: "2026-10-15T10:30:00.000Z",
    updated_at: "2026-10-15T10:30:00.000Z",
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-row overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      {/* Desktop Collapsible Sidebar */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
          }}
          userName={displayDbData.name || displayUser.profile?.name || "Alex Mercer"}
          userEmailOrPhone={displayDbData.phone || displayDbData.email || displayUser.email || ""}
          avatarUrl={displayDbData.avatar_url || displayUser.profile?.avatar_url || undefined}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex flex-col w-72 max-w-[85vw] h-full bg-[#0d0f18] shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.06] text-zinc-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar
              isCollapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              userName={displayDbData.name || displayUser.profile?.name || "Alex Mercer"}
              userEmailOrPhone={displayDbData.phone || displayDbData.email || displayUser.email || ""}
              avatarUrl={displayDbData.avatar_url || displayUser.profile?.avatar_url || undefined}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          activeTab={activeTab}
          userName={displayDbData.name || displayUser.profile?.name || "Alex Mercer"}
          isDbLive={!!user}
          onRefreshDb={user ? fetchLiveDatabaseRecord : undefined}
          loadingDb={loadingDb}
        />

        {/* Demo banner if not signed in */}
        {!user && !isLoading && (
          <div className="bg-gradient-to-r from-indigo-950/70 via-purple-950/60 to-indigo-950/70 border-b border-indigo-500/20 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-indigo-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Dashboard Preview Mode</strong>: You are exploring the dashboard layout with simulated data.
              </span>
            </div>
            <Link
              href="/sign-in"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with InsForge</span>
            </Link>
          </div>
        )}

        {/* Dynamic Tab Content Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "dashboard" && (
            <DashboardView
              user={displayUser}
              dbData={displayDbData}
              loadingDb={loadingDb}
              onRefreshDb={fetchLiveDatabaseRecord}
              onUpdateName={handleUpdateName}
              savingName={savingName}
              feedbackMsg={feedbackMsg}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "ai-agent" && <AgentView />}

          {activeTab === "briefing" && <BriefingView />}

          {activeTab === "integrations" && <IntegrationsView />}

          {activeTab === "alerts" && <AlertsView />}

          {activeTab === "settings" && (
            <SettingsView
              user={displayUser}
              dbData={displayDbData}
              onUpdateName={handleUpdateName}
              savingName={savingName}
              feedbackMsg={feedbackMsg}
            />
          )}

          {activeTab === "pricing" && <PricingSettingsView />}
        </main>
      </div>
    </div>
  );
}
