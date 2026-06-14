export const FAQS = [
  {
    question: "What is Decko?",
    answer: "Decko is an AI-powered presentation planner and outline generator. It drafts fully structured, professional chapter guides, outlines, and summaries for your topics in seconds, helping you skip the dreaded blank-slide phase of creating presentations.",
  },
  {
    question: "How does the credit system work?",
    answer: "Every registered user starts with 2 free credits. You can generate outlines using different AI models which deduct credits based on their capability: Owl Alpha (1 credit/run), DeepSeek V4 (3 credits/run), or GPT-5.5 (7 credits/run). Refills and extra credit packs can be purchased at any time.",
  },
  {
    question: "Are presentation revisions free?",
    answer: "Yes! Once you generate an outline, you can interactively revise, update, or expand it using our natural chat pane up to 3 times per presentation. Revisions are completely free and consume zero extra credits.",
  },
  {
    question: "Can I export my outlines?",
    answer: "Absolutely. You can export any generated presentation outline directly into structured PDF documents or styled Microsoft Word (.docx) formats with a single click, ready to share or import into presentation software.",
  },
  {
    question: "Is there a limit on how many outlines I can save?",
    answer: "No. Your generated presentation outline history is securely saved in your personal sidebar workspace so you can access, edit, revise, or re-export them whenever you need.",
  },
];

export const PRICING_PLANS = [
  {
    name: "Free Trial",
    price: "$0",
    description: "Perfect for testing the waters",
    features: [
      "2 free starter credits",
      "Fast Owl Alpha generation (1 credit)",
      "3 free revisions per presentation",
      "Standard PDF & DOCX export",
      "Saved workspace history",
    ],
    buttonText: "Get Started Free",
    actionLink: "/auth/signup",
    popular: false,
  },
  {
    name: "Starter Pack",
    price: "$5",
    priceSub: "one-time",
    description: "Perfect for casual students & writers",
    features: [
      "10 credits pack refilled instantly",
      "Access to DeepSeek V4 (3 credits)",
      "3 free revisions per presentation",
      "Standard PDF & DOCX export",
      "Priority outline generation speed",
      "Saved workspace history",
    ],
    buttonText: "Get Starter Pack",
    actionLink: "/auth/login?purchase=starter",
    popular: false,
  },
  {
    name: "Pro Pack",
    price: "$15",
    priceSub: "one-time",
    description: "Best value for professionals & creators",
    features: [
      "50 credits pack refilled instantly",
      "Access to GPT-5.5 (7 credits)",
      "Access to DeepSeek V4 & Owl Alpha",
      "3 free revisions per presentation",
      "Premium formatting PDF/DOCX exports",
      "Ultra-fast priority processing",
      "Saved workspace history",
    ],
    buttonText: "Upgrade to Pro",
    actionLink: "/auth/login?purchase=pro",
    popular: true,
  },
];
