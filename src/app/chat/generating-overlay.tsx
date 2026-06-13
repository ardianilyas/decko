"use client";

import { Sparkles, CheckCircle2, Circle } from "lucide-react";

interface GeneratingOverlayProps {
  isVisible: boolean;
  loadingStep: number;
  loadingSteps: string[];
}

export function GeneratingOverlay({
  isVisible,
  loadingStep,
  loadingSteps,
}: GeneratingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />

      {/* Glowing Center Orb Animation */}
      <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
        {/* Pulsing Aura */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary/20 via-violet-500/10 to-amber-500/20 blur-xl animate-pulse duration-3000" />
        
        {/* Outer Concentric Dash Ring (Spinning Counter-clockwise) */}
        <div 
          className="absolute w-36 h-36 border border-dashed border-primary/20 rounded-full" 
          style={{ animation: "spin 16s linear infinite reverse" }}
        />
        
        {/* Inner Concentric Dash Ring (Spinning Clockwise) */}
        <div 
          className="absolute w-28 h-28 border border-dashed border-violet-500/30 rounded-full" 
          style={{ animation: "spin 10s linear infinite" }}
        />

        {/* Glowing morphing gradient core */}
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-primary via-violet-500 to-amber-400 p-0.5 shadow-[0_0_40px_rgba(var(--primary),0.3)] animate-pulse duration-2000">
          <div className="w-full h-full rounded-full bg-background/90 flex items-center justify-center backdrop-blur-2xl">
            <Sparkles className="w-6 h-6 text-foreground animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stepper Checklist */}
      <div className="text-center max-w-sm w-full space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent animate-pulse">
            Crafting Outline
          </h2>
          <p className="text-xs text-muted-foreground">
            Analyzing topic and generating custom slides
          </p>
        </div>

        <div className="bg-card/50 border border-border/50 rounded-2xl p-5 shadow-sm space-y-3.5 text-left backdrop-blur-md">
          {loadingSteps.map((step, idx) => {
            const isCompleted = idx < loadingStep;
            const isActive = idx === loadingStep;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 transition-all duration-500 ease-out ${
                  isCompleted
                    ? "opacity-45 scale-98"
                    : isActive
                      ? "opacity-100 scale-102 bg-primary/10 border border-primary/20 -mx-2.5 px-2.5 py-1.5 rounded-xl shadow-[0_0_15px_rgba(var(--primary),0.05)]"
                      : "opacity-25 scale-95"
                }`}
              >
                <div className="flex items-center justify-center w-5 h-5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in zoom-in duration-300" />
                  ) : isActive ? (
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-4 h-4 bg-primary/20 rounded-full animate-ping duration-1000" />
                      <span className="relative w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </div>
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-muted-foreground/60" />
                  )}
                </div>
                <span
                  className={`text-xs transition-colors duration-500 ${
                    isCompleted
                      ? "text-muted-foreground line-through font-medium"
                      : isActive
                        ? "text-primary font-bold"
                        : "text-muted-foreground/50 font-medium"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
