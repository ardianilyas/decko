"use client";

import { ChevronDown } from "lucide-react";

interface LanguageDropdownProps {
  language: "English" | "Bahasa Indonesia";
  setLanguage: (lang: "English" | "Bahasa Indonesia") => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export function LanguageDropdown({
  language,
  setLanguage,
  isOpen,
  setIsOpen,
  dropdownRef,
}: LanguageDropdownProps) {
  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary/50 border border-border/50 text-foreground hover:bg-secondary transition-all ${
          isOpen ? "ring-1 ring-ring/30 border-border bg-secondary" : ""
        }`}
      >
        <span>{language === "English" ? "🇬🇧 EN" : "🇮🇩 ID"}</span>
        <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-48 rounded-2xl border border-border bg-popover/95 backdrop-blur-md p-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Language
          </div>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setLanguage("English");
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs transition-colors text-left ${
                language === "English"
                  ? "bg-foreground text-background font-medium"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-sm">🇬🇧</span>
              <div>
                <div className="font-medium">English</div>
                <div className={`text-[10px] ${language === "English" ? "text-background/80" : "text-muted-foreground"}`}>
                  Generate in English
                </div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setLanguage("Bahasa Indonesia");
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs transition-colors text-left ${
                language === "Bahasa Indonesia"
                  ? "bg-foreground text-background font-medium"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-sm">🇮🇩</span>
              <div>
                <div className="font-medium">Bahasa Indonesia</div>
                <div className={`text-[10px] ${language === "Bahasa Indonesia" ? "text-background/80" : "text-muted-foreground"}`}>
                  Hasilkan dalam Bahasa
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
