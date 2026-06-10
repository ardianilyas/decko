"use client";

import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";
import { MessageInput } from "./message-input";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MessageArea({ 
  conversationId, 
  userId,
  initialPrompt,
  clearPrompt
}: { 
  conversationId: string; 
  userId?: string;
  initialPrompt?: string;
  clearPrompt?: () => void;
}) {
  const { data: initialDbMessages, isLoading: isFetching } = trpc.chat.getMessages.useQuery({ conversationId });
  
  console.log("[MessageArea] conversationId:", conversationId, "isFetching:", isFetching, "initialDbMessages:", initialDbMessages);

  if (isFetching) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <ChatEngine 
      key={conversationId}
      conversationId={conversationId} 
      userId={userId} 
      initialMessages={initialDbMessages as any}
      initialPrompt={initialPrompt}
      clearPrompt={clearPrompt}
    />
  );
}

function ChatEngine({ 
  conversationId, 
  userId, 
  initialMessages,
  initialPrompt,
  clearPrompt
}: { 
  conversationId: string; 
  userId?: string; 
  initialMessages: any[];
  initialPrompt?: string;
  clearPrompt?: () => void;
}) {
  const chatState = useChat({
    id: conversationId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { conversationId },
    }),
    messages: initialMessages?.map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      parts: [{ type: "text", text: msg.content }]
    })) || [],
    onError: (error) => {
      toast.error(error.message || "An error occurred while generating a response.");
    }
  });
  const { messages, status, sendMessage, setMessages } = chatState;

  console.log("[ChatEngine] conversationId:", conversationId, "messages:", messages, "status:", status);

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedRef.current && initialMessages) {
      console.log("[ChatEngine] Syncing database messages to useChat state:", initialMessages);
      setMessages(initialMessages.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        parts: [{ type: "text", text: msg.content }]
      })));
      hasInitializedRef.current = true;
    }
  }, [initialMessages, setMessages]);

  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    console.log("Sending message...", input);
    try {
      sendMessage(
        { text: input } as any,
        { body: { conversationId } }
      );
    } catch (err) {
      console.error("SendMessage error:", err);
    }
    setInput("");
  };

  useEffect(() => {
    if (initialPrompt && clearPrompt) {
      console.log("Sending initial prompt...", initialPrompt);
      try {
        sendMessage(
          { text: initialPrompt } as any,
          { body: { conversationId } }
        );
      } catch (err) {
        console.error("SendMessage initial error:", err);
      }
      clearPrompt();
    }
  }, [initialPrompt, clearPrompt, sendMessage, conversationId]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 mt-10">
            No messages yet. Start chatting with Decko!
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.role === "user";
            const rawContent = msg.content || (msg.parts && msg.parts.map((p: any) => p.text).join("")) || "";
            // Replace literal \n characters (often resulting from string escapes in DB storage/transfers) with actual newlines
            const textContent = rawContent.replace(/\\n/g, "\n");
            return (
              <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                  <span className="text-xs text-[#808080] mb-1 ml-1">{isMe ? "You" : "Decko"}</span>
                  <div 
                    className={`px-4 py-3 rounded-2xl ${
                      isMe 
                        ? "bg-[#2a2a2a] text-[#e0e0e0] border border-[#333333] rounded-br-sm whitespace-pre-wrap leading-relaxed text-sm md:text-[15px]" 
                        : "bg-transparent text-[#e0e0e0] rounded-bl-sm"
                    }`}
                  >
                    {isMe ? (
                      textContent
                    ) : (
                      <div className="relative">
                        {textContent.trim() ? (
                          <div className="text-sm md:text-[15px] text-[#e0e0e0] leading-relaxed max-w-none">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p({ children }) {
                                  return <p className="mb-5 last:mb-0 leading-relaxed">{children}</p>;
                                },
                                ul({ children }) {
                                  return <ul className="list-disc pl-6 mb-5 space-y-2">{children}</ul>;
                                },
                                ol({ children }) {
                                  return <ol className="list-decimal pl-6 mb-5 space-y-2">{children}</ol>;
                                },
                                li({ children }) {
                                  return <li className="leading-relaxed mb-1">{children}</li>;
                                },
                                h1({ children }) {
                                  return <h1 className="text-xl font-bold mb-5 mt-7 text-white">{children}</h1>;
                                },
                                h2({ children }) {
                                  return <h2 className="text-lg font-bold mb-4 mt-6 text-white">{children}</h2>;
                                },
                                h3({ children }) {
                                  return <h3 className="text-md font-bold mb-3 mt-5 text-white">{children}</h3>;
                                },
                                a({ href, children }) {
                                  return (
                                    <a href={href} className="text-[#a0a0a0] hover:text-white underline transition-colors" target="_blank" rel="noopener noreferrer">
                                      {children}
                                    </a>
                                  );
                                },
                                table({ children }) {
                                  return (
                                    <div className="overflow-x-auto my-4 rounded-lg border border-[#333333]">
                                      <table className="w-full border-collapse text-left text-sm">{children}</table>
                                    </div>
                                  );
                                },
                                thead({ children }) {
                                  return <thead className="bg-[#1c1c1c] border-b border-[#333333]">{children}</thead>;
                                },
                                th({ children }) {
                                  return <th className="px-4 py-2 font-semibold text-white border-r border-[#333333] last:border-r-0">{children}</th>;
                                },
                                td({ children }) {
                                  return <td className="px-4 py-2 border-t border-[#333333] border-r border-[#333333] last:border-r-0 text-[#c0c0c0]">{children}</td>;
                                },
                                blockquote({ children }) {
                                  return <blockquote className="border-l-4 border-[#808080] pl-4 italic my-4 text-zinc-400">{children}</blockquote>;
                                },
                                pre({ children }) {
                                  return <>{children}</>;
                                },
                                code({node, className, children, ...props}: any) {
                                  const match = /language-(\w+)/.exec(className || '')
                                  return match ? (
                                    <div className="rounded-md bg-[#111111] border border-[#333333] my-4 overflow-hidden">
                                      <div className="flex items-center justify-between px-4 py-1.5 bg-[#1a1a1a] border-b border-[#333333]">
                                        <span className="text-xs text-[#808080] font-mono">{match[1]}</span>
                                      </div>
                                      <div className="p-4 overflow-x-auto">
                                        <pre className="!bg-transparent !m-0 !p-0">
                                          <code className={`text-[13px] leading-relaxed font-mono ${className || ''}`} {...props}>
                                            {children}
                                          </code>
                                        </pre>
                                      </div>
                                    </div>
                                  ) : (
                                    <code className="bg-[#333333] px-1.5 py-0.5 rounded text-[#e0e0e0] font-mono text-[13px]" {...props}>
                                      {children}
                                    </code>
                                  )
                                }
                              }}
                            >
                              {textContent}
                            </ReactMarkdown>
                            {isLoading && messages[messages.length - 1]?.id === msg.id && (
                              <span className="inline-block w-1.5 h-4 bg-zinc-400 ml-1 animate-pulse" />
                            )}
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center px-1 py-1 h-6">
                            <Loader2 className="h-4 w-4 animate-spin text-[#808080]" />
                            <span className="text-xs text-zinc-400">Decko is thinking...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex w-full justify-start">
            <div className="flex flex-col max-w-[85%] sm:max-w-[75%] items-start">
              <span className="text-xs text-[#808080] mb-1 ml-1">Decko</span>
              <div className="px-4 py-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl rounded-bl-sm flex gap-2 items-center h-10">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                <span className="text-xs text-zinc-400">Decko is thinking...</span>
              </div>
            </div>
          </div>
        )}
        


        <div ref={bottomRef} />
      </div>
      
      <MessageInput 
        input={input} 
        handleInputChange={handleInputChange} 
        handleSubmit={handleSubmit} 
        isLoading={isLoading} 
      />
    </div>
  );
}
