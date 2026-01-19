
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Code2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface CodeWorkspaceProps {
    currentQuestion: string;
    onCodeSubmit: (code: string, language: string) => void;
    isLoading: boolean;
}

const CodeWorkspace = ({ currentQuestion, onCodeSubmit, isLoading }: CodeWorkspaceProps) => {
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState("// Write your solution here\n");

    const handleRun = () => {
        onCodeSubmit(code, language);
    };

    const getLanguageTemplate = (lang: string) => {
        switch (lang) {
            case "javascript": return "// Write your solution here\nfunction solution() {\n  \n}";
            case "python": return "# Write your solution here\ndef solution():\n    pass";
            case "java": return "// Write your solution here\nclass Solution {\n    public void solve() {\n        \n    }\n}";
            case "cpp": return "// Write your solution here\n#include <iostream>\n\nvoid solve() {\n    \n}";
            default: return "";
        }
    };

    const handleLanguageChange = (val: string) => {
        setLanguage(val);
        setCode(getLanguageTemplate(val));
    };

    return (
        <Card className="glass-card overflow-hidden h-full flex flex-col border-white/5">
            <CardHeader className="bg-white/5 border-b border-white/5 pb-4 flex-shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                            <Code2 className="h-5 w-5 text-blue-400" />
                            Code Editor
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs mt-1">
                            Write and run your code solution.
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select value={language} onValueChange={handleLanguageChange}>
                            <SelectTrigger className="glass-input h-9 w-32 text-xs border-white/10 bg-black/20">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1b26] border-purple-500/20 text-white">
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handleRun}
                            disabled={isLoading || !code.trim()}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white h-9 px-4 rounded-lg shadow-lg shadow-green-900/20"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Play className="h-3 w-3 mr-2 fill-current" />
                                    Run & Submit
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 flex-grow relative min-h-[400px]">
                {/* Editor Container */}
                <div className="absolute inset-0">
                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        theme="vs-dark"
                        onChange={(value) => setCode(value || "")}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 20, bottom: 20 },
                            roundedSelection: true,
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default CodeWorkspace;
