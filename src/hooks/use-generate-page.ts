import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import type { Presentation } from "@/server/services/generation.service";
import { LOADING_STEPS } from "@/components/chat/constants";

export function useGeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const displayId = searchParams.get("id");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  const [topic, setTopic] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [greeting, setGreeting] = useState("Hello");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [pendingGenerationId, setPendingGenerationId] = useState<string | null>(null);

  // Time-of-day greeting calculation
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Cmd+K / Ctrl+K keyboard shortcut to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const utils = trpc.useUtils();

  const { data: historyItem, isLoading: historyLoading } = trpc.generation.getGeneration.useQuery(
    { id: displayId! },
    { 
      enabled: !!displayId,
      refetchInterval: (query) => query.state.data?.status === "pending" ? 3000 : false
    }
  );

  // Reset pendingGenerationId when the loaded generation is completed
  useEffect(() => {
    if (historyItem && historyItem.status !== "pending") {
      setPendingGenerationId(null);
    }
  }, [historyItem?.status]);

  // Cycle loadingStep for new generations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const isPending = isGenerating || (historyItem?.status === "pending" && !historyItem?.generatedJson);
    if (isPending) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1 < LOADING_STEPS.length ? prev + 1 : prev));
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, historyItem?.status, !!historyItem?.generatedJson]);

  const handleNewGeneration = () => {
    setPendingGenerationId(null);
    router.push("/chat");
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleResult = (id: string, _result?: Presentation) => {
    setPendingGenerationId(id);
    router.push(`/chat?id=${id}`);
    utils.generation.getHistory.invalidate();
    utils.generation.getCredits.invalidate();
  };

  const handleHistorySelect = (id: string) => {
    setPendingGenerationId(null);
    router.push(`/chat?id=${id}`);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const displayResult = (historyItem?.generatedJson as Presentation | undefined) ?? null;
  const showResult = !!displayId && !!displayResult;
  const isGeneratingOverlayVisible = 
    isGenerating || 
    (displayId === pendingGenerationId && historyLoading) ||
    (displayId && historyItem?.status === "pending" && !historyItem?.generatedJson);

  return {
    displayId,
    sidebarOpen,
    setSidebarOpen,
    searchOpen,
    setSearchOpen,
    topic,
    setTopic,
    textareaRef,
    greeting,
    isGenerating,
    setIsGenerating,
    loadingStep,
    pendingGenerationId,
    historyItem,
    historyLoading,
    displayResult,
    showResult,
    isGeneratingOverlayVisible,
    handleNewGeneration,
    handleResult,
    handleHistorySelect,
  };
}
