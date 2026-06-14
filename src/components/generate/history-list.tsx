"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import {
  Loader2,
  MessageSquare,
  History,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HistoryListProps {
  onSelect: (id: string) => void;
  activeId?: string | null;
}

export function HistoryList({ onSelect, activeId }: HistoryListProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: history, isLoading } = trpc.generation.getHistory.useQuery(
    { limit: 50 },
    {
      refetchInterval: (query) =>
        query.state.data?.some((item) => item.status === "pending") ? 3000 : false,
    }
  );

  const deleteMutation = trpc.generation.delete.useMutation({
    onSuccess: () => {
      toast.success("Chat deleted successfully");
      utils.generation.getHistory.invalidate();
      if (activeId === deleteId) {
        router.push("/chat");
      }
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete chat");
      setDeleteId(null);
    },
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-1 px-2 py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-secondary/35 border border-border/10 animate-pulse"
            style={{ opacity: 1 - i * 0.12 }}
          >
            <div className="w-3.5 h-3.5 rounded bg-muted-foreground/25 shrink-0" />
            <div className="h-3 bg-muted-foreground/20 rounded w-[70%]" />
          </div>
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-center">
        <History className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No generations yet</p>
        <p className="text-xs text-muted-foreground/60">
          Generate your first presentation to see it here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0.5 px-2 py-1">
        {history.map((item) => {
          const title =
            item.generatedJson && (item.generatedJson as any).title
              ? (item.generatedJson as any).title
              : item.topic;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onSelect(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                  activeId === item.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                {item.status === "pending" ? (
                  <Loader2 className="w-3.5 h-3.5 shrink-0 text-primary animate-spin" />
                ) : (
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                )}
                <span className={`text-xs font-medium truncate pr-6 ${
                  item.status === "pending"
                    ? "text-primary/80 animate-pulse"
                    : activeId === item.id
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                }`}>
                  {title}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(item.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                title="Delete chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Presentation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this presentation and all of its revisions. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2
                  className="w-4 h-4"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
