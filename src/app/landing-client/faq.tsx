"use client";

import { useState } from "react";
import { Plus, Minus, X, Check, Loader2 } from "lucide-react";
import { FAQS } from "./constants";

interface FaqProps {
  activeFaq: number | null;
  setActiveFaq: (idx: number | null) => void;
}

export function FAQ({ activeFaq, setActiveFaq }: FaqProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <section id="faq" className="relative z-10 py-24 border-t border-black/5 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col justify-between text-left h-full min-h-[320px] lg:min-h-[400px]">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
                General Questions <br />
                asked by customers.
              </h2>
            </div>
            
            <div className="space-y-6 mt-8 lg:mt-auto">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed max-w-sm font-medium">
                Our friendly team is always here to help you with quick, clear, and reliable answers whenever needed.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-semibold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Contact Sales
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7">
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
                      <span className="font-semibold text-zinc-950 dark:text-white text-lg pr-6 group-hover:text-zinc-650 dark:group-hover:text-zinc-350 transition-colors">
                        {faq.question}
                      </span>
                      <div className="shrink-0 transition-transform duration-300 relative w-6 h-6 flex items-center justify-center">
                        <Plus className={`absolute w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-all duration-300 ${isOpen ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}`} />
                        <Minus className={`absolute w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-all duration-300 ${isOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"}`} />
                      </div>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "max-h-[300px] opacity-100 pb-6"
                          : "max-h-0 opacity-0 pb-0 pointer-events-none"
                      }`}
                    >
                      <p className="text-zinc-550 dark:text-zinc-400 text-sm sm:text-base leading-relaxed pr-8">
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

      {/* Contact Sales Interactive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setIsModalOpen(false);
              setIsSubmitted(false);
              setName("");
              setEmail("");
              setMessage("");
            }}
          />

          {/* Modal Container */}
          <div className="relative bg-white dark:bg-[#0c0c0e] border border-black/10 dark:border-white/10 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setIsSubmitted(false);
                setName("");
                setEmail("");
                setMessage("");
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {isSubmitted ? (
              <div className="py-8 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-pulse">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Message Sent!</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
                  Thank you for reaching out. A sales representative will get back to you shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setTimeout(() => {
                    setIsSubmitting(false);
                    setIsSubmitted(true);
                  }, 1200);
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white">
                    Contact Sales
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Fill out the form below and we'll be in touch shortly.
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Message
                    </label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your team and presentation needs..."
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Submit Request</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
