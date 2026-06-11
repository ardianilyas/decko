"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { Loader2, Sparkles, Zap, Coins, Send } from "lucide-react";
import { toast } from "sonner";
import type { Presentation } from "@/server/services/generation.service";

const MODELS = [
  {
    id: "openrouter/owl-alpha" as const,
    label: "Owl Alpha (Testing)",
    description: "Free",
    cost: 0,
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
}

export function GenerationForm({ onResult }: GenerationFormProps) {
  const [topic, setTopic] = useState("");
  const [selectedModel, setSelectedModel] = useState<"deepseek/deepseek-chat" | "openai/gpt-4o-mini" | "openrouter/owl-alpha">("openrouter/owl-alpha");
  const [language, setLanguage] = useState<"English" | "Bahasa Indonesia">("English");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3 relative">
      {!hasEnoughCredits && creditsData !== undefined && (
        <div className="absolute -top-12 left-0 right-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive mx-auto w-fit shadow-sm backdrop-blur-sm">
          <Zap className="w-3.5 h-3.5 shrink-0" />
          Insufficient credits. Need {selectedModelData.cost}, have {creditsData.credits}.
        </div>
      )}

      {/* Main Input Area */}
      <div className="relative group rounded-2xl bg-card border border-border focus-within:border-ring/50 focus-within:ring-1 focus-within:ring-ring/50 transition-all shadow-sm">
        <textarea
          ref={textareaRef}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to present about?"
          className="w-full bg-transparent p-4 pr-12 text-foreground placeholder:text-muted-foreground text-sm leading-relaxed resize-none outline-none max-h-[200px]"
          rows={1}
        />
        
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="absolute right-3 bottom-3 p-2 rounded-xl bg-foreground text-background transition-all hover:opacity-90 disabled:opacity-40 disabled:hover:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {generateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Footer / Model Selection Pills */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                selectedModel === model.id
                  ? "bg-secondary border-foreground/20 text-foreground"
                  : "bg-transparent border-transparent text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <span>{model.icon}</span>
              <span>{model.label}</span>
              {model.cost > 0 && (
                <span className="flex items-center gap-0.5 ml-0.5 opacity-80">
                  <Coins className="w-3 h-3" />
                  {model.cost}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 pl-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent border border-border/50 text-foreground rounded-lg px-2 py-1 outline-none appearance-none cursor-pointer hover:bg-secondary/50 transition-colors"
          >
            <option value="English">🇬🇧 EN</option>
            <option value="Bahasa Indonesia">🇮🇩 ID</option>
          </select>
          {topic.length > 0 && (
            <span className={topicTooLong ? "text-destructive" : ""}>
              {topic.length}/500
            </span>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/50 border border-border/50">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-medium text-foreground">
              {creditsData !== undefined ? creditsData.credits : "..."}
            </span>
          </div>
        </div>
      </div>
      
      {generateMutation.isPending && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs font-medium text-muted-foreground animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          Crafting presentation structure...
        </div>
      )}
    </div>
  );
}
