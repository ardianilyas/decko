import { Sparkles, Shield, Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#fafcf7] dark:bg-[#030303] text-zinc-900 dark:text-white transition-colors duration-300">
      {/* Left Promotional Section (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 text-white flex-col justify-between p-12 relative overflow-hidden border-r border-black/5 dark:border-white/5">
        {/* Abstract background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none z-0" />
        
        <div className="relative z-10 flex items-center gap-2 font-bold text-2xl tracking-tight">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-400/10">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span>Decko</span>
        </div>

        <div className="relative z-10 max-w-lg mb-8">
          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
            Elevate Your <br />
            Presentation Outlines
          </h1>
          <p className="text-zinc-400 text-base mb-8 leading-relaxed">
            Draft structured, professional presentation slide decks tailored to your topic and audience in seconds. Powered by DeepSeek & GPT-4o models.
          </p>
          <div className="flex flex-col gap-4 text-sm font-medium text-zinc-300">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400" /> Fast & intelligent outline generation
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-400" /> Multi-model support with free revision cycles
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#fafcf7] dark:bg-[#030303] transition-colors duration-300">
        <div className="w-full max-w-[420px] mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
