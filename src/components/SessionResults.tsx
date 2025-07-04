
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
    if (avgScore >= 8) return { label: "Excellent", color: "text-green-400" };
    if (avgScore >= 6) return { label: "Good", color: "text-blue-400" };
    if (avgScore >= 4) return { label: "Average", color: "text-yellow-400" };
    return { label: "Needs Improvement", color: "text-orange-400" };
  };

  const avgScore = calculateAverageScore();
  const performance = getOverallPerformance(avgScore);

  return (
    <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/40">
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
            onClick={onCategorySwitch}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Try Another Category
          </Button>
          <Button
            onClick={onRestartSession}
            variant="outline"
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Practice Same Category Again
          </Button>
        </div>

        {/* Performance Tips */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h4 className="text-blue-400 font-semibold mb-2">💡 Tips for Improvement:</h4>
          <ul className="text-blue-300 text-sm space-y-1">
            {avgScore < 6 && (
              <>
                <li>• Focus on structuring your answers using the STAR method</li>
                <li>• Practice speaking clearly and at a steady pace</li>
                <li>• Include specific examples and quantify your achievements when possible</li>
              </>
            )}
            {avgScore >= 6 && avgScore < 8 && (
              <>
                <li>• Add more specific details and examples to your responses</li>
                <li>• Work on connecting your answers directly to the role requirements</li>
                <li>• Practice varying your tone and emphasis for better engagement</li>
              </>
            )}
            {avgScore >= 8 && (
              <>
                <li>• Excellent work! Keep practicing to maintain consistency</li>
                <li>• Try challenging yourself with different interview categories</li>
                <li>• Focus on advanced techniques like storytelling and strategic pausing</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionResults;
