import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowRight } from "lucide-react";

interface TypingInterfaceProps {
  code: string;
  userInput: string;
  onInputChange: (value: string) => void;
  isActive: boolean;
  isComplete: boolean;
  errors: number;
  accuracy: number;
  onReset: () => void;
  onNext: () => void;
}

export default function TypingInterface({
  code,
  userInput,
  onInputChange,
  isActive,
  isComplete,
  errors,
  accuracy,
  onReset,
  onNext,
}: TypingInterfaceProps) {
  const renderCode = () => {
    return code.split('').map((char, index) => {
      let className = 'text-gray-400'; // Default: not yet typed
      
      if (index < userInput.length) {
        // Already typed - check if correct or incorrect
        if (userInput[index] === char) {
          className = 'text-green-400'; // Correct
        } else {
          className = 'text-red-400 bg-red-500/20'; // Incorrect
        }
      } else if (index === userInput.length) {
        className = 'text-gray-400 bg-blue-500/20 border-l-2 border-neon-cyan'; // Current cursor position
      }
      
      return (
        <span key={index} className={className}>
          {char === '\n' ? '⏎\n' : char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Code Display */}
      <Card className="bg-dark-secondary/70 backdrop-blur-sm border-dark-accent">
        <CardContent className="p-6">
          <div className="text-sm mb-2 text-gray-500 font-mono">
            Type this code:
          </div>
          <pre className="font-mono text-base leading-relaxed whitespace-pre-wrap break-words">
            {renderCode()}
          </pre>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card className="bg-dark-secondary/70 backdrop-blur-sm border-neon-cyan">
        <CardContent className="p-6">
          <div className="text-sm mb-2 text-gray-500 font-mono">
            Your Code:
          </div>
          <textarea
            value={userInput}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={isComplete}
            className="w-full min-h-[200px] bg-dark-accent/50 text-white border border-dark-accent rounded-lg p-4 font-mono text-base leading-relaxed resize-none focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/50 disabled:opacity-50"
            placeholder={isComplete ? "Test completed!" : "Start typing here..."}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
          />
          
          {/* Stats Bar */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="flex space-x-6">
              <span className="text-gray-400">
                Characters: <span className="text-white font-semibold">{userInput.length}</span> / {code.length}
              </span>
              <span className="text-gray-400">
                Errors: <span className="text-red-400 font-semibold">{errors}</span>
              </span>
              <span className="text-gray-400">
                Accuracy: <span className="text-green-400 font-semibold">{accuracy}%</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={onReset}
          variant="outline"
          className="border-dark-accent text-gray-300 hover:bg-neon-pink hover:text-dark-primary"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        
        <Button
          onClick={onNext}
          className="gradient-bg hover:scale-105 transition-transform"
        >
          Next Snippet
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Instructions */}
      {!isActive && !isComplete && (
        <Card className="bg-blue-500/10 border-neon-blue">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-blue-300">
              💡 <strong>Tip:</strong> Start typing in the input area to begin the test. Match the code exactly, including spaces and punctuation!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
