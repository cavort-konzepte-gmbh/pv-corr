 import React, { useState, useEffect } from 'react';
import { Theme } from '../types/theme';
import { Plus, X, Edit2, Save, Upload } from 'lucide-react';
import { Language, useTranslation } from '../types/language';
import { Zone } from '../types/projects';
import MediaDialog from './MediaDialog';
import { useSupabaseMedia, fetchMediaUrlsByEntityId } from '../services/media';

interface DatapointsPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
  selectedZone?: Zone | null;
  onBack?: () => void;
}

const DatapointsPanel: React.FC<DatapointsPanelProps> = ({
  currentTheme,
  currentLanguage,
  selectedZone,
  onBack,
}) => {
  const t = useTranslation(currentLanguage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDatapoint, setEditingDatapoint] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const { mediaUrl, uploadMedia, loading: isUploading } = useSupabaseMedia("zone-data-points");
  const [preview, setPreview] = useState<string | null>(null);
  const [showMediaDialog, setShowMediaDialog] = useState<number | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleShowMediaDialog = async (index: number, projectId: string) => {
    setShowMediaDialog(index);
    const mediatwo = await fetchMediaUrlsByEntityId(projectId);
    setMediaUrls(mediatwo);
  };

  const handleFileChangeInDialog = async (event: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPreview(URL.createObjectURL(file));
      await uploadMedia(file, projectId);
      const mediatwo = await fetchMediaUrlsByEntityId(projectId);
      setMediaUrls(mediatwo);
    }
  };

  if (!selectedZone) {
    return (
      <div className="p-6 text-center text-secondary">
        Please select a zone to view its datapoints
      </div>
    );
  }


  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onBack}
          className="text-sm flex items-center gap-1 text-secondary"
        >
          ← Back to zones
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center p-4 text-secondary">
          {t("datapoint.loading")}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-theme text-primary">
              <thead>
                <tr>
                  <th className="p-2 text-left border font-normal border-theme">
                    ID
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Type
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Values
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Timestamp
                  </th>
                  <th className="p-2 text-center border font-normal border-theme">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedZone.datapoints?.map((datapoint, index) => (
                  <tr key={datapoint.id}>
                    <td className="p-2 border border-theme">
                      {datapoint.sequentialId}
                    </td>
                    <td className="p-2 border border-theme">
                      {datapoint.type}
                    </td>
                    <td className="p-2 border border-theme">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(datapoint.values).map(
                          ([key, value]) => (
                            <span
                              key={key}
                              className="px-2 py-1 rounded text-xs border-theme border-solid bg-theme"
                            >
                              {key}: {value}
                            </span>
                          )
                        )}
                      </div>
                    </td>
                    <td className="p-2 border text-sm text-secondary border-theme">
                      {new Date(datapoint.timestamp).toLocaleString()}
                    </td>
                    <td className="p-2 border border-theme">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            if (editingDatapoint === datapoint.id) {
                              // Save changes
                              setEditingDatapoint(null);
                              setEditingValues({});
                            } else {
                              setEditingDatapoint(datapoint.id);
                              setEditingValues(datapoint.values);
                            }
                          }}
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        >
                          {editingDatapoint === datapoint.id ? (
                            <Save size={14} />
                          ) : (
                            <Edit2 size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => handleShowMediaDialog(index, datapoint.id)}
                          className="p-1 rounded hover:bg-opacity-80"
                          style={{ color: currentTheme.colors.text.secondary }}
                        >
                          <Upload size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MediaDialog
        isOpen={showMediaDialog !== null}
        onClose={() => setShowMediaDialog(null)}
        onFileChange={(e) => {
          if (showMediaDialog !== null) {
            handleFileChangeInDialog(e, selectedZone.datapoints[showMediaDialog].id);
          }
        }}
        mediaUrls={mediaUrls}
        currentTheme={currentTheme}
      />
    </div>
  );
};

export default DatapointsPanel;
