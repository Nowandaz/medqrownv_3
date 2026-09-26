import { useStage8Dashboard } from "@/hooks/use-stage8"; // Will create this from use-student-stage8
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Activity, Clock, AlertCircle, Calendar, GraduationCap, Megaphone, Receipt } from "lucide-react";
import { RenewMembershipDialog } from "@/components/student/renew-membership-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FEATURES } from "@/lib/feature-flags";
import { useState, useEffect } from "react";

function UpcomingCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      if (distance < 0) {
        setTimeLeft("Starts soon");
        clearInterval(interval);
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      if (days > 0) setTimeLeft(`${days}d ${hours}h`);
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m`);
      else setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className="font-mono">{timeLeft || "..."}</span>;
}

export default function StudentDashboard() {
  const { data: dashboard, isLoading } = useStage8Dashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium">Unable to load dashboard</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  const { membership, pendingPayment, nextExam, latestAnnouncement, recentResults } = dashboard;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back. Here's a snapshot of your account and studies.
        </p>
      </div>

      {membership?.status === "grace" && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Membership Grace Period</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Your membership is in its grace period and will fully expire on {membership.graceEndDate}. Please renew your membership to maintain access.
            </p>
          </div>
        </div>
      )}

      {membership?.status === "expired" && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800 dark:text-red-400">Membership Expired</h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Your membership expired on {membership.endDate}. Access to exams and new content is restricted.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" /> My Membership
            </CardTitle>
          </CardHeader>
          <CardContent>
            {membership ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <Badge variant={membership.status === "active" ? "default" : membership.status === "grace" ? "secondary" : "destructive"}>
                    {membership.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-muted-foreground text-sm">Valid Until</span>
                  <span className="font-medium text-sm">{membership.endDate || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-muted-foreground text-sm">Days Remaining</span>
                  <span className="font-medium text-sm">{membership.daysRemaining ?? "0"} days</span>
                </div>
                <div className="pt-2">
                  <RenewMembershipDialog />
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No membership details found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="w-5 h-5 text-primary" /> Pending Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPayment ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-muted-foreground text-sm">Code</span>
                  <span className="font-medium text-sm font-mono">{pendingPayment.code}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-muted-foreground text-sm">Plan</span>
                  <span className="font-medium text-sm capitalize">{pendingPayment.plan}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-muted-foreground text-sm">Amount</span>
                  <span className="font-medium text-sm">${pendingPayment.amount}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-muted-foreground text-sm">Date</span>
                  <span className="font-medium text-sm">{new Date(pendingPayment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="flex h-[150px] flex-col items-center justify-center text-center">
                <Receipt className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium">No pending payments</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You have no pending payments awaiting review.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" /> Next Exam
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {nextExam ? (
              <div className="bg-primary/5 rounded-lg border border-primary/10 p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{nextExam.title}</h3>
                  <p className="text-sm text-muted-foreground">{nextExam.className}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Opens</p>
                    <p className="font-medium">{new Date(nextExam.opensAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Closes</p>
                    <p className="font-medium">{new Date(nextExam.closesAt).toLocaleString()}</p>
                  </div>
                </div>
                {nextExam.countdownSeconds > 0 ? (
                  <div className="pt-2 flex items-center gap-2 text-primary font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Starts in: <UpcomingCountdown targetDate={nextExam.opensAt} /></span>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center gap-2 text-green-600 font-medium">
                    <Activity className="w-4 h-4" />
                    <span>Currently Open</span>
                  </div>
                )}
                <Button className="w-full mt-2" asChild>
                  <Link href={`/student/my-class?classId=${nextExam.classId}`}>Go to Class</Link>
                </Button>
              </div>
            ) : (
              <div className="flex h-[200px] flex-col items-center justify-center text-center">
                <Clock className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium">No upcoming exams</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You don't have any scheduled exams in your classes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="h-5 w-5 text-primary" /> Latest Announcement
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {latestAnnouncement ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-semibold">{latestAnnouncement.title}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(latestAnnouncement.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {latestAnnouncement.className && (
                  <Badge variant="outline" className="mb-2">{latestAnnouncement.className}</Badge>
                )}
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {latestAnnouncement.message}
                </p>
                <Button variant="ghost" className="w-full mt-4" asChild>
                  <Link href="/student/my-class">View all announcements</Link>
                </Button>
              </div>
            ) : (
              <div className="flex h-[200px] flex-col items-center justify-center text-center">
                <Megaphone className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium">No announcements</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Check back later for updates from your classes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" /> Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!recentResults || recentResults.length === 0 ? (
              <div className="flex h-[150px] flex-col items-center justify-center text-center">
                <Activity className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium">No recent results</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete an exam to see your results here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recentResults.map((result) => (
                  <Link key={result.attemptId} href={`/student/results?examId=${result.examId}`}>
                    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer h-full">
                      <div className="space-y-1 min-w-0 pr-4">
                        <p className="text-sm font-medium leading-none truncate">{result.examTitle}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.className}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col items-center justify-center shrink-0 w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {result.scorePercent}%
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {recentResults && recentResults.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Button variant="outline" asChild>
                  <Link href="/student/results">View all history</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
