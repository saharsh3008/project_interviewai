
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Brain, Target, User, LogOut, BarChart3, Mic, Sparkles, ArrowRight, Code2 } from "lucide-react";
import { toast } from "sonner";
import { generateQuestion, evaluateAnswer } from "@/services/geminiService";
import { voiceService } from "@/services/voiceService";
import LoginPage from "@/components/LoginPage";
import SessionResults from "@/components/SessionResults";
import QuestionDisplay from "@/components/QuestionDisplay";
import VoiceAnswerInput from "@/components/VoiceAnswerInput";
import Dashboard from "@/components/Dashboard";
import ContextSetup from "@/components/ContextSetup";
import CodeWorkspace from "@/components/CodeWorkspace";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuestionResult {
  question: string;
  answer: string;
  feedback: any;
  questionNumber: number;
}

interface UserSession {
  username: string;
  totalSessions: number;
  bestScore: number;
  categoriesCompleted: string[];
}

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionResults, setSessionResults] = useState<QuestionResult[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  // Answer Mode State
  const [answerMode, setAnswerMode] = useState<"voice" | "code">("voice");

  // Context states
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Voice-related states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);

  const MAX_QUESTIONS_PER_CATEGORY = 5;
  // API Key from environment variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

  const categories = [
    { value: "technical", label: "Technical Interview", icon: "💻" },
    { value: "behavioral", label: "Behavioral Interview", icon: "🤝" },
    { value: "system-design", label: "System Design", icon: "🏗️" },
    { value: "leadership", label: "Leadership", icon: "👑" },
    { value: "product", label: "Product Management", icon: "📱" }
  ];

  // Load saved data on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user-session');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUserSession(userData);
      setIsLoggedIn(true);
    }

    // Load saved context
    const savedContext = localStorage.getItem('interview-context');
    if (savedContext) {
      const { resumeText: savedResume, jobDescription: savedJob } = JSON.parse(savedContext);
      if (savedResume) setResumeText(savedResume);
      if (savedJob) setJobDescription(savedJob);
    }

    setVoiceSupported(voiceService.isSupported());
    if (!voiceService.isSupported()) {
      toast.error("Voice features not supported in this browser. Please use Chrome or Edge for the best experience.");
    }
  }, []);

  const handleContextUpdate = (context: { resumeText?: string; jobDescription?: string }) => {
    if (context.resumeText !== undefined) setResumeText(context.resumeText);
    if (context.jobDescription !== undefined) setJobDescription(context.jobDescription);

    // Save to local storage for persistence
    localStorage.setItem('interview-context', JSON.stringify({
      resumeText: context.resumeText !== undefined ? context.resumeText : resumeText,
      jobDescription: context.jobDescription !== undefined ? context.jobDescription : jobDescription
    }));
  };

  const handleLogin = (username: string) => {
    const userData: UserSession = {
      username,
      totalSessions: 0,
      bestScore: 0,
      categoriesCompleted: []
    };
    setUserSession(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user-session', JSON.stringify(userData));
    toast.success(`Welcome back, ${username}!`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserSession(null);
    localStorage.removeItem('user-session');
    // Optional: Clear context on logout? keeping it for now as requested
    startNewSession();
    toast.success("Logged out successfully");
  };

  const saveSessionResults = (results: QuestionResult[], category: string) => {
    if (!userSession) return;

    const avgScore = results.reduce((sum, result) => sum + result.feedback.score, 0) / results.length;
    const updatedSession: UserSession = {
      ...userSession,
      totalSessions: userSession.totalSessions + 1,
      bestScore: Math.max(userSession.bestScore, avgScore),
      categoriesCompleted: [...new Set([...userSession.categoriesCompleted, category])]
    };

    setUserSession(updatedSession);
    localStorage.setItem('user-session', JSON.stringify(updatedSession));

    // Save individual session results
    const sessionData = {
      date: new Date().toISOString(),
      category,
      results,
      averageScore: avgScore
    };

    const savedSessions = JSON.parse(localStorage.getItem('interview-sessions') || '[]');
    savedSessions.push(sessionData);
    localStorage.setItem('interview-sessions', JSON.stringify(savedSessions));
  };

  const startNewSession = () => {
    setQuestionCount(0);
    setSessionResults([]);
    setSessionComplete(false);
    setCurrentQuestion("");
    setUserAnswer("");
    setTranscript("");
    setInterimTranscript("");
    setFeedback(null);
  };

  const handleGenerateQuestion = async () => {
    if (!selectedCategory) {
      toast.error("Please select an interview category first");
      return;
    }

    if (questionCount === 0) {
      startNewSession();
    }

    setIsLoading(true);
    try {
      // Pass the context (Resume/JD) to the generator
      const question = await generateQuestion(
        selectedCategory,
        apiKey,
        questionCount + 1,
        { resumeText, jobDescription }
      );

      setCurrentQuestion(question);
      setUserAnswer("");
      setTranscript("");
      setInterimTranscript("");
      setFeedback(null);
      setQuestionCount(prev => prev + 1);
      toast.success(`Question ${questionCount + 1}/${MAX_QUESTIONS_PER_CATEGORY} generated!`);

      if (voiceSupported) {
        speakQuestion(question);
      }
    } catch (error) {
      toast.error("Failed to generate question. Please check your API key.");
      console.error("Question generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (questionCount >= MAX_QUESTIONS_PER_CATEGORY) {
      setSessionComplete(true);
      const averageScore = sessionResults.reduce((sum, result) => sum + result.feedback.score, 0) / sessionResults.length;

      if (isLoggedIn && userSession) {
        saveSessionResults(sessionResults, selectedCategory);
      }

      toast.success(`Interview complete! Your average score: ${Math.round(averageScore)}/10`);

      if (voiceSupported) {
        const completionMessage = `Interview complete! You've answered all ${MAX_QUESTIONS_PER_CATEGORY} questions. Your average score is ${Math.round(averageScore)} out of 10.`;
        voiceService.speak(completionMessage);
      }
      return;
    }

    await handleGenerateQuestion();
  };

  const speakQuestion = (question: string) => {
    setIsSpeaking(true);
    voiceService.speak(question, () => {
      setIsSpeaking(false);
    });
  };

  const toggleQuestionSpeech = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else if (currentQuestion) {
      speakQuestion(currentQuestion);
    }
  };

  const startListening = () => {
    if (!voiceSupported) {
      toast.error("Voice recognition not supported");
      return;
    }

    setIsListening(true);
    setTranscript("");
    setInterimTranscript("");

    voiceService.startListening(
      (transcript, isFinal) => {
        if (isFinal) {
          setTranscript(prev => prev + " " + transcript);
          setUserAnswer(prev => prev + " " + transcript);
          setInterimTranscript("");
        } else {
          setInterimTranscript(transcript);
        }
      },
      (error) => {
        toast.error(`Voice recognition error: ${error}`);
        setIsListening(false);
      }
    );
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
    setInterimTranscript("");
  };

  const handleSubmitAnswer = async () => {
    const finalAnswer = userAnswer.trim();
    if (!finalAnswer) {
      toast.error("Please provide an answer first");
      return;
    }

    if (!currentQuestion) {
      toast.error("Please generate a question first");
      return;
    }

    if (isListening) {
      stopListening();
    }

    setIsLoading(true);
    try {
      const evaluation = await evaluateAnswer(currentQuestion, finalAnswer, selectedCategory, apiKey);
      setFeedback(evaluation);

      const questionResult: QuestionResult = {
        question: currentQuestion,
        answer: finalAnswer,
        feedback: evaluation,
        questionNumber: questionCount
      };
      setSessionResults(prev => [...prev, questionResult]);

      toast.success("Answer evaluated successfully!");

      if (voiceSupported) {
        const feedbackText = `Your score is ${evaluation.score} out of 10. ${evaluation.overall}.`;
        voiceService.speak(feedbackText);
      }
    } catch (error) {
      toast.error("Failed to evaluate answer. Please try again.");
      console.error("Answer evaluation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (code: string, language: string) => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    if (!currentQuestion) {
      toast.error("Please generate a question first");
      return;
    }

    setIsLoading(true);
    try {
      // Evaluate as CODE type
      const evaluation = await evaluateAnswer(currentQuestion, code, selectedCategory, apiKey, 'code');
      setFeedback(evaluation);

      const questionResult: QuestionResult = {
        question: currentQuestion,
        answer: `[${language}] \n${code}`,
        feedback: evaluation,
        questionNumber: questionCount
      };
      setSessionResults(prev => [...prev, questionResult]);

      toast.success("Code solution evaluated successfully!");
    } catch (error) {
      toast.error("Failed to evaluate code. Please try again.");
      console.error("Code evaluation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnswer = () => {
    setUserAnswer("");
    setTranscript("");
    setInterimTranscript("");
    if (isListening) {
      stopListening();
    }
  };

  const calculateAverageScore = () => {
    if (sessionResults.length === 0) return 0;
    return sessionResults.reduce((sum, result) => sum + result.feedback.score, 0) / sessionResults.length;
  };

  const handleCategorySwitch = () => {
    setSelectedCategory("");
    startNewSession();
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (showDashboard) {
    return <Dashboard userSession={userSession} onBack={() => setShowDashboard(false)} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '4s', animationDuration: '10s' }} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header - Compact & Premium */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 w-full max-w-[1800px] mx-auto">
          <div className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative w-14 h-14 bg-black/50 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="text-gradient">Interview</span>
                <span className="text-gradient-primary">AI</span>
              </h1>
              <p className="text-slate-400 text-xs tracking-wider uppercase font-medium mt-1">
                Your Personal AI Coach
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-2xl p-1.5 border border-white/5">
            <Button
              onClick={() => setShowDashboard(true)}
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-white/5 rounded-xl gap-2 font-medium"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Button>

            <div className="h-8 w-px bg-white/10 mx-1"></div>

            <div className="px-3 flex flex-col items-end hidden md:flex">
              <span className="text-sm font-semibold text-white">{userSession?.username}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                Lvl {userSession?.totalSessions || 1}
              </span>
            </div>

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {sessionComplete ? (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <SessionResults
              sessionResults={sessionResults}
              selectedCategory={selectedCategory}
              categories={categories}
              onCategorySwitch={handleCategorySwitch}
              onRestartSession={startNewSession}
            />
          </div>
        ) : (
          <div className="w-full max-w-[1800px] mx-auto grid lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Controls & Status */}
            <div className="lg:col-span-4 space-y-6">

              {/* Context Setup */}
              <ContextSetup
                onContextUpdate={handleContextUpdate}
                initialContext={{ resumeText, jobDescription }}
              />

              {/* Category Selection Card */}
              <Card className="glass-card overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/5 pb-4">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-purple-400" />
                    Setup Interview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">Review Category</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={questionCount > 0}>
                        <SelectTrigger className="glass-input h-12 text-white border-white/10 bg-black/20 focus:ring-purple-500/50">
                          <SelectValue placeholder="Select Focus Area" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1b26] border-purple-500/20 text-white">
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value} className="focus:bg-purple-600/20 focus:text-white my-1 cursor-pointer">
                              <span className="flex items-center gap-3 py-1">
                                <span className="text-xl">{category.icon}</span>
                                {category.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleGenerateQuestion}
                      disabled={isLoading || !selectedCategory || questionCount >= MAX_QUESTIONS_PER_CATEGORY}
                      className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 rounded-xl"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating...
                        </>
                      ) : questionCount === 0 ? (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Start Interview
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-5 w-5" />
                          Next Question
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Card */}
              {questionCount > 0 && (
                <Card className="glass-card animate-fade-in">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm font-medium">Session Progress</span>
                      <span className="text-white font-mono">{questionCount} / {MAX_QUESTIONS_PER_CATEGORY}</span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000 ease-out"
                        style={{ width: `${(questionCount / MAX_QUESTIONS_PER_CATEGORY) * 100}%` }}
                      />
                    </div>

                    {sessionResults.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-white leading-none">
                              {Math.round(calculateAverageScore())}
                              <span className="text-sm text-slate-500 ml-1 font-normal">/ 10</span>
                            </span>
                            <span className="text-xs text-slate-400 mt-1">Current Average</span>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                            <BarChart3 className="h-5 w-5 text-green-400" />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Interaction Area */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-6 animate-slide-up">
                {currentQuestion && (
                  <QuestionDisplay
                    currentQuestion={currentQuestion}
                    questionCount={questionCount}
                    maxQuestions={MAX_QUESTIONS_PER_CATEGORY}
                    selectedCategory={selectedCategory}
                    categories={categories}
                    isSpeaking={isSpeaking}
                    voiceSupported={voiceSupported}
                    onToggleSpeech={toggleQuestionSpeech}
                  />
                )}

                {!currentQuestion && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 animate-fade-in mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg h-fit">
                      <Sparkles className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">Ready to Start?</h4>
                      <p className="text-slate-400 text-xs">
                        Select a category on the left and click "Start Interview" to generate a question.
                        You can explore the Code Editor or Voice Interface below while you wait.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Tabs defaultValue="voice" value={answerMode} onValueChange={(val) => setAnswerMode(val as "voice" | "code")} className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <TabsList className="bg-black/20 border border-white/10 p-1 rounded-xl">
                        <TabsTrigger value="voice" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">
                          <Mic className="h-4 w-4 mr-2" /> Voice Answer
                        </TabsTrigger>
                        <TabsTrigger value="code" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">
                          <Code2 className="h-4 w-4 mr-2" /> Code Editor
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="voice">
                      <VoiceAnswerInput
                        userAnswer={userAnswer}
                        setUserAnswer={setUserAnswer}
                        transcript={transcript}
                        interimTranscript={interimTranscript}
                        isListening={isListening}
                        isLoading={isLoading}
                        voiceSupported={voiceSupported}
                        onStartListening={startListening}
                        onStopListening={stopListening}
                        onClearAnswer={clearAnswer}
                        onSubmitAnswer={handleSubmitAnswer}
                      />
                    </TabsContent>

                    <TabsContent value="code">
                      <div className="h-[600px] w-full">
                        <CodeWorkspace
                          currentQuestion={currentQuestion}
                          onCodeSubmit={handleCodeSubmit}
                          isLoading={isLoading}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {feedback && (
                  <div className="animate-fade-in">
                    <Card className="glass-card border-green-500/20 shadow-[0_0_30px_-5px_rgba(34,197,94,0.1)]">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                        <CardTitle className="text-white flex items-center gap-2">
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <Brain className="h-5 w-5 text-green-400" />
                          </div>
                          AI Analysis
                        </CardTitle>
                        {questionCount < MAX_QUESTIONS_PER_CATEGORY ? (
                          <Button
                            onClick={handleNextQuestion}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
                          >
                            Next Question <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        ) : (
                          <Button
                            onClick={handleNextQuestion}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                          >
                            See Final Results <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent className="pt-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                            <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Score</span>
                            <div className="text-3xl font-bold text-white mt-1">{feedback.score}<span className="text-lg text-slate-500">/10</span></div>
                          </div>
                          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                            <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Verdict</span>
                            <div className="text-lg font-medium text-blue-300 mt-2">{feedback.overall}</div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                            <h4 className="flex items-center gap-2 text-green-400 font-semibold mb-2 text-sm uppercase tracking-wide">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span> Strengths
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed">{feedback.strengths}</p>
                          </div>

                          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                            <h4 className="flex items-center gap-2 text-orange-400 font-semibold mb-2 text-sm uppercase tracking-wide">
                              <span className="h-1.5 w-1.5 rounded-full bg-orange-400"></span> Improvements
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed">{feedback.improvements}</p>
                          </div>

                          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <h4 className="flex items-center gap-2 text-blue-400 font-semibold mb-2 text-sm uppercase tracking-wide">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span> key Suggestions
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed">{feedback.suggestions}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
