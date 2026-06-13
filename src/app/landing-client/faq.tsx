"use client";

import { Plus, Minus } from "lucide-react";
import { FAQS } from "./constants";

interface FaqProps {
  activeFaq: number | null;
  setActiveFaq: (idx: number | null) => void;
}

export function FAQ({ activeFaq, setActiveFaq }: FaqProps) {
  return (
    <section id="faq" className="relative z-10 py-24 border-t border-black/5 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left Column */}
          <div className="lg:col-span-4 flex flex-col items-start text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white mb-4 leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
              Everything you need to know about the product and billing. Can't find the answer you're looking for?{" "}
              <a href="mailto:support@decko.com" className="text-zinc-900 dark:text-zinc-100 font-medium underline underline-offset-4 hover:opacity-80">
                Contact support
              </a>.
            </p>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8">
            <div className="space-y-0 border-t border-black/[0.08] dark:border-white/[0.08]">
              {FAQS.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div
                    key={index}
                    className="border-b border-black/[0.08] dark:border-white/[0.08] overflow-hidden"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between py-6 text-left focus:outline-none cursor-pointer group"
                    >
                      <span className="font-bold text-zinc-950 dark:text-white text-lg pr-6 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                        {faq.question}
                      </span>
                      <div className="shrink-0 transition-transform duration-300 relative w-6 h-6 flex items-center justify-center">
                        <Plus className={`absolute w-6 h-6 text-zinc-500 transition-all duration-300 ${isOpen ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}`} />
                        <Minus className={`absolute w-6 h-6 text-zinc-500 transition-all duration-300 ${isOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"}`} />
                      </div>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "max-h-[300px] opacity-100 pb-6"
                          : "max-h-0 opacity-0 pb-0 pointer-events-none"
                      }`}
                    >
                      <p className="text-zinc-700 dark:text-zinc-300 text-base font-medium leading-relaxed pr-8">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
