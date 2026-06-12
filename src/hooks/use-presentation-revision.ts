import { useState, useRef, useEffect } from "react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import type { Presentation } from "@/server/services/generation.service";

export const MAX_REVISIONS = 3;

interface UsePresentationRevisionOptions {
  generationId: string;
  onRevisionSuccess: (revised: Presentation) => void;
  refetch: () => void;
  revisionsUsed: number;
}

export function usePresentationRevision({
  generationId,
  onRevisionSuccess,
  refetch,
  revisionsUsed,
}: UsePresentationRevisionOptions) {
  const [revisionInput, setRevisionInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const revisionEndRef = useRef<HTMLDivElement>(null);

  const revisionsLeft = Math.max(0, MAX_REVISIONS - revisionsUsed);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [revisionInput]);

  const reviseMutation = trpc.generation.revise.useMutation({
    onSuccess: ({ result: revised, affectedSummary, revisionsLeft: left }) => {
      onRevisionSuccess(revised);
      setRevisionInput("");
      
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      refetch();

      toast.success(
        `✓ Revised: ${affectedSummary}${left > 0 ? ` — ${left} revision${left !== 1 ? "s" : ""} left` : " — no revisions left"}`,
        { duration: 4000 }
      );

      // Scroll to see the revision history
      setTimeout(() => revisionEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 300);
    },
    onError: (err) => {
      toast.error(err.message || "Revision failed. Please try again.");
    },
  });

  const handleRevise = () => {
    const trimmed = revisionInput.trim();
    if (trimmed.length < 3 || reviseMutation.isPending || revisionsLeft === 0) return;
    reviseMutation.mutate({ generationId, prompt: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRevise();
    }
  };

  return {
    revisionInput,
    setRevisionInput,
    textareaRef,
    revisionEndRef,
    revisionsLeft,
    reviseMutation,
    handleRevise,
    handleKeyDown,
  };
}
