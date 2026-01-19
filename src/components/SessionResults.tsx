
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, RotateCcw, ArrowRight, Trophy, BookOpen, Lightbulb } from "lucide-react";

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
    if (avgScore >= 8) return { label: "Excellent", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" };
    if (avgScore >= 6) return { label: "Good", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    if (avgScore >= 4) return { label: "Average", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
    return { label: "Needs Improvement", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" };
  };

  const avgScore = calculateAverageScore();
  const performance = getOverallPerformance(avgScore);
  const categoryLabel = categories.find(c => c.value === selectedCategory)?.label;

  return (
    <div className="space-y-6">
      <Card className="glass-card border-purple-500/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <CardHeader className="text-center pb-8 border-b border-white/5 relative z-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-yellow-400/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/30 mb-4 shadow-lg shadow-yellow-500/10">
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
          <CardTitle className="text-white text-4xl font-bold mb-2">
            Session Complete!
          </CardTitle>
          <CardDescription className="text-slate-400 text-lg">
            Performance Summary for <span className="text-purple-400 font-medium">{categoryLabel}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 relative z-10">
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Score Card */}
            <div className={`col-span-1 p-6 rounded-2xl border ${performance.border} ${performance.bg} flex flex-col items-center justify-center text-center`}>
              <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2">Overall Score</span>
              <div className="text-6xl font-black text-white mb-2 tracking-tight">
                {Math.round(avgScore)}<span className="text-2xl text-slate-500/60 font-medium">/10</span>
              </div>
              <Badge className={`${performance.bg} ${performance.color} border-0 px-3 py-1 text-sm font-semibold`}>
                {performance.label}
              </Badge>
            </div>

            {/* Quick Stats or Tips */}
            <div className="col-span-2 p-6 rounded-2xl bg-white/5 border border-white/5">
              <h4 className="flex items-center gap-2 text-blue-400 font-semibold mb-4 text-lg">
                <Lightbulb className="h-5 w-5" />
                Key Takeaways
              </h4>
              <ul className="space-y-3">
                {avgScore < 6 && (
                  <>
                    <li className="flex gap-3 text-slate-300 text-sm"><span className="text-blue-500 mt-0.5">•</span> Focus on structuring your answers using the STAR method for better clarity.</li>
                    <li className="flex gap-3 text-slate-300 text-sm"><span className="text-blue-500 mt-0.5">•</span> Practice speaking at a steady pace and avoid fillers.</li>
                  </>
                )}
                {avgScore >= 6 && avgScore < 8 && (
                  <>
                    <li className="flex gap-3 text-slate-300 text-sm"><span className="text-blue-500 mt-0.5">•</span> Add more specific metrics and results to your examples.</li>
                    <li className="flex gap-3 text-slate-300 text-sm"><span className="text-blue-500 mt-0.5">•</span> Try to connect your answers more directly to the company's values.</li>
                  </>
                )}
                {avgScore >= 8 && (
                  <>
                    <li className="flex gap-3 text-slate-300 text-sm"><span className="text-blue-500 mt-0.5">•</span> Excellent work! Keep refining your storytelling abilities.</li>
                    <li className="flex gap-3 text-slate-300 text-sm"><span className="text-blue-500 mt-0.5">•</span> Challenge yourself with System Design or Leadership questions next.</li>
                  </>
                )}
                <li className="flex gap-3 text-slate-300 text-sm"><span className="text-blue-500 mt-0.5">•</span> Review the detailed feedback below for specific question insights.</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" />
            Detailed Breakdown
          </h3>

          <div className="space-y-4">
            {sessionResults.map((result, index) => (
              <div key={index} className="group bg-black/20 hover:bg-black/30 border border-white/5 hover:border-purple-500/20 rounded-xl p-5 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 font-mono text-sm border border-white/5">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-white font-medium leading-snug">{result.question}</h4>
                    </div>
                  </div>
                  <Badge variant="outline" className={`shrink-0 ${result.feedback.score >= 7 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                    Score: {result.feedback.score}/10
                  </Badge>
                </div>

                <div className="pl-11">
                  <p className="text-sm text-slate-400 bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-purple-400 font-medium mr-2">Feedback:</span>
                    {result.feedback.overall}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 mt-4 border-t border-white/5">
            <Button
              onClick={onCategorySwitch}
              className="h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-primary/20 rounded-xl px-8"
            >
              Start New Category <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              onClick={onRestartSession}
              variant="outline"
              className="h-12 border-white/10 hover:bg-white/5 text-slate-300 hover:text-white rounded-xl px-8"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake This Category
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionResults;
