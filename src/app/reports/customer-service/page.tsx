"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubmissionDetailDialog } from "@/components/submission-detail-dialog";
import { ShareLeadDialog } from "@/components/share-lead-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { formatPhoneNumber } from "@/lib/formatters";
import {
  Search,
  Download,
  MoreVertical,
  Eye,
  FileText,
  Loader2,
  Share2,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SupportSubmission {
  id: string;
  name: string; // ownerName
  businessName?: string;
  email: string;
  phone?: string;
  submittedAt: string;
  timestamp: number;
  formType: string; // "support"
  hasFiles: boolean;
  fileCount: number;
  issueDescription?: string;
}

function truncate(text: string, max = 80) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export default function CustomerServiceReportPage() {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [submissions, setSubmissions] = useState<SupportSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    id: string;
    type: string;
  } | null>(null);

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [submissionToShare, setSubmissionToShare] = useState<{
    id: string;
    type: string;
    name: string;
  } | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<{
    id: string;
    type: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSupportSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forms?type=support`);
      if (response.ok) {
        const data = (await response.json()) as SupportSubmission[];
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Error fetching support submissions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupportSubmissions();
    const interval = setInterval(() => {
      fetchSupportSubmissions();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchSupportSubmissions]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return submissions;
    return submissions.filter((item) => {
      const matches =
        item.name?.toLowerCase().includes(q) ||
        item.businessName?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        (item.phone && item.phone.includes(searchQuery)) ||
        item.issueDescription?.toLowerCase().includes(q);
      return !!matches;
    });
  }, [searchQuery, submissions]);

  function exportToCSV() {
    const headers = [
      "Business Name",
      "Owner Name",
      "Email",
      "Phone",
      "Date",
      "Issue Description",
      "Has Files",
      "File Count",
    ];
    const rows = filteredData.map((item) => [
      item.businessName || "",
      item.name || "",
      item.email || "",
      item.phone || "",
      item.submittedAt || "",
      (item.issueDescription || "").replace(/\r?\n/g, " "),
      item.hasFiles ? "Yes" : "No",
      String(item.fileCount || 0),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customer-service-submissions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async function handleDeleteSubmission() {
    if (!submissionToDelete) return;
    try {
      setDeleting(true);
      const response = await fetch(
        `/api/forms/${submissionToDelete.id}?type=${submissionToDelete.type}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete submission");
      }

      await fetchSupportSubmissions();
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Failed to delete submission. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col">
        <PageHeader
          title="Customer Service"
          subtitle="Support/service requests submitted from the website"
        />

        <div className="p-6">
          <Card className="p-6">
            {/* Controls */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by business, owner, email, phone, or issue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={fetchSupportSubmissions}>
                  Refresh
                </Button>
                <Button onClick={exportToCSV} disabled={filteredData.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Loading submissions...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-32 text-center text-muted-foreground"
                      >
                        {searchQuery
                          ? "No submissions match your search."
                          : "No submissions found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((submission) => (
                      <TableRow
                        key={submission.id}
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedSubmission({
                            id: submission.id,
                            type: submission.formType,
                          })
                        }
                      >
                        <TableCell className="font-medium">
                          {submission.businessName || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submission.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submission.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatPhoneNumber(submission.phone)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submission.issueDescription
                            ? truncate(submission.issueDescription, 90)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submission.submittedAt}
                        </TableCell>
                        <TableCell>
                          {submission.hasFiles && (
                            <Badge variant="outline" className="gap-1">
                              <FileText className="h-3 w-3" />
                              {submission.fileCount}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  setSelectedSubmission({
                                    id: submission.id,
                                    type: submission.formType,
                                  })
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSubmissionToShare({
                                    id: submission.id,
                                    type: submission.formType,
                                    name:
                                      submission.businessName ||
                                      submission.name ||
                                      "Submission",
                                  });
                                  setShareDialogOpen(true);
                                }}
                              >
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                  setSubmissionToDelete({
                                    id: submission.id,
                                    type: submission.formType,
                                    name:
                                      submission.businessName ||
                                      submission.name ||
                                      "Submission",
                                  });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      {/* Detail Dialog */}
      {selectedSubmission && (
        <SubmissionDetailDialog
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          submissionId={selectedSubmission.id}
          formType={selectedSubmission.type}
        />
      )}

      {/* Share Dialog */}
      {submissionToShare && (
        <ShareLeadDialog
          isOpen={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false);
            setSubmissionToShare(null);
          }}
          submissionId={submissionToShare.id}
          formType={submissionToShare.type}
          submissionName={submissionToShare.name}
          sharedBy={user?.displayName || user?.email || "Admin"}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the submission{" "}
              <strong>{submissionToDelete?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubmission}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

