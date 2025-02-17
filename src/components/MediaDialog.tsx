import React from 'react';
import { Upload } from 'lucide-react';
import { Theme } from '../types/theme';

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
  if (!isOpen) return null;

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
            {mediaUrls.map((url, index) => (
              <img key={index} src={url} alt={`Media ${index}`} className="w-full h-32 object-cover" />
            ))}
          </div>
          
          <div className="flex justify-end gap-2">
            <label className="cursor-pointer px-4 py-2 rounded text-sm" style={{ backgroundColor: currentTheme.colors.accent.primary, color: 'white' }}>
              <Upload size={16} /> Upload Media
              <input
                type="file"
                onChange={onFileChange}
                className="hidden"
              />
            </label>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm"
              style={{
                backgroundColor: 'transparent',
                color: currentTheme.colors.text.secondary,
                border: `1px solid ${currentTheme.colors.border}`
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDialog;
