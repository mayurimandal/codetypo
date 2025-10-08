import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, ArrowRight } from "lucide-react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showCursor, setShowCursor] = useState(true);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Focus textarea when component mounts or resets
  useEffect(() => {
    if (textareaRef.current && !isComplete) {
      textareaRef.current.focus();
    }
  }, [isComplete, code]);

  // Render code with syntax highlighting
  const renderCodeWithHighlight = () => {
    const lines = code.split('\n');
    
    return lines.map((line, lineIndex) => {
      const lineStartIndex = lines.slice(0, lineIndex).reduce((acc, l) => acc + l.length + 1, 0);
      const lineEndIndex = lineStartIndex + line.length;
      
      let renderedLine = '';
      
      for (let i = 0; i < line.length; i++) {
        const globalIndex = lineStartIndex + i;
        const char = line[i];
        const userChar = userInput[globalIndex];
        
        let className = '';
        
        if (globalIndex < userInput.length) {
          // Character has been typed
          if (userChar === char) {
            className = 'text-green-400 bg-green-400/20';
          } else {
            className = 'text-red-400 bg-red-400/20';
          }
        } else if (globalIndex === userInput.length && isActive) {
          // Current cursor position
          className = `bg-neon-cyan/50 ${showCursor ? 'text-white' : 'text-gray-300'}`;
        } else {
          // Not yet typed
          className = 'text-gray-400';
        }
        
        renderedLine += `<span class="${className}">${char === ' ' ? '&nbsp;' : char}</span>`;
      }
      
      return (
        <div key={lineIndex} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: renderedLine }} />
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Code Display */}
      <Card className="code-highlight border border-dark-accent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Type this code:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              className="text-sm neon-cyan hover:text-neon-pink transition-colors"
            >
              Next Snippet <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="font-mono text-lg">
            {renderCodeWithHighlight()}
          </div>
        </CardContent>
      </Card>

      {/* Typing Input */}
      <Card className="bg-dark-secondary/50 backdrop-blur-sm border border-dark-accent">
        <CardContent className="p-6">
          <div className="mb-2">
            <label className="block text-sm text-gray-400 mb-2">Your Code:</label>
          </div>
          
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              className="w-full h-40 bg-dark-primary border border-dark-accent rounded-lg p-4 font-mono text-lg focus:outline-none focus:border-neon-cyan resize-none"
              placeholder={isComplete ? "Test completed!" : "Start typing the code above..."}
              disabled={isComplete}
              spellCheck={false}
            />
          </div>
          
          {/* Live Stats */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="flex space-x-6">
              <span className="text-gray-400">
                Characters: <span className="text-white">{userInput.length}/{code.length}</span>
              </span>
              <span className="text-gray-400">
                Accuracy: <span className="text-green-400">{accuracy.toFixed(1)}%</span>
              </span>
              <span className="text-gray-400">
                Errors: <span className="text-red-400">{errors}</span>
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
