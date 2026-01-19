
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, CheckCircle, Loader2, Keyboard, Sparkles } from "lucide-react";

interface VoiceAnswerInputProps {
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isLoading: boolean;
  voiceSupported: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onClearAnswer: () => void;
  onSubmitAnswer: () => void;
}

const VoiceAnswerInput = ({
  userAnswer,
  setUserAnswer,
  transcript,
  interimTranscript,
  isListening,
  isLoading,
  voiceSupported,
  onStartListening,
  onStopListening,
  onClearAnswer,
  onSubmitAnswer
}: VoiceAnswerInputProps) => {
  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 relative group">
      {/* Glow effect on hover/focus */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardHeader className="bg-white/5 border-b border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/20">
                <Mic className="h-5 w-5 text-blue-400" />
              </div>
              Your Answer
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Speak naturally or type your response below
            </CardDescription>
          </div>
          {userAnswer && (
            <Button
              onClick={onClearAnswer}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-white/5"
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Voice Control Center */}
        {voiceSupported && (
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <Button
              onClick={isListening ? onStopListening : onStartListening}
              disabled={isLoading}
              className={`
                 relative h-20 w-20 rounded-full transition-all duration-500 
                 flex items-center justify-center shadow-xl
                 ${isListening
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 ring-4 ring-red-500/20 scale-110'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30'
                }
               `}
            >
              {isListening ? (
                <>
                  <span className="absolute inset-0 rounded-full animate-ping bg-red-500/30"></span>
                  <MicOff className="h-8 w-8 text-white relative z-10" />
                </>
              ) : (
                <Mic className="h-8 w-8 text-white" />
              )}
            </Button>

            <div className="text-center h-6">
              {isListening ? (
                <span className="text-red-400 font-medium animate-pulse flex items-center gap-2">
                  Listening... <span className="text-slate-500 text-xs font-normal">(Click stop when done)</span>
                </span>
              ) : (
                <span className="text-slate-400 text-sm">
                  Click to start recording
                </span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="relative">
            <Textarea
              placeholder={voiceSupported ? "Transcript will appear here as you speak..." : "Type your detailed answer here..."}
              value={userAnswer + (interimTranscript ? ` ${interimTranscript}` : "")}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="glass-input min-h-[160px] text-lg text-white placeholder:text-slate-500/70 p-4 rounded-xl resize-none leading-relaxed border-white/10 focus:border-blue-500/50"
              readOnly={isListening}
            />
            {!voiceSupported && (
              <div className="absolute right-4 bottom-4 text-slate-500">
                <Keyboard className="h-4 w-4" />
              </div>
            )}

            {/* Interim Transcript Overlay */}
            {interimTranscript && (
              <div className="absolute top-4 left-4 right-4 bottom-16 pointer-events-none">
                <span className="text-blue-300 opacity-50">{userAnswer}</span>
                <span className="text-blue-400 font-medium">{interimTranscript}</span>
              </div>
            )}
          </div>

          <Button
            onClick={onSubmitAnswer}
            disabled={isLoading || !userAnswer.trim()}
            className={`
              w-full h-14 text-lg font-medium rounded-xl shadow-lg transition-all duration-300
              ${userAnswer.trim()
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-500/25 translate-y-0 opacity-100'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Response...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Submit Answer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceAnswerInput;
