"use client";

import { useState, useEffect } from "react";
import Link from "next/link";


import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { BentoGrid } from "./bento-grid";
import { Pricing } from "./pricing";
import { FAQ } from "./faq";

interface LandingPageClientProps {
  isLoggedIn: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export default function LandingPageClient({ isLoggedIn, user }: LandingPageClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; delay: string; opacity: number }[]>([]);

  useEffect(() => {
    // Generate star coordinates on the client to avoid SSR hydration mismatches
    const generatedStars = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 95 + 2}%`,
      left: `${Math.random() * 96 + 2}%`,
      size: Math.random() * 2.2 + 0.8,
      delay: `${Math.random() * 6}s`,
      opacity: Math.random() * 0.4 + 0.25,
    }));
    setStars(generatedStars);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcf7] dark:bg-[#030303] text-zinc-800 dark:text-zinc-100 font-sans selection:bg-amber-400 selection:text-black overflow-x-clip relative transition-colors duration-300">
      {/* Background Starry Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full dark:bg-white/75 bg-zinc-800/40 animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
              opacity: star.opacity,
              willChange: "opacity",
            }}
          />
        ))}
      </div>

      {/* Ambient Glow Rings */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/[0.04] dark:bg-blue-500/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-500/[0.04] dark:bg-purple-500/10 blur-[130px] pointer-events-none z-0" />

      {/* Floating Navbar Container */}
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        scrollToSection={scrollToSection}
      />

      {/* Hero Section */}
      <Hero isLoggedIn={isLoggedIn} scrollToSection={scrollToSection} />

      {/* Features Showcase Section */}
      <BentoGrid />

      {/* Pricing Section */}
      <Pricing />

      {/* FAQ Section */}
      <FAQ activeFaq={activeFaq} setActiveFaq={setActiveFaq} />

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/5 dark:border-white/5 py-12 bg-zinc-50/50 dark:bg-[#020202]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-zinc-950 dark:text-white">Decko</span>
          </div>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} Decko Presentation outlines. All rights reserved.
          </p>
          <div className="flex gap-6 text-zinc-500 dark:text-zinc-400 text-xs">
            <Link href="/auth/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              App Login
            </Link>
            <Link href="/auth/signup" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              App Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
