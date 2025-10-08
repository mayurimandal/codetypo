import { useRef, useEffect } from "react";
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
  const codeDisplayRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll the code display as user types
  useEffect(() => {
    if (codeDisplayRef.current) {
      const currentCharSpan = codeDisplayRef.current.querySelector(`[data-index="${userInput.length}"]`);
      if (currentCharSpan) {
        currentCharSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [userInput.length]);

  // Auto-focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current && !isComplete) {
      textareaRef.current.focus();
    }
  }, [isComplete]);

  const renderCode = () => {
    return code.split('').map((char, index) => {
      let className = 'transition-all duration-150'; // Default
      
      if (index < userInput.length) {
        // Already typed - check if correct or incorrect
        if (userInput[index] === char) {
          className = 'text-green-400 bg-green-500/10'; // Correct
        } else {
          className = 'text-red-400 bg-red-500/30 font-bold'; // Incorrect
        }
      } else if (index === userInput.length) {
        className = 'text-white bg-neon-cyan/30 animate-pulse'; // Current cursor position
      } else {
        className = 'text-gray-500'; // Not yet typed
      }
      
      return (
        <span key={index} data-index={index} className={className}>
          {char === '\n' ? '⏎\n' : char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Combined Typing Interface */}
      <Card className="bg-dark-secondary/70 backdrop-blur-sm border-neon-cyan">
        <CardContent className="p-6">
          {/* Code Display with scrolling */}
          <div className="mb-4">
            <div className="text-sm mb-2 text-gray-400 font-mono flex justify-between items-center">
              <span>Type the code below:</span>
              <span className="text-xs">
                {userInput.length} / {code.length} characters
              </span>
            </div>
            <div 
              ref={codeDisplayRef}
              className="bg-gray-900/50 border-2 border-gray-700 rounded-lg p-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-neon-cyan scrollbar-track-gray-800"
            >
              <pre className="font-mono text-base leading-relaxed whitespace-pre-wrap break-words">
                {renderCode()}
              </pre>
            </div>
          </div>

          {/* Hidden Input Area - for actual typing */}
          <div>
            <div className="text-sm mb-2 text-gray-400 font-mono">
              Your typing area:
            </div>
            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              disabled={isComplete}
              className="w-full h-[120px] bg-gray-900 text-gray-100 border-2 border-gray-700 rounded-lg p-4 font-mono text-base leading-relaxed resize-none focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/50 disabled:opacity-50 placeholder-gray-500"
              placeholder={isComplete ? "Test completed!" : "Start typing here..."}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              style={{ caretColor: '#2dd4bf' }}
            />
          </div>
          
          {/* Stats Bar */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700 text-sm">
            <div className="flex space-x-6">
              <span className="text-gray-400">
                Progress: <span className="text-neon-cyan font-semibold">{Math.round((userInput.length / code.length) * 100)}%</span>
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
          className="border-dark-accent text-gray-300 hover:bg-neon-pink hover:text-dark-primary transition-all"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        
        <Button
          onClick={onNext}
          className="gradient-bg hover:scale-105 transition-transform shadow-lg"
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
              💡 <strong>Tip:</strong> The code display will scroll automatically as you type. Focus on the typing area below and match the code exactly!
            </p>
          </CardContent>
        </Card>
      )}

      {isComplete && (
        <Card className="bg-green-500/10 border-green-500">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-green-300">
              🎉 <strong>Great job!</strong> You've completed this challenge. Check your results and try the next one!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
