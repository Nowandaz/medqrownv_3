import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AdminNav } from "@/components/admin/admin-nav";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Search, Users } from "lucide-react";

export default function AdminWaitlist() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const { data: admin, isLoading: adminLoading } = useQuery<any>({
    queryKey: ["/api/admin/me"],
  });

  const { data: waitlist, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/waitlist"],
  });

  useEffect(() => {
    if (!adminLoading && !admin) setLocation("/admin");
  }, [adminLoading, admin, setLocation]);

  if (adminLoading) return <div className="min-h-screen bg-background" />;
  if (!admin) return null;

  const filtered = waitlist?.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const exportCsv = () => {
    if (!filtered.length) return;
    const header = "Name,Email,Date Joined\n";
    const csv = filtered.map(w => `"${w.name}","${w.email}","${new Date(w.createdAt).toLocaleDateString()}"`).join("\n");
    const blob = new Blob([header + csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/3">
      <AdminNav admin={admin} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Waitlist
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Manage users who have signed up for the next cohort.</p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search name or email..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Date Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ) : !filtered.length ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      {search ? "No waitlist entries match your search." : "The waitlist is currently empty."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell>{entry.email}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{entry.source || "Organic"}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
