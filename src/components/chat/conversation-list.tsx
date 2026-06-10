"use client";

import { trpc } from "@/trpc/client";
import { 
  Loader2, 
  PanelLeft, 
  Search, 
  Plus, 
  MessageSquare, 
  ChevronDown, 
  Diamond, 
  HelpCircle, 
  Clock, 
  Settings 
} from "lucide-react";

interface ConversationListProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onToggleSidebar?: () => void;
  userEmail?: string;
}

export function ConversationList({ activeId, onSelect, onToggleSidebar, userEmail }: ConversationListProps) {
  const { data: conversations, isLoading, refetch } = trpc.chat.getConversations.useQuery();
  const createConv = trpc.chat.createConversation.useMutation({
    onSuccess: (data) => {
      refetch();
      onSelect(data.id);
    }
  });

  return (
    <div className="flex flex-col h-full bg-[#1c1c1c] text-[#e0e0e0] font-sans">
      {/* Top Header */}
      <div className="p-4 flex items-center justify-between">
        <button onClick={onToggleSidebar} className="p-1 text-[#a0a0a0] hover:text-white transition-colors">
          <PanelLeft className="w-5 h-5" />
        </button>
        <button className="p-1 text-[#a0a0a0] hover:text-white transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mb-6">
        <button 
          onClick={() => createConv.mutate()}
          disabled={createConv.isPending}
          className="w-full flex items-center justify-between bg-[#2a2a2a] hover:bg-[#333333] text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors border border-[#333333]"
        >
          <div className="flex items-center gap-2">
            {createConv.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            New Chat
          </div>
          <span className="text-xs text-[#808080] font-mono bg-[#1c1c1c] px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <span>⌥</span> N
          </span>
        </button>
      </div>

      {/* Recent Chats */}
      <div className="px-4 mb-2">
        <h3 className="text-xs font-semibold text-[#808080] mb-3">Recent</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-[#808080]" />
          </div>
        ) : conversations?.length === 0 ? (
          <div className="text-center p-4 text-xs text-[#808080]">
            No chats yet.
          </div>
        ) : (
          <>
            {conversations?.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full text-left px-2 py-2 rounded-md flex items-center gap-3 transition-colors ${
                  activeId === conv.id 
                    ? "bg-[#2a2a2a] text-white" 
                    : "text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-white"
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <div className="font-medium text-sm truncate">
                  {conv.name || "New Conversation"}
                </div>
              </button>
            ))}
            <button className="w-full text-left px-2 py-2 rounded-md flex items-center gap-3 text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-white transition-colors">
              <ChevronDown className="w-4 h-4 shrink-0" />
              <div className="font-medium text-sm">Show more</div>
            </button>
          </>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 space-y-0.5 border-t border-[#2a2a2a] mt-auto">
        <button className="w-full text-left px-2 py-2 rounded-md flex items-center gap-3 text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-white transition-colors text-sm font-medium">
          <Diamond className="w-4 h-4" /> Gem Manager
        </button>
        <button className="w-full text-left px-2 py-2 rounded-md flex items-center gap-3 text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-white transition-colors text-sm font-medium">
          <HelpCircle className="w-4 h-4" /> Help
        </button>
        <button className="w-full text-left px-2 py-2 rounded-md flex items-center gap-3 text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-white transition-colors text-sm font-medium">
          <Clock className="w-4 h-4" /> Activity
        </button>
        <button className="w-full text-left px-2 py-2 rounded-md flex items-center gap-3 text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-white transition-colors text-sm font-medium">
          <Settings className="w-4 h-4" /> Settings
        </button>
      </div>

      {/* Upgrade Card */}
      <div className="mx-3 mb-3 p-3 bg-[#262626] rounded-xl border border-[#333333]">
        <h4 className="text-sm font-medium text-white mb-1">Unlimited Conversations</h4>
        <p className="text-xs text-[#808080] mb-3">Upgrade for unlimited use</p>
        <button className="w-full bg-gradient-to-r from-white to-[#e0e0e0] text-black font-medium text-sm py-1.5 rounded-lg hover:opacity-90 transition-opacity">
          Upgrade
        </button>
      </div>

      {/* User Profile */}
      <div className="px-3 pb-3">
        <button className="w-full flex items-center justify-between bg-[#2a2a2a] hover:bg-[#333333] rounded-lg p-2 transition-colors border border-[#333333]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-4 h-4 rounded-full bg-white shrink-0 text-black flex items-center justify-center font-bold text-[8px]">
              {userEmail ? userEmail.charAt(0).toUpperCase() : "?"}
            </div>
            <span className="text-xs font-medium text-[#e0e0e0] truncate">
              {userEmail || "user@example.com"}
            </span>
          </div>
          <ChevronDown className="w-3 h-3 text-[#808080] shrink-0" />
        </button>
      </div>
    </div>
  );
}
