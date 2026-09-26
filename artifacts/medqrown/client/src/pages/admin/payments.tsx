import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Phone, Calendar, Search, Edit, Check, X, AlertTriangle, ShieldCheck } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState<"Pending" | "Flagged" | "Approved" | "Rejected">("Pending");
  const { data: admin } = useQuery<any>({ queryKey: ["/api/admin/me"] });

  
  const { data: groups, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/payments", { status: activeTab }],
    queryFn: async () => {
      const res = await fetch(`/api/admin/payments?status=${activeTab}`);
      if (!res.ok) throw new Error("Failed to load payments");
      return res.json();
    }
  });

  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set());
  
  // Modals
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; entries: number[] }>({ open: false, entries: [] });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; entries: number[] }>({ open: false, entries: [] });
  const [editDialog, setEditDialog] = useState<{ open: boolean; entry: any }>({ open: false, entry: null });

  const { toast } = useToast();

  const toggleEntry = (id: number) => {
    const next = new Set(selectedEntries);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEntries(next);
  };

  const toggleGroup = (groupIds: number[]) => {
    const next = new Set(selectedEntries);
    const allSelected = groupIds.every(id => next.has(id));
    if (allSelected) {
      groupIds.forEach(id => next.delete(id));
    } else {
      groupIds.forEach(id => next.add(id));
    }
    setSelectedEntries(next);
  };

  const approveMutation = useMutation({
    mutationFn: async (data: { entryIds: number[]; endDate?: string }) => {
      const res = await apiRequest("POST", "/api/admin/payments/approve", data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to approve");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      setApproveDialog({ open: false, entries: [] });
      setSelectedEntries(new Set());
      toast({ title: "Payments approved successfully." });
    },
    onError: (e: any) => toast({ title: "Approval Failed", description: e.message, variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (data: { entryIds: number[]; reason: string }) => {
      const res = await apiRequest("POST", "/api/admin/payments/reject", data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to reject");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      setRejectDialog({ open: false, entries: [] });
      setSelectedEntries(new Set());
      toast({ title: "Payments rejected." });
    },
    onError: (e: any) => toast({ title: "Rejection Failed", description: e.message, variant: "destructive" }),
  });

  const editMutation = useMutation({
    mutationFn: async ({ entryId, data }: { entryId: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/payments/${entryId}`, data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update entry");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      setEditDialog({ open: false, entry: null });
      toast({ title: "Payment entry updated." });
    },
    onError: (e: any) => toast({ title: "Update Failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/3">
      <AdminNav admin={admin} />
      <header className="hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-lg font-bold flex-1">Payments Queue</h1>
          {selectedEntries.size > 0 && activeTab !== "Approved" && activeTab !== "Rejected" && (
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={() => setRejectDialog({ open: true, entries: Array.from(selectedEntries) })}>
                <X className="w-4 h-4 mr-2" /> Reject ({selectedEntries.size})
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setApproveDialog({ open: true, entries: Array.from(selectedEntries) })}>
                <Check className="w-4 h-4 mr-2" /> Approve ({selectedEntries.size})
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex gap-2 mb-6 bg-muted/50 p-1 rounded-lg w-fit overflow-x-auto">
          {(["Pending", "Flagged", "Approved", "Rejected"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedEntries(new Set()); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "Pending" && <Calendar className="w-4 h-4" />}
              {tab === "Flagged" && <AlertTriangle className="w-4 h-4" />}
              {tab === "Approved" && <ShieldCheck className="w-4 h-4" />}
              {tab === "Rejected" && <X className="w-4 h-4" />}
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        ) : !groups || groups.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="py-16 text-center text-muted-foreground">
              No payments found in the {activeTab.toLowerCase()} queue.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {groups.map((group, idx) => {
              const allEntryIds = group.entries.map((e: any) => e.id);
              const isFullySelected = allEntryIds.every((id: number) => selectedEntries.has(id));
              const isPartiallySelected = allEntryIds.some((id: number) => selectedEntries.has(id)) && !isFullySelected;

              return (
                <Card key={idx} className={`shadow-sm overflow-hidden border-t-4 ${group.isFlagged ? "border-t-yellow-500" : activeTab === "Approved" ? "border-t-green-500" : activeTab === "Rejected" ? "border-t-red-500" : "border-t-primary"}`}>
                  <div className="bg-muted/30 px-4 py-3 border-b flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      {(activeTab === "Pending" || activeTab === "Flagged") && (
                        <Checkbox 
                          checked={isFullySelected ? true : isPartiallySelected ? "indeterminate" : false} 
                          onCheckedChange={() => toggleGroup(allEntryIds)} 
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono font-bold text-lg">{group.code}</h3>
                          {group.isComplete ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Complete</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Incomplete</Badge>
                          )}
                          {group.isFlagged && <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1"/> Flagged</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Source: {group.sources.join(", ")} • Total Amount: KES {group.totalAmount} • Plans: {group.plans.join(", ")}
                        </p>
                      </div>
                    </div>
                    {(activeTab === "Pending" || activeTab === "Flagged") && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setRejectDialog({ open: true, entries: allEntryIds })}>Reject Group</Button>
                        <Button size="sm" onClick={() => setApproveDialog({ open: true, entries: allEntryIds })}>Approve Group</Button>
                      </div>
                    )}
                  </div>
                  <div className="divide-y">
                    {group.entries.map((entry: any) => (
                      <div key={entry.id} className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:bg-muted/10 transition-colors">
                        <div className="flex items-start gap-3">
                          {(activeTab === "Pending" || activeTab === "Flagged") && (
                            <Checkbox className="mt-1" checked={selectedEntries.has(entry.id)} onCheckedChange={() => toggleEntry(entry.id)} />
                          )}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{entry.studentName}</span>
                              <Badge variant="outline" className="text-[10px]">{entry.plan.toUpperCase()}</Badge>
                              <Badge variant="secondary" className="text-[10px]">{entry.membershipStatus}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{entry.studentEmail}</span>
                              <a href={`tel:${entry.studentPhone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                                <Phone className="w-3 h-3" /> {entry.studentPhone}
                              </a>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Submitted: {new Date(entry.createdAt).toLocaleString()}
                            </div>
                            {(entry.status === "approved" || entry.status === "rejected") && (
                              <div className="text-xs mt-2 p-2 bg-muted rounded-md inline-block">
                                <span className="font-medium text-foreground">{entry.status === "approved" ? "Approved" : "Rejected"}</span> by {entry.reviewerName} on {new Date(entry.reviewedAt).toLocaleDateString()}
                                {entry.rejectReason && <span className="block text-destructive mt-1">Reason: {entry.rejectReason}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        {(entry.status === "pending" || entry.status === "flagged") && (
                          <Button variant="ghost" size="sm" onClick={() => setEditDialog({ open: true, entry })}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onOpenChange={(o) => !o && setApproveDialog({ open: false, entries: [] })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {approveDialog.entries.length} Payment(s)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Approving will extend memberships for the selected students based on standard cohort rules.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Override End Date (Optional)</label>
              <Input 
                type="date" 
                id="overrideDate"
              />
              <p className="text-xs text-muted-foreground">Leave empty to use automatic calculation.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialog({ open: false, entries: [] })}>Cancel</Button>
              <Button 
                onClick={() => {
                  const dateVal = (document.getElementById('overrideDate') as HTMLInputElement)?.value;
                  approveMutation.mutate({ 
                    entryIds: approveDialog.entries, 
                    endDate: dateVal || undefined 
                  });
                }} 
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? "Approving..." : "Confirm Approval"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(o) => !o && setRejectDialog({ open: false, entries: [] })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectDialog.entries.length} Payment(s)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Rejection *</label>
              <Textarea 
                id="rejectReason" 
                placeholder="e.g. Invalid code, insufficient amount, etc." 
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">Students will receive this reason in their notification.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialog({ open: false, entries: [] })}>Cancel</Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  const reason = (document.getElementById('rejectReason') as HTMLTextAreaElement)?.value;
                  if (!reason?.trim()) {
                    toast({ title: "Reason Required", description: "You must provide a reason to reject.", variant: "destructive" });
                    return;
                  }
                  rejectMutation.mutate({ entryIds: rejectDialog.entries, reason });
                }} 
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(o) => !o && setEditDialog({ open: false, entry: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Entry</DialogTitle>
          </DialogHeader>
          {editDialog.entry && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction Code</label>
                <Input 
                  id="editCode"
                  defaultValue={editDialog.entry.code}
                  className="font-mono uppercase"
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan</label>
                <Select defaultValue={editDialog.entry.plan} onValueChange={(v) => {
                  const el = document.getElementById('editPlanVal') as HTMLInputElement;
                  if(el) el.value = v;
                }}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" id="editPlanVal" value={editDialog.entry.plan} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialog({ open: false, entry: null })}>Cancel</Button>
                <Button 
                  onClick={() => {
                    const newCode = (document.getElementById('editCode') as HTMLInputElement)?.value;
                    const newPlan = (document.getElementById('editPlanVal') as HTMLInputElement)?.value;
                    editMutation.mutate({
                      entryId: editDialog.entry.id,
                      data: { code: newCode.replace(/\s+/g, "").toUpperCase(), plan: newPlan }
                    });
                  }} 
                  disabled={editMutation.isPending}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
