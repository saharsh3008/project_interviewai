import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Brain, Target, User, LogOut, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { generateQuestion, evaluateAnswer } from "@/services/geminiService";
import { voiceService } from "@/services/voiceService";
import LoginPage from "@/components/LoginPage";
import SessionResults from "@/components/SessionResults";
import QuestionDisplay from "@/components/QuestionDisplay";
import VoiceAnswerInput from "@/components/VoiceAnswerInput";
import Dashboard from "@/components/Dashboard";

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
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Voice-related states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);

  const MAX_QUESTIONS_PER_CATEGORY = 5;
  // Hardcoded API key - replace with your actual API key
  const apiKey = "AIzaSyBT-2MwNCd7xDug1YmkuXQ7KAils6TJekk";

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
    
    setVoiceSupported(voiceService.isSupported());
    if (!voiceService.isSupported()) {
      toast.error("Voice features not supported in this browser. Please use Chrome or Edge for the best experience.");
    }
  }, []);

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
    setShowCategorySelection(false);
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
      const question = await generateQuestion(selectedCategory, apiKey, questionCount + 1);
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
    console.log("Next question clicked, current count:", questionCount);
    
    if (questionCount >= MAX_QUESTIONS_PER_CATEGORY) {
      console.log("Session complete, showing results");
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
    setShowCategorySelection(true);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  InterviewAI
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowDashboard(true)}
                variant="outline"
                className="bg-slate-800/50 border-purple-500/30 text-purple-300 hover:bg-purple-900/30"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="text-white">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Welcome, {userSession?.username}</span>
                </div>
                <div className="text-sm text-slate-300">
                  Sessions: {userSession?.totalSessions} | Best: {Math.round(userSession?.bestScore || 0)}/10
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Master your interview skills with AI-powered voice questions and instant feedback
          </p>
          {!voiceSupported && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg max-w-md mx-auto">
              <p className="text-yellow-400 text-sm">
                ⚠️ For the best voice experience, please use Chrome or Edge browser
              </p>
            </div>
          )}
        </div>

        {sessionComplete ? (
          <SessionResults 
            sessionResults={sessionResults}
            selectedCategory={selectedCategory}
            categories={categories}
            onCategorySwitch={handleCategorySwitch}
            onRestartSession={startNewSession}
          />
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Question Generation */}
            <div className="space-y-6">
              <Card className="bg-slate-800/80 border-purple-500/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-400" />
                    Interview Category
                  </CardTitle>
                  {questionCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-purple-500 text-purple-300 bg-purple-900/20">
                        Question {questionCount}/{MAX_QUESTIONS_PER_CATEGORY}
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                      <SelectValue placeholder="Choose interview type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500/30">
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value} className="text-white hover:bg-slate-700">
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    onClick={handleGenerateQuestion}
                    disabled={isLoading || !selectedCategory || questionCount >= MAX_QUESTIONS_PER_CATEGORY}
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Question...
                      </>
                    ) : questionCount === 0 ? (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Start Voice Interview
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Generate Question {questionCount + 1}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

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
            </div>

            {/* Right Column - Voice Answer & Feedback */}
            <div className="space-y-6">
              {currentQuestion && (
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
              )}

              {feedback && (
                <Card className="bg-slate-800/80 border-green-500/30 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Brain className="h-5 w-5 text-green-400" />
                        AI Feedback
                      </CardTitle>
                      {questionCount < MAX_QUESTIONS_PER_CATEGORY && (
                        <Button
                          onClick={handleNextQuestion}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
                        >
                          Next Question
                        </Button>
                      )}
                      {questionCount >= MAX_QUESTIONS_PER_CATEGORY && (
                        <Button
                          onClick={handleNextQuestion}
                          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg"
                        >
                          Complete Interview
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-green-500 text-green-300 bg-green-900/20">
                        Score: {feedback.score}/10
                      </Badge>
                      <Badge variant="outline" className="border-blue-500 text-blue-300 bg-blue-900/20">
                        {feedback.overall}
                      </Badge>
                    </div>

                    <div className="bg-slate-700/30 p-4 rounded-lg border border-green-500/20">
                      <h4 className="text-green-300 font-semibold mb-2">Strengths:</h4>
                      <p className="text-green-200 text-sm">{feedback.strengths}</p>
                    </div>

                    <div className="bg-slate-700/30 p-4 rounded-lg border border-orange-500/20">
                      <h4 className="text-orange-300 font-semibold mb-2">Areas for Improvement:</h4>
                      <p className="text-orange-200 text-sm">{feedback.improvements}</p>
                    </div>

                    <div className="bg-slate-700/30 p-4 rounded-lg border border-blue-500/20">
                      <h4 className="text-blue-300 font-semibold mb-2">Suggestions:</h4>
                      <p className="text-blue-200 text-sm">{feedback.suggestions}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        {questionCount > 0 && !sessionComplete && (
          <Card className="mt-8 bg-slate-800/60 border-purple-500/30 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-white">{questionCount}</div>
                  <div className="text-slate-300 text-sm">Questions Answered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{sessionResults.length > 0 ? Math.round(calculateAverageScore()) : 0}</div>
                  <div className="text-slate-300 text-sm">Average Score</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {selectedCategory ? categories.find(c => c.value === selectedCategory)?.icon : "🎯"}
                  </div>
                  <div className="text-slate-300 text-sm">Category</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
