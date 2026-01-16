"use client";

import { X, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  mimeType: string;
}

export function DocumentViewer({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  mimeType,
}: DocumentViewerProps) {
  const isPDF = mimeType.includes("pdf");
  const isImage = mimeType.includes("image");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-7xl max-h-[95vh] flex flex-col bg-background rounded-lg shadow-xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 flex-shrink-0 bg-background rounded-t-lg">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {fileName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mimeType}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Open in New Tab */}
            <Button variant="ghost" size="sm" asChild>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>

            {/* Download Button */}
            <Button variant="ghost" size="sm" asChild>
              <a
                href={fileUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                title="Download file"
              >
                <Download className="h-4 w-4" />
              </a>
            </Button>

            {/* Close Button */}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          {isPDF && (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title={fileName}
              style={{ minHeight: '500px' }}
            />
          )}

          {isImage && (
            <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain shadow-lg rounded"
              />
            </div>
          )}

          {!isPDF && !isImage && (
            <div className="flex flex-col items-center gap-4 text-center p-6">
              <p className="text-muted-foreground">
                Preview not available for this file type.
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={fileUrl}
                    download={fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
