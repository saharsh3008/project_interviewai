
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Brain, MessageSquare, Star, Target, CheckCircle, Key, Save, Mic, MicOff, Volume2, VolumeX, Play, Pause, ArrowRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { generateQuestion, evaluateAnswer } from "@/services/geminiService";
import { voiceService } from "@/services/voiceService";

interface QuestionResult {
  question: string;
  answer: string;
  feedback: any;
  questionNumber: number;
}

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionResults, setSessionResults] = useState<QuestionResult[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  
  // Voice-related states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);

  const MAX_QUESTIONS_PER_CATEGORY = 5;

  const categories = [
    { value: "technical", label: "Technical Interview", icon: "💻" },
    { value: "behavioral", label: "Behavioral Interview", icon: "🤝" },
    { value: "system-design", label: "System Design", icon: "🏗️" },
    { value: "leadership", label: "Leadership", icon: "👑" },
    { value: "product", label: "Product Management", icon: "📱" }
  ];

  // Load API key and check voice support on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    setVoiceSupported(voiceService.isSupported());
    if (!voiceService.isSupported()) {
      toast.error("Voice features not supported in this browser. Please use Chrome or Edge for the best experience.");
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini-api-key', apiKey.trim());
      toast.success("API key saved successfully!");
    } else {
      toast.error("Please enter a valid API key");
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini-api-key');
    setApiKey("");
    toast.success("API key cleared");
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
    
    if (!apiKey.trim()) {
      toast.error("Please enter your Gemini API key");
      return;
    }

    // Start new session if this is the first question
    if (questionCount === 0) {
      startNewSession();
    }

    setIsLoading(true);
    try {
      const question = await generateQuestion(selectedCategory, apiKey);
      setCurrentQuestion(question);
      setUserAnswer("");
      setTranscript("");
      setInterimTranscript("");
      setFeedback(null);
      setQuestionCount(prev => prev + 1);
      toast.success(`Question ${questionCount + 1}/${MAX_QUESTIONS_PER_CATEGORY} generated!`);
      
      // Speak the question automatically
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

    // Stop listening if active
    if (isListening) {
      stopListening();
    }

    setIsLoading(true);
    try {
      const evaluation = await evaluateAnswer(currentQuestion, finalAnswer, selectedCategory, apiKey);
      setFeedback(evaluation);
      
      // Add to session results
      const questionResult: QuestionResult = {
        question: currentQuestion,
        answer: finalAnswer,
        feedback: evaluation,
        questionNumber: questionCount
      };
      setSessionResults(prev => [...prev, questionResult]);
      
      toast.success("Answer evaluated successfully!");
      
      // Speak the feedback
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

  const getOverallPerformance = (avgScore: number) => {
    if (avgScore >= 8) return { label: "Excellent", color: "text-green-400" };
    if (avgScore >= 6) return { label: "Good", color: "text-blue-400" };
    if (avgScore >= 4) return { label: "Average", color: "text-yellow-400" };
    return { label: "Needs Improvement", color: "text-orange-400" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            AI Voice Interview Coach
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Practice interviews with AI-powered voice questions and get instant feedback to ace your next job interview
          </p>
          {!voiceSupported && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg max-w-md mx-auto">
              <p className="text-yellow-400 text-sm">
                ⚠️ For the best voice experience, please use Chrome or Edge browser
              </p>
            </div>
          )}
        </div>

        {/* API Key Input */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5" />
              Gemini API Configuration
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter your Gemini API key to start practicing. Get your free API key from Google AI Studio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter your Gemini API key here..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
              <Button 
                onClick={handleSaveApiKey}
                variant="outline"
                className="shrink-0 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              {apiKey && (
                <Button 
                  onClick={handleClearApiKey}
                  variant="outline"
                  className="shrink-0 bg-red-900/20 border-red-500/30 text-red-400 hover:bg-red-900/30"
                >
                  Clear
                </Button>
              )}
            </div>
            {apiKey && (
              <p className="text-green-400 text-sm">✓ API key is saved and ready to use</p>
            )}
          </CardContent>
        </Card>

        {!sessionComplete ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Question Generation */}
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Interview Category
                  </CardTitle>
                  {questionCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-purple-500 text-purple-400">
                        Question {questionCount}/{MAX_QUESTIONS_PER_CATEGORY}
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Choose interview type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
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
                    disabled={isLoading || !selectedCategory || !apiKey.trim() || questionCount >= MAX_QUESTIONS_PER_CATEGORY}
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
                <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/40 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2 text-xl">
                          <MessageSquare className="h-6 w-6 text-purple-400" />
                          Interview Question #{questionCount}
                        </CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                            {categories.find(c => c.value === selectedCategory)?.label}
                          </Badge>
                          <Badge variant="outline" className="border-blue-500 text-blue-400">
                            {questionCount}/{MAX_QUESTIONS_PER_CATEGORY}
                          </Badge>
                        </div>
                      </div>
                      {voiceSupported && (
                        <Button
                          onClick={toggleQuestionSpeech}
                          variant="outline"
                          size="sm"
                          className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="h-4 w-4 mr-2" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-4 w-4 mr-2" />
                              Listen
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-500/20">
                      <p className="text-white text-lg leading-relaxed font-medium">
                        {currentQuestion}
                      </p>
                    </div>
                    {isSpeaking && (
                      <div className="mt-3 flex items-center gap-2 text-purple-400">
                        <Volume2 className="h-4 w-4 animate-pulse" />
                        <span className="text-sm">Speaking question...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Voice Answer & Feedback */}
            <div className="space-y-6">
              {currentQuestion && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Your Voice Answer</CardTitle>
                    <CardDescription className="text-slate-400">
                      Click the microphone to start speaking your answer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Voice Controls */}
                      <div className="flex gap-2">
                        {voiceSupported && (
                          <>
                            <Button
                              onClick={isListening ? stopListening : startListening}
                              disabled={isLoading}
                              className={`${
                                isListening
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                            >
                              {isListening ? (
                                <>
                                  <MicOff className="h-4 w-4 mr-2" />
                                  Stop Recording
                                </>
                              ) : (
                                <>
                                  <Mic className="h-4 w-4 mr-2" />
                                  Start Recording
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={clearAnswer}
                              variant="outline"
                              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                            >
                              Clear
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Live transcription indicator */}
                      {isListening && (
                        <div className="flex items-center gap-2 text-green-400">
                          <Mic className="h-4 w-4 animate-pulse" />
                          <span className="text-sm">Listening... Speak now</span>
                        </div>
                      )}

                      {/* Answer text area with live transcription */}
                      <Textarea
                        placeholder={voiceSupported ? "Your voice answer will appear here as you speak..." : "Type your answer here..."}
                        value={userAnswer + (interimTranscript ? ` ${interimTranscript}` : "")}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="min-h-32 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        readOnly={isListening}
                      />

                      {/* Interim transcript display */}
                      {interimTranscript && (
                        <div className="text-slate-400 text-sm italic">
                          Speaking: "{interimTranscript}"
                        </div>
                      )}

                      <Button 
                        onClick={handleSubmitAnswer}
                        disabled={isLoading || !userAnswer.trim()}
                        className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Evaluating Answer...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Get AI Feedback
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {feedback && (
                <Card className="bg-gradient-to-r from-green-900/20 to-teal-900/20 border-green-500/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        AI Voice Feedback
                      </CardTitle>
                      {questionCount < MAX_QUESTIONS_PER_CATEGORY && (
                        <Button
                          onClick={handleNextQuestion}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Next Question
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-green-500 text-green-400">
                        Score: {feedback.score}/10
                      </Badge>
                      <Badge variant="outline" className="border-blue-500 text-blue-400">
                        {feedback.overall}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">Strengths:</h4>
                      <p className="text-green-400 text-sm">{feedback.strengths}</p>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">Areas for Improvement:</h4>
                      <p className="text-orange-400 text-sm">{feedback.improvements}</p>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">Suggestions:</h4>
                      <p className="text-blue-400 text-sm">{feedback.suggestions}</p>
                    </div>

                    {questionCount >= MAX_QUESTIONS_PER_CATEGORY && (
                      <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                        <p className="text-purple-400 text-center font-semibold">
                          🎉 All questions completed! Check your results below.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          // Session Complete - Combined Results
          <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/40">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-3xl flex items-center justify-center gap-2">
                <Star className="h-8 w-8 text-yellow-400" />
                Interview Complete!
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                Here's your comprehensive performance summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Score */}
              <div className="text-center p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30">
                <div className="text-6xl font-bold text-white mb-2">
                  {Math.round(calculateAverageScore())}/10
                </div>
                <div className={`text-xl font-semibold ${getOverallPerformance(calculateAverageScore()).color}`}>
                  {getOverallPerformance(calculateAverageScore()).label}
                </div>
                <div className="text-slate-400 mt-2">Average Score</div>
              </div>

              {/* Question by Question Results */}
              <div className="space-y-4">
                <h3 className="text-white text-xl font-semibold">Question Breakdown:</h3>
                {sessionResults.map((result, index) => (
                  <Card key={index} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="border-purple-500 text-purple-400">
                          Question {result.questionNumber}
                        </Badge>
                        <Badge variant="outline" className="border-green-500 text-green-400">
                          {result.feedback.score}/10
                        </Badge>
                      </div>
                      <p className="text-slate-300 text-sm mb-2 line-clamp-2">
                        <strong>Q:</strong> {result.question}
                      </p>
                      <p className="text-slate-400 text-xs">
                        <strong>Performance:</strong> {result.feedback.overall}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center pt-4">
                <Button
                  onClick={() => {
                    setSelectedCategory("");
                    startNewSession();
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Another Category
                </Button>
                <Button
                  onClick={startNewSession}
                  variant="outline"
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Practice Same Category Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {questionCount > 0 && !sessionComplete && (
          <Card className="mt-8 bg-slate-800/30 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-white">{questionCount}</div>
                  <div className="text-slate-400 text-sm">Questions Answered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{sessionResults.length > 0 ? Math.round(calculateAverageScore()) : 0}</div>
                  <div className="text-slate-400 text-sm">Average Score</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {selectedCategory ? categories.find(c => c.value === selectedCategory)?.icon : "🎯"}
                  </div>
                  <div className="text-slate-400 text-sm">Category</div>
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
