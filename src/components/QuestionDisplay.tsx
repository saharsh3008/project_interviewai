
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
                {questionCount}/{maxQuestions}
              </Badge>
            </div>
          </div>
          {voiceSupported && (
            <Button
              onClick={onToggleSpeech}
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
  );
};

export default QuestionDisplay;
