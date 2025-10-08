import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/ui/navbar";
import LanguageSelector from "@/components/ui/language-selector";
import { Link } from "wouter";
import { TrendingUp, Target, BarChart3, Trophy } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  
  const { data: userStats } = useQuery({
    queryKey: ["/api/users", user?.id, "stats"],
    enabled: !!user?.id,
  });

  const { data: languages } = useQuery({
    queryKey: ["/api/languages"],
  });

  return (
    <div className="min-h-screen bg-dark-primary">
      <Navbar />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              Master Your Code
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Level up your programming speed with real code snippets from popular languages. 
              Track your progress and compete with developers worldwide.
            </p>
            <Link href="/test">
              <Button className="gradient-bg px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform shadow-lg">
                Start Typing Challenge
              </Button>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-dark-secondary/50 backdrop-blur-sm border-dark-accent hover:border-neon-cyan transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Average WPM</span>
                  <TrendingUp className="h-5 w-5 text-neon-cyan" />
                </div>
                <div className="text-3xl font-bold neon-cyan">
                  {userStats?.averageWpm?.toFixed(0) || '0'}
                </div>
                <div className="text-xs text-green-400">Track your speed</div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-secondary/50 backdrop-blur-sm border-dark-accent hover:border-neon-pink transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Accuracy</span>
                  <Target className="h-5 w-5 text-neon-pink" />
                </div>
                <div className="text-3xl font-bold neon-pink">
                  {userStats?.averageAccuracy?.toFixed(1) || '0'}%
                </div>
                <div className="text-xs text-green-400">Stay precise</div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-secondary/50 backdrop-blur-sm border-dark-accent hover:border-neon-blue transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Tests Completed</span>
                  <BarChart3 className="h-5 w-5 text-neon-blue" />
                </div>
                <div className="text-3xl font-bold neon-blue">
                  {userStats?.totalTests || 0}
                </div>
                <div className="text-xs text-green-400">Keep practicing</div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-secondary/50 backdrop-blur-sm border-dark-accent hover:border-yellow-400 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Global Rank</span>
                  <Trophy className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-yellow-400">
                  #{userStats?.globalRank || 'Unranked'}
                </div>
                <div className="text-xs text-green-400">Climb up!</div>
              </CardContent>
            </Card>
          </div>

          {/* Language Selection */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 text-center">Choose Your Language</h3>
            <LanguageSelector languages={languages || []} />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-dark-secondary/50 backdrop-blur-sm border-dark-accent">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Quick Practice</h3>
                <p className="text-gray-400 mb-4">
                  Jump into a random coding challenge to warm up your fingers
                </p>
                <Link href="/test">
                  <Button className="w-full gradient-bg">
                    Random Challenge
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-secondary/50 backdrop-blur-sm border-dark-accent">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">View Progress</h3>
                <p className="text-gray-400 mb-4">
                  Check your detailed statistics and performance history
                </p>
                <Link href="/profile">
                  <Button variant="outline" className="w-full border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-dark-primary">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
