"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Check,
  ArrowUpRight,
  Shield,
  Zap,
  Activity,
  History,
  FileText,
  HelpCircle,
} from "lucide-react";

interface LandingPageClientProps {
  isLoggedIn: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

const FAQS = [
  {
    question: "What is Decko?",
    answer: "Decko is an AI-powered presentation planner and outline generator. It drafts fully structured, professional chapter guides, outlines, and summaries for your topics in seconds, helping you skip the dreaded blank-slide phase of creating presentations.",
  },
  {
    question: "How does the credit system work?",
    answer: "Every registered user starts with 2 free credits. You can generate outlines using different AI models which deduct credits based on their capability: Owl Alpha (1 credit/run), DeepSeek Chat (3 credits/run), or GPT-4o Mini (7 credits/run). Refills and extra credit packs can be purchased at any time.",
  },
  {
    question: "Are presentation revisions free?",
    answer: "Yes! Once you generate an outline, you can interactively revise, update, or expand it using our natural chat pane up to 3 times per presentation. Revisions are completely free and consume zero extra credits.",
  },
  {
    question: "Can I export my outlines?",
    answer: "Absolutely. You can export any generated presentation outline directly into structured PDF documents or styled Microsoft Word (.docx) formats with a single click, ready to share or import into presentation software.",
  },
  {
    question: "Is there a limit on how many outlines I can save?",
    answer: "No. Your generated presentation outline history is securely saved in your personal sidebar workspace so you can access, edit, revise, or re-export them whenever you need.",
  },
];

const PRICING_PLANS = [
  {
    name: "Free Trial",
    price: "$0",
    description: "Perfect for testing the waters",
    features: [
      "2 free starter credits",
      "Fast Owl Alpha generation (1 credit)",
      "3 free revisions per presentation",
      "Standard PDF & DOCX export",
      "Saved workspace history",
    ],
    buttonText: "Get Started Free",
    actionLink: "/auth/signup",
    popular: false,
  },
  {
    name: "Starter Pack",
    price: "$5",
    priceSub: "one-time",
    description: "Perfect for casual students & writers",
    features: [
      "10 credits pack refilled instantly",
      "Access to DeepSeek Chat (3 credits)",
      "3 free revisions per presentation",
      "Standard PDF & DOCX export",
      "Priority outline generation speed",
      "Saved workspace history",
    ],
    buttonText: "Get Starter Pack",
    actionLink: "/auth/login?purchase=starter",
    popular: false,
  },
  {
    name: "Pro Pack",
    price: "$15",
    priceSub: "one-time",
    description: "Best value for professionals & creators",
    features: [
      "50 credits pack refilled instantly",
      "Access to GPT-4o Mini (7 credits)",
      "Access to DeepSeek & Owl Alpha",
      "3 free revisions per presentation",
      "Premium formatting PDF/DOCX exports",
      "Ultra-fast priority processing",
      "Saved workspace history",
    ],
    buttonText: "Upgrade to Pro",
    actionLink: "/auth/login?purchase=pro",
    popular: true,
  },
];

export default function LandingPageClient({ isLoggedIn, user }: LandingPageClientProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; delay: string; opacity: number }[]>([]);

  useEffect(() => {
    // Generate star coordinates on the client to avoid SSR hydration mismatches
    const generatedStars = Array.from({ length: 45 }).map((_, i) => ({
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
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans selection:bg-amber-400 selection:text-black overflow-x-clip relative">
      {/* Background Starry Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white/70 animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* Top Ambient Glow Rings */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none z-0" />

      {/* Floating Navbar Container */}
      <div className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pointer-events-none pt-4">
        <header className="max-w-5xl mx-auto h-14 rounded-full border border-white/10 bg-[#0c0c0f]/75 backdrop-blur-md shadow-lg shadow-black/40 flex items-center justify-between px-6 pointer-events-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-400/10">
              <Sparkles className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-base font-bold tracking-tight text-white group-hover:opacity-90 transition-opacity">
              Decko
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* CTA Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <span className="text-xs text-zinc-400">
                  Signed in as <span className="text-zinc-200 font-medium">{user?.name}</span>
                </span>
                <Link
                  href="/chat"
                  className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors shadow-md shadow-white/5"
                >
                  Go to Workspace
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 rounded-full text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors shadow-md shadow-white/5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="fixed inset-x-4 top-20 z-40 bg-[#0c0c0f]/95 border border-white/10 rounded-2xl px-5 py-6 flex flex-col gap-5 md:hidden animate-in fade-in slide-in-from-top-5 duration-200 shadow-xl shadow-black/50 pointer-events-auto">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("hero")}
                className="text-left text-base text-zinc-300 hover:text-white py-1 cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-left text-base text-zinc-300 hover:text-white py-1 cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-left text-base text-zinc-300 hover:text-white py-1 cursor-pointer"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-left text-base text-zinc-300 hover:text-white py-1 cursor-pointer"
              >
                FAQ
              </button>
            </nav>
            <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
              {isLoggedIn ? (
                <Link
                  href="/chat"
                  className="w-full text-center px-4 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
                >
                  Go to Workspace
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="w-full text-center px-4 py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:text-white text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="w-full text-center px-4 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <section id="hero" className="relative z-10 pt-16 pb-24 md:pt-24 md:pb-36 flex flex-col items-center text-center px-4 max-w-7xl mx-auto">
        {/* Release Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-400/20 bg-amber-400/5 text-amber-200 text-xs font-medium mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Presentation Planner</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.08] mb-6">
          Elevate Your <br />
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
            Presentation Outlines
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          Draft structured, professional presentation slide decks tailored to your topic and audience in seconds. Powered by DeepSeek & GPT-4o models.
        </p>

        {/* Call to Action Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20 z-20">
          <Link
            href={isLoggedIn ? "/chat" : "/auth/signup"}
            className="group px-8 py-4 rounded-xl bg-white text-black font-semibold text-base flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{isLoggedIn ? "Go to Workspace" : "Get Started for Free"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => scrollToSection("pricing")}
            className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium text-base transition-all cursor-pointer"
          >
            View Pricing
          </button>
        </div>

        {/* visual interactive metallic orb container */}
        <div className="w-full max-w-4xl relative mt-4 select-none">
          {/* Back glows */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[75%] rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent blur-[80px] z-0 pointer-events-none" />

          {/* Liquid metallic bubble graphic */}
          <div className="relative w-80 h-80 sm:w-[480px] sm:h-[480px] mx-auto z-10 flex items-center justify-center">
            {/* The animated liquid orb */}
            <div className="w-72 h-72 sm:w-[420px] sm:h-[420px] liquid-bubble">
              <div className="liquid-bubble-glow" />
            </div>

            {/* Overlapping Glassmorphic Card 1 (Left) */}
            <div className="absolute left-[-20px] top-[45%] sm:left-[5%] md:left-[-40px] z-20 glass-card-premium rounded-2xl p-5 w-[160px] sm:w-[220px] text-left">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Model Choice
                </span>
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300" />
                </div>
              </div>
              <h4 className="text-sm sm:text-lg font-bold text-white mb-1">
                DeepSeek & GPT-4o
              </h4>
              <p className="text-[10px] sm:text-xs text-zinc-400">
                Optimized configurations starting from 1 credit
              </p>
            </div>

            {/* Overlapping Glassmorphic Card 2 (Right) */}
            <div className="absolute right-[-20px] top-[60%] sm:right-[5%] md:right-[-40px] z-20 glass-card-premium rounded-2xl p-5 w-[160px] sm:w-[220px] text-left">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Revision Cost
                </span>
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300" />
                </div>
              </div>
              <h4 className="text-sm sm:text-lg font-bold text-white mb-1">
                0 Credits
              </h4>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-1.5 mt-2">
                <div className="bg-amber-400 h-full w-[100%] rounded-full" />
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-400">
                Free adjustments per outline (up to 3 times)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section id="features" className="relative z-10 py-24 border-t border-white/5 bg-[#050507]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to draft slides instantly
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg">
              Decko compiles structure, summaries, and objectives into a unified workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto">
            {/* Feature 1 (Double size - Col Span 2, Row Span 2) */}
            <div className="glass-card-premium rounded-3xl p-8 md:col-span-2 md:row-span-2 flex flex-col justify-between relative overflow-hidden border-indigo-500/25 hover:border-indigo-500/40 hover:shadow-indigo-500/5 group text-left min-h-[380px] md:min-h-[460px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.07)_0%,_transparent_60%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Instant AI Generation</h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xl mb-6">
                  Input your topic, select your language preference, and choose an AI model. In under 30 seconds, Decko drafts slide titles, descriptions, target outcomes, and chapter slides.
                </p>
              </div>
              {/* Mini Interactive Mockup inside Bento box */}
              <div className="relative z-10 bg-black/40 border border-white/5 rounded-xl p-4 mt-auto">
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <span className="text-xs font-semibold text-zinc-300">AI Steps Checklist</span>
                  <span className="text-[10px] text-indigo-400 animate-pulse font-medium">Processing...</span>
                </div>
                <div className="space-y-2 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Tuning Prompt template</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Generating Outline chapters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border border-indigo-400/50 animate-spin border-t-transparent shrink-0" />
                    <span className="text-zinc-200">Polishing slide content & formatting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 (Single size - Amber) */}
            <div className="glass-card-premium rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden border-amber-500/25 hover:border-amber-500/40 hover:shadow-amber-500/5 group text-left min-h-[220px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.07)_0%,_transparent_60%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-6 text-amber-300">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">DeepSeek & GPT-4o</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Choose between Owl Alpha (1 credit), DeepSeek (3 credits), or GPT-4o Mini (7 credits) to match your draft detail and cost requirements.
                </p>
              </div>
            </div>

            {/* Feature 3 (Single size - Rose) */}
            <div className="glass-card-premium rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden border-rose-500/25 hover:border-rose-500/40 hover:shadow-rose-500/5 group text-left min-h-[220px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.07)_0%,_transparent_60%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 text-rose-400">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Free Chat Revisions</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Refine slide outlines iteratively using natural chat feedback. Up to 3 cycles per presentation outline with absolutely zero extra credits required.
                </p>
              </div>
            </div>

            {/* Feature 4 (Single size - Emerald) */}
            <div className="glass-card-premium rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden border-emerald-500/25 hover:border-emerald-500/40 hover:shadow-emerald-500/5 group text-left min-h-[220px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.07)_0%,_transparent_60%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Document Exports</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Download finished outlines cleanly into styled Microsoft Word (.docx) or print-ready PDF files with one single click.
                </p>
              </div>
            </div>

            {/* Feature 5 (Double size - Col Span 2, Purple) */}
            <div className="glass-card-premium rounded-3xl p-8 md:col-span-2 flex flex-col md:flex-row gap-6 items-center justify-between relative overflow-hidden border-purple-500/25 hover:border-purple-500/40 hover:shadow-purple-500/5 group text-left min-h-[220px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.07)_0%,_transparent_60%)] pointer-events-none" />
              <div className="relative z-10 flex-1">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Visual Skeletons & stable UI</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md">
                  Pulsing loader skeletons match elements exactly, maintaining a visually stable workspace during initial loading states without layout shifts.
                </p>
              </div>
              {/* Mini Skeleton Preview widget */}
              <div className="relative z-10 bg-black/40 border border-white/5 rounded-xl p-4 w-full md:w-[220px] space-y-3 shrink-0">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <div className="w-3.5 h-3.5 rounded bg-purple-500/20 shrink-0" />
                  <div className="h-2.5 bg-purple-500/20 rounded w-16" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500/10 shrink-0" />
                    <div className="h-2 bg-purple-500/10 rounded w-[60%]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500/10 shrink-0" />
                    <div className="h-2 bg-purple-500/10 rounded w-[50%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg">
              Start with free credits, top up when you need. No recurring subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {PRICING_PLANS.map((plan, index) => (
              <div
                key={index}
                className={`glass-card-premium rounded-2xl p-8 flex flex-col justify-between text-left relative ${
                  plan.popular ? "border-amber-400/40 ring-1 ring-amber-400/20 bg-[#0c0c0e]/85" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-zinc-300 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white">{plan.price}</span>
                    {plan.priceSub && (
                      <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                        / {plan.priceSub}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-sm mb-6">{plan.description}</p>
                  <div className="border-t border-white/5 pt-6 mb-8 space-y-3.5">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-zinc-300 text-xs sm:text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link
                  href={plan.actionLink}
                  className={`w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? "bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/15 hover:scale-[1.01]"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-24 border-t border-white/5 bg-[#050507]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg">
              Have questions about credits, revision cycles, or models? We&apos;ve got answers.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="glass-card-premium rounded-xl border border-white/5 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none cursor-pointer"
                  >
                    <span className="font-semibold text-white text-sm sm:text-base pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform duration-300 shrink-0 ${
                        isOpen ? "rotate-180 text-white" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "max-h-[300px] border-t border-white/5"
                        : "max-h-0 pointer-events-none"
                    }`}
                  >
                    <p className="p-6 text-zinc-400 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 bg-[#020202]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">Decko</span>
          </div>
          <p className="text-zinc-500 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} Decko Presentation outlines. All rights reserved.
          </p>
          <div className="flex gap-6 text-zinc-400 text-xs">
            <Link href="/auth/login" className="hover:text-white transition-colors">
              App Login
            </Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">
              App Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
