"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { Loader2, Zap, Coins, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import type { Presentation } from "@/server/services/generation.service";
import { MODELS } from "./constants";
import { LanguageDropdown } from "./language-dropdown";
import { ModelDropdown } from "./model-dropdown";

interface GenerationFormProps {
  onResult: (id: string, result?: Presentation) => void;
  onPendingChange?: (isPending: boolean) => void;
  topic: string;
  setTopic: (topic: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function GenerationForm({
  onResult,
  onPendingChange,
  topic,
  setTopic,
  textareaRef,
}: GenerationFormProps) {
  const utils = trpc.useUtils();
  const [selectedModel, setSelectedModel] = useState<"deepseek/deepseek-chat" | "openai/gpt-4o-mini" | "openrouter/owl-alpha">("openrouter/owl-alpha");
  const [language, setLanguage] = useState<"English" | "Bahasa Indonesia">("English");

  // Custom dropdown states
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const { data: creditsData } = trpc.generation.getCredits.useQuery();
  const generateMutation = trpc.generation.generate.useMutation({
    onSuccess: ({ id }) => {
      toast.info("Starting outline generation...");
      setTopic("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      onResult(id);
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
  }, [topic, textareaRef]);

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
            <LanguageDropdown
              language={language}
              setLanguage={setLanguage}
              isOpen={isLangOpen}
              setIsOpen={(open) => {
                setIsLangOpen(open);
                if (open) setIsModelOpen(false);
              }}
              dropdownRef={langDropdownRef}
            />

            <div className="h-4 w-px bg-border/50 mx-0.5" />

            {/* Model Dropdown Pill */}
            <ModelDropdown
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              isOpen={isModelOpen}
              setIsOpen={(open) => {
                setIsModelOpen(open);
                if (open) setIsLangOpen(false);
              }}
              dropdownRef={modelDropdownRef}
            />

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
