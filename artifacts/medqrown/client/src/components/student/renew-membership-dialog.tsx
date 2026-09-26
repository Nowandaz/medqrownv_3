import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRenewalStatus, usePaymentDetails, useSubmitRenewal } from "@/hooks/use-student";
import { Copy, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RenewMembershipDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [plan, setPlan] = useState<"individual" | "group">("individual");
  
  const { data: status, isLoading: statusLoading } = useRenewalStatus();
  const { data: details, isLoading: detailsLoading } = usePaymentDetails();
  const submitRenewal = useSubmitRenewal();
  const { toast } = useToast();

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = () => {
    const normalizedCode = code.replace(/\s+/g, "").toUpperCase();
    if (normalizedCode.length !== 10) {
      toast({ title: "Invalid Code", description: "Payment code must be exactly 10 characters.", variant: "destructive" });
      return;
    }
    
    submitRenewal.mutate({ code: normalizedCode, plan }, {
      onSuccess: () => {
        toast({ title: "Payment Submitted", description: "Your payment code is pending verification." });
        setOpen(false);
        setCode("");
      },
      onError: (e: any) => {
        toast({ title: "Submission Failed", description: e.message, variant: "destructive" });
      }
    });
  };

  if (statusLoading) return null;
  if (!status?.available) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="default" className="w-full">Renew Membership</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Renew Membership</DialogTitle>
          <DialogDescription>
            Follow the instructions below to renew your membership via M-Pesa.
          </DialogDescription>
        </DialogHeader>
        
        {detailsLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !details ? (
          <div className="text-center p-4 text-destructive">Could not load payment details.</div>
        ) : (
          <div className="space-y-6 pt-4">
            {status.message && (
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 p-3 rounded-md text-sm flex items-start gap-2 border border-blue-200 dark:border-blue-900">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{status.message}</p>
              </div>
            )}
            
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-md relative group">
                  <p className="text-xs text-muted-foreground mb-1">Paybill / Business No.</p>
                  <p className="font-mono font-medium text-lg">{details.paybill}</p>
                  <Button 
                    variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCopy(details.paybill, "paybill")}
                  >
                    {copiedField === "paybill" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="p-3 bg-muted rounded-md relative group">
                  <p className="text-xs text-muted-foreground mb-1">Account No.</p>
                  <p className="font-mono font-medium text-lg">{details.accountNumber}</p>
                  <Button 
                    variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCopy(details.accountNumber, "account")}
                  >
                    {copiedField === "account" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="p-3 border rounded-md relative group flex flex-col gap-1">
                 <p className="text-xs text-muted-foreground">Account Name / Bank</p>
                 <p className="font-medium">{details.bankName}</p>
              </div>
              
              <div className="p-3 bg-muted rounded-md relative group">
                 <p className="text-xs text-muted-foreground mb-1">Important Note (Copy exactly)</p>
                 <p className="font-mono text-xs break-words">{details.accountNote}</p>
                 <Button 
                    variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCopy(details.accountNote, "note")}
                  >
                    {copiedField === "note" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
              </div>
              
              <div className="space-y-3 pt-2">
                <Label>Select Plan</Label>
                <Select value={plan} onValueChange={(v: "individual" | "group") => setPlan(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual (KES {details.individualPrice})</SelectItem>
                    <SelectItem value="group">Group of 4 (KES {details.groupPrice})</SelectItem>
                  </SelectContent>
                </Select>
                
                {plan === "group" && (
                  <p className="text-xs text-muted-foreground bg-muted p-2 rounded">{details.groupInstructions}</p>
                )}
              </div>
              
              <div className="space-y-2 pt-2">
                <Label>M-Pesa Transaction Code</Label>
                <Input 
                  placeholder="e.g. QAZ1234567" 
                  value={code} 
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  maxLength={15}
                  className="font-mono uppercase"
                />
                <p className="text-xs text-muted-foreground">Enter the 10-character code from your M-Pesa confirmation message.</p>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={handleSubmit} 
                disabled={submitRenewal.isPending || code.replace(/\s+/g, "").length !== 10}
              >
                {submitRenewal.isPending ? "Submitting..." : "Submit Payment Code"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
