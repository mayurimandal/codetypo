import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Basic keywords for rudimentary highlighting across all languages
const KEYWORDS = new Set([
  "def", "import", "return", "if", "elif", "else", "while", "for", "in", "range", 
  "const", "let", "var", "function", "async", "await", "try", "catch", "new", 
  "class", "public", "private", "void", "String", "int", "float", "this", "#include",
  "java", "static", "final", "System", "out", "print", "console", "log", "export",
  "interface", "type", "true", "false", "null", "undefined", "continue", "break"
]);

const isWordChar = (char: string) => /[a-zA-Z0-9_]/.test(char);

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
  const codeDisplayRef = useRef<HTMLDivElement>(null);
  const [showCursor, setShowCursor] = useState(true);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Focus textarea when component mounts or resets
  useEffect(() => {
    if (textareaRef.current && !isComplete) {
      textareaRef.current.focus();
    }
  }, [isComplete, code]);

  // Determine current line index for scrolling
  const currentLineIndex = userInput.split('\n').length - 1;

  // Auto-scroll logic for code display to keep current line visible
  useEffect(() => {
    if (codeDisplayRef.current) {
      const lines = codeDisplayRef.current.children;
      if (currentLineIndex >= 0 && currentLineIndex < lines.length) {
        const targetLine = lines[currentLineIndex] as HTMLElement;
        const container = codeDisplayRef.current;
        
        const containerHeight = container.offsetHeight;
        const lineOffset = containerHeight / 3;

        if (targetLine.offsetTop > container.scrollTop + containerHeight - lineOffset) {
             container.scrollTop = targetLine.offsetTop - containerHeight + lineOffset;
        } 
        else if (targetLine.offsetTop < container.scrollTop + lineOffset) {
             container.scrollTop = targetLine.offsetTop - lineOffset;
        }
      }
    }
  }, [userInput, currentLineIndex]);


  // Render code with syntax highlighting
  const renderCodeWithHighlight = () => {
    const lines = code.split('\n');
    let globalIndex = 0;
    let inString = false;
    
    return lines.map((line, lineIndex) => {
      let renderedLine = '';
      let isLineComment = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        let syntaxClassName = '';
        
        // FIX: Moved variable declarations to the top of the loop's scope
        let word = '';
        let endOfWord = i;
        
        const remainingLine = line.substring(i);
        
        if (remainingLine.startsWith('//') || remainingLine.startsWith('#')) {
            isLineComment = true;
        }

        if (isLineComment) {
            syntaxClassName = 'syntax-comment';
            inString = false;
        } 
        
        else if (char === '"' || char === "'") { 
            if (i === 0 || line[i - 1] !== '\\') {
                inString = !inString;
            }
            syntaxClassName = 'syntax-string';
        } else if (inString) {
            syntaxClassName = 'syntax-string';
        }
        
        else if (isWordChar(char)) {
            while (endOfWord < line.length && isWordChar(line[endOfWord])) {
                word += line[endOfWord];
                endOfWord++;
            }
            
            if ((i === 0 || !isWordChar(line[i - 1])) && word.length > 0) {
                if (KEYWORDS.has(word)) {
                    syntaxClassName = 'syntax-keyword';
                } else if (!isNaN(Number(word))) { 
                    syntaxClassName = 'syntax-number';
                } else {
                    let nextCharIndex = endOfWord;
                    while (nextCharIndex < line.length && line[nextCharIndex] === ' ') {
                        nextCharIndex++;
                    }
                    if (line[nextCharIndex] === '(') { 
                        syntaxClassName = 'syntax-function';
                    }
                }
            }
        }

        let finalClassName = '';

        if (globalIndex < userInput.length) {
          const userChar = userInput[globalIndex];
          finalClassName = userChar === char ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20';
        } else if (globalIndex === userInput.length && isActive && !isComplete) {
          finalClassName = cn(`bg-neon-cyan/50 ${showCursor ? 'text-white' : 'text-gray-300'}`);
        } else {
          finalClassName = syntaxClassName || 'text-gray-400';
        }
        
        renderedLine += `<span class="${finalClassName}">${char === ' ' ? '&nbsp;' : char}</span>`;
        
        if (syntaxClassName && (syntaxClassName === 'syntax-keyword' || syntaxClassName === 'syntax-number' || syntaxClassName === 'syntax-function')) {
            const wordLength = word.length;
            if (wordLength > 1 && i === endOfWord - wordLength) {
                i += wordLength - 1;
                globalIndex += wordLength - 1;
                
                syntaxClassName = '';
                word = '';
            } else {
                globalIndex++;
            }
        } else {
            globalIndex++;
        }
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
          
          <div ref={codeDisplayRef} className="font-mono text-lg max-h-64 overflow-y-auto">
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
              className="w-full h-20 bg-dark-primary border border-dark-accent rounded-lg p-4 font-mono text-lg focus:outline-none focus:border-neon-cyan resize-none"
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
