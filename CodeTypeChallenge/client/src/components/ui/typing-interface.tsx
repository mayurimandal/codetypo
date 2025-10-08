import { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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

  // Auto-focus textarea when component mounts or activity changes
  useEffect(() => {
    if (isActive && !isComplete) {
        textareaRef.current?.focus();
    } else if (!isComplete) {
        textareaRef.current?.focus();
    }
  }, [isActive, isComplete]);

  const renderCode = () => {
    return code.split('').map((char, index) => {
      let className = 'transition-colors duration-150'; // Default
      
      if (index < userInput.length) {
        // Already typed - check if correct or incorrect
        if (userInput[index] === char) {
          className = 'text-green-400'; // Correct
        } else {
          className = 'text-red-400 bg-red-500/20'; // Incorrect
        }
      } else if (index === userInput.length && isActive) {
        className = 'text-black bg-neon-cyan/80 rounded animate-pulse'; // Current cursor position
      } else {
        className = 'text-gray-500'; // Not yet typed
      }
      
      return (
        <span key={index} data-index={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-dark-secondary/70 backdrop-blur-sm border-dark-accent overflow-hidden">
        <CardContent className="p-6 relative">
          <div 
            ref={codeDisplayRef}
            className="bg-dark-primary border border-gray-700 rounded-lg p-4 max-h-[250px] overflow-y-auto mb-4"
            onClick={() => textareaRef.current?.focus()}
          >
            <pre className="font-mono text-lg leading-relaxed whitespace-pre-wrap break-words">
              {renderCode()}
            </pre>
          </div>

          {/* This textarea is now completely invisible and just captures input */}
          <Textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={isComplete}
            className="absolute top-0 left-0 w-full h-full p-4 bg-transparent border-none resize-none focus:outline-none"
            style={{ caretColor: 'transparent', color: 'transparent' }}
            placeholder=""
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
          />
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700 text-sm">
            <div className="flex space-x-6">
              <span className="text-gray-400">
                Errors: <span className="text-red-400 font-semibold">{errors}</span>
              </span>
              <span className="text-gray-400">
                Accuracy: <span className="text-green-400 font-semibold">{accuracy.toFixed(1)}%</span>
              </span>
            </div>
            <div className="flex space-x-4">
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
                className="gradient-bg hover:scale-105 transition-transform shadow-lg"
              >
                Next Snippet
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
