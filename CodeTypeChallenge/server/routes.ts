import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTestResultSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Language routes
  app.get('/api/languages', async (req, res) => {
    try {
      const languages = await storage.getLanguages();
      res.json(languages);
    } catch (error) {
      console.error("Error fetching languages:", error);
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });

  app.get('/api/languages/:id', async (req, res) => {
    try {
      const language = await storage.getLanguage(req.params.id);
      if (!language) {
        return res.status(404).json({ message: "Language not found" });
      }
      res.json(language);
    } catch (error) {
      console.error("Error fetching language:", error);
      res.status(500).json({ message: "Failed to fetch language" });
    }
  });

  // Code snippet routes
  app.get('/api/languages/:languageId/snippets', async (req, res) => {
    try {
      const snippets = await storage.getCodeSnippets(req.params.languageId);
      res.json(snippets);
    } catch (error) {
      console.error("Error fetching code snippets:", error);
      res.status(500).json({ message: "Failed to fetch code snippets" });
    }
  });

  app.get('/api/languages/:languageId/snippets/random', async (req, res) => {
    try {
      const { difficulty } = req.query;
      const snippet = await storage.getRandomCodeSnippet(
        req.params.languageId,
        difficulty as string
      );
      if (!snippet) {
        return res.status(404).json({ message: "No code snippets found" });
      }
      res.json(snippet);
    } catch (error) {
      console.error("Error fetching random code snippet:", error);
      res.status(500).json({ message: "Failed to fetch code snippet" });
    }
  });

  app.get('/api/snippets/:id', async (req, res) => {
    try {
      const snippet = await storage.getCodeSnippet(req.params.id);
      if (!snippet) {
        return res.status(404).json({ message: "Code snippet not found" });
      }
      res.json(snippet);
    } catch (error) {
      console.error("Error fetching code snippet:", error);
      res.status(500).json({ message: "Failed to fetch code snippet" });
    }
  });

  // Test result routes
  app.post('/api/test-results', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const testData = insertTestResultSchema.parse({
        ...req.body,
        userId,
      });

      const result = await storage.createTestResult(testData);
      
      // Update user stats after creating test result
      await updateUserStatsAfterTest(userId, result);
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid test data", errors: error.errors });
      }
      console.error("Error creating test result:", error);
      res.status(500).json({ message: "Failed to create test result" });
    }
  });

  app.get('/api/users/:userId/test-results', isAuthenticated, async (req: any, res) => {
    try {
      const requestedUserId = req.params.userId;
      const currentUserId = req.user.claims.sub;
      
      // Users can only access their own test results
      if (requestedUserId !== currentUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const results = await storage.getUserTestResults(requestedUserId, limit);
      res.json(results);
    } catch (error) {
      console.error("Error fetching test results:", error);
      res.status(500).json({ message: "Failed to fetch test results" });
    }
  });

  // User stats routes
  app.get('/api/users/:userId/stats', isAuthenticated, async (req: any, res) => {
    try {
      const requestedUserId = req.params.userId;
      const currentUserId = req.user.claims.sub;
      
      // Users can only access their own stats
      if (requestedUserId !== currentUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getUserStats(requestedUserId);
      if (!stats) {
        // Create initial stats if they don't exist
        const newStats = await storage.updateUserStats({
          userId: requestedUserId,
          totalTests: 0,
          averageWpm: 0,
          averageAccuracy: 0,
          bestWpm: 0,
          bestAccuracy: 0,
          globalRank: null,
        });
        return res.json(newStats);
      }
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Achievement routes
  app.get('/api/achievements', async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get('/api/users/:userId/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const requestedUserId = req.params.userId;
      const currentUserId = req.user.claims.sub;
      
      // Users can only access their own achievements
      if (requestedUserId !== currentUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const achievements = await storage.getUserAchievements(requestedUserId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // Language proficiency routes
  app.get('/api/users/:userId/proficiency', isAuthenticated, async (req: any, res) => {
    try {
      const requestedUserId = req.params.userId;
      const currentUserId = req.user.claims.sub;
      
      // Users can only access their own proficiency data
      if (requestedUserId !== currentUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const proficiency = await storage.getUserLanguageProficiency(requestedUserId);
      res.json(proficiency);
    } catch (error) {
      console.error("Error fetching language proficiency:", error);
      res.status(500).json({ message: "Failed to fetch language proficiency" });
    }
  });

  // Initialize default data
  await initializeDefaultData();

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to update user stats after a test
async function updateUserStatsAfterTest(userId: string, testResult: any) {
  try {
    const currentStats = await storage.getUserStats(userId);
    const allResults = await storage.getUserTestResults(userId, 1000); // Get all results for accurate calculation

    const totalTests = allResults.length;
    const averageWpm = allResults.reduce((sum, result) => sum + result.wpm, 0) / totalTests;
    const averageAccuracy = allResults.reduce((sum, result) => sum + result.accuracy, 0) / totalTests;
    const bestWpm = Math.max(...allResults.map(result => result.wpm));
    const bestAccuracy = Math.max(...allResults.map(result => result.accuracy));

    await storage.updateUserStats({
      userId,
      totalTests,
      averageWpm,
      averageAccuracy,
      bestWpm,
      bestAccuracy,
      globalRank: currentStats?.globalRank || null,
    });
  } catch (error) {
    console.error("Error updating user stats:", error);
  }
}

// Initialize default languages and code snippets
async function initializeDefaultData() {
  try {
    const languages = await storage.getLanguages();
    if (languages.length === 0) {
      // Create default languages
      const defaultLanguages = [
        { name: 'python', displayName: 'Python', icon: '🐍', snippetCount: 0 },
        { name: 'javascript', displayName: 'JavaScript', icon: '⚡', snippetCount: 0 },
        { name: 'java', displayName: 'Java', icon: '☕', snippetCount: 0 },
        { name: 'cpp', displayName: 'C++', icon: '⚙️', snippetCount: 0 },
        { name: 'html', displayName: 'HTML/CSS', icon: '🌐', snippetCount: 0 },
      ];

      for (const lang of defaultLanguages) {
        await storage.createLanguage(lang);
      }
    }
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}
