"use client";

import { useEffect, useState } from "react";
import { X, Download, Mail, Phone, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatPhoneNumber, formatFileSize } from "@/lib/formatters";

interface FileUpload {
  originalName: string;
  fileName: string;
  url: string;
  size: number;
  mimeType: string;
}

interface SubmissionDetail {
  id: string;
  formType: string;
  submittedAt: string;
  data: Record<string, unknown>;
  files: FileUpload[];
  metadata: {
    userAgent?: string;
    ip?: string;
    referrer?: string;
  };
}

interface SubmissionDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  formType: string;
}

export function SubmissionDetailDialog({
  isOpen,
  onClose,
  submissionId,
  formType,
}: SubmissionDetailDialogProps) {
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && submissionId) {
      fetchSubmission();
    }

    // Handle ESC key to close modal
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, submissionId, formType, onClose]);

  async function fetchSubmission() {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/forms/${submissionId}?type=${formType}`
      );
      if (response.ok) {
        const data = await response.json();
        setSubmission(data);
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  // Define preferred field order for better UX
  const fieldOrder = [
    "ownerName",
    "businessName",
    "name",
    "fullName",
    "firstName",
    "lastName",
    "email",
    "phone",
    "phoneNumber",
    "position",
    "address",
    "streetAddress",
    "city",
    "state",
    "zipCode",
    "zip",
    "country",
    "propertyType",
    "roofSize",
    "monthlyElectricBill",
    "systemSize",
    "message",
    "comments",
    "notes",
  ];

  // Sort submission data fields by preferred order
  function sortFields(data: Record<string, unknown>): [string, unknown][] {
    const entries = Object.entries(data).filter(
      // Filter out recaptcha-related fields
      ([key]) => !key.toLowerCase().includes("recaptcha")
    );

    return entries.sort((a, b) => {
      const aIndex = fieldOrder.indexOf(a[0]);
      const bIndex = fieldOrder.indexOf(b[0]);

      // If both are in the order list, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      // If only 'a' is in the list, it comes first
      if (aIndex !== -1) return -1;
      // If only 'b' is in the list, it comes first
      if (bIndex !== -1) return 1;
      // If neither is in the list, maintain original order (alphabetically)
      return a[0].localeCompare(b[0]);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-lg bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Submission Details
            </h2>
            <p className="text-sm text-muted-foreground capitalize">
              {formType} Form
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 w-24 rounded bg-muted"></div>
                  <div className="h-6 w-full rounded bg-muted"></div>
                </div>
              ))}
            </div>
          ) : submission ? (
            <div className="space-y-6">
              {/* Submission Date */}
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Submitted on{" "}
                    {format(
                      new Date(submission.submittedAt),
                      "MMMM dd, yyyy 'at' HH:mm"
                    )}
                  </span>
                </div>
              </Card>

              {/* Form Data */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Form Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {sortFields(submission.data).map(([key, value]) => {
                    const isPhone = key.toLowerCase().includes("phone");
                    const displayValue = isPhone
                      ? formatPhoneNumber(value as string)
                      : (value as string);

                    return (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-medium uppercase text-muted-foreground">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </label>
                        <div className="flex items-center gap-2">
                          {key.toLowerCase().includes("email") && (
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          )}
                          {isPhone && (
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          )}
                          <p className="text-sm font-medium text-foreground break-words">
                            {displayValue}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Files */}
              {submission.files && submission.files.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Uploaded Files ({submission.files.length})
                  </h3>
                  <div className="space-y-2">
                    {submission.files.map((file, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {file.originalName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)} • {file.mimeType}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {submission.metadata &&
                Object.keys(submission.metadata).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Technical Details
                    </h3>
                    <Card className="p-4">
                      <div className="space-y-2 text-xs">
                        {submission.metadata.ip && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              IP Address:
                            </span>
                            <span className="font-mono text-foreground">
                              {submission.metadata.ip}
                            </span>
                          </div>
                        )}
                        {submission.metadata.referrer && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Referrer:
                            </span>
                            <span className="truncate font-mono text-foreground max-w-[200px]">
                              {submission.metadata.referrer}
                            </span>
                          </div>
                        )}
                        {submission.metadata.userAgent && (
                          <div className="space-y-1">
                            <span className="text-muted-foreground">
                              User Agent:
                            </span>
                            <p className="font-mono text-foreground text-[10px] break-all">
                              {submission.metadata.userAgent}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                )}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              Failed to load submission details
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {submission && (
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Contact Submitter
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
