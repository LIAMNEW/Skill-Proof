import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const savedAnalyses = pgTable("saved_analyses", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  profileData: jsonb("profile_data").notNull(),
  matchData: jsonb("match_data"),
  jobDescription: text("job_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSavedAnalysisSchema = createInsertSchema(savedAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertSavedAnalysis = z.infer<typeof insertSavedAnalysisSchema>;
export type SavedAnalysis = typeof savedAnalyses.$inferSelect;

// Code DNA Fingerprint types (no database table - used for API responses)
export interface CodeDNAPersonality {
  communicationStyle: "Concise" | "Detailed" | "Visual";
  documentationHabits: "Extensive" | "Moderate" | "Minimal";
  commitStyle: "Atomic" | "Feature-based" | "Mixed";
}

export interface CodeDNACollaboration {
  role: "Mentor" | "Contributor" | "Solo Builder" | "Architect";
  prQuality: number;
  reviewActivity: "Active Reviewer" | "Occasional" | "Rare";
}

export interface CodeDNATechnical {
  codeStructure: "Functional" | "OOP" | "Hybrid";
  testingApproach: "TDD Advocate" | "Pragmatic" | "Minimal";
  architecturePreference: "Microservices" | "Monolithic" | "Modular";
}

export interface CodeDNAEvolution {
  primaryGrowthArea: string;
  languageProgression: Array<{ year: number; languages: string[] }>;
  complexityTrend: "Increasing" | "Stable" | "Exploring";
}

export interface CodeDNA {
  username: string;
  personality: CodeDNAPersonality;
  collaboration: CodeDNACollaboration;
  technicalDNA: CodeDNATechnical;
  evolution: CodeDNAEvolution;
  uniqueMarkers: string[];
}
