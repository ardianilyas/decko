import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  credits: integer("credits").notNull().default(100),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export const conversation = pgTable("conversation", {
  id: text("id").primaryKey(),
  name: text("name"),
  isGroup: boolean("isGroup").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const participant = pgTable("participant", {
  id: text("id").primaryKey(),
  conversationId: text("conversationId").notNull().references(() => conversation.id),
  userId: text("userId").notNull().references(() => user.id),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export const message = pgTable("message", {
  id: text("id").primaryKey(),
  conversationId: text("conversationId").notNull().references(() => conversation.id),
  senderId: text("senderId").references(() => user.id),
  role: text("role").$type<"user" | "assistant" | "system">().default("user").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  isRead: boolean("isRead").default(false).notNull(),
});

// --- PRD Tables ---

export const generation = pgTable("generation", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  topic: text("topic").notNull(),
  language: text("language").notNull().default("English"),
  model: text("model").notNull(),
  generatedJson: jsonb("generatedJson"),
  revisionCount: integer("revisionCount").notNull().default(0),
  creditsUsed: integer("creditsUsed").notNull().default(0),
  status: text("status").$type<"pending" | "completed" | "failed">().notNull().default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const revision = pgTable("revision", {
  id: text("id").primaryKey(),
  generationId: text("generationId").notNull().references(() => generation.id),
  prompt: text("prompt").notNull(),
  generatedJson: jsonb("generatedJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const creditTransaction = pgTable("creditTransaction", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => user.id),
  amount: integer("amount").notNull(),
  type: text("type").$type<"PURCHASE" | "GENERATION" | "REFUND">().notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
