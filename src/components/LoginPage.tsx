
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, User, Lock } from "lucide-react";
import { toast } from "sonner";

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    onLogin(username.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">AI Interview Coach</h1>
          </div>
          <p className="text-slate-300">
            Sign in to save your interview progress and track your improvement
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800/50 border-slate-700 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isSignUp 
                ? "Create your account to start practicing interviews" 
                : "Sign in to continue your interview practice"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Lock className="h-4 w-4 mr-2" />
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
              </p>
              <Button
                onClick={() => setIsSignUp(!isSignUp)}
                variant="link"
                className="text-purple-400 hover:text-purple-300 p-0 h-auto font-normal"
              >
                {isSignUp ? "Sign in here" : "Create one here"}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-sm text-center">
                💡 Your progress and scores will be saved locally and persist across sessions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-white font-semibold">Track Progress</div>
            <div className="text-slate-400 text-sm">Monitor your improvement</div>
          </div>
          <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-white font-semibold">Best Scores</div>
            <div className="text-slate-400 text-sm">Beat your personal records</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
