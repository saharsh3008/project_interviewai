
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, CheckCircle, Loader2 } from "lucide-react";

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
                  onClick={isListening ? onStopListening : onStartListening}
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
                  onClick={onClearAnswer}
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
            onClick={onSubmitAnswer}
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
  );
};

export default VoiceAnswerInput;
