
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, RotateCcw, ArrowRight } from "lucide-react";

interface QuestionResult {
  question: string;
  answer: string;
  feedback: any;
  questionNumber: number;
}

interface Category {
  value: string;
  label: string; 
  icon: string;
}

interface SessionResultsProps {
  sessionResults: QuestionResult[];
  selectedCategory: string;
  categories: Category[];
  onCategorySwitch: () => void;
  onRestartSession: () => void;
}

const SessionResults = ({ 
  sessionResults, 
  selectedCategory, 
  categories, 
  onCategorySwitch, 
  onRestartSession 
}: SessionResultsProps) => {
  const calculateAverageScore = () => {
    if (sessionResults.length === 0) return 0;
    return sessionResults.reduce((sum, result) => sum + result.feedback.score, 0) / sessionResults.length;
  };

  const getOverallPerformance = (avgScore: number) => {
    if (avgScore >= 8) return { label: "Excellent", color: "text-green-300" };
    if (avgScore >= 6) return { label: "Good", color: "text-blue-300" };
    if (avgScore >= 4) return { label: "Average", color: "text-yellow-300" };
    return { label: "Needs Improvement", color: "text-orange-300" };
  };

  const avgScore = calculateAverageScore();
  const performance = getOverallPerformance(avgScore);

  return (
    <Card className="bg-slate-800/80 border-purple-500/30 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-white text-3xl flex items-center justify-center gap-2">
          <Star className="h-8 w-8 text-yellow-400" />
          Interview Complete!
        </CardTitle>
        <CardDescription className="text-slate-300 text-lg">
          Here's your comprehensive performance summary for {categories.find(c => c.value === selectedCategory)?.label}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30">
          <div className="text-6xl font-bold text-white mb-2">
            {Math.round(avgScore)}/10
          </div>
          <div className={`text-xl font-semibold ${performance.color}`}>
            {performance.label}
          </div>
          <div className="text-slate-300 mt-2">Average Score</div>
        </div>

        {/* Question by Question Results */}
        <div className="space-y-4">
          <h3 className="text-white text-xl font-semibold">Question Breakdown:</h3>
          {sessionResults.map((result, index) => (
            <Card key={index} className="bg-slate-700/50 border-purple-500/20 shadow-lg">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="border-purple-500 text-purple-300 bg-purple-900/20">
                    Question {result.questionNumber}
                  </Badge>
                  <Badge variant="outline" className="border-green-500 text-green-300 bg-green-900/20">
                    {result.feedback.score}/10
                  </Badge>
                </div>
                <p className="text-slate-200 text-sm mb-2 line-clamp-2 bg-slate-600/30 p-3 rounded border border-slate-500/20">
                  <strong className="text-purple-300">Q:</strong> {result.question}
                </p>
                <p className="text-slate-300 text-xs bg-slate-600/20 p-2 rounded">
                  <strong className="text-blue-300">Performance:</strong> {result.feedback.overall}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-4">
          <Button
            onClick={onCategorySwitch}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Try Another Category
          </Button>
          <Button
            onClick={onRestartSession}
            variant="outline"
            className="bg-slate-700/50 border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Practice Same Category Again
          </Button>
        </div>

        {/* Performance Tips */}
        <div className="mt-6 p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h4 className="text-blue-300 font-semibold mb-3 text-lg">💡 Tips for Improvement:</h4>
          <ul className="text-blue-200 space-y-2">
            {avgScore < 6 && (
              <>
                <li className="bg-blue-900/10 p-2 rounded">• Focus on structuring your answers using the STAR method</li>
                <li className="bg-blue-900/10 p-2 rounded">• Practice speaking clearly and at a steady pace</li>
                <li className="bg-blue-900/10 p-2 rounded">• Include specific examples and quantify your achievements when possible</li>
              </>
            )}
            {avgScore >= 6 && avgScore < 8 && (
              <>
                <li className="bg-blue-900/10 p-2 rounded">• Add more specific details and examples to your responses</li>
                <li className="bg-blue-900/10 p-2 rounded">• Work on connecting your answers directly to the role requirements</li>
                <li className="bg-blue-900/10 p-2 rounded">• Practice varying your tone and emphasis for better engagement</li>
              </>
            )}
            {avgScore >= 8 && (
              <>
                <li className="bg-blue-900/10 p-2 rounded">• Excellent work! Keep practicing to maintain consistency</li>
                <li className="bg-blue-900/10 p-2 rounded">• Try challenging yourself with different interview categories</li>
                <li className="bg-blue-900/10 p-2 rounded">• Focus on advanced techniques like storytelling and strategic pausing</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionResults;
