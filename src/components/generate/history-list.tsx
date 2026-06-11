"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import {
  Loader2,
  MessageSquare,
  Clock,
  ChevronRight,
  History,
} from "lucide-react";

function formatRelativeTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString();
}

const STATUS_STYLES = {
  completed: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

interface HistoryListProps {
  onSelect: (id: string) => void;
  activeId?: string | null;
}

export function HistoryList({ onSelect, activeId }: HistoryListProps) {
  const { data: history, isLoading } = trpc.generation.getHistory.useQuery({
    limit: 30,
    offset: 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
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
    <div className="space-y-1 px-2 py-1">
      {history.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors group ${
            activeId === item.id
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate text-foreground">
              {item.generatedJson && (item.generatedJson as any).title ? (item.generatedJson as any).title : item.topic}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                {formatRelativeTime(item.createdAt)}
              </span>
              <span
                className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${
                  STATUS_STYLES[item.status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.pending
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
          <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  );
}
