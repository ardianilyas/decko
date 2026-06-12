"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { Loader2, Sparkles, Zap, Coins, ArrowUp, ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import type { Presentation } from "@/server/services/generation.service";

const MODELS = [
  {
    id: "openrouter/owl-alpha" as const,
    label: "Owl Alpha",
    description: "1 credit · Fast",
    cost: 1,
    icon: "🦉",
  },
  {
    id: "deepseek/deepseek-chat" as const,
    label: "DeepSeek",
    description: "Fast",
    cost: 3,
    icon: "⚡",
  },
  {
    id: "openai/gpt-4o-mini" as const,
    label: "GPT-4o Mini",
    description: "High quality",
    cost: 7,
    icon: "✨",
  },
];

interface GenerationFormProps {
  onResult: (id: string, result: Presentation) => void;
  onPendingChange?: (isPending: boolean) => void;
}

export function GenerationForm({ onResult, onPendingChange }: GenerationFormProps) {
  const [topic, setTopic] = useState("");
  const [selectedModel, setSelectedModel] = useState<"deepseek/deepseek-chat" | "openai/gpt-4o-mini" | "openrouter/owl-alpha">("openrouter/owl-alpha");
  const [language, setLanguage] = useState<"English" | "Bahasa Indonesia">("English");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Custom dropdown states
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const { data: creditsData } = trpc.generation.getCredits.useQuery();
  const generateMutation = trpc.generation.generate.useMutation({
    onSuccess: ({ id, result }) => {
      toast.success("Presentation generated successfully!");
      setTopic("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      onResult(id, result);
    },
    onError: (err) => {
      toast.error(err.message || "Generation failed.");
      utils.generation.getHistory.invalidate();
    },
  });

  const selectedModelData = MODELS.find((m) => m.id === selectedModel)!;
  const hasEnoughCredits = (creditsData?.credits ?? 0) >= selectedModelData.cost;
  const topicTooShort = topic.trim().length < 3;
  const topicTooLong = topic.trim().length > 500;
  const canSubmit = !topicTooShort && !topicTooLong && hasEnoughCredits && !generateMutation.isPending;

  const handleSubmit = () => {
    if (canSubmit) {
      generateMutation.mutate({ topic: topic.trim(), model: selectedModel, language });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [topic]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelOpen(false);
      }
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    onPendingChange?.(generateMutation.isPending);
  }, [generateMutation.isPending, onPendingChange]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3 relative">
      {!hasEnoughCredits && creditsData !== undefined && (
        <div className="absolute -top-14 left-0 right-0 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive mx-auto w-fit shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <Zap className="w-3.5 h-3.5 shrink-0" />
          Insufficient credits. Need {selectedModelData.cost}, have {creditsData.credits}.
        </div>
      )}

      {/* Main Input Area */}
      <div className="relative group rounded-3xl bg-card border border-border focus-within:border-ring/50 focus-within:ring-1 focus-within:ring-ring/50 transition-all shadow-sm flex flex-col">
        <textarea
          ref={textareaRef}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to present about?"
          className="w-full bg-transparent p-4 pb-2 text-foreground placeholder:text-muted-foreground text-sm md:text-base leading-relaxed resize-none outline-none max-h-[200px]"
          rows={1}
        />
        
        {/* Inner Footer: Models, Language, Submit */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1 gap-2">
          {/* Left side: Selectors */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Language Dropdown Pill */}
            <div className="relative shrink-0" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsLangOpen(!isLangOpen);
                  setIsModelOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary/50 border border-border/50 text-foreground hover:bg-secondary transition-all ${
                  isLangOpen ? "ring-1 ring-ring/30 border-border bg-secondary" : ""
                }`}
              >
                <span>{language === "English" ? "🇬🇧 EN" : "🇮🇩 ID"}</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${isLangOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isLangOpen && (
                <div className="absolute bottom-full left-0 mb-2 z-50 w-48 rounded-2xl border border-border bg-popover/95 backdrop-blur-md p-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Language
                  </div>
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("English");
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs transition-colors text-left ${
                        language === "English"
                          ? "bg-foreground text-background font-medium"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <span className="text-sm">🇬🇧</span>
                      <div>
                        <div className="font-medium">English</div>
                        <div className={`text-[10px] ${language === "English" ? "text-background/80" : "text-muted-foreground"}`}>
                          Generate in English
                        </div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("Bahasa Indonesia");
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs transition-colors text-left ${
                        language === "Bahasa Indonesia"
                          ? "bg-foreground text-background font-medium"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <span className="text-sm">🇮🇩</span>
                      <div>
                        <div className="font-medium">Bahasa Indonesia</div>
                        <div className={`text-[10px] ${language === "Bahasa Indonesia" ? "text-background/80" : "text-muted-foreground"}`}>
                          Hasilkan dalam Bahasa
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-border/50 mx-0.5" />

            {/* Model Dropdown Pill */}
            <div className="relative shrink-0" ref={modelDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsModelOpen(!isModelOpen);
                  setIsLangOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary/50 border border-border/50 text-foreground hover:bg-secondary transition-all ${
                  isModelOpen ? "ring-1 ring-ring/30 border-border bg-secondary" : ""
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
                <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${isModelOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isModelOpen && (
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
                          setIsModelOpen(false);
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

            <div className="h-4 w-px bg-border/50 mx-0.5" />

            {/* Credit Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-500 shrink-0 transition-colors hover:bg-amber-500/20">
              <Coins className="w-3.5 h-3.5" />
              <span>
                {creditsData !== undefined ? creditsData.credits : "..."} <span className="hidden sm:inline">credits</span>
              </span>
            </div>
          </div>

          {/* Right side: Button */}
          <div className="flex items-center gap-3 shrink-0">
            {topic.length > 0 && (
              <span className={`text-xs ${topicTooLong ? "text-destructive" : "text-muted-foreground"}`}>
                {topic.length}/500
              </span>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="p-2 rounded-xl bg-foreground text-background transition-all hover:opacity-90 disabled:opacity-40 disabled:hover:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
