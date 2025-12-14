import { type User, type InsertUser, type SavedAnalysis, type InsertSavedAnalysis, savedAnalyses } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveAnalysis(analysis: InsertSavedAnalysis): Promise<SavedAnalysis>;
  getAnalyses(): Promise<SavedAnalysis[]>;
  getAnalysisById(id: number): Promise<SavedAnalysis | undefined>;
  deleteAnalysis(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveAnalysis(analysis: InsertSavedAnalysis): Promise<SavedAnalysis> {
    const [saved] = await db.insert(savedAnalyses).values(analysis).returning();
    return saved;
  }

  async getAnalyses(): Promise<SavedAnalysis[]> {
    return await db.select().from(savedAnalyses).orderBy(desc(savedAnalyses.createdAt));
  }

  async getAnalysisById(id: number): Promise<SavedAnalysis | undefined> {
    const [analysis] = await db.select().from(savedAnalyses).where(eq(savedAnalyses.id, id));
    return analysis;
  }

  async deleteAnalysis(id: number): Promise<boolean> {
    const result = await db.delete(savedAnalyses).where(eq(savedAnalyses.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new MemStorage();
