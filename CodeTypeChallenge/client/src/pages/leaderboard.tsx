import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/ui/navbar";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

export default function Leaderboard() {
  const { user } = useAuth();
  
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/users", user?.id, "stats"],
    enabled: !!user?.id,
  });

  const topThree = leaderboard?.slice(0, 3) || [];
  const otherRanks = leaderboard?.slice(3) || [];
  
  const currentUserRank = leaderboard?.findIndex(entry => entry.userId === user?.id) + 1 || 0;
  const currentUserEntry = leaderboard?.find(entry => entry.userId === user?.id);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 2: return <Medal className="h-8 w-8 text-gray-400" />;
      case 3: return <Award className="h-8 w-8 text-orange-500" />;
      default: return <span className="text-2xl font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1: return "h-32";
      case 2: return "h-24";
      case 3: return "h-20";
      default: return "h-16";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <Navbar />
      
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Global Leaderboard</h2>
            <p className="text-gray-400">Compete with the fastest coders worldwide</p>
          </div>

          {/* Leaderboard Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button className="bg-neon-pink hover:bg-neon-pink/80">All Languages</Button>
            <Button variant="outline" className="border-dark-accent text-gray-300 hover:bg-neon-cyan hover:text-dark-primary">Python</Button>
            <Button variant="outline" className="border-dark-accent text-gray-300 hover:bg-neon-cyan hover:text-dark-primary">JavaScript</Button>
            <Button variant="outline" className="border-dark-accent text-gray-300 hover:bg-neon-cyan hover:text-dark-primary">Java</Button>
            <Button variant="outline" className="border-dark-accent text-gray-300 hover:bg-neon-cyan hover:text-dark-primary">This Week</Button>
          </div>

          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Second Place */}
              {topThree[1] && (
                <div className="order-2 md:order-1">
                  <Card className="bg-dark-secondary/50 backdrop-blur-sm border-gray-500 text-center">
                    <CardContent className="p-6">
                      <div className="mb-4 flex justify-center">
                        <Medal className="h-12 w-12 text-gray-400" />
                      </div>
                      <Avatar className="w-16 h-16 mx-auto mb-3">
                        <AvatarImage src={topThree[1].user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {topThree[1].user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg">{topThree[1].user.username}</h3>
                      <p className="neon-cyan text-2xl font-bold">{Math.round(topThree[1].averageWpm)} WPM</p>
                      <p className="text-gray-400 text-sm">{topThree[1].averageAccuracy?.toFixed(1)}% accuracy</p>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* First Place */}
              {topThree[0] && (
                <div className="order-1 md:order-2">
                  <Card className="bg-dark-secondary/50 backdrop-blur-sm border border-yellow-400 text-center transform scale-105">
                    <CardContent className="p-6">
                      <div className="mb-4 flex justify-center">
                        <Trophy className="h-16 w-16 text-yellow-400" />
                      </div>
                      <Avatar className="w-20 h-20 mx-auto mb-3">
                        <AvatarImage src={topThree[0].user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {topThree[0].user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-xl text-yellow-400">{topThree[0].user.username}</h3>
                      <p className="neon-pink text-3xl font-bold">{Math.round(topThree[0].averageWpm)} WPM</p>
                      <p className="text-gray-400 text-sm">{topThree[0].averageAccuracy?.toFixed(1)}% accuracy</p>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Third Place */}
              {topThree[2] && (
                <div className="order-3">
                  <Card className="bg-dark-secondary/50 backdrop-blur-sm border border-orange-400 text-center">
                    <CardContent className="p-6">
                      <div className="mb-4 flex justify-center">
                        <Award className="h-12 w-12 text-orange-400" />
                      </div>
                      <Avatar className="w-16 h-16 mx-auto mb-3">
                        <AvatarImage src={topThree[2].user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {topThree[2].user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg">{topThree[2].user.username}</h3>
                      <p className="neon-cyan text-2xl font-bold">{Math.round(topThree[2].averageWpm)} WPM</p>
                      <p className="text-gray-400 text-sm">{topThree[2].averageAccuracy?.toFixed(1)}% accuracy</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Full Leaderboard */}
          <Card className="bg-dark-secondary/50 backdrop-blur-sm border border-dark-accent overflow-hidden">
            <div className="px-6 py-4 bg-dark-accent">
              <h3 className="text-xl font-bold">All Rankings</h3>
            </div>
            
            <div className="divide-y divide-dark-accent">
              {otherRanks.map((entry, index) => {
                const rank = index + 4;
                const isCurrentUser = entry.userId === user?.id;
                
                return (
                  <div 
                    key={entry.userId}
                    className={`px-6 py-4 flex items-center justify-between hover:bg-dark-accent/30 transition-colors ${
                      isCurrentUser ? 'bg-dark-accent/50 border-l-4 border-neon-pink' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`text-2xl font-bold w-8 ${isCurrentUser ? 'neon-pink' : 'text-gray-400'}`}>
                        #{rank}
                      </span>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={entry.user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {entry.user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className={`font-semibold ${isCurrentUser ? 'neon-pink' : ''}`}>
                          {entry.user.username} {isCurrentUser && '(You)'}
                        </h4>
                        <p className="text-sm text-gray-400">Active recently</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-xl font-bold ${isCurrentUser ? 'neon-pink' : 'neon-cyan'}`}>
                        {Math.round(entry.averageWpm)} WPM
                      </p>
                      <p className="text-sm text-gray-400">{entry.averageAccuracy?.toFixed(1)}% accuracy</p>
                    </div>
                  </div>
                );
              })}
              
              {/* Show current user if not in top results */}
              {currentUserRank > 10 && currentUserEntry && (
                <>
                  <div className="px-6 py-2 text-center text-gray-500">
                    <span>...</span>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between bg-dark-accent/50 border-l-4 border-neon-pink">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold neon-pink w-8">#{currentUserRank}</span>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user?.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold neon-pink">{user?.username} (You)</h4>
                        <p className="text-sm text-gray-400">Active now</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold neon-pink">
                        {Math.round(currentUserEntry.averageWpm)} WPM
                      </p>
                      <p className="text-sm text-gray-400">{currentUserEntry.averageAccuracy?.toFixed(1)}% accuracy</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
