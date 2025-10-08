import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen gaming-bg flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">&lt;/&gt;</span>
            </div>
            <h1 className="text-4xl font-bold gradient-text">
              CodeType Pro
            </h1>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold mb-6 gradient-text">
            Master Your Code
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Level up your programming speed with real code snippets from popular languages. 
            Track your progress and compete with developers worldwide.
          </p>
          
          <Button 
            onClick={handleLogin}
            className="gradient-bg px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform shadow-lg glow-animation"
          >
            Start Your Journey
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-dark-secondary/50 backdrop-blur-sm border-dark-accent">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🏃‍♂️</div>
              <h3 className="text-xl font-semibold mb-2 neon-cyan">Speed Training</h3>
              <p className="text-gray-400">
                Practice with real code snippets and improve your typing speed with proper syntax
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-secondary/50 backdrop-blur-sm border-dark-accent">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2 neon-pink">Accuracy Focus</h3>
              <p className="text-gray-400">
                Build muscle memory for programming syntax and reduce errors in your code
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-secondary/50 backdrop-blur-sm border-dark-accent">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2 neon-blue">Global Competition</h3>
              <p className="text-gray-400">
                Compete with developers worldwide and climb the leaderboard rankings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Languages */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-6">Supported Languages</h3>
          <div className="flex justify-center items-center space-x-8 text-4xl">
            <span title="Python">🐍</span>
            <span title="JavaScript">⚡</span>
            <span title="Java">☕</span>
            <span title="C++">⚙️</span>
            <span title="HTML/CSS">🌐</span>
          </div>
        </div>

        <p className="text-gray-400">
          Join thousands of developers improving their coding speed
        </p>
      </div>
    </div>
  );
}
