import React, { useState, useEffect } from 'react';
import { Upload, X, Edit3, Eye, Image as ImageIcon, FileText, Video, Save } from 'lucide-react';
import { Theme } from '../../types/theme';
import { fetchMediaUrlsByEntityId, useSupabaseMedia, updateMedia, deleteMedia } from '../../services/media';
import { DeleteConfirmDialog } from './FormHandler';

interface MediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  currentTheme: Theme;
  entityType:  string; 
}

const MediaDialog: React.FC<MediaDialogProps> = ({
  isOpen,
  onClose,
  entityId,
  currentTheme,
  entityType 
}) => {
  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null);
  const [mediaNotes, setMediaNotes] = useState<{ [key: string]: string }>({});
  const [renamingMedia, setRenamingMedia] = useState<string | null>(null);
  const [newMediaName, setNewMediaName] = useState<string>('');
  const [showMedia, setShowMedia] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [newMediaFile, setNewMediaFile] = useState<File | null>(null);
  const [mediaData, setMediaData] = useState<{ url: string, title: string, description: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { uploadMedia } = useSupabaseMedia(entityType); 

  useEffect(() => {
    if (isOpen) {
      fetchMediaUrlsByEntityId(entityId).then(setMediaData);
    }
  }, [isOpen, entityId]);

  if (!isOpen) return null;

  const handleRename = async (url: string, newTitle: string, newDescription: string) => {
    const media = mediaData.find(media => media.url === url);
    if (media) {
      await updateMedia(url, newTitle, newDescription);
      const updatedMediaData = mediaData.map(media =>
        media.url === url ? { ...media, title: newTitle, description: newDescription } : media
      );
      setMediaData(updatedMediaData);
      setRenamingMedia(null);
      setNewMediaName('');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!entityId) return;

    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles(files);
      
      // Create previews for the first file
      if (files[0]) {
        const previewUrl = URL.createObjectURL(files[0]);
        setPreview(previewUrl);
        setNewMediaFile(files[0]);
      }
    }
  };

  const handleUpload = async () => { 
    if (!selectedFiles.length || !entityId) return;

    if (!newMediaName.trim()) {
      setError('Media name is required');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const totalFiles = selectedFiles.length;
      let completedFiles = 0;

      // Upload all selected files
      for (const file of selectedFiles) {
        // Initialize progress for this file
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // Upload with progress tracking
        await uploadMedia(
          file,
          entityId,
          `${newMediaName} ${selectedFiles.length > 1 ? `(${selectedFiles.indexOf(file) + 1})` : ''}`,
          mediaNotes[preview || ''] || '',
          (progress) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }
        );
        // Update completed files count
        completedFiles++;
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      // Refresh media list
      const data = await fetchMediaUrlsByEntityId(entityId);
      setMediaData(data);

      // Reset states
      setSelectedFiles([]);
      setPreview(null);
      setNewMediaFile(null);
      setMediaNotes({});
      setNewMediaName('');
      setUploadProgress({});
    } catch (err) {
      setError('Failed to upload media');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setPreview(null);
    setNewMediaFile(null);
    setSelectedFiles([]);
    setNewMediaName('');
    setMediaNotes({});
    setError(null);
  };

  const getMediaIcon = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText size={16} />;
    if (['mp4', 'webm', 'ogg'].includes(ext || '')) return <Video size={16} />;
    return <ImageIcon size={16} />;
  };

  const handleDeleteMedia = async (url: string) => {
    await deleteMedia(url);
    const updatedMediaData = mediaData.filter(media => media.url !== url);
    setMediaData(updatedMediaData);
    setDeleteConfirm(null);
  };

  const renderMediaBox = (media: { url: string, title: string, description: string }, index: number) => {
    return (
      <div key={index} className="relative p-2 border rounded shadow-sm bg-surface text-white">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {getMediaIcon(media.url)}
            {renamingMedia === media.url ? (
              <input
                type="text"
                className="w-full p-2 border rounded mb-2 border-theme bg-surface text-white"
                value={newMediaName || media.title}
                onChange={(e) => setNewMediaName(e.target.value)}
              />
            ) : (
              <span className="text-sm font-semibold">{media.title}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {renamingMedia === media.url ? (
              <>
                <button
                  className="p-1 rounded hover:bg-opacity-80 text-white"
                  onClick={() => handleRename(media.url, newMediaName || media.title, mediaNotes[media.url] || media.description)}
                >
                  <Save size={14} />
                </button>
                <button
                  className="p-1 rounded hover:bg-opacity-80 text-white"
                  onClick={() => {
                    setRenamingMedia(null);
                    setNewMediaName('');
                  }}
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="p-1 rounded hover:bg-opacity-80 text-white"
                  onClick={() => {
                    setRenamingMedia(media.url);
                    setNewMediaName(media.title);
                  }}
                >
                  <Edit3 size={14} />
                </button>
                <button
                  className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  onClick={() => setFullscreenMedia(media.url)}
                >
                  <Eye size={14} />
                </button>
                <button
                  className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  onClick={() => setDeleteConfirm(media.url)}
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>
        </div>
        {renamingMedia === media.url ? (
          <textarea
            className="w-full p-2 border rounded mb-2 border-theme bg-surface text-white break-words"
            value={mediaNotes[media.url] || media.description}
            onChange={(e) => setMediaNotes({ ...mediaNotes, [media.url]: e.target.value })}
            rows={4}
          />
        ) : (
          <label className="block text-sm mb-1 text-secondary overflow-y-auto max-h-24 break-words">
            {media.description}
          </label>
        )}
      </div>
    );
  };

  const images = mediaData.filter(media => media.url.match(/\.(jpeg|jpg|gif|png)$/));
  const videos = mediaData.filter(media => media.url.match(/\.(mp4|webm|ogg)$/));
  const documents = mediaData.filter(media => media.url.match(/\.pdf$/));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-surface" 
      >
        <h3 
          className="text-lg mb-4 flex items-center gap-2 text-primary"
        >
          Media Management
        </h3>
        
        <div className="space-y-6">
          <div className="flex justify-end gap-2">
            <label className="cursor-pointer px-4 py-2 rounded text-sm flex items-center gap-x-2 bg-accent-primary text-white">
              <Upload size={16} /> Upload Media
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*,.pdf"
              />
            </label>
            <button
              onClick={() => setShowMedia(!showMedia)}
              className="px-4 py-2 rounded text-sm border-theme border-solid bg-transparent text-secondary"
            >
              {showMedia ? 'Hide Media' : 'View Media'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm border-theme border-solid bg-transparent text-secondary"
            >
              Close
            </button>
          </div>
          {preview && (
            <div className="flex flex-col items-center">
              <div className="text-sm text-secondary mb-2">
                Selected {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
              </div>
              {uploading && (
                <div className="w-full space-y-2 mb-4">
                  {selectedFiles.map(file => (
                    <div key={file.name} className="space-y-1">
                      <div className="flex justify-between text-xs text-secondary">
                        <span>{file.name}</span>
                        <span>{Math.round(uploadProgress[file.name] || 0)}%</span>
                      </div>
                      <div className="w-full h-1 bg-theme rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent-primary transition-all duration-200"
                          style={{ width: `${uploadProgress[file.name] || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {newMediaFile?.type === 'application/pdf' ? (
                <embed 
                  src={preview} 
                  type="application/pdf" 
                  className="w-full h-64 object-cover mb-4 bg-surface"
                />
              ) : newMediaFile?.type.startsWith('video')  ? (
                <video 
                  controls 
                  className="w-full h-64 object-cover mb-4 bg-surface"
                >
                  <source src={preview} type={`video/${preview.split('.').pop()}`} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img src={preview} alt="Preview" className="max-w-full h-auto mb-4 bg-surface" />
              )}
              <input 
                type="text" 
                placeholder="Enter media name" 
                value={newMediaName || ''} 
                onChange={(e) => setNewMediaName(e.target.value)} 
                className="border p-2 rounded mb-2 w-full border-theme border-solid bg-surface text-primary"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <input
                type="text"
                className="w-full p-2 border rounded mb-2 border-theme border-solid bg-surface text-primary"
                placeholder="Add notes..."
                value={preview ? mediaNotes[preview] || '' : ''}
                onChange={(e) => preview && setMediaNotes({ ...mediaNotes, [preview]: e.target.value })}
              />
              <div className="flex gap-2">
                <button onClick={handleUpload} className="px-4 py-2 rounded text-sm border-theme border-solid bg-transparent text-secondary" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
                <button onClick={handleCancelUpload} className="px-4 py-2 rounded text-sm border-theme border-solid bg-transparent text-secondary" disabled={isUploading}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          {showMedia && (
            <>
              <h4 className="text-md text-primary">Images</h4>
              <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {images.map((media, index) => renderMediaBox(media, index))}
              </div>
              <h4 className="text-md text-primary">Videos</h4>
              <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {videos.map((media, index) => renderMediaBox(media, index))}
              </div>
              <h4 className="text-md text-primary">Documents</h4>
              <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {documents.map((media, index) => renderMediaBox(media, index))}
              </div>
            </>
          )}
        </div>
      </div>

      {fullscreenMedia && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setFullscreenMedia(null)}
        >
          {fullscreenMedia.endsWith('.pdf') ? (
            <div className="w-full h-full flex items-center justify-center">
              <embed 
                src={fullscreenMedia} 
                type="application/pdf" 
                className="w-full h-full bg-surface"
              />
            </div>
          ) : fullscreenMedia.endsWith('.mp4') || fullscreenMedia.endsWith('.webm') || fullscreenMedia.endsWith('.ogg') ? (
            <video 
              controls 
              className="max-w-[90vw] max-h-[90vh] object-contain bg-surface"
            >
              <source src={fullscreenMedia} type={`video/${fullscreenMedia.split('.').pop()}`} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img 
              src={fullscreenMedia} 
              alt="Fullscreen Media"
              className="max-w-[90vw] max-h-[90vh] object-contain bg-surface"
            />
          )}
          <button
            className="absolute top-4 right-4 p-2 rounded hover:bg-white hover:bg-opacity-10 text-secondary"
            onClick={() => setFullscreenMedia(null)}
          >
            <X size={24} />
          </button>
        </div>
      )}
      {deleteConfirm && (
        <DeleteConfirmDialog
          isOpen={!!deleteConfirm}
          itemName="media"
         confirmName={deleteConfirmName}
          onConfirmChange={setDeleteConfirmName}
          onConfirm={() => handleDeleteMedia(deleteConfirm!)}
          onCancel={() => {
            setDeleteConfirm(null);
            setDeleteConfirmName('');
          }}
        />
      )}
    </div>
  );
};

export default MediaDialog;