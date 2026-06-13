export const MODELS = [
  {
    id: "openrouter/owl-alpha" as const,
    label: "Owl Alpha",
    description: "1 credit · Fast",
    cost: 1,
    icon: "🦉",
  },
  {
    id: "deepseek/deepseek-chat" as const,
    label: "DeepSeek",
    description: "Fast",
    cost: 3,
    icon: "⚡",
  },
  {
    id: "openai/gpt-4o-mini" as const,
    label: "GPT-4o Mini",
    description: "High quality",
    cost: 7,
    icon: "✨",
  },
] as const;
