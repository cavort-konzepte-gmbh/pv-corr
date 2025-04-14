import React, { useState, useEffect } from "react";
import {
  X,
  Edit3,
  Eye,
  Image as ImageIcon,
  FileText,
  Video,
  Save,
  UploadCloud,
  Trash2,
  Check,
  Filter,
  SortAsc,
  SortDesc,
  Search,
} from "lucide-react";
import { Theme } from "../../types/theme";
import { fetchMediaUrlsByEntityId, useSupabaseMedia, updateMedia, deleteMedia } from "../../services/media";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Dropzone } from "../ui/dropzone";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface MediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  currentTheme: Theme;
  entityType: string;
}

type MediaItem = {
  url: string;
  title: string;
  description: string;
  type: string;
  createdAt?: string;
};

type MediaFilter = "all" | "photo" | "video" | "document";
type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

const MediaDialog: React.FC<MediaDialogProps> = ({ isOpen, onClose, entityId, currentTheme, entityType }) => {
  const [mediaData, setMediaData] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "photo" | "video" | "document">("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const { uploadMedia } = useSupabaseMedia(entityType);

  useEffect(() => {
    if (isOpen) {
      loadMediaData();
    }
  }, [isOpen, entityId]);

  const loadMediaData = async () => {
    try {
      const data = await fetchMediaUrlsByEntityId(entityId);
      // Categorize media by file extension
      const categorizedData = data.map((item) => {
        return item;
      });

      setMediaData(categorizedData);
    } catch (err) {
      console.error("Error loading media:", err);
      setError("Failed to load media");
    }
  };

  const handleFilesAdded = (files: File[]) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !entityId) return;

    setIsUploading(true);
    setError(null);

    try {
      for (const file of selectedFiles) {
        // Initialize progress for this file
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        // Generate a title from the filename
        const title = file.name.split(".")[0].replace(/[_-]/g, " ");

        // Get file extension
        const ext = file.name.split(".").pop()?.toLowerCase() || "";

        // Determine the type based on file extension
        let type = "document"; // Default type

        if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff"].includes(ext)) {
          type = "photo";
        } else if (["mp4", "webm", "mov", "avi", "mkv", "flv"].includes(ext)) {
          type = "video";
        }

        // Upload with progress tracking
        await uploadMedia(file, entityId, title, `Uploaded on ${new Date().toLocaleString()}`, (progress) => {
          setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
        });
      }

      // Refresh media list
      await loadMediaData();

      // Reset states
      setSelectedFiles([]);
      setUploadProgress({});
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload media. Please ensure file types are supported.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (url: string) => {
    try {
      await deleteMedia(url);
      setMediaData(mediaData.filter((media) => media.url !== url));
      if (selectedMedia?.url === url) {
        setSelectedMedia(null);
      }
    } catch (err) {
      console.error("Error deleting media:", err);
      setError("Failed to delete media");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.size) return;

    try {
      const deletePromises = Array.from(selectedItems).map((url) => deleteMedia(url));
      await Promise.all(deletePromises);

      // Refresh media list
      await loadMediaData();
      setSelectedItems(new Set());
    } catch (err) {
      console.error("Error deleting media:", err);
      setError("Failed to delete selected media");
    }
  };

  const handleUpdateMedia = async (media: MediaItem, newTitle: string, newDescription: string) => {
    try {
      await updateMedia(media.url, newTitle, newDescription);

      // Update local state
      setMediaData(mediaData.map((item) => (item.url === media.url ? { ...item, title: newTitle, description: newDescription } : item)));

      setEditingMedia(null);

      // If this was the selected media, update that too
      if (selectedMedia?.url === media.url) {
        setSelectedMedia({ ...media, title: newTitle, description: newDescription });
      }
    } catch (err) {
      console.error("Error updating media:", err);
      setError("Failed to update media");
    }
  };

  const toggleSelectItem = (url: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else {
        newSet.add(url);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    if (selectedItems.size === filteredMedia.length) {
      // Deselect all if all are already selected
      setSelectedItems(new Set());
    } else {
      // Select all filtered items
      setSelectedItems(new Set(filteredMedia.map((item) => item.url)));
    }
  };

  // Filter and sort media
  const filteredMedia = mediaData
    .filter((media) => {
      // Apply type filter
      if (activeFilter !== "all") {
        if (activeFilter === "photo" && media.type !== "photo") return false;
        if (activeFilter === "video" && media.type !== "video") return false;
        if (activeFilter === "document" && media.type !== "document") return false;
      }

      // Apply search filter
      if (searchTerm) {
        return (
          media.title.toLowerCase().includes(searchTerm.toLowerCase()) || media.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortOption) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  const getFileTypeIcon = (type: string, size = 16) => {
    switch (type) {
      case "photo":
        return <ImageIcon size={size} />;
      case "video":
        return <Video size={size} />;
      case "document":
        return <FileText size={size} />;
      default:
        return <FileText size={size} />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "photo":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "video":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case "document":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Media Management
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-4 h-full overflow-hidden">
          {/* Left panel - Media grid and upload */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search and filters */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search media..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOption((prev) => (prev === "name-asc" ? "name-desc" : "name-asc"))}
                  >
                    {sortOption.includes("name-asc") ? <SortAsc size={16} /> : <SortDesc size={16} />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectAllItems}>
                    {selectedItems.size === filteredMedia.length && filteredMedia.length > 0 ? (
                      <Check size={16} />
                    ) : (
                      <span className="text-xs">Select All</span>
                    )}
                  </Button>
                  {selectedItems.size > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>

              <Tabs defaultValue="all" onValueChange={(value) => setActiveFilter(value as MediaFilter)}>
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="photo" className="flex-1">
                    Photos
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex-1">
                    Videos
                  </TabsTrigger>
                  <TabsTrigger value="document" className="flex-1">
                    Documents
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Media list */}
            <div className="overflow-y-auto flex-1 pr-1">
              {filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                  <p>No media found</p>
                  <p className="text-xs">Upload files to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMedia.map((media) => (
                    <div
                      key={media.url}
                      className={cn(
                        "group relative border rounded-md overflow-hidden bg-card hover:bg-accent/5 transition-colors p-3",
                        selectedMedia?.url === media.url && "ring-2 ring-primary",
                        selectedItems.has(media.url) && "ring-2 ring-primary/50 bg-primary/5",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Selection checkbox */}
                        <div
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectItem(media.url);
                          }}
                        >
                          <div
                            className={cn(
                              "h-5 w-5 rounded border flex items-center justify-center",
                              selectedItems.has(media.url)
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-input bg-background",
                            )}
                          >
                            {selectedItems.has(media.url) && <Check className="h-3 w-3" />}
                          </div>
                        </div>

                        {/* Type icon */}
                        <div
                          className={cn("flex-shrink-0 w-10 h-10 rounded flex items-center justify-center", getFileTypeColor(media.type))}
                        >
                          {getFileTypeIcon(media.type, 20)}
                        </div>

                        {/* Media info */}
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedMedia(media)}>
                          <div className="font-medium truncate">{media.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{media.description}</div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditingMedia(media)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(media.url, "_blank")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleDeleteMedia(media.url)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload section */}
            <div className="mt-4 border-t pt-4">
              <Dropzone
                className="h-24 w-full"
                onFilesAdded={handleFilesAdded}
                dropzoneOptions={{
                  accept: {
                    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".tiff"],
                    "video/*": [".mp4", ".webm", ".mov", ".avi", ".mkv", ".flv"],
                    "application/pdf": [".pdf"],
                    "application/msword": [".doc"],
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                    "application/vnd.ms-excel": [".xls"],
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                  },
                  multiple: true,
                }}
              />

              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="text-sm font-medium">Selected files ({selectedFiles.length})</div>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="flex-1 truncate">{file.name}</div>
                        <div className="text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</div>
                        {uploadProgress[file.name] > 0 && <Progress value={uploadProgress[file.name]} className="w-20 h-1.5" />}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setSelectedFiles((files) => files.filter((_, i) => i !== index))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedFiles([])}>
                      Clear
                    </Button>
                    <Button size="sm" onClick={handleUpload} disabled={isUploading}>
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel - Media details */}
          {selectedMedia && (
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Media Details</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMedia(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {editingMedia ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium">Title</label>
                    <Input value={editingMedia.title} onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Description</label>
                    <Textarea
                      value={editingMedia.description}
                      onChange={(e) => setEditingMedia({ ...editingMedia, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingMedia(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleUpdateMedia(selectedMedia, editingMedia.title, editingMedia.description)}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Preview */}
                  <div className="aspect-square mb-4 bg-muted/30 rounded-md overflow-hidden flex items-center justify-center">
                    {selectedMedia.type === "photo" ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Button
                          variant="ghost"
                          className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-background/80"
                          onClick={() => window.open(selectedMedia.url, "_blank")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <img
                          src={selectedMedia.url}
                          alt={selectedMedia.title}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            // If image fails to load, show a fallback
                            e.currentTarget.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTggMTVWMThIMlY2SDVNMjIgNlYxOEgxOE0xOCA2SDIyTTE4IDE4VjZNMiA2VjE4IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=";
                            e.currentTarget.classList.add("p-8");
                          }}
                          onClick={() => setFullscreenMedia(selectedMedia.url)}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    ) : selectedMedia.type === "video" ? (
                      <video src={selectedMedia.url} controls className="max-w-[90vw] max-h-[90vh]" />
                    ) : selectedMedia.url.endsWith(".pdf") ? (
                      <iframe src={selectedMedia.url} className="w-full h-full" title={selectedMedia.title} />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        {getFileTypeIcon(selectedMedia.type, 48)}
                        <div className="mt-2 text-sm">{selectedMedia.url.split(".").pop()?.toUpperCase()}</div>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4 flex-1">
                    <div>
                      <label className="text-xs font-medium">Title</label>
                      <div className="text-sm mt-1">{selectedMedia.title}</div>
                    </div>

                    <div>
                      <label className="text-xs font-medium">Description</label>
                      <div className="text-sm mt-1 break-words">{selectedMedia.description || "No description"}</div>
                    </div>

                    <div>
                      <label className="text-xs font-medium">Type</label>
                      <div className="text-sm mt-1 flex items-center gap-1">
                        {getFileTypeIcon(selectedMedia.type, 14)}
                        <span className="capitalize">{selectedMedia.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingMedia(selectedMedia)}>
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 whitespace-nowrap"
                      onClick={() => window.open(selectedMedia.url, "_blank")}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Open in New Tab
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDeleteMedia(selectedMedia.url)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {error && <div className="mt-4 p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Fullscreen preview */}
      {fullscreenMedia && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setFullscreenMedia(null)}>
          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            {fullscreenMedia.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i) ? (
              <div className="relative">
                <Button
                  variant="outline"
                  className="absolute top-4 right-4 z-10 bg-background/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(fullscreenMedia, "_blank");
                  }}
                >
                  Open in New Tab
                </Button>
                <img
                  src={fullscreenMedia}
                  alt="Fullscreen preview"
                  className="max-w-full max-h-[90vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    // If image fails to load, show a fallback
                    e.currentTarget.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTggMTVWMThIMlY2SDVNMjIgNlYxOEgxOE0xOCA2SDIyTTE4IDE4VjZNMiA2VjE4IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=";
                    e.currentTarget.classList.add("p-8");
                  }}
                />
              </div>
            ) : fullscreenMedia.match(/\.(mp4|webm|mov|avi|mkv|flv)$/i) ? (
              <video src={fullscreenMedia} controls className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()} />
            ) : fullscreenMedia.endsWith(".pdf") ? (
              <iframe src={fullscreenMedia} className="w-[90vw] h-[90vh]" title="PDF Preview" onClick={(e) => e.stopPropagation()} />
            ) : (
              <div className="text-white text-center">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <div>This file type cannot be previewed</div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(fullscreenMedia, "_blank");
                  }}
                >
                  Open in new tab
                </Button>
              </div>
            )}

            <Button variant="ghost" className="absolute top-4 right-4 text-white" onClick={() => setFullscreenMedia(null)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default MediaDialog;
