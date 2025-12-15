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
import {
  Search,
  Download,
  MoreVertical,
  Eye,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { SubmissionDetailDialog } from "@/components/submission-detail-dialog";
import { formatPhoneNumber } from "@/lib/formatters";
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

type FormType =
  | "consultation"
  | "career"
  | "newsletter"
  | "contact"
  | "calculator";

interface FormSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  submittedAt: string;
  timestamp: number;
  formType: string;
  hasFiles: boolean;
  fileCount: number;
}

const formTypeTabs: { value: FormType; label: string }[] = [
  { value: "consultation", label: "Consultations" },
  { value: "career", label: "Career Applications" },
  { value: "newsletter", label: "Newsletter" },
];

export default function FormsPage() {
  const [activeTab, setActiveTab] = useState<FormType>("consultation");
  const [searchQuery, setSearchQuery] = useState("");
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    id: string;
    type: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<{
    id: string;
    type: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forms?type=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    // Fetch immediately
    fetchSubmissions();

    // Poll for new submissions every 30 seconds
    const interval = setInterval(() => {
      fetchSubmissions();
    }, 30000); // 30 seconds

    // Cleanup interval on unmount or tab change
    return () => clearInterval(interval);
  }, [fetchSubmissions]);

  const filteredData = submissions.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.phone && item.phone.includes(searchQuery));
    return matchesSearch;
  });

  // Handle delete submission
  async function handleDeleteSubmission() {
    if (!submissionToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(
        `/api/forms/${submissionToDelete.id}?type=${submissionToDelete.type}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete submission");
      }

      // Refresh the submissions list
      await fetchSubmissions();
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Failed to delete submission. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  // Export to CSV
  function exportToCSV() {
    const headers = ["Name", "Email", "Phone", "Date", "Has Files"];
    const rows = filteredData.map((item) => [
      item.name,
      item.email,
      item.phone || "",
      item.submittedAt,
      item.hasFiles ? "Yes" : "No",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-submissions-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex flex-col">
        <PageHeader
          title="Forms"
          subtitle="Manage form submissions and leads"
        />

        <div className="space-y-6 p-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border overflow-x-auto">
            {formTypeTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.value
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Card className="p-6">
            {/* Controls */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={exportToCSV}
                disabled={filteredData.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    {activeTab === "career" && <TableHead>Position</TableHead>}
                    <TableHead>Phone</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Loading submissions...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
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
                          {submission.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submission.email}
                        </TableCell>
                        {activeTab === "career" && (
                          <TableCell className="text-muted-foreground">
                            {submission.position || "N/A"}
                          </TableCell>
                        )}
                        <TableCell className="text-muted-foreground">
                          {formatPhoneNumber(submission.phone)}
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
                                  setSubmissionToDelete({
                                    id: submission.id,
                                    type: submission.formType,
                                    name: submission.name,
                                  });
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive focus:text-destructive"
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

            {/* Stats */}
            {!loading && filteredData.length > 0 && (
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <p>
                  Showing {filteredData.length}{" "}
                  {filteredData.length === 1 ? "submission" : "submissions"}
                </p>
                <Button variant="outline" size="sm" onClick={fetchSubmissions}>
                  Refresh
                </Button>
              </div>
            )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the submission from{" "}
              <strong>{submissionToDelete?.name}</strong>? This action cannot
              be undone.
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
