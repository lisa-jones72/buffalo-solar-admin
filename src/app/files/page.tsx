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
import { Search, Download, Loader2, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { formatFileSize } from "@/lib/formatters";
import { getFileIcon, getFileTypeLabel } from "@/lib/file-icons";
import dynamic from "next/dynamic";

// Dynamically import DocumentViewer with no SSR
const DocumentViewer = dynamic(
  () => import("@/components/document-viewer").then(mod => mod.DocumentViewer),
  { ssr: false }
);

interface FileData {
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  formType: string;
  submissionId: string;
  submitterName?: string;
  submitterEmail?: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewerFile, setViewerFile] = useState<FileData | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    try {
      setLoading(true);
      const response = await fetch("/api/files");
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredFiles = files.filter((file) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      file.originalName.toLowerCase().includes(searchLower) ||
      file.submitterName?.toLowerCase().includes(searchLower) ||
      file.submitterEmail?.toLowerCase().includes(searchLower) ||
      file.formType.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Files"
        subtitle="All files uploaded through form submissions"
      />

      <div className="p-6">
        <Card className="p-6">
          {/* Search */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by filename, submitter, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Files Table */}
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Form Type</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading files...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredFiles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-muted-foreground"
                    >
                      {searchQuery
                        ? "No files match your search."
                        : "No files uploaded yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFiles.map((file) => {
                    const FileIcon = getFileIcon(file.mimeType);
                    return (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div 
                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setViewerFile(file)}
                          >
                            <FileIcon className="h-5 w-5 text-primary" />
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate hover:text-primary">
                                {file.originalName}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getFileTypeLabel(file.mimeType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatFileSize(file.size)}
                        </TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {file.submitterName}
                            </p>
                            {file.submitterEmail && (
                              <p className="text-xs text-muted-foreground truncate">
                                {file.submitterEmail}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {file.formType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {file.uploadedAt}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              title="Download file"
                            >
                              <a
                                href={file.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewerFile(file)}
                              title="View file"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Stats */}
          {!loading && filteredFiles.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-6">
                <span>
                  Total size:{" "}
                  {formatFileSize(
                    filteredFiles.reduce((sum, file) => sum + file.size, 0)
                  )}
                </span>
                <span>
                  {
                    filteredFiles.filter((f) => f.mimeType.includes("pdf"))
                      .length
                  }{" "}
                  PDFs
                </span>
                <span>
                  {
                    filteredFiles.filter((f) => f.mimeType.startsWith("image/"))
                      .length
                  }{" "}
                  Images
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={fetchFiles}>
                Refresh
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Document Viewer */}
      {viewerFile && (
        <DocumentViewer
          isOpen={true}
          onClose={() => setViewerFile(null)}
          fileUrl={viewerFile.url}
          fileName={viewerFile.originalName}
          mimeType={viewerFile.mimeType}
        />
      )}
    </div>
  );
}
