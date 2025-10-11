/**
 * Format phone number for display
 * Handles various formats and returns a clean, formatted number
 */
export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) return "N/A";

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Handle different lengths
  if (cleaned.length === 10) {
    // Format as (XXX) XXX-XXXX
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else if (cleaned.length === 11 && cleaned[0] === "1") {
    // Format as +1 (XXX) XXX-XXXX
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7
    )}`;
  } else if (cleaned.length > 10) {
    // International or other format - just add spaces
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  }

  // Return as-is if it doesn't match expected patterns
  return phone;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
