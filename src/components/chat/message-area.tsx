"use client";

import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";
import { MessageInput } from "./message-input";
import { useEffect, useRef } from "react";

export function MessageArea({ conversationId, userId }: { conversationId: string, userId?: string }) {
  const { data: messages, isLoading } = trpc.chat.getMessages.useQuery({ conversationId });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages?.length === 0 ? (
          <div className="text-center text-zinc-500 mt-10">
            No messages yet. Say hi!
          </div>
        ) : (
          messages?.map((msg) => {
            const isMe = msg.senderId === userId;
            return (
              <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                  <span className="text-xs text-zinc-500 mb-1 ml-1">{isMe ? "You" : msg.senderName}</span>
                  <div 
                    className={`px-4 py-2.5 rounded-2xl ${
                      isMe 
                        ? "bg-blue-600 text-white rounded-br-sm" 
                        : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
