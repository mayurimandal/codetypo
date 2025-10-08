import { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
      const cursor = codeDisplayRef.current.querySelector('.cursor');
      if (cursor) {
        cursor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [userInput]);

  // Auto-focus the textarea
  useEffect(() => {
    if (!isComplete) {
      textareaRef.current?.focus();
    }
  }, [isComplete, isActive, code]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault(); // Prevent default focus change

      const { selectionStart, selectionEnd, value } = e.currentTarget;
      const tabSpaces = '  '; // Using 2 spaces for a tab

      // Insert the spaces at the current cursor position
      const newValue = value.substring(0, selectionStart) + tabSpaces + value.substring(selectionEnd);
      
      onInputChange(newValue);
      
      // After the state updates, React moves the cursor to the end.
      // We need to manually set it back to the correct position after the inserted spaces.
      // A minimal timeout ensures this runs *after* React has re-rendered the component.
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPosition = selectionStart + tabSpaces.length;
          textareaRef.current.selectionStart = newCursorPosition;
          textareaRef.current.selectionEnd = newCursorPosition;
        }
      }, 0);
    }
  };

  const renderCode = () => {
    return code.split('').map((char, index) => {
      let className = 'text-yellow-400'; // Untyped text is yellow
      
      if (index < userInput.length) {
        // Already typed characters
        className = userInput[index] === char ? 'text-green-400' : 'text-red-400 bg-red-500/20';
      }
      
      // Add a cursor span at the current typing position
      if (index === userInput.length && isActive) {
        return (
          <span key="cursor" className="relative cursor">
            <span className='text-black bg-white rounded animate-pulse'>
              {char === '\n' ? '⏎' : char}
            </span>
          </span>
        );
      }
      
      return (
        <span key={index} data-index={index} className={className}>
          {char === '\n' ? '⏎\n' : char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-dark-secondary/70 backdrop-blur-sm border-dark-accent">
        <CardContent className="p-6">
          <div className="mb-4">
            <div 
              ref={codeDisplayRef}
              className="bg-gray-900/50 border-2 border-gray-700 rounded-lg p-4 max-h-[300px] overflow-y-auto"
              onClick={() => textareaRef.current?.focus()}
            >
              <pre className="font-mono text-base leading-relaxed whitespace-pre-wrap break-words">
                {renderCode()}
              </pre>
            </div>
          </div>

          <div>
            <div className="text-sm mb-2 text-gray-400 font-mono">
              Your typing area:
            </div>
            <Textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown} // <-- Add the key down handler here
              disabled={isComplete}
              className="w-full h-[120px] bg-gray-900 text-gray-100 border-2 border-gray-700 rounded-lg p-4 font-mono text-base leading-relaxed resize-none focus:outline-none focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/50 disabled:opacity-50"
              placeholder={isComplete ? "Test completed!" : "Start typing here..."}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              style={{ caretColor: '#2dd4bf' }}
            />
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700 text-sm">
            <div className="flex space-x-6">
              <span className="text-gray-400">
                Progress: <span className="text-neon-cyan font-semibold">{Math.round((userInput.length / (code.length || 1)) * 100)}%</span>
              </span>
              <span className="text-gray-400">
                Errors: <span className="text-red-400 font-semibold">{errors}</span>
              </span>
              <span className="text-gray-400">
                Accuracy: <span className="text-green-400 font-semibold">{accuracy.toFixed(1)}%</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

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
          className="gradient-bg hover:scale-105 transition-transform shadow-lg"
        >
          Next Snippet
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
