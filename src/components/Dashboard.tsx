
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, TrendingUp, Award, Target, Brain, ArrowRight, BarChart3 } from "lucide-react";

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
    if (score >= 8) return "text-green-400 bg-green-500/10 border-green-500/20";
    if (score >= 6) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    if (score >= 4) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-orange-400 bg-orange-500/10 border-orange-500/20";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="icon"
              className="rounded-xl border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-purple-400" />
                Performance Dashboard
              </h1>
              <p className="text-slate-400">Track your progress and interview history</p>
            </div>
          </div>

          <div className="glass px-6 py-3 rounded-xl flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Current User</div>
              <div className="font-bold text-white">{userSession?.username}</div>
            </div>
            <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {userSession?.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Sessions", value: userSession?.totalSessions || 0, icon: <Calendar className="h-6 w-6 text-purple-400" />, bg: "bg-purple-500/10" },
            { label: "Best Score", value: `${Math.round(userSession?.bestScore || 0)}/10`, icon: <Award className="h-6 w-6 text-green-400" />, bg: "bg-green-500/10" },
            { label: "Categories", value: userSession?.categoriesCompleted.length || 0, icon: <Target className="h-6 w-6 text-blue-400" />, bg: "bg-blue-500/10" },
            { label: "Avg Performance", value: `${sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.averageScore, 0) / sessions.length) : 0}/10`, icon: <TrendingUp className="h-6 w-6 text-yellow-400" />, bg: "bg-yellow-500/10" }
          ].map((stat, i) => (
            <Card key={i} className="glass-card border-white/5 hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-white mt-2">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg} border border-white/5`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* History List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              Recent Sessions
            </h2>

            {sessions.length === 0 ? (
              <Card className="glass-card border-white/5 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Brain className="h-8 w-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No sessions yet</h3>
                  <p className="text-slate-400 max-w-sm mb-6">
                    Complete your first interview session to see detailed analytics and tracking here.
                  </p>
                  <Button onClick={onBack} variant="outline" className="border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-500/20">
                    Start Your First Interview
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sessions.map((session, index) => {
                  const categoryInfo = categories.find(c => c.value === session.category);
                  return (
                    <Card key={index} className="glass-card border-white/5 hover:bg-white/5 transition-colors group">
                      <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-2xl border border-white/5">
                              {categoryInfo?.icon}
                            </div>
                            <div>
                              <h4 className="text-white font-semibold flex items-center gap-2">
                                {categoryInfo?.label}
                                <span className="text-xs font-normal text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                                  {formatDate(session.date)}
                                </span>
                              </h4>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <div
                                      key={star}
                                      className={`h-1.5 w-6 rounded-full ${star <= Math.round(session.averageScore / 2)
                                        ? 'bg-purple-500'
                                        : 'bg-slate-700'
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-slate-400">
                                  {session.results.length} Questions
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <Badge className={`${getScoreColor(session.averageScore)} px-3 py-1 text-base font-bold`}>
                              {Math.round(session.averageScore)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              Insights
            </h2>

            <Card className="glass-card bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Pro Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">
                  Consistency is key. Practicing just 15 minutes a day can improve your interview confidence by 40% in two weeks.
                </p>
                <Button className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white border border-white/10">
                  Start Practice
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl border border-white/5 bg-black/20">
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Category Distribution</h4>
              <div className="space-y-3">
                {categories.map((cat, i) => {
                  const count = sessions.filter(s => s.category === cat.value).length;
                  const percent = sessions.length ? (count / sessions.length) * 100 : 0;
                  if (count === 0 && sessions.length > 5) return null; // Hide unused categories if we have lots of data

                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300 flex items-center gap-2">
                          <span className="text-xs">{cat.icon}</span> {cat.label}
                        </span>
                        <span className="text-slate-500">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


