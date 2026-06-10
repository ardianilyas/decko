"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { SendHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function MessageInput({ conversationId }: { conversationId: string }) {
  const [content, setContent] = useState("");
  const trpcCtx = trpc.useUtils();

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setContent("");
      trpcCtx.chat.getMessages.invalidate({ conversationId });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sendMessage.isPending) return;
    
    sendMessage.mutate({ conversationId, content });
  };

  return (
    <div className="p-4 pb-6 bg-transparent">
      <form 
        onSubmit={handleSubmit} 
        className="flex items-center gap-2 max-w-4xl mx-auto w-full bg-[#1e1e1e] border border-[#333333] rounded-full p-1.5 shadow-lg relative"
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          disabled={sendMessage.isPending}
          className="flex-1 bg-transparent border-none outline-none text-[#e0e0e0] placeholder:text-[#666666] h-10 px-4 text-sm"
        />
        <button 
          type="submit" 
          disabled={!content.trim() || sendMessage.isPending}
          className="h-9 w-9 rounded-full shrink-0 bg-[#333333] hover:bg-[#444444] text-[#e0e0e0] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
