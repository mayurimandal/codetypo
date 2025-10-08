import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  real,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Programming languages
export const languages = pgTable("languages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  icon: varchar("icon").notNull(),
  snippetCount: integer("snippet_count").default(0),
});

// Code snippets for typing tests
export const codeSnippets = pgTable("code_snippets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  languageId: varchar("language_id").notNull().references(() => languages.id),
  title: varchar("title").notNull(),
  code: text("code").notNull(),
  difficulty: varchar("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  createdAt: timestamp("created_at").defaultNow(),
});

// User test results
export const testResults = pgTable("test_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  snippetId: varchar("snippet_id").notNull().references(() => codeSnippets.id),
  wpm: real("wpm").notNull(),
  accuracy: real("accuracy").notNull(),
  timeSpent: integer("time_spent").notNull(), // in seconds
  errors: integer("errors").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// User statistics (aggregated)
export const userStats = pgTable("user_stats", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  totalTests: integer("total_tests").default(0),
  averageWpm: real("average_wpm").default(0),
  averageAccuracy: real("average_accuracy").default(0),
  bestWpm: real("best_wpm").default(0),
  bestAccuracy: real("best_accuracy").default(0),
  globalRank: integer("global_rank"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User achievements
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: varchar("description").notNull(),
  icon: varchar("icon").notNull(),
  condition: varchar("condition").notNull(), // JSON string defining achievement condition
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Language proficiency tracking
export const languageProficiency = pgTable("language_proficiency", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  languageId: varchar("language_id").notNull().references(() => languages.id),
  averageWpm: real("average_wpm").default(0),
  averageAccuracy: real("average_accuracy").default(0),
  testsCompleted: integer("tests_completed").default(0),
  proficiencyLevel: varchar("proficiency_level").default('beginner'), // 'beginner', 'intermediate', 'advanced'
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Language = typeof languages.$inferSelect;
export type InsertLanguage = typeof languages.$inferInsert;

export type CodeSnippet = typeof codeSnippets.$inferSelect;
export type InsertCodeSnippet = typeof codeSnippets.$inferInsert;

export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = typeof testResults.$inferInsert;

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

export type LanguageProficiency = typeof languageProficiency.$inferSelect;
export type InsertLanguageProficiency = typeof languageProficiency.$inferInsert;

// Zod schemas
export const insertTestResultSchema = createInsertSchema(testResults).omit({
  id: true,
  completedAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats);
