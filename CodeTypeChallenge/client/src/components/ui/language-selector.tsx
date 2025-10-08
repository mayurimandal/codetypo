import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

interface Language {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  snippetCount: number;
}

interface LanguageSelectorProps {
  languages: Language[];
}

export default function LanguageSelector({ languages }: LanguageSelectorProps) {
  const getLanguageColor = (name: string) => {
    switch (name) {
      case 'python': return 'hover:border-neon-cyan';
      case 'javascript': return 'hover:border-yellow-400';
      case 'java': return 'hover:border-red-400';
      case 'cpp': return 'hover:border-blue-400';
      case 'html': return 'hover:border-orange-400';
      default: return 'hover:border-neon-cyan';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {languages.map((language) => (
        <Link key={language.id} href={`/test/${language.id}`}>
          <div className="group cursor-pointer">
            <Card className={`bg-dark-secondary/50 backdrop-blur-sm border border-dark-accent ${getLanguageColor(language.name)} transition-all group-hover:scale-105`}>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">{language.icon}</div>
                  <div className="font-semibold">{language.displayName}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {language.snippetCount || 0} snippets
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Link>
      ))}
      
      {languages.length === 0 && (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-400">No languages available yet</p>
        </div>
      )}
    </div>
  );
}
