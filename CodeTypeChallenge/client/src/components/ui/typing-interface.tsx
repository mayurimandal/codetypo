import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/ui/navbar";
import TypingInterface from "@/components/ui/typing-interface";
import ResultsModal from "@/components/ui/results-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Clock, Zap, Target, AlertCircle } from "lucide-react";

interface TestState {
  currentText: string;
  userInput: string;
  startTime: number | null;
  isActive: boolean;
  isComplete: boolean;
  wpm: number;
  accuracy: number;
  errors: number;
  timeSpent: number;
  timeRemaining: number; // Time remaining in seconds
}

interface Snippet {
  id: string;
  languageId: string;
  code: string;
  difficulty: string;
  title: string;
}

const TEST_DURATION = 120; // 2 minutes in seconds

export default function TypingTest() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [testState, setTestState] = useState<TestState>({
    currentText: '',
    userInput: '',
    startTime: null,
    isActive: false,
    isComplete: false,
    wpm: 0,
    accuracy: 0,
    errors: 0,
    timeSpent: 0,
    timeRemaining: TEST_DURATION,
  });

  const [showResults, setShowResults] = useState(false);
  const [currentSnippet, setCurrentSnippet] = useState<Snippet | null>(null);

  const {
    data: snippet,
    refetch: fetchNewSnippet,
    isLoading: isSnippetLoading,
    isError: isSnippetError,
  } = useQuery<Snippet>({
    queryKey: ["/api/languages", params.languageId, "snippets/random"],
    enabled: !!params.languageId,
    staleTime: 60000,
  });

  const { data: languages } = useQuery({
    queryKey: ["/api/languages"],
  });

  const submitResult = useMutation({
    mutationFn: async (result: any) => {
      await apiRequest("POST", "/api/test-results", result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Your session expired. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save test result.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (snippet) {
      setCurrentSnippet(snippet);
      setTestState(prev => ({
        ...prev,
        currentText: snippet.code,
        userInput: '',
        startTime: null,
        isActive: false,
        isComplete: false,
        wpm: 0,
        accuracy: 0,
        errors: 0,
        timeSpent: 0,
        timeRemaining: TEST_DURATION,
      }));
    }
  }, [snippet]);

  const calculateStats = useCallback((input: string, text: string, timeElapsed: number) => {
    const wordsTyped = input.length / 5;
    const wpm = timeElapsed > 0 ? (wordsTyped / (timeElapsed / 60000)) : 0;

    let correctChars = 0;
    let errors = 0;

    for (let i = 0; i < input.length; i++) {
      if (i < text.length && input[i] === text[i]) {
        correctChars++;
      } else {
        errors++;
      }
    }

    const accuracy = input.length > 0 ? (correctChars / input.length) * 100 : 100;

    return { wpm: Math.round(wpm), accuracy: Math.round(accuracy * 10) / 10, errors };
  }, []);

  // Complete the test
  const completeTest = useCallback((finalInput: string, finalTime: number) => {
    const finalStats = calculateStats(finalInput, testState.currentText, finalTime);

    setTestState(prev => ({
      ...prev,
      isActive: false,
      isComplete: true,
      timeSpent: Math.round(finalTime / 1000),
      ...finalStats,
    }));

    if (currentSnippet && user) {
      submitResult.mutate({
        snippetId: currentSnippet.id,
        wpm: finalStats.wpm,
        accuracy: finalStats.accuracy,
        timeSpent: Math.round(finalTime / 1000),
        errors: finalStats.errors,
      });
    }

    setShowResults(true);
  }, [testState.currentText, currentSnippet, user, submitResult, calculateStats]);

  // Timer and stats update
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (testState.isActive && !testState.isComplete) {
      interval = setInterval(() => {
        setTestState(prev => {
          if (!prev.startTime) return prev;

          const timeElapsed = Date.now() - prev.startTime;
          const secondsElapsed = Math.round(timeElapsed / 1000);
          const timeRemaining = Math.max(0, TEST_DURATION - secondsElapsed);

          // Time's up!
          if (timeRemaining === 0 && !prev.isComplete) {
            completeTest(prev.userInput, timeElapsed);
            return {
              ...prev,
              timeRemaining: 0,
            };
          }

          if (secondsElapsed > prev.timeSpent) {
            const stats = calculateStats(prev.userInput, prev.currentText, timeElapsed);
            return {
              ...prev,
              timeSpent: secondsElapsed,
              timeRemaining,
              ...stats,
            };
          }
          return { ...prev, timeRemaining };
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testState.isActive, testState.isComplete, calculateStats, completeTest]);

  const handleInputChange = (value: string) => {
    const now = Date.now();
    const text = testState.currentText;

    if (testState.isComplete) return;

    // Start test on first character
    if (!testState.startTime && value.length > 0) {
      setTestState(prev => ({
        ...prev,
        startTime: now,
        isActive: true,
        userInput: value,
      }));
      return;
    } else if (!testState.startTime) {
      return;
    }

    // Check if test is complete (typed all characters)
    const isComplete = value.length >= text.length;
    const timeElapsed = testState.startTime ? now - testState.startTime : 0;
    const stats = calculateStats(value, text, timeElapsed);

    setTestState(prev => ({
      ...prev,
      userInput: value,
      isComplete,
      timeSpent: testState.startTime ? Math.round((now - testState.startTime) / 1000) : 0,
      ...stats,
    }));

    // Complete test if all text is typed
    if (isComplete && !testState.isComplete && testState.startTime) {
      completeTest(value, timeElapsed);
    }
  };

  const resetTest = () => {
    setShowResults(false);
    const newCode = currentSnippet?.code || '';

    setTestState(prev => ({
      ...prev,
      currentText: newCode,
      userInput: '',
      startTime: null,
      isActive: false,
      isComplete: false,
      wpm: 0,
      accuracy: 0,
      errors: 0,
      timeSpent: 0,
      timeRemaining: TEST_DURATION,
    }));
  };

  const nextSnippet = () => {
    fetchNewSnippet();
    setShowResults(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = useMemo(() => {
    return testState.currentText.length > 0
      ? (testState.userInput.length / testState.currentText.length) * 100
      : 0;
  }, [testState.currentText, testState.userInput.length]);

  // Determine timer color based on remaining time
  const getTimerColor = () => {
    if (testState.timeRemaining > 60) return 'text-green-400';
    if (testState.timeRemaining > 30) return 'text-yellow-400';
    return 'text-red-400 animate-pulse';
  };

  if (isSnippetLoading) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <Zap className="h-12 w-12 text-neon-cyan mx-auto mb-4 animate-pulse" />
              <h2 className="text-xl font-bold mb-2">Loading Challenge...</h2>
              <p className="text-gray-400">Fetching a new code snippet.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isReadyToRender = currentSnippet && params.languageId;

  if (!isReadyToRender || isSnippetError) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No Code Snippets Available</h2>
              <p className="text-gray-400 mb-4">
                {params.languageId
                  ? "No code snippets found for this language. Please try a different one."
                  : "Please select a language to start typing."}
              </p>
              <Button onClick={() => window.location.href = "/"}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <Navbar />

      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Test Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              {currentSnippet.title}
            </h2>
            <div className="flex justify-center items-center space-x-8 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Difficulty:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  currentSnippet.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                  currentSnippet.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {currentSnippet.difficulty}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className={`font-mono text-2xl font-bold ${getTimerColor()}`}>
                  {formatTime(testState.timeRemaining)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-gray-400" />
                <span className="neon-pink font-mono text-xl">
                  {testState.wpm} WPM
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-400" />
                <span className="neon-blue font-mono text-xl">
                  {testState.accuracy}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <Progress
              value={progress}
              className="w-full mb-6 h-2 bg-dark-accent"
            />
          </div>

          {/* Typing Interface */}
          <TypingInterface
            code={testState.currentText}
            userInput={testState.userInput}
            onInputChange={handleInputChange}
            isActive={testState.isActive}
            isComplete={testState.isComplete}
            errors={testState.errors}
            accuracy={testState.accuracy}
            onReset={resetTest}
            onNext={nextSnippet}
          />
        </div>
      </main>

      {/* Results Modal */}
      <ResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        results={{
          wpm: testState.wpm,
          accuracy: testState.accuracy,
          time: formatTime(testState.timeSpent),
          errors: testState.errors,
        }}
        onTryAgain={resetTest}
        onNextChallenge={nextSnippet}
      />
    </div>
  );
}
