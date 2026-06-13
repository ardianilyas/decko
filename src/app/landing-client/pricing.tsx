"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { PRICING_PLANS } from "./constants";

export function Pricing() {
  return (
    <section id="pricing" className="relative z-10 py-24 border-t border-black/5 dark:border-white/5 overflow-hidden">
      {/* Background glow blobs to showcase glassmorphism */}
      <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/[0.02] dark:bg-indigo-500/[0.04] blur-[110px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[10%] w-[45%] h-[45%] rounded-full bg-blue-500/[0.02] dark:bg-blue-500/[0.04] blur-[130px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-zinc-650 dark:text-zinc-400 text-base sm:text-lg">
            Start with free credits, top up when you need. No recurring subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch px-2 mt-12">
          {PRICING_PLANS.map((plan, index) => {
            return (
              <div
                key={index}
                className={`rounded-3xl p-8 flex flex-col justify-between text-left relative transition-all duration-300 ${
                  plan.popular
                    ? "bg-white dark:bg-[#0c0c0e] border-2 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.1),0_20px_40px_rgba(0,0,0,0.05)] scale-[1.02] z-20"
                    : "bg-white/80 dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-900/5 dark:shadow-none scale-100 z-10"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span className="text-4xl sm:text-5xl font-extrabold text-zinc-950 dark:text-white">{plan.price}</span>
                    {plan.priceSub && (
                      <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                        / {plan.priceSub}
                      </span>
                    )}
                  </div>
                  {index === 1 && (
                    <span className="inline-block text-[10px] font-semibold text-zinc-650 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-0.5 rounded mb-3">
                      $0.50 per credit
                    </span>
                  )}
                  {index === 2 && (
                    <span className="inline-block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded mb-3">
                      $0.30 per credit (Save 40% vs Starter)
                    </span>
                  )}
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 leading-relaxed">{plan.description}</p>
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 mb-8 space-y-3.5">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link
                  href={plan.actionLink}
                  className={`w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:scale-[1.01]"
                      : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors"
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
  );
}
