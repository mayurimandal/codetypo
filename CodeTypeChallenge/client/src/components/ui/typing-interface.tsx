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
      const activeLine = codeDisplayRef.current.querySelector('.active-line');
      if (activeLine) {
        activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [userInput]);

  // Auto-focus textarea when component mounts or activity changes
  useEffect(() => {
    if (isActive && !isComplete) {
      textareaRef.current?.focus();
    }
  }, [isActive, isComplete]);

  const renderCode = () => {
    const userInputLines = userInput.split('\n');
    const codeLines = code.split('\n');
    const currentLineIndex = userInputLines.length - 1;

    return codeLines.map((line, lineIndex) => {
      const isCurrentLine = lineIndex === currentLineIndex;
      let lineContent;

      if (lineIndex < currentLineIndex) {
        // Line has been fully typed
        lineContent = <span className="text-green-400">{line}</span>;
      } else if (isCurrentLine) {
        // This is the active typing line
        const typedPart = userInputLines[currentLineIndex];
        const untypedPart = line.substring(typedPart.length);
        lineContent = (
          <>
            {typedPart.split('').map((char, charIndex) => {
              const isCorrect = char === line[charIndex];
              return (
                <span key={charIndex} className={isCorrect ? 'text-green-400' : 'text-red-400 bg-red-500/30'}>
                  {line[charIndex] === ' ' ? '\u00A0' : line[charIndex]}
                </span>
              );
            })}
            <span className="bg-neon-cyan/50 animate-pulse">{untypedPart.charAt(0) || '\u00A0'}</span>
            <span className="text-gray-500">{untypedPart.substring(1)}</span>
          </>
        );
      } else {
        // Future lines
        lineContent = <span className="text-gray-500">{line}</span>;
      }

      return (
        <div key={lineIndex} className={isCurrentLine ? 'active-line' : ''}>
          {lineContent}
          {lineIndex < codeLines.length - 1 && '⏎\n'}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-dark-secondary/70 backdrop-blur-sm border-dark-accent">
        <CardContent className="p-6">
          <div 
            ref={codeDisplayRef}
            className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 max-h-[250px] overflow-y-auto"
            onClick={() => textareaRef.current?.focus()}
          >
            <pre className="font-mono text-base leading-relaxed whitespace-pre-wrap break-words">
              {renderCode()}
            </pre>
            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              disabled={isComplete}
              className="absolute top-0 left-0 w-full h-full p-4 bg-transparent text-transparent border-none resize-none focus:outline-none"
              style={{ caretColor: 'transparent' }}
              placeholder={isComplete ? "Test completed!" : "Start typing here..."}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
            />
          </div>
          
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
