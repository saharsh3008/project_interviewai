
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
    <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-purple-500/10 hover:border-purple-500/20">
      <CardHeader className="bg-white/5 border-b border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-white flex items-center gap-3 text-lg">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/20">
                <MessageSquare className="h-5 w-5 text-purple-400" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Current Question
              </span>
            </CardTitle>
            <div className="flex gap-2 pl-[3.25rem]">
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 transition-colors">
                {categories.find(c => c.value === selectedCategory)?.label}
              </Badge>
              <Badge variant="outline" className="border-blue-500/30 text-blue-300 bg-blue-500/5">
                #{questionCount} of {maxQuestions}
              </Badge>
            </div>
          </div>

          {voiceSupported && (
            <Button
              onClick={onToggleSpeech}
              variant="outline"
              size="sm"
              className={`
                border-white/10 transition-all duration-300
                ${isSpeaking
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-4 w-4 mr-2" />
                  Stop Reading
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Read Aloud
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-8">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full opacity-50"></div>
          <p className="text-white text-xl md:text-2xl leading-relaxed font-medium pl-6 font-sans tracking-wide">
            {currentQuestion}
          </p>
        </div>

        {isSpeaking && (
          <div className="mt-6 flex items-center gap-3 text-purple-300 bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 w-fit animate-fade-in">
            <div className="flex gap-1 h-4 items-end">
              <div className="w-1 bg-purple-400 rounded-full animate-[music-bar_1s_ease-in-out_infinite]" style={{ animationDelay: '0s' }}></div>
              <div className="w-1 bg-purple-400 rounded-full animate-[music-bar_1s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 bg-purple-400 rounded-full animate-[music-bar_1s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm font-medium">Reading question...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
