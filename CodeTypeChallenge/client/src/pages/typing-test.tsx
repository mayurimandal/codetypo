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
  timeRemaining: number;
}

interface Snippet {
  id: string;
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
    accuracy: 100,
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
  } = useQuery<Snippet>({
    queryKey: ["/api/languages", params.languageId, "snippets/random"],
    enabled: !!params.languageId,
    staleTime: 60000,
  });

  const submitResult = useMutation({
    mutationFn: (result: any) => apiRequest("POST", "/api/test-results", result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Your session expired.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to save test result.", variant: "destructive" });
      }
    },
  });
  
  const completeTest = useCallback(() => {
    setTestState(prev => {
      if (prev.isComplete || !prev.startTime) return prev;
      
      const timeElapsed = Date.now() - prev.startTime;
      const finalStats = calculateStats(prev.userInput, prev.currentText, timeElapsed);

      if (currentSnippet && user) {
        submitResult.mutate({
          snippetId: currentSnippet.id,
          wpm: finalStats.wpm,
          accuracy: finalStats.accuracy,
          timeSpent: Math.round(timeElapsed / 1000),
          errors: finalStats.errors,
        });
      }
      setShowResults(true);

      return { ...prev, isActive: false, isComplete: true, ...finalStats };
    });
  }, [currentSnippet, user, submitResult]);

  const resetTest = useCallback((newCode?: string) => {
    setShowResults(false);
    const codeToUse = newCode ?? currentSnippet?.code ?? '';
    setTestState({
      currentText: codeToUse,
      userInput: '',
      startTime: null,
      isActive: false,
      isComplete: false,
      wpm: 0,
      accuracy: 100,
      errors: 0,
      timeSpent: 0,
      timeRemaining: TEST_DURATION,
    });
  }, [currentSnippet]);

  useEffect(() => {
    if (snippet) {
      setCurrentSnippet(snippet);
      resetTest(snippet.code);
    }
  }, [snippet, resetTest]);

  const calculateStats = useCallback((input: string, text: string, timeElapsedMs: number) => {
    const wordsTyped = input.length / 5;
    const wpm = timeElapsedMs > 0 ? (wordsTyped / (timeElapsedMs / 60000)) : 0;
    let errors = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] !== text[i]) {
        errors++;
      }
    }
    const accuracy = input.length > 0 ? ((input.length - errors) / input.length) * 100 : 100;
    return { wpm: Math.round(wpm), accuracy: Math.max(0, accuracy), errors };
  }, []);

  useEffect(() => {
    if (!testState.isActive || testState.isComplete) return;

    const timer = setInterval(() => {
      const secondsElapsed = testState.startTime ? Math.round((Date.now() - testState.startTime) / 1000) : 0;
      const timeRemaining = Math.max(0, TEST_DURATION - secondsElapsed);
      
      if (timeRemaining === 0) {
        completeTest();
      }
      
      const stats = calculateStats(testState.userInput, testState.currentText, secondsElapsed * 1000);
      setTestState(prev => ({ ...prev, timeRemaining, timeSpent: secondsElapsed, ...stats }));
    }, 1000);

    return () => clearInterval(timer);
  }, [testState.isActive, testState.isComplete, testState.startTime, testState.userInput, testState.currentText, calculateStats, completeTest]);

  const handleInputChange = (value: string) => {
    if (testState.isComplete) return;

    if (!testState.isActive && value.length > 0) {
      setTestState(prev => ({ ...prev, isActive: true, startTime: Date.now(), userInput: value }));
    } else if (testState.isActive) {
      setTestState(prev => ({ ...prev, userInput: value }));
      if (value.length >= testState.currentText.length) {
        completeTest();
      }
    }
  };

  const nextSnippet = () => fetchNewSnippet();
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  const progress = useMemo(() => testState.currentText.length > 0 ? (testState.userInput.length / testState.currentText.length) * 100 : 0, [testState.currentText.length, testState.userInput.length]);
  const getTimerColor = () => testState.timeRemaining < 10 ? 'text-red-400 animate-pulse' : testState.timeRemaining < 60 ? 'text-yellow-400' : 'neon-cyan';

  if (isSnippetLoading) return <div className="min-h-screen bg-dark-primary flex items-center justify-center text-white">Loading...</div>;
  if (!currentSnippet) return <div className="min-h-screen bg-dark-primary flex items-center justify-center text-white">No snippet found.</div>;

  return (
    <div className="min-h-screen bg-dark-primary">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">{currentSnippet.title}</h2>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 mb-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className={`font-mono text-2xl font-bold ${getTimerColor()}`}>{formatTime(testState.timeRemaining)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-gray-400" />
                <span className="neon-pink font-mono text-xl">{testState.wpm} WPM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-400" />
                <span className="neon-blue font-mono text-xl">{testState.accuracy.toFixed(1)}%</span>
              </div>
            </div>
            <Progress value={progress} className="w-full mb-6 h-2 bg-dark-accent" />
          </div>

          <TypingInterface
            code={testState.currentText}
            userInput={testState.userInput}
            onInputChange={handleInputChange}
            isActive={testState.isActive}
            isComplete={testState.isComplete}
            errors={testState.errors}
            accuracy={testState.accuracy}
            onReset={() => resetTest()}
            onNext={nextSnippet}
          />
        </div>
      </main>

      <ResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        results={{
          wpm: testState.wpm,
          accuracy: testState.accuracy,
          time: formatTime(testState.timeSpent),
          errors: testState.errors,
        }}
        onTryAgain={() => resetTest()}
        onNextChallenge={nextSnippet}
      />
    </div>
  );
}
