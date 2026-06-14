"use client";

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

  const currentStepText = loadingSteps[loadingStep] || "Processing...";
  const progressPercent = Math.min(((loadingStep + 1) / loadingSteps.length) * 100, 100);

  return (
    <div className="absolute inset-0 bg-background/70 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-card/45 border border-border/60 rounded-3xl p-8 shadow-xl backdrop-blur-xl flex flex-col items-center text-center space-y-6">
        {/* Minimalist Premium Loader */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outermost breathing wave */}
          <div 
            className="absolute inset-0 rounded-full border border-primary/20 animate-ping" 
            style={{ animationDuration: "2s" }}
          />
          {/* Middle breathing wave */}
          <div 
            className="absolute inset-2 rounded-full border border-violet-500/15 animate-pulse" 
            style={{ animationDuration: "2.5s" }}
          />
          {/* Spinning gradient track */}
          <div 
            className="absolute w-14 h-14 rounded-full border-2 border-transparent border-t-primary border-r-violet-500 animate-spin" 
            style={{ animationDuration: "1s" }}
          />
          {/* Inner breathing glowing core */}
          <div 
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary via-violet-500 to-indigo-500 opacity-90 shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse"
            style={{ animationDuration: "1.8s" }}
          />
        </div>

        <div className="space-y-2.5 w-full">
          <h3 className="text-lg font-bold text-foreground">
            Generating Presentation
          </h3>
          <p 
            className="text-sm text-muted-foreground animate-pulse min-h-[20px]"
            style={{ animationDuration: "1.5s" }}
          >
            {currentStepText}
          </p>
        </div>

        {/* Smooth Progress Bar */}
        <div className="w-full bg-secondary/60 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-violet-500 to-indigo-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
          Step {loadingStep + 1} of {loadingSteps.length}
        </div>
      </div>
    </div>
  );
}
