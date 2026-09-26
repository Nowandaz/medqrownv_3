import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AnalyticsTab({ analytics, examId }: { analytics: any[]; examId: number }) {
  const { toast } = useToast();
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [saqMarkFilter, setSaqMarkFilter] = useState<string>("all");

  const { data: savedAnalyses } = useQuery<any[]>({
    queryKey: [`/api/admin/exams/${examId}/ai-analysis`],
  });

  const analyzeAI = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/exams/${examId}/ai-analysis`, {
        questionIds: Array.from(selectedQuestions)
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/exams/${examId}/ai-analysis`] });
      setSelectedQuestions(new Set());
      toast({ title: "Analysis complete", description: "Examiner feedback has been saved." });
    },
    onError: (e: any) => toast({ title: "Analysis failed", description: e.message, variant: "destructive" })
  });

  const downloadRevisionPack = async () => {
    try {
      const res = await fetch(`/api/admin/exams/${examId}/revision-pack`);
      if (!res.ok) throw new Error("Failed to fetch revision pack");
      const data = await res.json();
      
      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `revision-pack-exam-${examId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: "Revision pack downloaded" });
    } catch (e: any) {
      toast({ title: "Download failed", description: e.message, variant: "destructive" });
    }
  };

  const toggleSelection = (qId: number) => {
    const next = new Set(selectedQuestions);
    if (next.has(qId)) next.delete(qId);
    else next.add(qId);
    setSelectedQuestions(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">Performance Analytics</h3>
          <p className="text-xs text-muted-foreground">{analytics.length} questions analyzed</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedQuestions.size > 0 && (
            <Button size="sm" onClick={() => analyzeAI.mutate()} disabled={analyzeAI.isPending} className="gap-2">
              <Sparkles className="w-4 h-4" />
              {analyzeAI.isPending ? "Analyzing..." : `Analyze ${selectedQuestions.size} with AI`}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={downloadRevisionPack} className="gap-2">
            <Download className="w-4 h-4" /> Revision Pack
          </Button>
        </div>
      </div>
      
      {analytics.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">No analytics data available. Wait for students to submit.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {analytics.map((a: any) => {
            const analysis = savedAnalyses?.find(sa => sa.questionId === a.questionId);
            const correctRate = a.totalAttempts > 0 ? (a.correctCount / a.totalAttempts) * 100 : 0;
            const isSelected = selectedQuestions.has(a.questionId);

            return (
              <Card key={a.questionId} className={`shadow-sm overflow-hidden transition-colors ${isSelected ? "border-primary ring-1 ring-primary/20" : ""}`}>
                <CardHeader className="py-3 px-4 bg-muted/20 border-b flex flex-row items-start gap-3 space-y-0">
                  <div className="pt-0.5">
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSelection(a.questionId)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{a.type}</Badge>
                      <span className="text-xs text-muted-foreground font-medium">{a.totalAttempts} answered</span>
                      <span className="text-xs text-muted-foreground font-medium">Avg Mark: {a.avgMarks.toFixed(1)}</span>
                      {a.totalAttempts > 0 && (
                        <Badge variant={correctRate >= 50 ? "default" : "destructive"} className="text-xs ml-auto">
                          {correctRate.toFixed(0)}% correct
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{a.content}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 space-y-4">
                  {/* MCQ Distribution */}
                  {a.type === "mcq" && a.options && (
                    <div className="space-y-2 mt-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Option Distribution</p>
                      {a.options.map((opt: any, idx: number) => {
                        const optRate = a.totalAttempts > 0 ? (opt.count / a.totalAttempts) * 100 : 0;
                        const isFlagged = !opt.isCorrect && optRate > 30;
                        
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="flex items-center gap-1.5 truncate max-w-[70%]">
                                {opt.isCorrect && <CheckCircle className="w-3 h-3 text-green-600 shrink-0" />}
                                {isFlagged && <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />}
                                <span className={opt.isCorrect ? "font-medium text-green-700 dark:text-green-400" : ""}>{opt.content}</span>
                              </span>
                              <span className="font-medium shrink-0">{opt.count} ({optRate.toFixed(0)}%)</span>
                            </div>
                            <Progress 
                              value={optRate} 
                              className={`h-1.5 ${opt.isCorrect ? "bg-green-100 dark:bg-green-950 [&>div]:bg-green-600" : isFlagged ? "bg-red-100 dark:bg-red-950 [&>div]:bg-red-500" : ""}`} 
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SAQ Responses */}
                  {a.type === "saq" && (
                    <div className="space-y-3 mt-2 border-t pt-3">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student Responses</p>
                        <Select value={saqMarkFilter} onValueChange={setSaqMarkFilter}>
                          <SelectTrigger className="w-[120px] h-7 text-xs"><SelectValue placeholder="Filter by mark" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Marks</SelectItem>
                            <SelectItem value="full">Full Marks</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                            <SelectItem value="zero">Zero</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {a.modelAnswer && (
                        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-md mb-4">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Model Answer</p>
                          <p className="text-sm">{a.modelAnswer}</p>
                        </div>
                      )}
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {a.responses?.filter((r: any) => {
                          if (saqMarkFilter === "all") return true;
                          if (saqMarkFilter === "full") return r.mark === a.maxMarks;
                          if (saqMarkFilter === "zero") return r.mark === 0;
                          return r.mark > 0 && r.mark < a.maxMarks;
                        }).map((resp: any, idx: number) => (
                          <div key={idx} className="bg-muted/30 p-2.5 rounded-md border text-sm flex gap-3">
                            <div className="flex-1">
                              <p className="font-medium text-xs mb-0.5">{resp.studentName}</p>
                              <p className="text-muted-foreground">{resp.answer || <span className="italic">No answer provided</span>}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <Badge variant={resp.mark === a.maxMarks ? "default" : resp.mark > 0 ? "secondary" : "outline"} className="text-[10px]">
                                {resp.mark}/{a.maxMarks}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Result */}
                  {analysis && (
                    <div className="bg-primary/5 border border-primary/20 rounded-md p-4 mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold text-primary">Examiner Insight</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        {analysis.misconceptions && (
                          <div><span className="font-semibold text-xs uppercase text-muted-foreground">Misconceptions:</span> <p>{analysis.misconceptions}</p></div>
                        )}
                        {analysis.ambiguity && (
                          <div><span className="font-semibold text-xs uppercase text-muted-foreground">Flaws/Ambiguity:</span> <p>{analysis.ambiguity}</p></div>
                        )}
                        {analysis.improvements && (
                          <div><span className="font-semibold text-xs uppercase text-muted-foreground">Suggested Improvements:</span> <p>{analysis.improvements}</p></div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
