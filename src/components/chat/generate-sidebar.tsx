"use client";

import { Sparkles, Search, PanelLeft, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { HistoryList } from "@/components/generate/history-list";

const SearchCommand = dynamic(
  () => import("@/components/generate/search-command").then((mod) => mod.SearchCommand),
  { ssr: false }
);

const UserMenu = dynamic(
  () => import("./user-menu").then((mod) => mod.UserMenu),
  {
    ssr: false,
    loading: () => (
      <div className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-left bg-secondary/35 border border-border/10 animate-pulse">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="h-3.5 bg-muted-foreground/25 rounded w-20" />
          <div className="h-3 bg-muted-foreground/15 rounded w-32" />
        </div>
        <div className="w-4 h-4 bg-muted-foreground/20 rounded shrink-0" />
      </div>
    ),
  }
);

interface GenerateSidebarProps {
  user: { name: string; email: string };
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  displayId: string | null;
  handleNewGeneration: () => void;
  handleHistorySelect: (id: string) => void;
}

export function GenerateSidebar({
  user,
  sidebarOpen,
  setSidebarOpen,
  searchOpen,
  setSearchOpen,
  displayId,
  handleNewGeneration,
  handleHistorySelect,
}: GenerateSidebarProps) {
  if (!sidebarOpen) return null;

  return (
    <div className="absolute md:relative z-50 h-full w-[260px] shrink-0 border-r border-border bg-card flex flex-col animate-in slide-in-from-left duration-200">
      <div className="p-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Decko</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Search presentations (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Close sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SearchCommand
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={(id) => {
          handleHistorySelect(id);
          setSearchOpen(false);
        }}
      />

      <div className="p-2">
        <button
          onClick={handleNewGeneration}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Presentation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            History
          </span>
        </div>
        <HistoryList onSelect={handleHistorySelect} activeId={displayId} />
      </div>

      <div className="p-3 border-t border-border bg-card">
        <UserMenu user={user} />
      </div>
    </div>
  );
}
