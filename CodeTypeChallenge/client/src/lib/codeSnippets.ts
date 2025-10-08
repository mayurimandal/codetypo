// Default code snippets for each language
export const defaultSnippets = {
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

export const getLanguageIcon = (languageName: string): string => {
  const icons: Record<string, string> = {
    python: '🐍',
    javascript: '⚡',
    java: '☕',
    cpp: '⚙️',
    html: '🌐',
  };
  return icons[languageName] || '💻';
};
