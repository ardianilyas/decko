"use client";

import { ChevronDown, Coins } from "lucide-react";
import { MODELS } from "./constants";

interface ModelDropdownProps {
  selectedModel: "deepseek/deepseek-v4-flash" | "openai/gpt-5.5" | "openrouter/owl-alpha";
  setSelectedModel: (
    model: "deepseek/deepseek-v4-flash" | "openai/gpt-5.5" | "openrouter/owl-alpha"
  ) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export function ModelDropdown({
  selectedModel,
  setSelectedModel,
  isOpen,
  setIsOpen,
  dropdownRef,
}: ModelDropdownProps) {
  const selectedModelData = MODELS.find((m) => m.id === selectedModel)!;

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary/50 border border-border/50 text-foreground hover:bg-secondary transition-all ${
          isOpen ? "ring-1 ring-ring/30 border-border bg-secondary" : ""
        }`}
      >
        <span>{selectedModelData.icon}</span>
        <span className="hidden sm:inline">{selectedModelData.label}</span>
        {selectedModelData.cost > 0 && (
          <span className="flex items-center gap-0.5 ml-0.5 opacity-90 text-amber-600 dark:text-amber-500">
            <Coins className="w-3 h-3" />
            {selectedModelData.cost}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-64 rounded-2xl border border-border bg-popover/95 backdrop-blur-md p-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Select AI Model
          </div>
          <div className="space-y-0.5">
            {MODELS.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  setSelectedModel(model.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors text-left ${
                  selectedModel === model.id
                    ? "bg-foreground text-background font-medium"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{model.icon}</span>
                  <div>
                    <div className="font-medium">{model.label}</div>
                    <div className={`text-[10px] ${selectedModel === model.id ? "text-background/80" : "text-muted-foreground"}`}>
                      {model.description}
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
                  selectedModel === model.id
                    ? "bg-background/25 text-background"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                }`}>
                  <Coins className="w-3 h-3" />
                  {model.cost}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
