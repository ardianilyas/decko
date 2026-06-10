"use client";

import { useState } from "react";
import { ConversationList } from "./conversation-list";
import { MessageArea } from "./message-area";
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
  Code
} from "lucide-react";

export function ChatLayout({ userEmail, userId }: { userEmail?: string, userId?: string }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-1 overflow-hidden bg-[#171717] text-[#e0e0e0] font-sans">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-[280px] shrink-0 border-r border-[#2a2a2a] transition-all">
          <ConversationList 
            activeId={activeConversationId} 
            onSelect={setActiveConversationId} 
            onToggleSidebar={() => setSidebarOpen(false)}
            userEmail={userEmail}
          />
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-transparent shrink-0">
          <div className="flex flex-col">
            <button className="flex items-center gap-1.5 text-lg font-semibold text-white">
              {!sidebarOpen && (
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="mr-2 text-[#a0a0a0] hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
              )}
              ChatFusion <ChevronDown className="w-4 h-4 text-[#808080]" />
            </button>
            <span className="text-xs text-[#808080]">Free Plan</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#222222] hover:bg-[#2a2a2a] border border-[#333333] rounded-full text-sm font-medium transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#222222] hover:bg-[#2a2a2a] border border-[#333333] rounded-full text-sm font-medium transition-colors">
              <HelpCircle className="w-4 h-4" /> Help
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeConversationId ? (
            <MessageArea conversationId={activeConversationId} userId={userId} />
          ) : (
            <div className="flex flex-col items-center max-w-3xl mx-auto px-4 pt-12 pb-24 h-full">
              {/* Upgrade Pill */}
              <div className="mb-8 flex items-center gap-1.5 px-3 py-1 bg-[#222222] border border-[#333333] rounded-full text-xs text-[#a0a0a0]">
                Using limited free plan <span className="text-white font-medium cursor-pointer hover:underline">Upgrade.</span>
              </div>

              {/* Greeting */}
              <h1 className="text-3xl text-white font-semibold mb-2 flex items-center gap-2">
                Good Morning Karthik <span className="text-3xl">👋</span>
              </h1>
              <p className="text-sm text-[#808080] mb-12">
                Chat with ChatFusion and turn your ideas into reality with ease
              </p>

              {/* Central Input Box */}
              <div className="w-full bg-[#1e1e1e] border border-[#333333] rounded-2xl p-4 mb-4 relative shadow-lg">
                <div className="flex items-start gap-3 mb-8">
                  <LinkIcon className="w-5 h-5 text-[#808080] shrink-0 mt-0.5" />
                  <textarea 
                    className="w-full bg-transparent border-none outline-none text-[#e0e0e0] placeholder:text-[#666666] resize-none h-12 text-lg"
                    placeholder="How can Chatfusion help you today?"
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
                  
                  <button className="w-8 h-8 bg-[#333333] hover:bg-[#444444] rounded-full flex items-center justify-center text-[#e0e0e0] transition-colors">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#666666] mb-8 text-center">
                Collaborate with Chatfusion using documents, images and more
              </p>

              {/* Dashed Suggestions */}
              <div className="flex flex-wrap justify-center gap-3 mb-16">
                <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-dashed border-[#444444] rounded-full text-xs font-medium text-[#a0a0a0] hover:text-white hover:border-[#666666] transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" /> Create Images
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-dashed border-[#444444] rounded-full text-xs font-medium text-[#a0a0a0] hover:text-white hover:border-[#666666] transition-colors">
                  <MonitorUp className="w-3.5 h-3.5" /> Analyze Images
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-dashed border-[#444444] rounded-full text-xs font-medium text-[#a0a0a0] hover:text-white hover:border-[#666666] transition-colors">
                  <Code className="w-3.5 h-3.5" /> Code
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-dashed border-[#444444] rounded-full text-xs font-medium text-[#a0a0a0] hover:text-white hover:border-[#666666] transition-colors">
                  More
                </button>
              </div>

              {/* Recent Chats Grid */}
              <div className="w-full">
                <div className="flex items-center gap-2 text-sm font-medium text-white mb-4">
                  <MessageSquare className="w-4 h-4" /> Your Recent chats <ChevronDown className="w-4 h-4 text-[#808080]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: "Suggest a color palette for my website.", time: "10 hours ago" },
                    { title: "Can AI replace designers in the future?", time: "10 hours ago" },
                    { title: "Guide me on creating a landing page for a new app.", time: "10 hours ago" },
                  ].map((chat, i) => (
                    <div key={i} className="bg-[#222222] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#444444] transition-colors cursor-pointer flex flex-col justify-between min-h-[120px]">
                      <div>
                        <MessageSquare className="w-4 h-4 text-[#808080] mb-3" />
                        <h4 className="text-sm font-medium text-[#e0e0e0] leading-snug">{chat.title}</h4>
                      </div>
                      <span className="text-[10px] text-[#666666] mt-4">{chat.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-16 text-center text-[10px] text-[#666666]">
                Chatfusion may display inaccurate info, so please double check the response
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
