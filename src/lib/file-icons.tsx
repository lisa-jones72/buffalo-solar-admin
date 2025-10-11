import { FileText, FileImage, File, FileArchive } from "lucide-react";

export function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return FileImage;
  }
  if (mimeType.includes("pdf")) {
    return FileText;
  }
  if (mimeType.includes("zip") || mimeType.includes("compressed")) {
    return FileArchive;
  }
  return File;
}

export function getFileTypeLabel(mimeType: string): string {
  const typeMap: Record<string, string> = {
    "application/pdf": "PDF",
    "image/jpeg": "JPEG",
    "image/jpg": "JPG",
    "image/png": "PNG",
    "image/gif": "GIF",
    "application/zip": "ZIP",
    "application/x-zip-compressed": "ZIP",
    "text/plain": "TXT",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "DOCX",
  };

  return typeMap[mimeType] || mimeType.split("/")[1]?.toUpperCase() || "FILE";
}
