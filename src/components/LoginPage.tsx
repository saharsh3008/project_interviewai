
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, User, Lock, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      onLogin(username.trim());
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] bg-pink-600/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-2 animate-float">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-lg">
              <Brain className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-gradient">Interview</span>
            <span className="text-gradient-primary">AI</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xs mx-auto">
            Master your interview skills with intelligent voice-driven practice
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass-card border-white/10 overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              {isSignUp ? "Begin Your Journey" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              {isSignUp
                ? "Create your profile to start practicing"
                : "Sign in to continue your progress"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300 ml-1">
                  Username
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors duration-300" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="glass-input pl-10 h-12 text-white placeholder:text-slate-500 rounded-xl"
                    autoComplete="off"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white font-medium text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f111a] px-2 text-slate-500">
                  {isSignUp ? "Already have an account?" : "New to InterviewAI?"}
                </span>
              </div>
            </div>

            <Button
              onClick={() => setIsSignUp(!isSignUp)}
              variant="ghost"
              className="w-full text-slate-400 hover:text-white hover:bg-white/5 h-auto py-2"
            >
              {isSignUp ? "Sign in to existing account" : "Create a new account"}
            </Button>
          </CardContent>
        </Card>

        {/* Features Preview */}
        {!isSignUp && (
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="glass p-4 rounded-2xl flex flex-col items-center text-center gap-2 hover:bg-white/5 transition-colors duration-300">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-white">AI Feedback</span>
                <span className="text-xs text-slate-400">Instant expert analysis</span>
              </div>
            </div>
            <div className="glass p-4 rounded-2xl flex flex-col items-center text-center gap-2 hover:bg-white/5 transition-colors duration-300">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Brain className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-white">Smart Tracking</span>
                <span className="text-xs text-slate-400">Monitor your growth</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
