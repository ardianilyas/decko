"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Sparkles,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Check,
  ArrowUpRight,
  Zap,
  Activity,
  History,
  FileText,
  Plus,
  Minus,
} from "lucide-react";

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);

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
  const [sliderCredits, setSliderCredits] = useState(15);
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
            }}
          />
        ))}
      </div>

      {/* Ambient Glow Rings */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/[0.04] dark:bg-blue-500/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-500/[0.04] dark:bg-purple-500/10 blur-[130px] pointer-events-none z-0" />

      {/* Floating Navbar Container */}
      <div className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pointer-events-none pt-4">
        <header className="max-w-5xl mx-auto h-14 rounded-full border border-black/[0.06] dark:border-white/[0.06] bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-black/20 flex items-center justify-between px-6 pointer-events-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-lg font-extrabold tracking-tight text-zinc-950 dark:text-white group-hover:opacity-80 transition-opacity bg-gradient-to-r from-zinc-950 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
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
          <div className="fixed inset-x-4 top-20 z-40 bg-white/95 dark:bg-[#0c0c0f]/95 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-6 flex flex-col gap-5 md:hidden animate-in fade-in slide-in-from-top-5 duration-200 shadow-xl shadow-black/10 dark:shadow-black/50 pointer-events-auto">
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

      {/* Hero Section */}
      <section id="hero" className="relative z-10 pt-16 pb-24 md:pt-24 md:pb-36 flex flex-col items-center text-center px-4 max-w-7xl mx-auto">
        {/* Release Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/20 dark:border-amber-400/20 bg-amber-500/5 dark:bg-amber-400/5 text-amber-700 dark:text-amber-200 text-xs font-medium mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Presentation Planner</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-zinc-950 dark:text-white max-w-4xl leading-[1.08] mb-6">
          Elevate Your <br />
          <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 dark:from-amber-200 dark:via-amber-400 dark:to-amber-200 bg-clip-text text-transparent">
            Presentation Outlines
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          Draft structured, professional presentation slide decks tailored to your topic and audience in seconds. Powered by DeepSeek & GPT-4o models.
        </p>

        {/* Call to Action Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20 z-20">
          <Link
            href={isLoggedIn ? "/chat" : "/auth/signup"}
            className="group px-8 py-4 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-black font-semibold text-base flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/5 dark:shadow-white/5 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{isLoggedIn ? "Go to Workspace" : "Get Started for Free"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => scrollToSection("pricing")}
            className="px-8 py-4 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-800 dark:text-white font-medium text-base transition-all cursor-pointer"
          >
            View Pricing
          </button>
        </div>

        {/* visual interactive metallic orb container */}
        <div className="w-full max-w-4xl relative mt-4 select-none">
          {/* Back glows */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[75%] rounded-full bg-radial from-amber-500/[0.04] dark:from-amber-500/10 via-transparent to-transparent blur-[80px] z-0 pointer-events-none" />

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
                  <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-full mb-2" />
                <div className="w-5/6 h-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-full mb-2" />
                <div className="w-4/6 h-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-full mb-6" />
                
                <div className="flex gap-2 mt-auto">
                  <div className="w-1/2 h-16 sm:h-20 bg-amber-500/5 dark:bg-amber-500/10 rounded-lg border border-amber-500/10 dark:border-amber-500/20" />
                  <div className="w-1/2 h-16 sm:h-20 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg border border-zinc-100 dark:border-zinc-700/50" />
                </div>
              </div>
            </div>

            {/* Overlapping Glassmorphic Card 1 (Left) */}
            <div className="absolute left-[-20px] top-[45%] sm:left-[5%] md:left-[-40px] z-20 glass-card-premium rounded-2xl p-5 w-[160px] sm:w-[220px] text-left">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Model Choice
                </span>
                <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                </div>
              </div>
              <h4 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-white mb-1">
                DeepSeek & GPT-4o
              </h4>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                Optimized configurations starting from 1 credit
              </p>
            </div>

            {/* Overlapping Glassmorphic Card 2 (Right) */}
            <div className="absolute right-[-20px] top-[60%] sm:right-[5%] md:right-[-40px] z-20 glass-card-premium rounded-2xl p-5 w-[160px] sm:w-[220px] text-left">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Revision Cost
                </span>
                <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                </div>
              </div>
              <h4 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-white mb-1">
                0 Credits
              </h4>
              <div className="w-full bg-zinc-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-1.5 mt-2">
                <div className="bg-amber-500 h-full w-[100%] rounded-full" />
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                Free adjustments per outline (up to 3 times)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
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

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 border-t border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-zinc-650 dark:text-zinc-400 text-base sm:text-lg">
              Start with free credits, top up when you need. No recurring subscriptions.
            </p>
          </div>

          {/* Credit Estimator Slider widget */}
          <div className="max-w-xl mx-auto mb-16 p-6 rounded-2xl bg-white/40 dark:bg-[#0c0c0e]/45 border border-zinc-200/50 dark:border-zinc-800/80 backdrop-blur-md text-center shadow-lg shadow-zinc-100/10 dark:shadow-none">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Credit Needs Estimator
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Drag the slider to calculate your estimated outline runs and see which plan fits you best!
            </p>
            
            <div className="flex justify-between items-center mb-2 px-1 text-xs font-semibold text-zinc-700 dark:text-zinc-305">
              <span>2 Credits (Trial)</span>
              <span className="text-amber-500 dark:text-amber-400 text-sm font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                {sliderCredits} Credits
              </span>
              <span>100 Credits</span>
            </div>

            <input
              type="range"
              min="2"
              max="100"
              value={sliderCredits}
              onChange={(e) => setSliderCredits(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-6"
            />

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] border-t border-black/[0.06] dark:border-white/5 pt-4">
              <div>
                <span className="block text-zinc-500 dark:text-zinc-400">Owl Alpha (1 cr.)</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{Math.floor(sliderCredits / 1)} runs</span>
              </div>
              <div className="border-x border-black/[0.06] dark:border-white/5">
                <span className="block text-zinc-500 dark:text-zinc-400">DeepSeek (3 cr.)</span>
                <span className="font-bold text-zinc-855 dark:text-zinc-200">{Math.floor(sliderCredits / 3)} runs</span>
              </div>
              <div>
                <span className="block text-zinc-500 dark:text-zinc-400">GPT-4o Mini (7 cr.)</span>
                <span className="font-bold text-zinc-855 dark:text-zinc-200">{Math.floor(sliderCredits / 7)} runs</span>
              </div>
            </div>

            <div className="mt-5 text-xs font-medium text-zinc-800 dark:text-zinc-305">
              Recommended:{" "}
              {sliderCredits <= 2 ? (
                <span className="text-zinc-500 font-bold dark:text-zinc-400">Free Trial ($0)</span>
              ) : sliderCredits <= 10 ? (
                <span className="text-zinc-950 dark:text-white font-bold bg-zinc-150 dark:bg-zinc-850 px-2 py-1 rounded">
                  Starter Pack ($5)
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-extrabold bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 dark:border-amber-400/20 px-2 py-1 rounded">
                  Pro Pack ($15) — Save 40% per credit!
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch px-2">
            {PRICING_PLANS.map((plan, index) => {
              const isRecommended =
                (sliderCredits <= 2 && index === 0) ||
                (sliderCredits > 2 && sliderCredits <= 10 && index === 1) ||
                (sliderCredits > 10 && index === 2);

              return (
                <div
                  key={index}
                  className={`glass-card-premium rounded-3xl p-8 flex flex-col justify-between text-left relative transition-all duration-300 ${
                    isRecommended
                      ? "ring-2 ring-amber-500 dark:ring-amber-400 scale-[1.03] z-20 shadow-xl shadow-amber-500/[0.04] dark:shadow-none"
                      : "opacity-75 hover:opacity-100 scale-[0.98] z-10"
                  } ${
                    plan.popular ? "border-amber-500/20 dark:border-amber-400/30 bg-white/40 dark:bg-[#0c0c0e]/85" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-300 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1.5 mb-4">
                      <span className="text-4xl sm:text-5xl font-extrabold text-zinc-950 dark:text-white">{plan.price}</span>
                      {plan.priceSub && (
                        <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                          / {plan.priceSub}
                        </span>
                      )}
                    </div>
                    {index === 1 && (
                      <span className="inline-block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded mb-3">
                        $0.50 per credit
                      </span>
                    )}
                    {index === 2 && (
                      <span className="inline-block text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/10 dark:border-amber-400/10 px-2 py-0.5 rounded mb-3">
                        $0.30 per credit (Save 40% vs Starter)
                      </span>
                    )}
                    <p className="text-zinc-650 dark:text-zinc-400 text-sm mb-6">{plan.description}</p>
                    <div className="border-t border-black/[0.06] dark:border-white/5 pt-6 mb-8 space-y-3.5">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                          <span className="text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Link
                    href={plan.actionLink}
                    className={`w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      plan.popular || isRecommended
                        ? "bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/10 hover:scale-[1.01]"
                        : "bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white border border-black/[0.05] dark:border-white/10 hover:border-black/10 dark:hover:border-white/20"
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-24 border-t border-black/[0.05] dark:border-white/[0.05] bg-zinc-50/10 dark:bg-[#050507]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Left Column */}
            <div className="lg:col-span-5 flex flex-col items-start text-left">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white mb-6 leading-[1.15]">
                General Questions <br />
                asked by customers.
              </h2>
              <p className="text-zinc-650 dark:text-zinc-400 text-base mb-8 max-w-sm leading-relaxed">
                Our friendly team is always here to help you with quick, clear, and reliable answers whenever needed.
              </p>
              <a
                href="mailto:support@decko.com"
                className="px-6 py-3 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-md shadow-zinc-950/10 dark:shadow-white/5"
              >
                Contact Support
              </a>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7 space-y-4">
              {FAQS.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div
                    key={index}
                    className="bg-white/70 dark:bg-[#0c0c0e]/70 backdrop-blur-sm rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)] dark:shadow-none overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none cursor-pointer"
                    >
                      <span className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base pr-6 leading-snug">
                        {faq.question}
                      </span>
                      <div className="w-7 h-7 rounded-full border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center shrink-0 transition-colors duration-300 bg-white/50 dark:bg-black/20">
                        {isOpen ? (
                          <Minus className="w-3.5 h-3.5 text-zinc-850 dark:text-zinc-200" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-zinc-550 dark:text-zinc-400" />
                        )}
                      </div>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "max-h-[300px] border-t border-zinc-100 dark:border-zinc-900"
                          : "max-h-0 pointer-events-none"
                      }`}
                    >
                      <p className="p-6 text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/5 dark:border-white/5 py-12 bg-zinc-50/50 dark:bg-[#020202]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-black" />
            </div>
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
