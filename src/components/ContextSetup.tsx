
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileText, Upload, Check, AlertCircle, X, Trash2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Set worker source for PDF.js - using unpkg for better version alignment
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface ContextSetupProps {
    onContextUpdate: (context: { resumeText?: string; jobDescription?: string }) => void;
    initialContext?: { resumeText?: string; jobDescription?: string };
}

const ContextSetup = ({ onContextUpdate, initialContext }: ContextSetupProps) => {
    const [resumeText, setResumeText] = useState(initialContext?.resumeText || "");
    const [jobDescription, setJobDescription] = useState(initialContext?.jobDescription || "");
    const [fileName, setFileName] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<"resume" | "job">("resume");

    // Sync changes to parent whenever local state updates
    useEffect(() => {
        onContextUpdate({ resumeText, jobDescription });
    }, [resumeText, jobDescription, onContextUpdate]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            alert("Please upload a PDF file.");
            return;
        }

        setFileName(file.name);
        setIsProcessing(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let extractedText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                // Fix for TypeScript error accessing 'str' on TextItem
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(" ");
                extractedText += pageText + "\n";
            }

            setResumeText(extractedText);
        } catch (error) {
            console.error("Error parsing PDF:", error);
            alert("Failed to parse PDF. Please try again or copy-paste text.");
            setFileName(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const clearResume = () => {
        setResumeText("");
        setFileName(null);
    };

    const clearJob = () => {
        setJobDescription("");
    };

    return (
        <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-black/20 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-purple-400" />
                        Interview Context
                    </CardTitle>
                    <div className="flex bg-slate-800/50 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab("resume")}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === "resume"
                                ? "bg-purple-600 text-white shadow-lg"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            Resume
                        </button>
                        <button
                            onClick={() => setActiveTab("job")}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === "job"
                                ? "bg-blue-600 text-white shadow-lg"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            Job Description
                        </button>
                    </div>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                    Add details to get personalized interview questions tailored to you.
                </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
                {activeTab === "resume" && (
                    <div className="p-5 space-y-4 animate-fade-in">
                        {!resumeText ? (
                            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 transition-colors group">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="resume-upload"
                                />
                                <label htmlFor="resume-upload" className="cursor-pointer block">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        {isProcessing ? (
                                            <div className="h-5 w-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Upload className="h-6 w-6 text-purple-400" />
                                        )}
                                    </div>
                                    <h4 className="text-white font-medium mb-1">Upload Resume (PDF)</h4>
                                    <p className="text-slate-500 text-xs">
                                        or paste text below manually
                                    </p>
                                </label>
                            </div>
                        ) : (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <Check className="h-4 w-4 text-green-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white text-sm font-medium">Resume Uploaded</h4>
                                        <p className="text-slate-400 text-xs">{fileName || "Text Content Active"}</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={clearResume}
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-slate-300 text-xs uppercase tracking-wider font-semibold">
                                    Or Paste Text
                                </Label>
                                {resumeText && <span className="text-xs text-purple-400">{resumeText.length} chars</span>}
                            </div>
                            <Textarea
                                placeholder="Paste your resume content here if you don't have a PDF..."
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                className="glass-input min-h-[120px] text-sm text-slate-300 font-mono"
                            />
                        </div>
                    </div>
                )}

                {activeTab === "job" && (
                    <div className="p-5 space-y-4 animate-fade-in">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                                <p className="text-blue-200 text-xs leading-relaxed">
                                    Paste the job description of the role you are applying for. The AI will tailor questions to match these specific requirements.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-slate-300 text-xs uppercase tracking-wider font-semibold">
                                    Job Description
                                </Label>
                                {jobDescription && (
                                    <Button
                                        onClick={clearJob}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-slate-400 hover:text-red-400 px-2"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                            <Textarea
                                placeholder="Paste Job Description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="glass-input min-h-[200px] text-sm text-slate-300 font-mono"
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ContextSetup;
