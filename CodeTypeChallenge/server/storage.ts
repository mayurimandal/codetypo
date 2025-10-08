import {
  users,
  languages,
  codeSnippets,
  testResults,
  userStats,
  achievements,
  userAchievements,
  languageProficiency,
  type User,
  type UpsertUser,
  type Language,
  type InsertLanguage,
  type CodeSnippet,
  type InsertCodeSnippet,
  type TestResult,
  type InsertTestResult,
  type UserStats,
  type InsertUserStats,
  type Achievement,
  type UserAchievement,
  type InsertUserAchievement,
  type LanguageProficiency,
  type InsertLanguageProficiency,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Language operations
  getLanguages(): Promise<Language[]>;
  getLanguage(id: string): Promise<Language | undefined>;
  createLanguage(language: InsertLanguage): Promise<Language>;
  
  // Code snippet operations
  getCodeSnippets(languageId: string): Promise<CodeSnippet[]>;
  getCodeSnippet(id: string): Promise<CodeSnippet | undefined>;
  getRandomCodeSnippet(languageId: string, difficulty?: string): Promise<CodeSnippet | undefined>;
  createCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet>;
  
  // Test result operations
  createTestResult(result: InsertTestResult): Promise<TestResult>;
  getUserTestResults(userId: string, limit?: number): Promise<TestResult[]>;
  
  // User stats operations
  getUserStats(userId: string): Promise<UserStats | undefined>;
  updateUserStats(stats: InsertUserStats): Promise<UserStats>;
  getLeaderboard(limit?: number): Promise<Array<UserStats & { user: User }>>;
  
  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<Array<UserAchievement & { achievement: Achievement }>>;
  awardAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  
  // Language proficiency operations
  getUserLanguageProficiency(userId: string): Promise<LanguageProficiency[]>;
  updateLanguageProficiency(proficiency: InsertLanguageProficiency): Promise<LanguageProficiency>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Language operations
  async getLanguages(): Promise<Language[]> {
    return await db.select().from(languages).orderBy(asc(languages.displayName));
  }

  async getLanguage(id: string): Promise<Language | undefined> {
    const [language] = await db.select().from(languages).where(eq(languages.id, id));
    return language;
  }

  async createLanguage(language: InsertLanguage): Promise<Language> {
    const [newLanguage] = await db.insert(languages).values(language).returning();
    return newLanguage;
  }

  // Code snippet operations
  async getCodeSnippets(languageId: string): Promise<CodeSnippet[]> {
    return await db
      .select()
      .from(codeSnippets)
      .where(eq(codeSnippets.languageId, languageId))
      .orderBy(asc(codeSnippets.title));
  }

  async getCodeSnippet(id: string): Promise<CodeSnippet | undefined> {
    const [snippet] = await db.select().from(codeSnippets).where(eq(codeSnippets.id, id));
    return snippet;
  }

  async getRandomCodeSnippet(languageId: string, difficulty?: string): Promise<CodeSnippet | undefined> {
    let query = db
      .select()
      .from(codeSnippets)
      .where(eq(codeSnippets.languageId, languageId));

    if (difficulty) {
      query = query.where(and(
        eq(codeSnippets.languageId, languageId),
        eq(codeSnippets.difficulty, difficulty)
      ));
    }

    const snippets = await query;
    if (snippets.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * snippets.length);
    return snippets[randomIndex];
  }

  async createCodeSnippet(snippet: InsertCodeSnippet): Promise<CodeSnippet> {
    const [newSnippet] = await db.insert(codeSnippets).values(snippet).returning();
    return newSnippet;
  }

  // Test result operations
  async createTestResult(result: InsertTestResult): Promise<TestResult> {
    const [newResult] = await db.insert(testResults).values(result).returning();
    return newResult;
  }

  async getUserTestResults(userId: string, limit = 10): Promise<TestResult[]> {
    return await db
      .select()
      .from(testResults)
      .where(eq(testResults.userId, userId))
      .orderBy(desc(testResults.completedAt))
      .limit(limit);
  }

  // User stats operations
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats;
  }

  async updateUserStats(stats: InsertUserStats): Promise<UserStats> {
    const [updatedStats] = await db
      .insert(userStats)
      .values(stats)
      .onConflictDoUpdate({
        target: userStats.userId,
        set: {
          ...stats,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updatedStats;
  }

  async getLeaderboard(limit = 50): Promise<Array<UserStats & { user: User }>> {
    return await db
      .select({
        userId: userStats.userId,
        totalTests: userStats.totalTests,
        averageWpm: userStats.averageWpm,
        averageAccuracy: userStats.averageAccuracy,
        bestWpm: userStats.bestWpm,
        bestAccuracy: userStats.bestAccuracy,
        globalRank: userStats.globalRank,
        updatedAt: userStats.updatedAt,
        user: users,
      })
      .from(userStats)
      .innerJoin(users, eq(userStats.userId, users.id))
      .orderBy(desc(userStats.averageWpm))
      .limit(limit);
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getUserAchievements(userId: string): Promise<Array<UserAchievement & { achievement: Achievement }>> {
    return await db
      .select({
        id: userAchievements.id,
        userId: userAchievements.userId,
        achievementId: userAchievements.achievementId,
        earnedAt: userAchievements.earnedAt,
        achievement: achievements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));
  }

  async awardAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const [newAchievement] = await db
      .insert(userAchievements)
      .values({ userId, achievementId })
      .returning();
    return newAchievement;
  }

  // Language proficiency operations
  async getUserLanguageProficiency(userId: string): Promise<LanguageProficiency[]> {
    return await db
      .select()
      .from(languageProficiency)
      .where(eq(languageProficiency.userId, userId));
  }

  async updateLanguageProficiency(proficiency: InsertLanguageProficiency): Promise<LanguageProficiency> {
    const [updatedProficiency] = await db
      .insert(languageProficiency)
      .values(proficiency)
      .onConflictDoUpdate({
        target: [languageProficiency.userId, languageProficiency.languageId],
        set: {
          ...proficiency,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updatedProficiency;
  }
}

export const storage = new DatabaseStorage();
