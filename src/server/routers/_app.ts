import { router } from "../trpc";
import { chatRouter } from "./chat";
import { generationRouter } from "./generation";

export const appRouter = router({
  chat: chatRouter,
  generation: generationRouter,
});

export type AppRouter = typeof appRouter;
