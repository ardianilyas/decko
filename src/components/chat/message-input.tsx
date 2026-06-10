"use client";

import { SendHorizontal } from "lucide-react";

interface MessageInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function MessageInput({ input, handleInputChange, handleSubmit, isLoading }: MessageInputProps) {
  return (
    <div className="p-2 sm:p-4 pb-4 sm:pb-6 bg-transparent">
      <form 
        onSubmit={handleSubmit} 
        className="flex items-center gap-2 max-w-4xl mx-auto w-full bg-[#1e1e1e] border border-[#333333] rounded-full p-1.5 shadow-lg relative"
      >
        <input
          value={input || ""}
          onChange={(e) => {
            if (handleInputChange) {
              handleInputChange(e);
            }
          }}
          placeholder="Type a message..."
          disabled={isLoading}
          className="flex-1 bg-transparent border-none outline-none text-[#e0e0e0] placeholder:text-[#666666] h-10 px-4 text-sm"
        />
        <button 
          type="submit" 
          disabled={!(input || "").trim() || isLoading}
          className="h-9 w-9 rounded-full shrink-0 bg-[#333333] hover:bg-[#444444] text-[#e0e0e0] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
