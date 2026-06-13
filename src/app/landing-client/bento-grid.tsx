"use client";

import { Zap, Check, Sparkles, History, FileText, Activity } from "lucide-react";

export function BentoGrid() {
  return (
    <section id="features" className="relative z-10 py-24 border-t border-black/5 dark:border-white/5 bg-zinc-50/20 dark:bg-[#050507]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-white mb-4">
            Everything you need to draft slides instantly
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">
            Decko compiles structure, summaries, and objectives into a unified workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto">
          {/* Feature 1 (Double size - Col Span 2, Row Span 2) */}
          <div className="glass-card-premium rounded-3xl p-8 md:col-span-2 md:row-span-2 flex flex-col justify-between relative overflow-hidden border-zinc-200/50 dark:border-white/5 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 group text-left min-h-[380px] md:min-h-[460px]">
            <div className="absolute inset-0 bg-indigo-500/[0.005] dark:bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_transparent_60%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/15 dark:border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-650 dark:text-indigo-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold text-zinc-950 dark:text-white mb-3">Instant AI Generation</h3>
              <p className="text-zinc-655 dark:text-zinc-400 text-sm leading-relaxed max-w-xl mb-6">
                Input your topic, select your language preference, and choose an AI model. In under 30 seconds, Decko drafts slide titles, descriptions, target outcomes, and chapter slides.
              </p>
            </div>
            {/* Mini Interactive Mockup inside Bento box */}
            <div className="relative z-10 bg-zinc-100/40 dark:bg-black/20 border border-black/[0.06] dark:border-white/5 rounded-xl p-4 mt-auto backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3 border-b border-black/[0.06] dark:border-white/5 pb-2">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">AI Steps Checklist</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 animate-pulse font-medium">Processing...</span>
              </div>
              <div className="space-y-2 text-xs text-zinc-650 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Tuning Prompt template</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Generating Outline chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-indigo-500/50 dark:border-indigo-400/50 animate-spin border-t-transparent shrink-0" />
                  <span className="text-zinc-800 dark:text-zinc-200">Polishing slide content & formatting</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 (Single size - Amber) */}
          <div className="glass-card-premium rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden border-zinc-200/50 dark:border-white/5 hover:border-amber-500/30 dark:hover:border-amber-500/30 group text-left min-h-[220px]">
            <div className="absolute inset-0 bg-amber-500/[0.005] dark:bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.05)_0%,_transparent_60%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 dark:border-amber-500/20 flex items-center justify-center mb-6 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-950 dark:text-white mb-2">DeepSeek & GPT-4o</h3>
              <p className="text-zinc-650 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Choose between Owl Alpha (1 credit), DeepSeek (3 credits), or GPT-4o Mini (7 credits) to match your draft detail and cost requirements.
              </p>
            </div>
            <div className="relative z-10 bg-zinc-100/40 dark:bg-black/20 border border-black/[0.06] dark:border-white/5 rounded-xl p-2.5 mt-4 flex flex-col gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 backdrop-blur-sm">
              <div className="flex justify-between items-center bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/10 dark:border-amber-400/10 p-1.5 rounded-lg">
                <span className="font-semibold text-amber-700 dark:text-amber-300">Owl Alpha</span>
                <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded-full font-bold">1 credit</span>
              </div>
              <div className="flex justify-between items-center p-1.5 border border-black/[0.04] dark:border-white/5 rounded-lg opacity-85">
                <span className="font-semibold text-zinc-700 dark:text-zinc-350">DeepSeek Chat</span>
                <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-350 px-1.5 py-0.5 rounded-full">3 credits</span>
              </div>
            </div>
          </div>

          {/* Feature 3 (Single size - Rose) */}
          <div className="glass-card-premium rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden border-zinc-200/50 dark:border-white/5 hover:border-rose-500/30 dark:hover:border-rose-500/30 group text-left min-h-[220px]">
            <div className="absolute inset-0 bg-rose-500/[0.005] dark:bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.05)_0%,_transparent_60%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/15 dark:border-rose-500/20 flex items-center justify-center mb-6 text-rose-600 dark:text-rose-400">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-950 dark:text-white mb-2">Free Chat Revisions</h3>
              <p className="text-zinc-655 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Refine slide outlines iteratively using natural chat feedback. Up to 3 cycles per outline with absolutely zero extra credits required.
              </p>
            </div>
            <div className="relative z-10 bg-zinc-100/40 dark:bg-black/20 border border-black/[0.06] dark:border-white/5 rounded-xl p-2.5 mt-4 space-y-2 text-[11px] backdrop-blur-sm">
              <div className="bg-zinc-200/55 dark:bg-zinc-800/40 rounded-lg p-1.5 max-w-[85%] text-left">
                <span className="text-zinc-800 dark:text-zinc-250">Add safety chapter</span>
              </div>
              <div className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 rounded-lg p-1.5 max-w-[90%] ml-auto text-left flex items-start gap-1">
                <Sparkles className="w-2.5 h-2.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-zinc-700 dark:text-zinc-350 leading-normal">Chapter added!</span>
              </div>
            </div>
          </div>

          {/* Feature 4 (Single size - Emerald) */}
          <div className="glass-card-premium rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden border-zinc-200/50 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 group text-left min-h-[220px]">
            <div className="absolute inset-0 bg-emerald-500/[0.005] dark:bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.05)_0%,_transparent_60%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 dark:border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-950 dark:text-white mb-2">Document Exports</h3>
              <p className="text-zinc-655 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Download finished outlines cleanly into styled Microsoft Word (.docx) or print-ready PDF files with one single click.
              </p>
            </div>
            <div className="relative z-10 bg-zinc-100/40 dark:bg-black/20 border border-black/[0.06] dark:border-white/5 rounded-xl p-2.5 mt-4 flex gap-2 justify-center backdrop-blur-sm">
              <div className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                <FileText className="w-3 h-3" />
                <span>Word.docx</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded-lg bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 text-red-650 dark:text-red-400 font-semibold text-[10px]">
                <FileText className="w-3 h-3" />
                <span>PDF.pdf</span>
              </div>
            </div>
          </div>

          {/* Feature 5 (Double size - Col Span 2, Purple) */}
          <div className="glass-card-premium rounded-3xl p-8 md:col-span-2 flex flex-col md:flex-row gap-6 items-center justify-between relative overflow-hidden border-zinc-200/50 dark:border-white/5 hover:border-purple-500/30 dark:hover:border-purple-500/30 group text-left min-h-[220px]">
            <div className="absolute inset-0 bg-purple-500/[0.005] dark:bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.05)_0%,_transparent_60%)] pointer-events-none" />
            <div className="relative z-10 flex-1">
              <div className="w-12 h-12 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/15 dark:border-purple-500/20 flex items-center justify-center mb-6 text-purple-650 dark:text-purple-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-950 dark:text-white mb-2">Visual Skeletons & stable UI</h3>
              <p className="text-zinc-655 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md">
                Pulsing loader skeletons match elements exactly, maintaining a visually stable workspace during initial loading states without layout shifts.
              </p>
            </div>
            {/* Mini Skeleton Preview widget */}
            <div className="relative z-10 bg-zinc-100/40 dark:bg-black/20 border border-black/[0.06] dark:border-white/5 rounded-xl p-4 w-full md:w-[220px] space-y-3 shrink-0 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-black/[0.06] dark:border-white/5 pb-2">
                <div className="w-3.5 h-3.5 rounded bg-purple-500/20 shrink-0" />
                <div className="h-2.5 bg-purple-500/20 rounded w-16" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500/10 dark:bg-purple-500/20 shrink-0 animate-pulse" />
                  <div className="h-2 bg-purple-500/10 dark:bg-purple-500/20 rounded w-[60%] animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500/10 dark:bg-purple-500/20 shrink-0 animate-pulse" />
                  <div className="h-2 bg-purple-500/10 dark:bg-purple-500/20 rounded w-[50%] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
