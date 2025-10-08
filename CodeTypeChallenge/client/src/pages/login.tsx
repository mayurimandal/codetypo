import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";

export default function Login() {
  const handleLogin = () => {
    // This redirects to the existing mock login endpoint
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen gaming-bg flex items-center justify-center">
      <Card className="w-full max-w-sm mx-4 bg-dark-secondary/80 backdrop-blur-sm border-dark-accent">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">&lt;/&gt;</span>
            </div>
            <h1 className="text-2xl font-bold gradient-text">
              CodeType Pro
            </h1>
          </div>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to save your progress and compete!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button 
            onClick={handleLogin}
            className="w-full gradient-bg font-semibold hover:scale-105 transition-transform"
          >
            Sign In as GuestCoder
          </Button>
          <p className="text-center text-xs text-gray-500">
            This is a mock login. In a real app, this would be a form with a username and password.
          </p>
          <Link href="/" className="text-center text-sm text-neon-cyan hover:underline">
            « Continue as a Guest
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
