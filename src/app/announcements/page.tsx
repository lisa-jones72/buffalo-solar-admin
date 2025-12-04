"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Calendar,
  Upload,
  X as XIcon,
  Info,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { format } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  summary: string;
  details: string;
  imageUrl?: string;
  modalType: 'info' | 'promotion' | 'alert' | 'update';
  ctaText?: string;
  ctaUrl?: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  lastActivatedAt?: Date;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewingAnnouncement, setViewingAnnouncement] =
    useState<Announcement | null>(null);
  const [autoDisablePrevious, setAutoDisablePrevious] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<Announcement | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    details: "",
    imageUrl: "",
    modalType: "info" as 'info' | 'promotion' | 'alert' | 'update',
    ctaText: "",
    ctaUrl: "",
    isActive: true,
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      const q = query(
        collection(db, "announcements"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const announcementsList: Announcement[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        announcementsList.push({
          id: doc.id,
          title: data.title,
          summary: data.summary,
          details: data.details,
          imageUrl: data.imageUrl,
          modalType: data.modalType || 'info',
          ctaText: data.ctaText,
          ctaUrl: data.ctaUrl,
          isActive: data.isActive,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastActivatedAt: data.lastActivatedAt?.toDate(),
        });
      });

      setAnnouncements(announcementsList);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDialog(announcement?: Announcement) {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        summary: announcement.summary,
        details: announcement.details,
        imageUrl: announcement.imageUrl || "",
        modalType: announcement.modalType || "info",
        ctaText: announcement.ctaText || "",
        ctaUrl: announcement.ctaUrl || "",
        isActive: announcement.isActive,
        startDate: format(announcement.startDate, "yyyy-MM-dd"),
        endDate: format(announcement.endDate, "yyyy-MM-dd"),
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: "",
        summary: "",
        details: "",
        imageUrl: "",
        modalType: "info",
        ctaText: "",
        ctaUrl: "",
        isActive: true,
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd"
        ),
      });
    }
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const announcementData = {
        title: formData.title,
        summary: formData.summary,
        details: formData.details,
        imageUrl: formData.imageUrl || null,
        modalType: formData.modalType,
        ctaText: formData.ctaText || null,
        ctaUrl: formData.ctaUrl || null,
        isActive: formData.isActive,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        updatedAt: Timestamp.now(),
      };

      if (editingAnnouncement) {
        // Update existing announcement
        const announcementRef = doc(db, "announcements", editingAnnouncement.id);
        await updateDoc(announcementRef, announcementData);
      } else {
        // Create new announcement
        
        // If auto-disable is enabled and new announcement is active, disable all other active announcements
        if (autoDisablePrevious && formData.isActive) {
          const activeAnnouncementsQuery = query(
            collection(db, "announcements"),
            where("isActive", "==", true)
          );
          const activeSnapshot = await getDocs(activeAnnouncementsQuery);
          
          const disablePromises = activeSnapshot.docs.map((doc) =>
            updateDoc(doc.ref, { isActive: false, updatedAt: Timestamp.now() })
          );
          
          await Promise.all(disablePromises);
        }
        
        await addDoc(collection(db, "announcements"), {
          ...announcementData,
          createdAt: Timestamp.now(),
        });
      }

      setDialogOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Error saving announcement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;

    try {
      await deleteDoc(doc(db, "announcements", deleteConfirm));
      fetchAnnouncements();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Error deleting announcement. Please try again.");
    }
  }

  async function confirmToggle() {
    if (!toggleConfirm) return;

    try {
      const announcementRef = doc(db, "announcements", toggleConfirm.id);
      const updateData: any = {
        isActive: !toggleConfirm.isActive,
        updatedAt: Timestamp.now(),
      };
      
      // If reactivating (was inactive, now becoming active), set lastActivatedAt
      // This makes the announcement show again to all users
      if (!toggleConfirm.isActive) {
        updateData.lastActivatedAt = Timestamp.now();
      }
      
      await updateDoc(announcementRef, updateData);
      fetchAnnouncements();
      setToggleConfirm(null);
    } catch (error) {
      console.error("Error toggling announcement status:", error);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPG, PNG, WebP, or GIF)");
      e.target.value = "";
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File is too large. Maximum size is 10MB");
      e.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/announcements/upload-image", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      setFormData({ ...formData, imageUrl: data.url });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage() {
    setFormData({ ...formData, imageUrl: "" });
  }

  return (
    <TooltipProvider>
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Announcements"
        subtitle="Create and manage website announcements and notifications"
      />

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage popup announcements that appear to users on the website
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Announcements Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No announcements yet. Create your first announcement!
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="w-[200px]">Dates</TableHead>
                <TableHead className="w-[180px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((announcement) => {
                const now = new Date();
                const isExpired = announcement.endDate < now;
                const isUpcoming = announcement.startDate > now;
                
                return (
                <TableRow 
                  key={announcement.id}
                  className="cursor-pointer"
                  onClick={() => setViewingAnnouncement(announcement)}
                >
                  <TableCell className="font-medium">
                    <span className="line-clamp-1 max-w-md">
                      {announcement.title}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-row flex-wrap items-center gap-1.5">
                      {isExpired ? (
                        <Badge
                          variant="destructive"
                          className="font-normal"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      ) : (
                        <>
                          <Badge
                            variant={announcement.isActive ? "default" : "secondary"}
                            className="font-normal"
                          >
                            {announcement.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {isUpcoming && (
                            <Badge
                              variant="outline"
                              className="font-normal text-xs"
                            >
                              Upcoming
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="text-sm text-muted-foreground">
                      {format(announcement.startDate, "MMM dd")} - {format(announcement.endDate, "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingAnnouncement(announcement)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Details</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setToggleConfirm(announcement)}
                          >
                            {announcement.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {announcement.isActive ? "Deactivate" : "Activate"}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(announcement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(announcement.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the announcement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Active Confirmation Dialog */}
      <AlertDialog open={!!toggleConfirm} onOpenChange={(open) => !open && setToggleConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleConfirm?.isActive ? "Deactivate" : "Activate"} Announcement?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleConfirm?.isActive
                ? "Users will no longer see this announcement on the website."
                : "This announcement will be shown to ALL users again, even those who have already seen it."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              {toggleConfirm?.isActive ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <Dialog
        open={!!viewingAnnouncement}
        onOpenChange={(open) => !open && setViewingAnnouncement(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Announcement Details</DialogTitle>
            <DialogDescription>
              Preview how this announcement will appear to users
            </DialogDescription>
          </DialogHeader>
          {viewingAnnouncement && (
            <div className="space-y-6">
              {/* Image Preview */}
              {viewingAnnouncement.imageUrl && (
                <div className="w-full rounded-lg overflow-hidden border">
                  <img
                    src={viewingAnnouncement.imageUrl}
                    alt={viewingAnnouncement.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Title & Summary */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    TITLE
                  </Label>
                  <h3 className="text-xl font-bold mt-1">
                    {viewingAnnouncement.title}
                  </h3>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    SUMMARY
                  </Label>
                  <p className="text-base mt-1">
                    {viewingAnnouncement.summary}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="border-t pt-4">
                <Label className="text-xs text-muted-foreground">
                  ADDITIONAL DETAILS
                </Label>
                <div className="prose prose-sm max-w-none mt-2">
                  {viewingAnnouncement.details.split("\n").map((line, index) => {
                    if (line.trim().startsWith("--")) {
                      return (
                        <p key={index} className="ml-4">
                          • {line.trim().substring(2).trim()}
                        </p>
                      );
                    }
                    return line.trim() ? (
                      <p key={index}>{line}</p>
                    ) : (
                      <br key={index} />
                    );
                  })}
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    STATUS
                  </Label>
                  <div className="mt-1 flex flex-row flex-wrap items-center gap-1.5">
                    {(() => {
                      const now = new Date();
                      const isExpired = viewingAnnouncement.endDate < now;
                      const isUpcoming = viewingAnnouncement.startDate > now;
                      
                      if (isExpired) {
                        return (
                          <Badge
                            variant="destructive"
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        );
                      }
                      
                      return (
                        <>
                          <Badge
                            variant={
                              viewingAnnouncement.isActive ? "default" : "secondary"
                            }
                          >
                            {viewingAnnouncement.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {isUpcoming && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              Upcoming
                            </Badge>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    DATE RANGE
                  </Label>
                  <p className="text-sm mt-1">
                    {format(viewingAnnouncement.startDate, "MMM dd, yyyy")} -{" "}
                    {format(viewingAnnouncement.endDate, "MMM dd, yyyy")}
                  </p>
                  {(() => {
                    const now = new Date();
                    const isExpired = viewingAnnouncement.endDate < now;
                    if (isExpired) {
                      return (
                        <p className="text-xs text-destructive mt-1">
                          This announcement expired on {format(viewingAnnouncement.endDate, "MMM dd, yyyy")}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewingAnnouncement(null);
                    handleOpenDialog(viewingAnnouncement);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewingAnnouncement(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
            <DialogDescription>
              Create an announcement that will appear as a popup modal to users
              on their first visit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-neutral-400">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Important Electricity Rate Update"
                className="text-neutral-600"
                required
              />
            </div>

            <div>
              <Label htmlFor="summary" className="text-neutral-400">Summary *</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                placeholder="Main message - shown prominently in large, bold text"
                className="text-neutral-600"
                rows={2}
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                Appears below title in large, bold text
              </p>
            </div>

            <div>
              <Label htmlFor="details" className="text-neutral-400">Additional Details *</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                placeholder="Supporting information - shown in smaller, lighter text. Use '--' for bullet points."
                className="text-neutral-600"
                rows={5}
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                Appears in smaller text. Start lines with &apos;--&apos; for bullet points
              </p>
            </div>

            <div>
              <Label htmlFor="imageUrl" className="text-neutral-400">Image (Optional)</Label>
              
              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="mt-2 mb-3 relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.alt = "Invalid image URL";
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                    title="Remove image"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              {!formData.imageUrl && (
                <div className="mt-2">
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Image"}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              )}

              {/* Or URL Input */}
              {!formData.imageUrl && (
                <div className="mt-3">
                  <p className="text-xs text-neutral-500 mb-2">
                    Or paste an image URL:
                  </p>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://storage.googleapis.com/..."
                    className="text-neutral-600"
                    disabled={uploading}
                  />
                </div>
              )}

              <p className="text-xs text-neutral-500 mt-2">
                {uploading ? "Uploading to GCS..." : "Max 10MB. JPG, PNG, WebP, or GIF."}
              </p>
            </div>

            <div>
              <Label htmlFor="modalType" className="text-neutral-400">Announcement Type *</Label>
              <Select
                value={formData.modalType}
                onValueChange={(value) =>
                  setFormData({ ...formData, modalType: value as any })
                }
              >
                <SelectTrigger className="w-full text-neutral-600">
                  <SelectValue placeholder="Select announcement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">ℹ️ Info - General information</SelectItem>
                  <SelectItem value="promotion">🏷️ Promotion - Special offers</SelectItem>
                  <SelectItem value="alert">⚠️ Alert - Important notices</SelectItem>
                  <SelectItem value="update">📢 Update - Company updates</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500 mt-1">
                Changes the icon shown in the modal
              </p>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="ctaText" className="text-neutral-400">Call-to-Action Button Text (Optional)</Label>
                <Input
                  id="ctaText"
                  value={formData.ctaText}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaText: e.target.value })
                  }
                  placeholder="e.g., Book Consultation, Learn More, View Projects"
                  className="text-neutral-600"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Button text - leave empty for no CTA button
                </p>
              </div>

              <div>
                <Label htmlFor="ctaUrl" className="text-neutral-400">Call-to-Action URL (Optional)</Label>
                <Select
                  value={formData.ctaUrl || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, ctaUrl: value })
                  }
                >
                  <SelectTrigger className="w-full text-neutral-600">
                    <SelectValue placeholder="-- Select a page --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/consultation">Consultation Page</SelectItem>
                    <SelectItem value="/blog">Blog / Newsroom</SelectItem>
                    <SelectItem value="/projects">Our Projects</SelectItem>
                    <SelectItem value="/warranty">Warranty Information</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-neutral-500 mt-1">
                  Where should the CTA button take users? Leave CTA text empty for no button.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <Label className="text-neutral-400">Start Date *</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal text-neutral-600"
                      type="button"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.startDate ? (() => {
                        const [year, month, day] = formData.startDate.split('-').map(Number);
                        return format(new Date(year, month - 1, day), "PPP");
                      })() : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.startDate ? (() => {
                        const [year, month, day] = formData.startDate.split('-').map(Number);
                        return new Date(year, month - 1, day);
                      })() : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          setFormData({ ...formData, startDate: `${year}-${month}-${day}` });
                          setStartDateOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-neutral-400">End Date *</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal text-neutral-600"
                      type="button"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.endDate ? (() => {
                        const [year, month, day] = formData.endDate.split('-').map(Number);
                        return format(new Date(year, month - 1, day), "PPP");
                      })() : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.endDate ? (() => {
                        const [year, month, day] = formData.endDate.split('-').map(Number);
                        return new Date(year, month - 1, day);
                      })() : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          setFormData({ ...formData, endDate: `${year}-${month}-${day}` });
                          setEndDateOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active (show to users)
                </Label>
              </div>
              
              {!editingAnnouncement && formData.isActive && (
                <div className="flex items-center gap-2 ml-6">
                  <input
                    type="checkbox"
                    id="autoDisablePrevious"
                    checked={autoDisablePrevious}
                    onChange={(e) => setAutoDisablePrevious(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="autoDisablePrevious" className="cursor-pointer text-sm">
                    Automatically disable all other active announcements
                  </Label>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingAnnouncement ? (
                  "Update Announcement"
                ) : (
                  "Create Announcement"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}

