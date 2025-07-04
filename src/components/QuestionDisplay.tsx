
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Volume2, VolumeX } from "lucide-react";

interface Category {
  value: string;
  label: string;
  icon: string;
}

interface QuestionDisplayProps {
  currentQuestion: string;
  questionCount: number;
  maxQuestions: number;
  selectedCategory: string;
  categories: Category[];
  isSpeaking: boolean;
  voiceSupported: boolean;
  onToggleSpeech: () => void;
}

const QuestionDisplay = ({
  currentQuestion,
  questionCount,
  maxQuestions,
  selectedCategory,
  categories,
  isSpeaking,
  voiceSupported,
  onToggleSpeech
}: QuestionDisplayProps) => {
  return (
    <Card className="bg-slate-800/80 border-purple-500/30 shadow-xl">
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
              <Badge variant="outline" className="border-blue-500 text-blue-300 bg-blue-900/20">
                {questionCount}/{maxQuestions}
              </Badge>
            </div>
          </div>
          {voiceSupported && (
            <Button
              onClick={onToggleSpeech}
              variant="outline"
              size="sm"
              className="bg-slate-700/50 border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
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
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-6 rounded-lg border border-purple-500/30 shadow-inner">
          <p className="text-white text-lg leading-relaxed font-medium">
            {currentQuestion}
          </p>
        </div>
        {isSpeaking && (
          <div className="mt-3 flex items-center gap-2 text-purple-300">
            <Volume2 className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Speaking question...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
