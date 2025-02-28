 import React, { useState, useEffect } from 'react';
import { Theme } from '../types/theme';
import { Plus, X, Edit2, Save, Upload, Info } from 'lucide-react';
import { Language, useTranslation } from '../types/language';
import { Datapoint, Zone } from '../types/projects';
import MediaDialog from './MediaDialog';
import { useSupabaseMedia, fetchMediaUrlsByEntityId } from '../services/media';
import { createDatapoint, deleteDatapoint, updateDatapoint } from '../services/datapoints';
import { Parameter } from '../types/parameters';
import { fetchParameters } from '../services/parameters';

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
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [isNewDatapoint, setIsNewDatapoint] = useState<boolean>(false);
  const [newDatapoint, setNewDatapoint] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(false);
    const getParameters = async () => {
      const parameters = await fetchParameters();
      setParameters(parameters);
    }
    getParameters()
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

  const handleChangeEditingValues = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setEditingValues(previous => ({
      ...previous,
      [name]: value,
    }));
  }

  const handleChangeDatapoint = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setNewDatapoint(previous => ({
      ...previous,
      [name]: value,
    }));
  }

  const resetValues = () => {
    setEditingValues({});
    setEditingDatapoint(null);
  }

  const handleUpdateSaveDatapoint = async (datapoint: Datapoint) => {
    if (editingDatapoint === datapoint.id) {
      updateDatapoint(datapoint.id, { values: editingValues });
      resetValues()
    } else {
      setEditingDatapoint(datapoint.id);
      setEditingValues(datapoint.values);
      setNewDatapoint({});
      setIsNewDatapoint(false);
    }
  }

  const handleDeleteDatapoint = async (datapointId: string) => {
    deleteDatapoint(datapointId);
  }

  const handleOpenDatapoint = () => {
    resetValues()
    setIsNewDatapoint(true);
  }

  const handleAddNewDatapoint = async () => {
    if(!selectedZone) return;
    await createDatapoint(selectedZone.id, {
      type: "",
      values: newDatapoint,
      ratings: {}
    });
    resetValues();
    setNewDatapoint({});
    setIsNewDatapoint(false);
  }

  const handleCancelNewDatapoint = () => {
    resetValues()
    setNewDatapoint({});
    setIsNewDatapoint(false);
  }


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

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-primary text-2xl">Datapoints</h2>
        <button 
          className="py-1.5 px-4 mb-8 flex items-center justify-center gap-x-2 text-sm text-primary rounded border-accent-primary border-solid bg-accent-primary"
          onClick={handleOpenDatapoint}
        >
          <Plus className="size-4 text-primary" />
          Add Datapoint
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
                    Name
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Timestamp
                  </th>
                  {parameters.map(param => (
                    <td className="py-3 px-7 text-secondary text-left border font-normal border-theme relative has-[span]:px-4" key={param.id}>
                      {param.shortName && (
                        <span className="mx-auto text-center">        
                          <span className="block">{param.shortName}</span>
                          <span className="block">{param.unit}</span>                          
                      </span>
                      )}
                      <Info className="peer text-primary absolute top-1.5 right-1.5 hover:cursor-pointer" size={10} />
                      <p className="min-w-max p-2 hidden text-sm text-primary absolute top-4 right-4 border-surface border-solid rounded bg-surface peer-hover:block">
                        {param.name}
                      </p>
                    </td>
                  ))}                  
                  <th className="p-2 text-center border font-normal border-theme">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedZone.datapoints?.map((datapoint, index) => (
                  <tr key={index}>
                    <td className="p-2 border border-theme">
                      {datapoint.sequentialId}
                    </td>
                    <td className="p-2 border text-sm text-secondary border-theme">
                      {new Date(datapoint.timestamp).toLocaleString()}
                    </td>           
                    {parameters.map((param) => {
                        return  (
                          <td className="text-xs text-center border-theme border-solid relative" key={param.id}>
                            {editingDatapoint !== datapoint.id && datapoint.values[param.id]}
                            {editingDatapoint === datapoint.id && (
                              <div className="w-full h-full p-2 absolute inset-0">
                                <input
                                  key={param.id}
                                  className="w-full h-full indent-1 text-xs outline-none border-theme rounded bg-surface"
                                  value={editingValues[param.id] ?? ""}
                                  autoComplete="off"
                                  name={param.id}
                                  onChange={handleChangeEditingValues}
                                />
                              </div>
                            )}
                          </td>
                        )
                      }
                    )}                    
                    <td className="p-2 border border-theme">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUpdateSaveDatapoint(datapoint)}
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        >
                          {editingDatapoint === datapoint.id ? (
                            <Save size={14} />
                          ) : (
                            <Edit2 size={14} />
                          )}
                        </button>
                        <button onClick={() => handleDeleteDatapoint(datapoint.id)}>
                          <X className="text-secondary" size={14} />
                        </button>
                        <button
                          onClick={() => handleShowMediaDialog(index, datapoint.id)}
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        >
                          <Upload size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {isNewDatapoint && (
                  <tr>
                    <td className="p-2 text-secondary border-theme">auto</td>
                    <td className="p-2 text-secondary text-center">auto</td>
                    {parameters.map(param => (
                      <td className="p-2 text-xs text-center border-theme border-solid" key={param.id}>
                        <input
                          className="py-3 indent-1 text-xs outline-none border-theme rounded bg-surface"
                          type="text"
                          name={param.id}
                          autoComplete="off"
                          value={newDatapoint[param.id] ?? ""}
                          onChange={handleChangeDatapoint}
                        />
                      </td>
                    ))}
                    <td className="p-2 text-secondary text-center">
                      <div className="flex items-center justify-center gap-x-4">
                        <button onClick={handleAddNewDatapoint}>
                          <Save size={14} />
                        </button>
                        <button onClick={handleCancelNewDatapoint}>
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
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
