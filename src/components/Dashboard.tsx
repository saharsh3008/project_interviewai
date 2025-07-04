
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, TrendingUp, Award, Target, Brain } from "lucide-react";

interface UserSession {
  username: string;
  totalSessions: number;
  bestScore: number;
  categoriesCompleted: string[];
}

interface SessionData {
  date: string;
  category: string;
  results: any[];
  averageScore: number;
}

interface DashboardProps {
  userSession: UserSession | null;
  onBack: () => void;
}

const Dashboard = ({ userSession, onBack }: DashboardProps) => {
  const [sessions, setSessions] = useState<SessionData[]>([]);

  useEffect(() => {
    const savedSessions = JSON.parse(localStorage.getItem('interview-sessions') || '[]');
    setSessions(savedSessions.reverse()); // Show newest first
  }, []);

  const categories = [
    { value: "technical", label: "Technical Interview", icon: "💻" },
    { value: "behavioral", label: "Behavioral Interview", icon: "🤝" },
    { value: "system-design", label: "System Design", icon: "🏗️" },
    { value: "leadership", label: "Leadership", icon: "👑" },
    { value: "product", label: "Product Management", icon: "📱" }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-300 bg-green-900/20 border-green-500/30";
    if (score >= 6) return "text-blue-300 bg-blue-900/20 border-blue-500/30";
    if (score >= 4) return "text-yellow-300 bg-yellow-900/20 border-yellow-500/30";
    return "text-orange-300 bg-orange-900/20 border-orange-500/30";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="bg-slate-800/50 border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interview
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                InterviewAI Dashboard
              </h1>
              <p className="text-slate-300">Welcome back, {userSession?.username}</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/80 border-purple-500/30 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Total Sessions</p>
                  <p className="text-3xl font-bold text-white">{userSession?.totalSessions || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-green-500/30 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Best Score</p>
                  <p className="text-3xl font-bold text-white">{Math.round(userSession?.bestScore || 0)}/10</p>
                </div>
                <Award className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-blue-500/30 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Categories Tried</p>
                  <p className="text-3xl font-bold text-white">{userSession?.categoriesCompleted.length || 0}</p>
                </div>
                <Target className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-yellow-500/30 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Avg Performance</p>
                  <p className="text-3xl font-bold text-white">
                    {sessions.length > 0 
                      ? Math.round(sessions.reduce((sum, s) => sum + s.averageScore, 0) / sessions.length)
                      : 0}/10
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session History */}
        <Card className="bg-slate-800/80 border-purple-500/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Session History</CardTitle>
            <CardDescription className="text-slate-300">
              Review your past interview practice sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No sessions completed yet</p>
                <p className="text-slate-500">Start your first interview practice to see results here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session, index) => {
                  const categoryInfo = categories.find(c => c.value === session.category);
                  return (
                    <Card key={index} className="bg-slate-700/50 border-purple-500/20 shadow-lg">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{categoryInfo?.icon}</span>
                            <div>
                              <h4 className="text-white font-semibold">{categoryInfo?.label}</h4>
                              <p className="text-slate-400 text-sm">{formatDate(session.date)}</p>
                            </div>
                          </div>
                          <Badge className={`${getScoreColor(session.averageScore)}`}>
                            {Math.round(session.averageScore)}/10
                          </Badge>
                        </div>
                        
                        <div className="bg-slate-600/30 p-3 rounded border border-slate-500/20">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">Questions Completed:</span>
                            <span className="text-white font-medium">{session.results.length}/5</span>
                          </div>
                          <div className="mt-2 grid grid-cols-5 gap-1">
                            {session.results.map((result, qIndex) => (
                              <div
                                key={qIndex}
                                className={`h-2 rounded-full ${
                                  result.feedback.score >= 8 ? 'bg-green-500' :
                                  result.feedback.score >= 6 ? 'bg-blue-500' :
                                  result.feedback.score >= 4 ? 'bg-yellow-500' : 'bg-orange-500'
                                }`}
                                title={`Question ${qIndex + 1}: ${result.feedback.score}/10`}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
