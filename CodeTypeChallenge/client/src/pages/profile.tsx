import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/ui/navbar";
import { Trophy, Target, Zap, Calendar, TrendingUp } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  
  const { data: userStats } = useQuery({
    queryKey: ["/api/users", user?.id, "stats"],
    enabled: !!user?.id,
  });

  const { data: testResults } = useQuery({
    queryKey: ["/api/users", user?.id, "test-results"],
    enabled: !!user?.id,
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/users", user?.id, "achievements"],
    enabled: !!user?.id,
  });

  const { data: proficiency } = useQuery({
    queryKey: ["/api/users", user?.id, "proficiency"],
    enabled: !!user?.id,
  });

  const { data: languages } = useQuery({
    queryKey: ["/api/languages"],
  });

  // Create language proficiency map
  const languageMap = languages?.reduce((acc: any, lang: any) => {
    acc[lang.id] = lang;
    return acc;
  }, {}) || {};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProficiencyLevel = (avgWpm: number) => {
    if (avgWpm >= 80) return { level: 'Advanced', color: 'neon-cyan', percentage: 85 };
    if (avgWpm >= 50) return { level: 'Intermediate', color: 'text-yellow-400', percentage: 70 };
    return { level: 'Beginner', color: 'text-orange-400', percentage: 45 };
  };

  return (
    <div className="min-h-screen bg-dark-primary">
      <Navbar />
      
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="bg-dark-secondary/50 backdrop-blur-sm border border-dark-accent">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-2xl">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold">{user?.username}</h2>
                    <p className="text-gray-400">
                      Member since {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                    </p>
                  </div>
                  
                  {/* Achievements */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Achievements</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-3 bg-dark-accent/50 rounded-lg">
                        <div className="text-2xl mb-1">🏆</div>
                        <div className="text-xs text-gray-400">Speed Demon</div>
                      </div>
                      <div className="text-center p-3 bg-dark-accent/50 rounded-lg">
                        <div className="text-2xl mb-1">🎯</div>
                        <div className="text-xs text-gray-400">Accuracy Pro</div>
                      </div>
                      <div className="text-center p-3 bg-dark-accent/50 rounded-lg">
                        <div className="text-2xl mb-1">📈</div>
                        <div className="text-xs text-gray-400">Consistent</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Language Proficiency */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Language Proficiency</h3>
                    <div className="space-y-3">
                      {proficiency?.slice(0, 3).map((prof: any) => {
                        const language = languageMap[prof.languageId];
                        const profLevel = getProficiencyLevel(prof.averageWpm);
                        
                        return (
                          <div key={prof.id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{language?.displayName || 'Unknown'}</span>
                              <span className={profLevel.color}>{profLevel.level}</span>
                            </div>
                            <Progress value={profLevel.percentage} className="h-2" />
                          </div>
                        );
                      })}
                      
                      {(!proficiency || proficiency.length === 0) && (
                        <p className="text-gray-400 text-sm">
                          Complete some typing tests to see your language proficiency
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Statistics & History */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-dark-secondary/50 backdrop-blur-sm border border-dark-accent">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 neon-cyan mx-auto mb-2" />
                    <div className="text-2xl font-bold neon-cyan">
                      {userStats?.averageWpm?.toFixed(0) || '0'}
                    </div>
                    <div className="text-xs text-gray-400">Avg WPM</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-secondary/50 backdrop-blur-sm border border-dark-accent">
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 neon-pink mx-auto mb-2" />
                    <div className="text-2xl font-bold neon-pink">
                      {userStats?.averageAccuracy?.toFixed(1) || '0'}%
                    </div>
                    <div className="text-xs text-gray-400">Accuracy</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-secondary/50 backdrop-blur-sm border border-dark-accent">
                  <CardContent className="p-4 text-center">
                    <Zap className="h-8 w-8 neon-blue mx-auto mb-2" />
                    <div className="text-2xl font-bold neon-blue">
                      {userStats?.bestWpm?.toFixed(0) || '0'}
                    </div>
                    <div className="text-xs text-gray-400">Best WPM</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-secondary/50 backdrop-blur-sm border border-dark-accent">
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-400">
                      #{userStats?.globalRank || 'Unranked'}
                    </div>
                    <div className="text-xs text-gray-400">Global Rank</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Performance Chart Placeholder */}
              <Card className="bg-dark-secondary/50 backdrop-blur-sm border border-dark-accent">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Performance Over Time</h3>
                  <div className="h-64 bg-dark-accent/30 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">Performance chart coming soon</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Tests */}
              <Card className="bg-dark-secondary/50 backdrop-blur-sm border border-dark-accent">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Recent Test History</h3>
                  <div className="space-y-4">
                    {testResults?.slice(0, 5).map((test: any) => (
                      <div key={test.id} className="flex items-center justify-between p-4 bg-dark-accent/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {languages?.find((l: any) => l.id === test.languageId)?.icon || '💻'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold">Coding Challenge</h4>
                            <p className="text-sm text-gray-400">
                              {test.completedAt ? formatDate(test.completedAt) : 'Unknown'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold neon-cyan">{Math.round(test.wpm)} WPM</p>
                          <p className="text-sm text-gray-400">{test.accuracy?.toFixed(1)}% accuracy</p>
                        </div>
                      </div>
                    ))}
                    
                    {(!testResults || testResults.length === 0) && (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No test history yet</p>
                        <p className="text-sm text-gray-500">Complete your first typing test to see results here</p>
                      </div>
                    )}
                  </div>
                  
                  {testResults && testResults.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 border-dark-accent hover:bg-neon-cyan hover:text-dark-primary"
                    >
                      View All History
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
