import React, { useState, useEffect } from 'react';
import { Upload, X, Edit3, Eye } from 'lucide-react';
import { Theme } from '../../types/theme';
import { fetchMediaUrlsByEntityId, useSupabaseMedia, updateMedia, deleteMedia } from '../../services/media';
import { DeleteConfirmDialog } from './FormHandler';

interface MediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  currentTheme: Theme;
}

const MediaDialog: React.FC<MediaDialogProps> = ({
  isOpen,
  onClose,
  entityId,
  currentTheme
}) => {
  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null);
  const [mediaNotes, setMediaNotes] = useState<{ [key: string]: string }>({});
  const [renamingMedia, setRenamingMedia] = useState<string | null>(null);
  const [newMediaName, setNewMediaName] = useState<string>('');
  const [showMedia, setShowMedia] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [newMediaFile, setNewMediaFile] = useState<File | null>(null);
  const [mediaData, setMediaData] = useState<{ url: string, title: string, description: string }[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const { uploadMedia } = useSupabaseMedia("datapoints");

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

    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const previewUrl = URL.createObjectURL(file);

      setPreview(previewUrl);
      setNewMediaFile(file);

      if (fileExtension === 'pdf' || fileExtension === 'mp4' || fileExtension === 'webm' || fileExtension === 'ogg') {
        setPreview(previewUrl);
      } else {
        setPreview(previewUrl);
      }
    }
  };

  const handleUpload = async () => {
    if (newMediaFile && entityId) {
      const note = preview ? mediaNotes[preview] || '' : '';
      await uploadMedia(newMediaFile, entityId, newMediaName, note);
      const data = await fetchMediaUrlsByEntityId(entityId);
      setMediaData(data);
      setPreview(null);
      setNewMediaFile(null);
      setMediaNotes({});
    }
  };

  const handleCancelUpload = () => {
    setPreview(null);
    setNewMediaFile(null);
    setNewMediaName('');
    setMediaNotes({});
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
          {renamingMedia === media.url ? (
            <>
              <input
                type="text"
                className="w-full p-2 border rounded mb-2 border-theme bg-surface text-white"
                value={newMediaName || media.title}
                onChange={(e) => setNewMediaName(e.target.value)}
              />
              <button
                className="p-1 rounded hover:bg-opacity-80 text-white"
                onClick={() => handleRename(media.url, newMediaName || media.title, mediaNotes[media.url] || media.description)}
              >
                Save
              </button>
              <button
                className="p-1 rounded hover:bg-opacity-80 text-white"
                onClick={() => {
                  setRenamingMedia(null);
                  setNewMediaName('');
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold">{media.title}</span>
              <button
                className="p-1 rounded hover:bg-opacity-80 text-white"
                onClick={() => {
                  setRenamingMedia(media.url);
                  setNewMediaName(media.title);
                }}
              >
                <Edit3 size={16} />
              </button>
            </>
          )}
          <button
            className="p-1 rounded hover:bg-opacity-80 text-secondary text-white"
            onClick={() => setFullscreenMedia(media.url)}
          >
            <Eye size={16} />
          </button>
          <button
            className="p-1 rounded hover:bg-opacity-80 text-secondary text-white"
            onClick={() => setDeleteConfirm(media.url)}
          >
            <X size={16} />
          </button>
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
        
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <label className="cursor-pointer px-4 py-2 rounded text-sm flex items-center gap-x-2 bg-accent-primary text-white">
              <Upload size={16} /> Upload Media
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
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
              <input
                type="text"
                className="w-full p-2 border rounded mb-2 border-theme border-solid bg-surface text-primary"
                placeholder="Add notes..."
                value={preview ? mediaNotes[preview] || '' : ''}
                onChange={(e) => preview && setMediaNotes({ ...mediaNotes, [preview]: e.target.value })}
              />
              <div className="flex gap-2">
                <button onClick={handleUpload} className="px-4 py-2 rounded text-sm border-theme border-solid bg-transparent text-secondary">Upload</button>
                <button onClick={handleCancelUpload} className="px-4 py-2 rounded text-sm border-theme border-solid bg-transparent text-secondary">Cancel</button>
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
          itemName="Media"
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