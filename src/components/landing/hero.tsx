"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, ArrowUpRight } from "lucide-react";

interface HeroProps {
  isLoggedIn: boolean;
  scrollToSection: (id: string) => void;
}

export function Hero({ isLoggedIn, scrollToSection }: HeroProps) {
  return (
    <section id="hero" className="relative z-10 pt-16 pb-24 md:pt-24 md:pb-36 flex flex-col items-center text-center px-4 max-w-7xl mx-auto">
      {/* Release Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/20 dark:border-indigo-400/20 bg-indigo-500/5 dark:bg-indigo-400/5 text-indigo-700 dark:text-indigo-300 text-xs font-medium mb-8 hover:bg-indigo-500/10 transition-colors cursor-pointer">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Meet Decko AI Presentation Builder</span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-zinc-950 dark:text-white max-w-4xl leading-[1.08] mb-6">
        Generate Beautiful <br className="hidden sm:block" />
        <span className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-500 dark:from-indigo-400 dark:via-indigo-300 dark:to-indigo-400 bg-clip-text text-transparent">
          Slide Decks in Seconds
        </span>
      </h1>

      {/* Subhead */}
      <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
        Transform your ideas into structured, professional slide outlines instantly. Powered by advanced AI models to help you focus on delivering the perfect pitch to your audience.
      </p>

      {/* Call to Action Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-20 z-20">
        <Link
          href={isLoggedIn ? "/chat" : "/auth/signup"}
          className="group px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base flex items-center justify-center gap-2 transition-[transform,box-shadow,background-color] duration-200 will-change-transform shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>{isLoggedIn ? "Go to Workspace" : "Get Started for Free"}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <button
          onClick={() => scrollToSection("pricing")}
          className="px-8 py-4 rounded-full border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-800 dark:text-white font-medium text-base transition-[transform,background-color,border-color] duration-200 cursor-pointer will-change-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          View Pricing
        </button>
      </div>

      {/* visual interactive metallic orb container */}
      <div className="w-full max-w-4xl relative mt-4 select-none">
        {/* Back glows */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[75%] rounded-full bg-radial from-indigo-500/[0.04] dark:from-indigo-500/10 via-transparent to-transparent blur-[80px] z-0 pointer-events-none" />

        {/* Liquid metallic bubble graphic */}
        <div className="relative w-80 h-80 sm:w-[480px] sm:h-[480px] mx-auto z-10 flex items-center justify-center">
          {/* Simple Animated Slide Cards */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Background floating slide */}
            <div className="absolute w-[200px] sm:w-[280px] h-[140px] sm:h-[180px] bg-white/40 dark:bg-zinc-800/40 backdrop-blur-md rounded-xl border border-white/50 dark:border-zinc-700/50 shadow-xl transform -rotate-6 -translate-x-6 sm:-translate-x-10 translate-y-4 animate-pulse duration-1000" />
            {/* Middle floating slide */}
            <div className="absolute w-[220px] sm:w-[300px] h-[150px] sm:h-[200px] bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl border border-white/60 dark:border-zinc-700/60 shadow-xl transform rotate-3 translate-x-4 sm:translate-x-8 -translate-y-4 animate-pulse duration-1000" style={{ animationDelay: '500ms' }} />
            {/* Foreground main slide */}
            <div className="absolute w-[240px] sm:w-[340px] h-[160px] sm:h-[220px] bg-white dark:bg-[#09090b] rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl flex flex-col p-4 sm:p-6 z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-full mb-2" />
              <div className="w-5/6 h-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-full mb-2" />
              <div className="w-4/6 h-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-full mb-6" />
              
              <div className="flex gap-2 mt-auto">
                <div className="w-1/2 h-16 sm:h-20 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-lg border border-indigo-500/10 dark:border-indigo-500/20" />
                <div className="w-1/2 h-16 sm:h-20 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg border border-zinc-100 dark:border-zinc-700/50" />
              </div>
            </div>
          </div>

          {/* Overlapping Glassmorphic Card 1 (Left) */}
          <div className="absolute left-[-20px] top-[45%] sm:left-[5%] md:left-[-40px] z-20 glass-card-premium rounded-2xl p-5 w-[160px] sm:w-[220px] text-left hover:scale-105 hover:bg-white/75 dark:hover:bg-[#121217]/75 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:shadow-xl cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Model Choice
              </span>
              <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
              </div>
            </div>
            <h4 className="text-sm sm:text-lg font-bold text-zinc-950 dark:text-white mb-1">
              DeepSeek & GPT-5.5
            </h4>
            <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              Optimized configurations starting from 1 credit
            </p>
          </div>

          {/* Overlapping Glassmorphic Card 2 (Right) */}
          <div className="absolute right-[-20px] top-[60%] sm:right-[5%] md:right-[-40px] z-20 glass-card-premium rounded-2xl p-5 w-[160px] sm:w-[220px] text-left hover:scale-105 hover:bg-white/75 dark:hover:bg-[#121217]/75 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:shadow-xl cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Revision Cost
              </span>
              <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
              </div>
            </div>
            <h4 className="text-sm sm:text-lg font-bold text-zinc-950 dark:text-white mb-1">
              0 Credits
            </h4>
            <div className="w-full bg-zinc-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-1.5 mt-2">
              <div className="bg-indigo-500 h-full w-[100%] rounded-full" />
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              Free adjustments per outline (up to 3 times)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
