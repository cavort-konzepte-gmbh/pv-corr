import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Language, useTranslation } from '../../../../types/language';
import { Parameter } from '../../../../types/parameters';
import { Datapoint } from '../../../../types/projects';
import { Edit2, Save, X, Upload, Clock } from 'lucide-react';
import MediaDialog from '../../../shared/MediaDialog';
import { useSupabaseMedia, fetchMediaUrlsByEntityId } from '../../../../services/media';
import { fetchProjects } from '../../../../services/projects';
import { updateDatapoint } from '../../../../services/datapoints';


interface DatapointListProps {
  currentTheme: Theme;
  currentLanguage: Language;
  datapoints: Datapoint[];
  parameters: Parameter[];
  onProjectsChange: (projects: any[]) => void;
}

const DatapointList: React.FC<DatapointListProps> = ({
  currentTheme,
  currentLanguage,
  datapoints,
  parameters,
  onProjectsChange
}) => {
  const [editingDatapoint, setEditingDatapoint] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [showMediaDialog, setShowMediaDialog] = useState<string | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const { mediaUrl, uploadMedia, loading: isUploading } = useSupabaseMedia("datapoints");
  const translation = useTranslation(currentLanguage);

  const handleShowMediaDialog = async (datapointId: string) => {
    setShowMediaDialog(datapointId);
    const urls = await fetchMediaUrlsByEntityId(datapointId);
    setMediaUrls(urls);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!showMediaDialog) return;
    
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      await uploadMedia(file, showMediaDialog);
      const urls = await fetchMediaUrlsByEntityId(showMediaDialog);
      setMediaUrls(urls);
    }
  };


  const handleUpdateDatapoint = async (datapoint: Datapoint) => {
    if (editingDatapoint === datapoint.id) {
      // Save changes
      setEditingDatapoint(null);
      setEditingName('');
      setEditingValues({});
      await updateDatapoint(editingDatapoint, {
        values: editingValues
      })
      const projects = await fetchProjects();
      onProjectsChange(projects);
    } else {
      // Start editing
      setEditingDatapoint(datapoint.id);
      setEditingName(datapoint.name || datapoint.sequentialId);
      setEditingValues(datapoint.values);
    }
  }

  return (
    <div className="mt-8">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-2 text-secondary">{translation("datapoint.short_name")}</th>
            {parameters.map(param => (
              <th key={param.id} className="text-center p-2 text-secondary w-32">
                {param.shortName || param.name}
              </th>
            ))}
            <th className="text-center p-2 text-secondary">{translation("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {datapoints.map(datapoint => (
            <tr key={datapoint.id} className="border-t border-theme">
              <td className="p-2">
                {editingDatapoint === datapoint.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                  />
                ) : (
                  <span className="text-primary">
                    {datapoint.name || datapoint.sequentialId}
                  </span>
                )}
              </td>
              {parameters.map(param => (
                <td key={param.id} className="p-2 text-center w-32">
                  {editingDatapoint === datapoint.id ? (
                    <input
                      type="text"
                      value={editingValues[param.id] || datapoint.values[param.id] || ''}
                      onChange={(e) => setEditingValues(prev => ({
                        ...prev,
                        [param.id]: e.target.value
                      }))}
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface text-center"
                    />
                  ) : (
                    <span className="text-primary">
                      {datapoint.values[param.id] || '-'}
                    </span>
                  )}
                </td>
              ))}
              <td className="p-2">
                <div className="flex items-center justify-center gap-2">
                  <div 
                    className="relative group cursor-help"
                    title={new Date(datapoint.timestamp).toLocaleString()}
                  >
                    <Clock size={14} className="text-secondary" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-surface border border-theme invisible group-hover:visible whitespace-nowrap">
                      {new Date(datapoint.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateDatapoint(datapoint)}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  >
                    {editingDatapoint === datapoint.id ? (
                      <Save size={14} />
                    ) : (
                      <Edit2 size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => setShowMediaDialog(datapoint.id)}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                  >
                    <Upload size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showMediaDialog && (
        <MediaDialog
          isOpen={true}
          onClose={() => setShowMediaDialog(null)}
          entityId={showMediaDialog}
          currentTheme={currentTheme}
        />
      )}
    </div>
  );
};

export default DatapointList;