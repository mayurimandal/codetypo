import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, Clock, AlertTriangle } from "lucide-react";

interface TestResults {
  wpm: number;
  accuracy: number;
  time: string;
  errors: number;
}

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: TestResults;
  onTryAgain: () => void;
  onNextChallenge: () => void;
}

export default function ResultsModal({
  isOpen,
  onClose,
  results,
  onTryAgain,
  onNextChallenge,
}: ResultsModalProps) {
  const getPerformanceMessage = (wpm: number, accuracy: number) => {
    if (wpm >= 100 && accuracy >= 95) return "🎉 Outstanding Performance!";
    if (wpm >= 80 && accuracy >= 90) return "🚀 Excellent Work!";
    if (wpm >= 60 && accuracy >= 85) return "👏 Great Job!";
    if (wpm >= 40 && accuracy >= 80) return "👍 Good Progress!";
    return "💪 Keep Practicing!";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-secondary border border-dark-accent max-w-md w-full mx-4">
        <DialogHeader>
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <DialogTitle className="text-3xl font-bold mb-2">Test Complete!</DialogTitle>
            <p className="text-gray-400 mb-6">
              {getPerformanceMessage(results.wpm, results.accuracy)}
            </p>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-dark-accent/50">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 neon-cyan mx-auto mb-2" />
              <div className="text-2xl font-bold neon-cyan">{results.wpm}</div>
              <div className="text-sm text-gray-400">WPM</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-accent/50">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 neon-pink mx-auto mb-2" />
              <div className="text-2xl font-bold neon-pink">{results.accuracy}%</div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-accent/50">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">{results.time}</div>
              <div className="text-sm text-gray-400">Time</div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-accent/50">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-400">{results.errors}</div>
              <div className="text-sm text-gray-400">Errors</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={onTryAgain}
            className="flex-1 bg-neon-cyan text-black hover:bg-neon-cyan/80 font-semibold"
          >
            Try Again
          </Button>
          <Button
            onClick={onNextChallenge}
            variant="outline"
            className="flex-1 border-dark-accent text-white hover:bg-dark-accent/80 font-semibold"
          >
            Next Challenge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
