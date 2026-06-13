"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Menu, X } from "lucide-react";

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);

interface NavbarProps {
  isLoggedIn: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  scrollToSection: (id: string) => void;
}

export function Navbar({
  isLoggedIn,
  user,
  mobileMenuOpen,
  setMobileMenuOpen,
  scrollToSection,
}: NavbarProps) {
  return (
    <div className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4">
      <header className="max-w-5xl mx-auto h-14 rounded-full border border-black/[0.06] dark:border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-black/20 flex items-center justify-between px-6 pointer-events-auto bg-white/30 dark:bg-[#0c0c0e]/30 glass-effect">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <span className="text-lg font-extrabold tracking-tight text-zinc-950 dark:text-white group-hover:opacity-80 transition-opacity">
            Decko
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("hero")}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("features")}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            FAQ
          </button>
        </nav>

        {/* CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <div className="w-px h-4 bg-zinc-200 dark:bg-white/10" />
          {isLoggedIn ? (
            <>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden lg:inline">
                Signed in as <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{user?.name}</span>
              </span>
              <Link
                href="/chat"
                className="px-4 py-2 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-md shadow-zinc-900/5 dark:shadow-white/5"
              >
                Workspace
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-3 py-1.5 rounded-full text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-md shadow-zinc-950/5 dark:shadow-white/5"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-4 top-20 z-40 bg-white/75 dark:bg-[#0c0c0f]/75 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl px-5 py-6 flex flex-col gap-5 md:hidden animate-in fade-in slide-in-from-top-5 duration-200 shadow-xl shadow-black/10 dark:shadow-black/50 pointer-events-auto">
          <nav className="flex flex-col gap-4">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-left text-base text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white py-1 cursor-pointer font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-left text-base text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white py-1 cursor-pointer font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-left text-base text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white py-1 cursor-pointer font-medium"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-left text-base text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white py-1 cursor-pointer font-medium"
            >
              FAQ
            </button>
          </nav>
          <div className="border-t border-black/5 dark:border-white/5 pt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Appearance</span>
              <ThemeToggle />
            </div>
            <div className="flex flex-col gap-2">
              {isLoggedIn ? (
                <Link
                  href="/chat"
                  className="w-full text-center px-4 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Go to Workspace
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="w-full text-center px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="w-full text-center px-4 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
