export const MODELS = [
  {
    id: "openrouter/owl-alpha" as const,
    label: "Owl Alpha",
    description: "1 credit · Max 5 Chapters",
    cost: 1,
    icon: "🦉",
  },
  {
    id: "deepseek/deepseek-v4-flash" as const,
    label: "DeepSeek V4",
    description: "3 credits · Max 10 Chapters",
    cost: 3,
    icon: "⚡",
  },
  {
    id: "openai/gpt-5.5" as const,
    label: "GPT-5.5",
    description: "7 credits · Max 14 Chapters",
    cost: 7,
    icon: "✨",
  },
] as const;
