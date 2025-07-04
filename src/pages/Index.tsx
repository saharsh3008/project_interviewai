
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Brain, MessageSquare, Star, Target, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { generateQuestion, evaluateAnswer } from "@/services/geminiService";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [questionCount, setQuestionCount] = useState(0);

  const categories = [
    { value: "technical", label: "Technical Interview", icon: "💻" },
    { value: "behavioral", label: "Behavioral Interview", icon: "🤝" },
    { value: "system-design", label: "System Design", icon: "🏗️" },
    { value: "leadership", label: "Leadership", icon: "👑" },
    { value: "product", label: "Product Management", icon: "📱" }
  ];

  const handleGenerateQuestion = async () => {
    if (!selectedCategory) {
      toast.error("Please select an interview category first");
      return;
    }
    
    if (!apiKey.trim()) {
      toast.error("Please enter your Gemini API key");
      return;
    }

    setIsLoading(true);
    try {
      const question = await generateQuestion(selectedCategory, apiKey);
      setCurrentQuestion(question);
      setUserAnswer("");
      setFeedback(null);
      setQuestionCount(prev => prev + 1);
      toast.success("New question generated!");
    } catch (error) {
      toast.error("Failed to generate question. Please check your API key.");
      console.error("Question generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please provide an answer first");
      return;
    }
    
    if (!currentQuestion) {
      toast.error("Please generate a question first");
      return;
    }

    setIsLoading(true);
    try {
      const evaluation = await evaluateAnswer(currentQuestion, userAnswer, selectedCategory, apiKey);
      setFeedback(evaluation);
      toast.success("Answer evaluated successfully!");
    } catch (error) {
      toast.error("Failed to evaluate answer. Please try again.");
      console.error("Answer evaluation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            AI Interview Coach
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Practice interviews with AI-powered questions and get instant feedback to ace your next job interview
          </p>
        </div>

        {/* API Key Input */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Gemini API Configuration
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter your Gemini API key to start practicing. Your key is stored locally and never sent to our servers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your Gemini API key here..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              rows={2}
            />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Question Generation */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Interview Category
                </CardTitle>
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
                  disabled={isLoading || !selectedCategory || !apiKey.trim()}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Question...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Question
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {currentQuestion && (
              <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Interview Question #{questionCount}
                  </CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {categories.find(c => c.value === selectedCategory)?.label}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-200 text-lg leading-relaxed">
                    {currentQuestion}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Answer & Feedback */}
          <div className="space-y-6">
            {currentQuestion && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Your Answer</CardTitle>
                  <CardDescription className="text-slate-400">
                    Take your time and provide a thoughtful response
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Type your answer here..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="min-h-32 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={isLoading || !userAnswer.trim()}
                    className="w-full mt-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
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
                </CardContent>
              </Card>
            )}

            {feedback && (
              <Card className="bg-gradient-to-r from-green-900/20 to-teal-900/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    AI Feedback
                  </CardTitle>
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
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Stats */}
        {questionCount > 0 && (
          <Card className="mt-8 bg-slate-800/30 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-white">{questionCount}</div>
                  <div className="text-slate-400 text-sm">Questions Practiced</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{feedback ? Math.round(feedback.score) : 0}</div>
                  <div className="text-slate-400 text-sm">Latest Score</div>
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
