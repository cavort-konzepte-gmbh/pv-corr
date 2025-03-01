import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Theme } from '../../types/theme';

interface MediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  mediaUrls: string[];
  currentTheme: Theme;
}

const MediaDialog: React.FC<MediaDialogProps> = ({
  isOpen,
  onClose,
  onFileChange,
  mediaUrls,
  currentTheme
}) => {
  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null);

  if (!isOpen) return null;

  const renderMedia = (url: string, index: number) => {
    const fileExtension = url.split('.').pop()?.toLowerCase();
  
    if (fileExtension === 'mp4' || fileExtension === 'webm' || fileExtension === 'ogg') {
      return (
        <video 
          key={index} 
          controls 
          className="w-full h-32 object-cover cursor-pointer"
          onClick={() => setFullscreenMedia(url)}
        >
          <source src={url} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (fileExtension === 'pdf') {
      return (
        <embed 
          key={index} 
          src={url} 
          type="application/pdf" 
          className="w-full h-32 object-cover cursor-pointer"
          onClick={() => setFullscreenMedia(url)}
        />
      );
    } else {
      return (
        <img 
          key={index} 
          src={url} 
          alt={`Media ${index}`} 
          className="w-full h-32 object-cover cursor-pointer"
          onClick={() => setFullscreenMedia(url)}
        />
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="p-6 rounded-lg max-w-3xl w-full" 
        style={{ backgroundColor: currentTheme.colors.surface }}
      >
        <h3 
          className="text-lg mb-4 flex items-center gap-2"
          style={{ color: currentTheme.colors.text.primary }}
        >
          Media
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {mediaUrls.map((url, index) => renderMedia(url, index))}
          </div>
          
          <div className="flex justify-end gap-2">
            <label className="cursor-pointer px-4 py-2 rounded text-sm flex items-center gap-x-2" style={{ backgroundColor: currentTheme.colors.accent.primary, color: 'white' }}>
              <Upload size={16} /> Upload Media
              <input
                type="file"
                onChange={onFileChange}
                className="hidden"
              />
            </label>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm text-secondary"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${currentTheme.colors.border}`
              }}
            >
              Close
            </button>
          </div>
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
                className="w-full h-full"
              />
            </div>
          ) : fullscreenMedia.endsWith('.mp4') || fullscreenMedia.endsWith('.webm') || fullscreenMedia.endsWith('.ogg') ? (
            <video 
              controls 
              className="max-w-[90vw] max-h-[90vh] object-contain"
            >
              <source src={fullscreenMedia} type={`video/${fullscreenMedia.split('.').pop()}`} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img 
              src={fullscreenMedia} 
              alt="Fullscreen Media"
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
          )}
          <button
            className="absolute top-4 right-4 p-2 rounded hover:bg-white hover:bg-opacity-10 text-white"
            onClick={() => setFullscreenMedia(null)}
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaDialog;