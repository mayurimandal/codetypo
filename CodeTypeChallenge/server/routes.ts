import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTestResultSchema } from "@shared/schema";
import { z } from "zod";

// --- EMBEDDED DEFAULT SNIPPET DATA ---
// This data was moved here from a client-side file to ensure server-side availability for initialization.
const defaultSnippetsData: Record<string, Array<{ title: string, code: string, difficulty: 'beginner' | 'intermediate' | 'advanced' }>> = {
  python: [
    {
      title: "Fibonacci Function",
      code: `def calculate_fibonacci(n):
    # Calculate fibonacci sequence up to n
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    return sequence`,
      difficulty: "intermediate"
    },
    {
      title: "Binary Search",
      code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      difficulty: "intermediate"
    },
    {
      title: "List Comprehension",
      code: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [x for x in numbers if x % 2 == 0]
squares = [x**2 for x in evens]
print(f"Even squares: {squares}")`,
      difficulty: "beginner"
    }
  ],
  javascript: [
    {
      title: "React Component",
      code: `import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(userData => {
      setUser(userData);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};`,
      difficulty: "intermediate"
    },
    {
      title: "Array Methods",
      code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = numbers
  .filter(n => n % 2 === 0)
  .map(n => n * n)
  .reduce((sum, n) => sum + n, 0);

console.log('Sum of even squares:', result);`,
      difficulty: "beginner"
    },
    {
      title: "Async/Await Function",
      code: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}`,
      difficulty: "intermediate"
    }
  ],
  java: [
    {
      title: "ArrayList Implementation",
      code: `import java.util.*;

public class UserManager {
    private List<User> users;
    
    public UserManager() {
        this.users = new ArrayList<>();
    }
    
    public void addUser(User user) {
        if (user != null && !users.contains(user)) {
            users.add(user);
        }
    }
    
    public List<User> getActiveUsers() {
        return users.stream()
                   .filter(User::isActive)
                   .collect(Collectors.toList());
    }
}`,
      difficulty: "intermediate"
    },
    {
      title: "Exception Handling",
      code: `public class FileProcessor {
    public String readFile(String filename) {
        try (BufferedReader reader = new BufferedReader(
                new FileReader(filename))) {
            
            StringBuilder content = new StringBuilder();
            String line;
            
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\\n");
            }
            
            return content.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }
    }
}`,
      difficulty: "advanced"
    }
  ],
  cpp: [
    {
      title: "Vector Operations",
      code: `#include <vector>
#include <algorithm>
#include <iostream>

class NumberProcessor {
private:
    std::vector<int> numbers;
    
public:
    void addNumber(int num) {
        numbers.push_back(num);
    }
    
    void sortNumbers() {
        std::sort(numbers.begin(), numbers.end());
    }
    
    int findMax() {
        return *std::max_element(numbers.begin(), numbers.end());
    }
    
    void printNumbers() {
        for (const auto& num : numbers) {
            std::cout << num << " ";
        }
        std::cout << std::endl;
    }
};`,
      difficulty: "intermediate"
    },
    {
      title: "Template Function",
      code: `#include <iostream>
#include <type_traits>

template<typename T>
typename std::enable_if<std::is_arithmetic<T>::value, T>::type
findMax(T a, T b) {
    return (a > b) ? a : b;
}

template<typename T>
void swap(T& a, T& b) {
    T temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 10, y = 20;
    std::cout << "Max: " << findMax(x, y) << std::endl;
    return 0;
}`,
      difficulty: "advanced"
    }
  ],
  html: [
    {
      title: "Responsive Card Component",
      code: `<div class="card">
  <div class="card-header">
    <img src="profile.jpg" alt="User Avatar" class="avatar">
    <h2 class="card-title">John Doe</h2>
  </div>
  
  <div class="card-body">
    <p class="card-description">
      Full-stack developer with 5+ years of experience
      in React, Node.js, and cloud technologies.
    </p>
    
    <div class="skills">
      <span class="skill-tag">React</span>
      <span class="skill-tag">TypeScript</span>
      <span class="skill-tag">Node.js</span>
    </div>
  </div>
  
  <div class="card-footer">
    <button class="btn btn-primary">Connect</button>
    <button class="btn btn-secondary">Message</button>
  </div>
</div>`,
      difficulty: "beginner"
    },
    {
      title: "CSS Grid Layout",
      code: `.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}`,
      difficulty: "intermediate"
    }
  ]
};

// --- END EMBEDDED DEFAULT SNIPPET DATA ---

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

// Initialize default languages and code snippets (UPDATED)
async function initializeDefaultData() {
  try {
    let languages = await storage.getLanguages();
    let snippetsCount = 0;

    if (languages.length === 0) {
      // 1. Create default languages
      const defaultLangs = [
        { name: 'python', displayName: 'Python', icon: '🐍', snippetCount: 0 },
        { name: 'javascript', displayName: 'JavaScript', icon: '⚡', snippetCount: 0 },
        { name: 'java', displayName: 'Java', icon: '☕', snippetCount: 0 },
        { name: 'cpp', displayName: 'C++', icon: '⚙️', snippetCount: 0 },
        { name: 'html', displayName: 'HTML/CSS', icon: '🌐', snippetCount: 0 },
      ];

      for (const lang of defaultLangs) {
        await storage.createLanguage(lang);
      }
      // Re-fetch languages including their IDs to be used for snippets
      languages = await storage.getLanguages();
    }
    
    // 2. Create default snippets if they don't exist for the corresponding languages
    for (const lang of languages) {
      const existingSnippets = await storage.getCodeSnippets(lang.id);
      
      // Check if data exists in the embedded structure for this language name
      const snippetsToInsert = defaultSnippetsData[lang.name];
      
      if (existingSnippets.length === 0 && snippetsToInsert) {
          for (const snippet of snippetsToInsert) {
              await storage.createCodeSnippet({ ...snippet, languageId: lang.id });
              snippetsCount++;
          }
      }
    }

    if (snippetsCount > 0) {
        console.log(`Initialized ${snippetsCount} code snippets.`);
    }

  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}
