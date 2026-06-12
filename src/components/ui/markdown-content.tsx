import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Check, Copy } from "lucide-react";

export function CodeBlock({ language, codeString, ...props }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border/50 my-4 shadow-sm bg-[#1E1E1E]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-[10px] uppercase font-semibold tracking-wider"
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        {...props}
        style={vscDarkPlus as any}
        language={language}
        PreTag="div"
        className="!m-0 !bg-transparent text-xs md:text-sm"
        customStyle={{ padding: "1rem" }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownContent({ content, compact = false }: { content: string; compact?: boolean }) {
  return (
    <div className={`w-full text-foreground/95 leading-relaxed ${compact ? "text-xs sm:text-sm space-y-1.5" : "text-sm md:text-base space-y-4"}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className={`leading-relaxed ${compact ? "mb-1" : "mb-3"}`}>{children}</p>,
          ul: ({ children }) => <ul className={`list-disc pl-4 space-y-0.5 ${compact ? "mb-1.5" : "mb-4 space-y-1.5"}`}>{children}</ul>,
          ol: ({ children }) => <ol className={`list-decimal pl-4 space-y-0.5 ${compact ? "mb-1.5" : "mb-4 space-y-1.5"}`}>{children}</ol>,
          li: ({ children }) => <li className="text-foreground/90">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          h1: ({ children }) => <h1 className={`${compact ? "text-lg font-bold mb-1.5 mt-2" : "text-2xl font-bold mb-4 mt-6"} text-foreground`}>{children}</h1>,
          h2: ({ children }) => <h2 className={`${compact ? "text-base font-bold mb-1 mt-1.5" : "text-xl font-bold mb-3 mt-5"} text-foreground`}>{children}</h2>,
          h3: ({ children }) => <h3 className={`${compact ? "text-sm font-bold mb-1 mt-1" : "text-lg font-bold mb-2 mt-4"} text-foreground`}>{children}</h3>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/50 pl-3 italic text-muted-foreground my-2">{children}</blockquote>,
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const isBlock = match || String(children).includes("\n");
            
            if (isBlock) {
              const language = match ? match[1] : "text";
              let codeString = String(children).replace(/\n$/, "");
              if (codeString.startsWith("`")) codeString = codeString.slice(1);
              if (codeString.endsWith("`")) codeString = codeString.slice(0, -1);
              codeString = codeString.trim();
              
              return <CodeBlock language={language} codeString={codeString} {...props} />;
            }

            return (
              <code {...props} className={`${className || ""} bg-secondary/80 px-1 py-0.5 rounded text-foreground font-mono text-[11px] sm:text-xs font-medium border border-border/50`}>
                {children}
              </code>
            );
          },
          pre: ({ children }: any) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
