import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import TypingTest from "@/pages/typing-test";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login"; // <-- Import the new Login page

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show a simple loading state while checking authentication
    return <div className="min-h-screen w-full bg-dark-primary" />;
  }

  return (
    <Switch>
      {/* Landing/Home page based on auth state */}
      <Route path="/">
        {isAuthenticated ? <Home /> : <Landing />}
      </Route>

      {/* Publicly accessible pages */}
      <Route path="/login" component={Login} />
      <Route path="/test/:languageId?" component={TypingTest} />
      <Route path="/leaderboard" component={Leaderboard} />

      {/* Protected route: only for logged-in users */}
      <Route path="/profile">
        {isAuthenticated ? <Profile /> : <Redirect to="/login" />}
      </Route>
      
      {/* Catch-all for 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
