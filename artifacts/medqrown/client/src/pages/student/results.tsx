import { useStage8ResultsSummary, useStage8ResultsHistory } from "@/hooks/use-stage8";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, Award, BarChart3, CheckCircle2, Clock, Hash, Target, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StudentResults() {
  const { data: summary, isLoading: loadingSummary } = useStage8ResultsSummary();
  const { data: history, isLoading: loadingHistory } = useStage8ResultsHistory();

  if (loadingSummary || loadingHistory) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Results & Statistics</h1>
        <p className="text-muted-foreground mt-2">
          Track your performance and review past exam attempts.
        </p>
      </div>

      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exams Completed</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalResults}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.averageScore}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Trophy className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.bestScore}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.passRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Threshold: {summary.passThreshold}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Exam History
          </CardTitle>
          <CardDescription>
            Your most recent completed and released exams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!history || history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium">No history yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Complete your first exam to start seeing your performance history and detailed results here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((result) => {
                const passed = summary ? result.scorePercent >= summary.passThreshold : false;
                
                return (
                  <Link key={result.attemptId} href={`/student/exam-review?examId=${result.examId}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer gap-4">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{result.examTitle}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{result.className}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(result.submittedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 md:min-w-[300px]">
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Score</span>
                            <span className="font-medium">{result.scorePercent}%</span>
                          </div>
                          <Progress value={result.scorePercent} className="h-2" />
                          <p className="text-xs text-right text-muted-foreground mt-1">
                            {result.earnedMarks} / {result.totalMarks} marks
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center shrink-0 w-20 border-l pl-4">
                          {passed ? (
                            <>
                              <CheckCircle2 className="w-6 h-6 text-green-500 mb-1" />
                              <span className="text-xs font-medium text-green-600 dark:text-green-400">PASSED</span>
                            </>
                          ) : (
                            <>
                              <Activity className="w-6 h-6 text-amber-500 mb-1" />
                              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">REVIEW</span>
                            </>
                          )}
                        </div>
                        
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 hidden md:block" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}