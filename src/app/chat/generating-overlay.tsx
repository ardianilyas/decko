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
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Outer pulsing ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" 
            style={{ animationDuration: "1.5s" }}
          />
          {/* Spinning gradient arc */}
          <div 
            className="w-12 h-12 rounded-full border-3 border-transparent border-t-primary border-r-violet-500 animate-spin" 
            style={{ animationDuration: "0.8s" }}
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
