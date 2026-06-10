"use client";

import { useState } from "react";
import { ConversationList } from "./conversation-list";
import { MessageArea } from "./message-area";
import { trpc } from "@/trpc/client";
import { 
  Share2, 
  HelpCircle, 
  ChevronDown, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  MonitorUp, 
  Zap, 
  ArrowUp,
  MessageSquare,
  Sparkles,
  Code,
  PanelLeftOpen,
  Loader2
} from "lucide-react";

interface ChatLayoutProps {
  userEmail?: string;
  userId?: string;
  userName?: string | null;
  initialConversationId?: string;
}

export function ChatLayout({ userEmail, userId, userName, initialConversationId }: ChatLayoutProps) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId || null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [emptyInput, setEmptyInput] = useState("");
  const [initialPrompt, setInitialPrompt] = useState("");

  const createConv = trpc.chat.createConversation.useMutation();

  const handleEmptySubmit = async () => {
    if (!emptyInput.trim() || createConv.isPending) return;
    setInitialPrompt(emptyInput);
    const newConv = await createConv.mutateAsync();
    setActiveConversationId(newConv.id);
    window.history.pushState({}, '', `/chat/${newConv.id}`);
    setEmptyInput("");
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-[#171717] text-[#e0e0e0] font-sans relative">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="absolute inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="absolute md:relative z-50 h-full w-[280px] shrink-0 border-r border-[#2a2a2a] bg-[#1c1c1c] transition-all">
          <ConversationList 
            activeId={activeConversationId} 
            onSelect={(id) => {
              setActiveConversationId(id);
              if (window.innerWidth < 768) setSidebarOpen(false);
            }} 
            onToggleSidebar={() => setSidebarOpen(false)}
            userEmail={userEmail}
          />
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-transparent shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="text-[#a0a0a0] hover:text-white transition-colors"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col">
              <button className="flex items-center gap-1.5 text-lg font-semibold text-white">
                Decko <ChevronDown className="w-4 h-4 text-[#808080]" />
              </button>
              <span className="text-xs text-[#808080] text-left">Free Plan</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-[#222222] hover:bg-[#2a2a2a] border border-[#333333] rounded-full text-sm font-medium transition-colors">
              <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Share</span>
            </button>
            <button className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-[#222222] hover:bg-[#2a2a2a] border border-[#333333] rounded-full text-sm font-medium transition-colors">
              <HelpCircle className="w-4 h-4" /> <span className="hidden sm:inline">Help</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeConversationId ? (
            <MessageArea 
              conversationId={activeConversationId} 
              userId={userId} 
              initialPrompt={initialPrompt}
              clearPrompt={() => setInitialPrompt("")}
            />
          ) : (
            <div className="flex flex-col items-center max-w-3xl mx-auto px-4 pt-12 pb-24 h-full">
              {/* Upgrade Pill */}
              <div className="mb-8 flex items-center gap-1.5 px-3 py-1 bg-[#222222] border border-[#333333] rounded-full text-xs text-[#a0a0a0]">
                Using limited free plan <span className="text-white font-medium cursor-pointer hover:underline">Upgrade.</span>
              </div>

              {/* Greeting */}
              <h1 className="text-2xl sm:text-3xl text-white font-semibold mb-2 flex items-center gap-2">
                Welcome back, {userName || userEmail?.split("@")[0] || "there"} <span className="text-2xl sm:text-3xl">👋</span>
              </h1>
              <p className="text-sm text-[#808080] mb-12">
                Chat with Decko and turn your ideas into reality with ease
              </p>

              {/* Central Input Box */}
              <div className="w-full bg-[#1e1e1e] border border-[#333333] rounded-2xl p-4 mb-4 relative shadow-lg">
                <div className="flex items-start gap-3 mb-8">
                  <LinkIcon className="w-5 h-5 text-[#808080] shrink-0 mt-0.5" />
                  <textarea 
                    value={emptyInput}
                    onChange={(e) => setEmptyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleEmptySubmit();
                      }
                    }}
                    disabled={createConv.isPending}
                    className="w-full bg-transparent border-none outline-none text-[#e0e0e0] placeholder:text-[#666666] resize-none h-12 text-lg disabled:opacity-50"
                    placeholder="How can Decko help you today?"
                  />
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  <button className="text-[#808080] hover:text-[#e0e0e0] transition-colors"><ImageIcon className="w-5 h-5" /></button>
                  <button className="text-[#808080] hover:text-[#e0e0e0] transition-colors"><MonitorUp className="w-5 h-5" /></button>
                  <button className="text-[#808080] hover:text-[#e0e0e0] transition-colors"><Zap className="w-5 h-5" /></button>
                </div>

                <div className="flex justify-between items-center">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] rounded-lg text-xs font-medium text-[#e0e0e0] hover:bg-[#333333] transition-colors">
                    version 3.0 <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  
                  <button 
                    onClick={handleEmptySubmit}
                    disabled={!emptyInput.trim() || createConv.isPending}
                    className="w-8 h-8 bg-[#333333] hover:bg-[#444444] rounded-full flex items-center justify-center text-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createConv.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-16 text-center text-[10px] text-[#666666]">
                Decko may display inaccurate info, so please double check the response
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
