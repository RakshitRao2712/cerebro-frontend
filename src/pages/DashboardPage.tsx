"use client";

import { Link } from "react-router-dom";
import {
  Terminal,
  LayoutDashboard,
  FolderGit2,
  Settings,
  LogOut,
  Plus,
  ArrowLeft,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* ---- Sidebar ---- */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-white/[0.01]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">
            <Terminal className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-sm font-bold tracking-tight">Cerebro</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
          <SidebarItem icon={FolderGit2} label="Projects" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/5">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* ---- Main ---- */}
      <main className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/30 hover:text-white/60 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-sm font-bold">Cerebro Dashboard</span>
          </div>
        </div>

        {/* Top bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/5">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
            <p className="text-xs text-white/30 mt-0.5">
              Welcome to Cerebro Console
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-white/90">
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        </header>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            {/* Animated icon */}
            <div className="relative mx-auto w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-2xl border border-white/5 bg-white/[0.02]" />
              <div className="absolute inset-0 rounded-2xl border border-cyan-500/10 bg-cyan-500/5 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Terminal className="w-10 h-10 text-white/10" />
              </div>
            </div>

            <h2 className="text-xl font-semibold tracking-tight mb-2">
              Coming Soon
            </h2>
            <p className="text-sm text-white/30 leading-relaxed mb-8">
              The Cerebro console is under construction. Soon you'll be able to
              generate, validate, and iterate on infrastructure code right from
              this dashboard.
            </p>

            {/* Stats placeholder */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: "Projects", value: "—" },
                { label: "Generations", value: "—" },
                { label: "Success Rate", value: "—" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="text-lg font-bold text-white/10 font-mono">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/20 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to homepage
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Sidebar nav item */
function SidebarItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
        active
          ? "bg-white/5 text-white font-medium"
          : "text-white/30 hover:text-white/60 hover:bg-white/[0.03]"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
