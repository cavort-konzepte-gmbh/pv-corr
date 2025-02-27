import React, { useState } from 'react';
import { Theme } from '../types/theme';
import { Language } from '../types/language';
import { Project, Zone } from '../types/projects';
import { Folder, MapPin,Plus,Upload } from 'lucide-react';
import { useSupabaseMedia, fetchMediaUrlsByEntityId } from '../services/media';
import MediaDialog from './MediaDialog';
import { createZone } from '../services/zones';

const initialZone = {
  name: '',
  latitude: '',
  longitude: ''
}

interface ZonesPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  selectedProjectId?: string;
  selectedFieldId?: string;
  onSelectZone: (zoneId: string) => void;
}

const ZonesPanel: React.FC<ZonesPanelProps> = ({
  currentTheme,
  projects,
  onProjectsChange,
  selectedProjectId,
  selectedFieldId,
  onSelectZone
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const { mediaUrl, uploadMedia, loading: isUploading } = useSupabaseMedia("fields-panels");
  const [preview, setPreview] = useState<string | null>(null);
  const [showMediaDialog, setShowMediaDialog] = useState<number | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [showNewZone, setShowNewZone] = useState<boolean>(false);
  const [newZone, setNewZone] = useState<Pick<Zone, "name" > & Partial<Pick<Zone, "latitude" | "longitude">>>(initialZone);


    const handleShowMediaDialog = async (index: number, projectId: string) => {
      setShowMediaDialog(0);
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

  const handleResetAddZone = () => {
    setShowNewZone(false);
    setNewZone(initialZone);
  }

  const handleAddNewZone = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(!newZone || !selectedFieldId) return;
    createZone(selectedFieldId, newZone);
    handleResetAddZone();
  }

  const handleChangeZone = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setNewZone(previous => ({
      ...previous,
      [name]: value
    }));
  }

  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId)
    : null;

  const selectedField = selectedProject && selectedFieldId
    ? selectedProject.fields.find(f => f.id === selectedFieldId)
    : null;

  if (!selectedProject || !selectedField) {
    return (
      <div 
        className="p-6 text-center"
        style={{ color: currentTheme.colors.text.secondary }}
      >
        Please select a field to view its zones
      </div>
    );
  }

  const zones = selectedField.zones;
  const selectedZone = selectedZoneId ? zones.find(z => z.id === selectedZoneId) : null;

  return (
    <div className="p-6">
      {/* Field Summary */}
      <div className="p-6 rounded-lg mb-8 border-theme border-solid bg-surface">
        <div className="text-2xl font-mono mb-4 text-primary">
          {selectedField.name}
        </div>
        <div className="text-sm text-secondary">
          {selectedProject.name}
        </div>
        {selectedField.latitude && selectedField.longitude && (
          <button
            onClick={() => window.open(`https://www.google.com/maps?q=${selectedField.latitude},${selectedField.longitude}`, '_blank')}
            className="text-sm hover:underline mt-2 text-accent-primary"
          >
            View on map
          </button>
        )}
      <div className="flex items-center gap-4 mt-4">
        <button
          className="p-1 rounded hover:bg-opacity-80 flex items-center gap-x-2 text-primary"
          onClick={() => handleShowMediaDialog(0, selectedField.id)}
        >
          view media <Upload size={14} />
        </button>
      </div>
      </div>

      <button 
        className="w-full py-3 px-4 mb-8 flex items-center justify-center gap-x-2 text-sm text-primary rounded border-accent-primary border-solid bg-accent-primary"
        onClick={() => setShowNewZone(true)}
      >
        <Plus className="size-4 text-primary" />
        Add Field
      </button>

      {selectedZone ? (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setSelectedZoneId(null)}
              className="text-sm flex items-center gap-1 text-secondary"
            >
              ← Back to zones
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border-theme border-solid bg-surface">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-primary">
                  {selectedZone.name}
                </h3>
                {selectedZone.latitude && selectedZone.longitude && (
                  <button
                    onClick={() => window.open(`https://www.google.com/maps?q=${selectedZone.latitude},${selectedZone.longitude}`, '_blank')}
                    className="text-sm flex items-center gap-1 hover:underline text-accent-primary"
                  >
                    <MapPin size={14} />
                    View on map
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full" style={{ color: currentTheme.colors.text.primary }}>
                  <thead>
                    <tr>
                      <th className="text-left p-2 font-medium">ID</th>
                      <th className="text-left p-2 font-medium">Type</th>
                      <th className="text-left p-2 font-medium">Values</th>
                      <th className="text-left p-2 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedZone.datapoints?.map(datapoint => (
                      <tr 
                        key={datapoint.id}
                        style={{ borderTop: `1px solid ${currentTheme.colors.border}` }}
                      >
                        <td className="p-2">{datapoint.sequentialId}</td>
                        <td className="p-2">{datapoint.type}</td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(datapoint.values).map(([key, value]) => (
                              <span 
                                key={key}
                                className="px-2 py-1 rounded text-xs border-theme border-solid bg-theme"                                
                              >
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-2 text-sm text-secondary">
                          {new Date(datapoint.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map(zone => (
            <div
              key={zone.id}
              className="p-4 rounded-lg transition-all hover:translate-y-[-2px] border-theme border-solid shadow-border bg-surface"
              onClick={() => onSelectZone(zone.id)}              
            >
              <h3 className="font-medium mb-2 text-primary">
                {zone.name}
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">
                  {zone.datapoints?.length || 0} datapoints
                </span>
                {zone.latitude && zone.longitude && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.google.com/maps?q=${zone.latitude},${zone.longitude}`, '_blank');
                    }}
                    className="text-sm hover:underline text-accent-primary"
                  >
                    View on map
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <MediaDialog
        isOpen={showMediaDialog !== null}
        onClose={() => setShowMediaDialog(null)}
        onFileChange={(e) => {
          if (showMediaDialog !== null) {
            handleFileChangeInDialog(e, selectedField.id);
          }
        }}
        mediaUrls={mediaUrls}
        currentTheme={currentTheme}
      />

      {showNewZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="flex gap-2 text-lg mb-4 text-primary">
              <Folder className="text-accent-primary" />
              Add New Zone
            </h3>
            <form onSubmit={handleAddNewZone}>
              <label className="block text-sm mb-1 text-secondary" htmlFor="new-field">
                Field Name
                <input
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  type="text"
                  name="name"
                  required
                  value={newZone.name}
                  onChange={handleChangeZone}
                />
              </label>
              <label className="block text-sm mb-1 text-secondary">
                Latitude
                <input
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                  
                  type="text"
                  name="latitude"
                  value={newZone.latitude}
                  onChange={handleChangeZone}
                />
              </label>
              <label className="block text-sm mb-1 text-secondary">
                Longitude
                <input
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                  
                  type="text"
                  name="longitude"
                  value={newZone.longitude}
                  onChange={handleChangeZone}
                />
              </label>
              <div className="w-full mt-6 flex items-center justify-end gap-x-2">
                <button
                  className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
                  type="button"
                  onClick={handleResetAddZone}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded text-sm text-white bg-accent-primary"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZonesPanel;