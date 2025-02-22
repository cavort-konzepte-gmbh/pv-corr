import { supabase } from '../../lib/supabase';
import React, { useState, useEffect } from 'react';
import { Project, Zone } from '../../types/projects';
import { Theme } from '../../types/theme';
import { Standard } from '../../types/standards';
import { Edit2, Save, Check, X, Trash2, MapPin, Plus, Upload } from 'lucide-react';
import { Language, useTranslation } from '../../types/language';
import { Parameter } from '../../types/parameters';
import { fetchParameters } from '../../services/parameters';
import { fetchStandards } from '../../services/standards';
import { updateZone, deleteZone } from '../../services/zones';
import { fetchProjects } from '../../services/projects';
import { createDatapoint, deleteDatapoint, updateDatapoint } from '../../services/datapoints';
import { useSupabaseMedia,  fetchMediaUrlsByEntityId } from '../../services/media';
import { useKeyAction } from '../../hooks/useKeyAction';


const openInMaps = (latitude: string, longitude: string) => {
};

interface ZoneViewProps {
  project: Project;
  zone: Zone;
  currentTheme: Theme;
  currentLanguage: Language;
  editingName: any;
  newName: string;
  setNewName: (name: string) => void;
  handleNameEdit: (type: string, projectId: string, id: string, currentName: string, fieldId?: string, e?: React.MouseEvent) => void;
  onCancelNewDatapoint: () => void;
  handleSubmitDatapoint: (datapoint: any) => void;
  onProjectsChange: (projects: Project[]) => void;
  setEditingName: (name: any) => void;
}

const ZoneView: React.FC<ZoneViewProps> = ({
  project,
  zone,
  currentTheme,
  currentLanguage,
  editingName,
  newName,
  setNewName,
  handleNameEdit,
  onCancelNewDatapoint,
  handleSubmitDatapoint,
  onProjectsChange,
  setEditingName
}) => {
  const t = useTranslation(currentLanguage);
  const [showStandardSelector, setShowStandardSelector] = useState(false);
  const [standardFilter, setStandardFilter] = useState<string | null>(null);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [existingDatapoints, setExistingDatapoints] = useState(zone.datapoints || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [showCoordinatesForm, setShowCoordinatesForm] = useState(false);
  const [coordinates, setCoordinates] = useState({
    latitude: zone.latitude || '',
    longitude: zone.longitude || ''
  });
  const [datapoints, setDatapoints] = useState<Array<Record<string, string>>>([]);
  const [editingDatapoint, setEditingDatapoint] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [editingSequentialId, setEditingSequentialId] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<'name' | 'timestamp' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showDeleteDatapointConfirm, setShowDeleteDatapointConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const {  uploadMedia} = useSupabaseMedia("zone-data-points");
  const [preview, setPreview] = useState<string | null>(null);
  const [showMediaDialog, setShowMediaDialog] = useState<number | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  const handleNameSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSaving) return;
    
    if (!zone.id || !newName.trim()) {
      setError('Zone name is required');
      setEditingName(null);
      return;
    }

    try {
      setIsSaving(true);
      setIsSaving(true);
      // Update the zone in the database
      const { data: updatedZone, error } = await supabase
        .from('zones')
        .update({ name: newName.trim() })
        .eq('id', zone.id)
        .select()
        .single();

      if (error) throw error;

      // Refresh projects data
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }

      // Reset state
      setNewName('');
      setEditingName(null);
      setError(null);
    } catch (err) {
      console.error('Error updating zone:', err);
      setError(err instanceof Error ? err.message : 'Failed to update zone name');
      setEditingName(null);
    } finally {
      setIsSaving(false);
    }
  };


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedParams, fetchedStandards] = await Promise.all([
          fetchParameters(),
          fetchStandards()
        ]);
        setParameters(fetchedParams);
        setStandards(fetchedStandards);
        setExistingDatapoints(zone.datapoints || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update existingDatapoints when zone changes
  useEffect(() => {
    setExistingDatapoints(zone.datapoints || []);
  }, [zone.datapoints]);

  const handleAddDatapoint = () => {
    setDatapoints(prev => [...prev, {}]);
    setEditingDatapoint(datapoints.length);
  };

  const handleDatapointChange = (paramId: string, value: string, index: number) => {
    setDatapoints(prev => {
      const newDatapoints = [...prev];
      if (!newDatapoints[index]) {
        newDatapoints[index] = {};
      }
      newDatapoints[index][paramId] = value;
      return newDatapoints;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Get all values for this datapoint
      const datapoint = datapoints[index];
      if (!datapoint || Object.keys(datapoint).length === 0) {
        setError('Please enter at least one value');
        return;
      }

      handleSaveDatapoint(index);
    }
  };

  const handleSaveDatapoint = async (index: number) => {
    if (isSaving) return;
    
    const datapoint = { ...datapoints[index] };
    if (!datapoint || Object.keys(datapoint).length === 0) {
      setError('Please enter at least one value');
      return;
    }
    

    // Get the custom sequential ID if it was set
    const sequentialId = datapoint.sequentialId || `DP${String(existingDatapoints.length + index + 1).padStart(3, '0')}`;
    delete datapoint.sequentialId; // Remove from values object

    try {
      if (!standards[0]?.id) {
        throw new Error('No standard selected');
      }

      setError(null);
      
      // Create the datapoint in the database
      const newDatapoint = await createDatapoint(zone.id, {
        type: standards[0].id,
        values: datapoint,
        ratings: {}, // The database will calculate ratings automatically
        sequentialId: sequentialId
      });

      if (!newDatapoint) {
        throw new Error('Failed to create datapoint');
      }

      // Refresh projects data to get the new datapoint
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        // Find the updated zone with new datapoint
        const updatedZone = updatedProjects
          .flatMap(p => p.fields)
          .flatMap(f => f.zones)
          .find(z => z.id === zone.id);

        if (!updatedZone) {
          throw new Error('Failed to find updated zone');
        }

        onProjectsChange(updatedProjects);
      }

      // Clear the row
      setDatapoints(prev => prev.filter((_, i) => i !== index));
      setEditingDatapoint(null);
    } catch (err) {
      console.error('Error saving datapoint:', err);
      setError(err instanceof Error ? err.message : 'Failed to save datapoint');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDatapoint = async (datapointId: string) => {
    try {
      await deleteDatapoint(datapointId);
      
      // Refresh projects data
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }

      setShowDeleteDatapointConfirm(null);
    } catch (err) {
      console.error('Error deleting datapoint:', err);
      setError('Failed to delete datapoint');
    }
  };



  const handleFileChangeInDialog = async (event: React.ChangeEvent<HTMLInputElement>, datapointId: string) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPreview(URL.createObjectURL(file));
      await uploadMedia(file, datapointId);
      const mediatwo=  await fetchMediaUrlsByEntityId(datapointId);
      setMediaUrls(mediatwo);
    }
  };

  const handleEditDatapoint = (datapoint: any) => {
    setEditingDatapoint(datapoint.id);
    setEditingValues(datapoint.values);
    setEditingSequentialId(datapoint.sequentialId);
  };

  const handleSaveEdit = async (datapointId: string) => {
    try {
      await updateDatapoint(datapointId, {
        values: editingValues,
        sequential_id: editingSequentialId
      });

      // Refresh projects data
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }

      setEditingDatapoint(null);
      setEditingValues({});
      setEditingSequentialId('');
    } catch (err) {
      console.error('Error updating datapoint:', err);
      setError('Failed to update datapoint');
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column as 'name' | 'timestamp');
      setSortDirection('asc');
    }
  };

  const sortedDatapoints = React.useMemo(() => {
    if (!sortColumn) return existingDatapoints;

    const sorted = [...existingDatapoints].sort((a, b) => {
      if (sortColumn === 'name') {
        return sortDirection === 'asc' 
          ? a.sequentialId.localeCompare(b.sequentialId)
          : b.sequentialId.localeCompare(a.sequentialId);
      } else if (sortColumn === 'timestamp') {
        const aTime = new Date(a.timestamp).getTime();
        const bTime = new Date(b.timestamp).getTime();
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      }
      return 0;
    });
    return sorted;
  }, [existingDatapoints, sortColumn, sortDirection]);


  const handleShowMediaDialog = async (index: number , datapoint: string) => {
    setShowMediaDialog(index);
    const mediatwo= await fetchMediaUrlsByEntityId(datapoint);
    setMediaUrls(mediatwo);
  };

  const addCoordinates = async () => {
    try {
      await updateZone(zone.id, {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      });
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }
      setShowCoordinatesForm(false);
    } catch (err) {
      console.error('Error updating coordinates:', err);
      setError('Failed to update coordinates');
    }
  }

  const handleCoordinates = async (e: React.FormEvent) => {
    e.preventDefault();
    addCoordinates();
  }

  useKeyAction(() => {
    addCoordinates();
  }, showCoordinatesForm);


  return (
    
    <div className="p-6">
      {error && (
        <div className="p-4 mb-4 rounded text-accent-primary border-theme border-solid bg-surface">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <div className="text-2xl font-mono text-primary">
          {editingName?.id === zone.id ? (
            <form onSubmit={handleNameSave} className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border-b px-1 outline-none font-mono text-2xl text-primary bg-accent-primary"                
                autoFocus
              />
              <button
                type="submit"
                className="p-1 rounded hover:bg-opacity-80 text-accent-primary"
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 rounded hover:bg-opacity-80 text-secondary"
              >
                <Trash2 size={16} />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <span>{zone.name}</span>
              <button
                onClick={(e) => handleNameEdit('zone', project.id, zone.id, zone.name, undefined, e)}
                className="p-1 rounded hover:bg-opacity-80 text-secondary"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {zone.latitude && zone.longitude ? (
            <button
              onClick={() => openInMaps(zone.latitude!, zone.longitude!)}
              className="text-sm flex items-center gap-1 hover:underline text-accent-primary"
            >
              <MapPin size={14} />
              {zone.latitude}, {zone.longitude}
            </button>
          ) : (
            <button
              onClick={() => setShowCoordinatesForm(true)}
              className="text-sm flex items-center gap-1 text-secondary"
            >
              <MapPin size={14} />
              Add coordinates
            </button>
          )}
          {zone.latitude && zone.longitude && (
            <button
              onClick={() => setShowCoordinatesForm(true)}
              className="text-sm text-secondary"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
        
      </div>

      {showCoordinatesForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="text-lg mb-4 text-primary">
              {zone.latitude && zone.longitude ? 'Edit Coordinates' : 'Add Coordinates'}
            </h3>
            <form onSubmit={handleCoordinates} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Latitude
                </label>
                <input
                  type="text"
                  value={coordinates.latitude}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, latitude: e.target.value }))}
                  required
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Longitude
                </label>
                <input
                  type="text"
                  value={coordinates.longitude}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, longitude: e.target.value }))}
                  required
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                  
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCoordinatesForm(false)}
                  className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"                  
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-sm text-white bg-accent-primary"                  
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="text-lg mb-4 flex items-center gap-2 text-primary">
              <Trash2 className="text-accent-primary" size={20} />
              Delete Zone
            </h3>
            
            <p className="mb-4 text-secondary">
              This action cannot be undone. Please type the zone name <strong>{zone.name}</strong> to confirm deletion.
            </p>
            
            <div className="space-y-4">
              <input
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder="Type zone name to confirm"
                className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"                
                autoFocus
              />
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmName('');
                    setEditingName(null);
                  }}
                  className="px-4 py-2 rounded text-sm text-secondary border-theme bg-surface"                  
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (deleteConfirmName === zone.name) {
                      try {
                        await deleteZone(zone.id);
                        const updatedProjects = await fetchProjects();
                        if (updatedProjects) {
                          onProjectsChange(updatedProjects);
                        }
                      } catch (err) {
                        console.error('Error deleting zone:', err);
                        setError('Failed to delete zone');
                      }
                    }
                  }}
                  disabled={deleteConfirmName !== zone.name}
                  className="px-4 py-2 rounded text-sm text-white bg-accent-primary"
                  style={{
                    opacity: deleteConfirmName === zone.name ? 1 : 0.5
                  }}
                >
                  Delete Zone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 rounded text-accent-primary border-theme border-solid bg-surface">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center p-4 text-secondary">
          Loading...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg text-primary">
              Datapoints
            </h3>
            <button
              onClick={handleAddDatapoint}
              className="px-3 py-1 rounded text-sm flex items-center gap-2 text-white bg-accent-primary"
            >
              <Plus size={14} />
              Add Datapoint
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-theme text-primary">
              <thead>
                <tr>
                  <th
                    className="min-w-[200px] p-2 text-left border font-normal sticky left-0 z-10 border-theme bg-surface"                    
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span>Name</span>
                      {sortColumn === 'name' && (
                        <span className="text-secondary">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  {parameters.map(param => (
                    <th
                      key={param.id}
                      className="w-24 p-2 text-left border font-normal border-theme"                      
                    >
                      <div className="flex flex-col items-center h-48">
                        <div className="h-24 writing-vertical-rl transform rotate-180 mb-2 text-center">
                          {param.name}
                        </div>
                        <div className="border-t w-full mb-2 border-theme" />
                        {param.shortName && (
                          <div className="text-xs mt-2 text-center text-secondary">
                            {param.shortName}
                          </div>
                        )}
                        <div className="text-xs mt-1 text-center text-secondary">
                          {param.unit || '-'}
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="w-44 p-2 text-left border font-normal border-theme">
                    Actions
                  </th>
                  <th
                    className="w-44 p-2 text-left border font-normal border-theme"                    
                    onClick={() => handleSort('timestamp')}
                  > 
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span>Timestamp</span>
                      {sortColumn === 'timestamp' && (
                        <span className="text-secondary">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
            
              <tbody>
                {sortedDatapoints.map((dp) => (
                  <tr key={dp.id}>
                    <td className="p-2 border sticky left-0 z-10 border-theme bg-surface">
                      <div className="flex items-center justify-between">
                        {editingDatapoint === Number(dp.id) ? (
                          <input
                            type="text"
                            value={editingSequentialId}
                            onChange={(e) => setEditingSequentialId(e.target.value)}
                            className="w-full p-1 rounded text-sm font-mono text-primary border-theme border-solid bg-surface"                            
                          />
                        ) : (
                          <span className="text-sm font-mono text-primary">
                            {dp.sequentialId}
                          </span>
                        )}
                      </div>
                    </td>
                    {parameters.map(param => (
                      <td 
                        key={param.id}
                        className="p-2 border border-theme"
                      >
                        {editingDatapoint === Number(dp.id) ? (
                          <input
                            type="text"
                            value={editingValues[param.id] || ''}
                            onChange={(e) => setEditingValues(prev => ({
                              ...prev,
                              [param.id]: e.target.value
                            }))}
                            className="w-full p-1 rounded text-sm text-center text-primary border-theme border-solid bg-surface"                            
                          />
                        ) : (
                          <span className="text-sm text-center block">
                            {dp.values[param.id] || '-'}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="p-2 border border-theme">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => editingDatapoint === Number(dp.id) ? 
                            handleSaveEdit(dp.id) : 
                            handleEditDatapoint(dp)
                          }
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        >
                          {editingDatapoint === Number(dp.id) ? (
                            <Save size={14} />
                          ) : (
                            <Edit2 size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (editingDatapoint === Number(dp.id)) {
                              setEditingDatapoint(null);
                              setEditingValues({});
                            } else {
                              setShowDeleteDatapointConfirm(dp.id);
                            }
                          }}
                          title={editingDatapoint === Number(dp.id) ? 
                            "Cancel editing" : 
                            "Delete datapoint"
                          }
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        >
                          {editingDatapoint === Number(dp.id) ? (
                            <X size={14} />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-2 border border-theme">
                      <span className="text-sm text-center block font-mono text-secondary">
                        {new Date(dp.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td 
                      className="p-2 border"
                      style={{ borderColor: currentTheme.colors.border }}
                    >
                      <label className="cursor-pointer">
                        <Upload size={16} onClick={() => handleShowMediaDialog(index , dp.id)} />
                      </label>

                    </td>
                  </tr>
                ))}
                {/* Display new datapoint inputs */}
                {datapoints.map((datapoint, index) => (
                  <tr key={index}>
                    <td className="p-2 border sticky left-0 z-10 border-theme bg-surface">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          name="sequentialId"
                          defaultValue={`DP${String(existingDatapoints.length + index + 1).padStart(3, '0')}`}
                          onChange={(e) => {
                            const newDatapoint = { ...datapoints[index] };
                            newDatapoint.sequentialId = e.target.value;
                            setDatapoints(prev => {
                              const newDatapoints = [...prev];
                              newDatapoints[index] = newDatapoint;
                              return newDatapoints;
                            });
                          }}
                          className="w-full p-1 rounded text-sm font-mono text-primary border-theme border-solid bg-surface"                          
                        />
                        <button
                          onClick={() => handleDeleteDatapoint(String(index))}
                          className="ml-2 hover:opacity-80 text-secondary"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                    {parameters.map(param => (
                      <td 
                        key={param.id}
                        className="p-2 border border-theme"
                      >
                        <input
                          type="text"
                          value={datapoint[param.id] || ''}
                          onChange={(e) => handleDatapointChange(param.id, e.target.value, index)}
                          onKeyPress={(e) => handleKeyPress(e, index)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveDatapoint(index);
                            }
                          }}
                          className="w-full p-1 rounded text-sm text-center text-primary border-theme border-solid bg-surface"                          
                        />
                      </td>
                    ))}
    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Delete Datapoint Confirmation Dialog */}
      {showDeleteDatapointConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="text-lg mb-4 flex items-center gap-2 text-primary">
              <Trash2 className="text-accent-primary" size={20} />
              Delete Datapoint
            </h3>
            
            <p className="mb-4 text-secondary">
              Are you sure you want to delete this datapoint? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteDatapointConfirm(null)}
                className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"                
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDatapoint(showDeleteDatapointConfirm)}
                className="px-4 py-2 rounded text-sm text-white bg-accent-primary"                
              >
                Delete Datapoint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Dialog */}
      {showMediaDialog !== null && ( 
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
                {mediaUrls.slice(0,mediaUrls.length).map((url, index) => (
                  <img key={index} src={url} alt={`Media ${index}`} className="w-full h-32 object-cover" />
                ))}
              
              </div>
              
              <div className="flex justify-end gap-2">
                <label className="cursor-pointer px-4 py-2 rounded text-sm" style={{ backgroundColor: currentTheme.colors.accent.primary, color: 'white' }}>
                  <Upload size={16} /> Upload Media
                  <input
                    type="file"
                    onChange={(e) => handleFileChangeInDialog(e, existingDatapoints[showMediaDialog].id)}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setShowMediaDialog(null)}
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
      )}
    </div>
  );
};

export default ZoneView;