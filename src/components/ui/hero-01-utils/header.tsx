"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Menu, X } from "lucide-react";

export type NavigationSection = {
  title: string;
  href: string;
  isActive?: boolean;
};

type HeaderProps = {
  navigationData: NavigationSection[];
};

export default function Header({ navigationData }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 md:py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shrink-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 2L2 5.5V10.5L8 14L14 10.5V5.5L8 2Z"
                fill="currentColor"
              />
              <path
                d="M8 2V8M8 8L2 5.5M8 8L14 5.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-white font-bold tracking-tight text-lg ml-1">
            shadcnspace.
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-md">
          {navigationData.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                item.isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {item.title}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <a
          href="#"
          className="group hidden md:flex items-center gap-3 rounded-full bg-white pl-6 pr-2 py-2 text-sm font-medium text-black transition-all duration-300 hover:bg-white/90"
        >
          Let&apos;s Collaborate
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </a>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 rounded-2xl border border-white/10 bg-black/90 p-4 backdrop-blur-xl">
          <nav className="flex flex-col gap-1">
            {navigationData.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                  item.isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                {item.title}
              </a>
            ))}
          </nav>
          <a
            href="#"
            className="mt-3 flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white px-5 py-2.5 text-sm font-medium text-black"
          >
            Let&apos;s Collaborate
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-white">
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </a>
        </div>
      )}
    </header>
  );
}
