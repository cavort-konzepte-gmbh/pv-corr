import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Zone } from '../../../../types/projects';
import { ChevronRight, Edit2, Save, X } from 'lucide-react';
import { updateZone, deleteZone } from '../../../../services/zones';
import { fetchProjects } from '../../../../services/projects';

interface ZoneListProps {
  currentTheme: Theme;
  zones: Zone[];
  onSelectZone: (zoneId: string) => void;
  onProjectsChange: (projects: Project[]) => void;
}

const ZoneList: React.FC<ZoneListProps> = ({
  currentTheme,
  zones,
  onSelectZone,
  onProjectsChange
}) => {
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [updatingZone, setUpdatingZone] = useState(false);

  const handleUpdateZone = async (zoneId: string, values: Record<string, string>) => {
    if (updatingZone) return;
    try {
      setUpdatingZone(true);
      await updateZone(zoneId, {
        name: values.name,
        latitude: values.latitude,
        longitude: values.longitude
      });
      
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }

      setEditingZoneId(null);
      setEditingValues({});
    } catch (err) {
      console.error('Error updating zone:', err);
    } finally {
      setUpdatingZone(false);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    try {
      await deleteZone(zoneId);
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }
    } catch (err) {
      console.error('Error deleting zone:', err);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border-theme text-primary">
        <thead>
          <tr>
            <th className="p-2 text-left border font-normal border-theme">
              Name
            </th>
            <th className="p-2 text-left border font-normal border-theme">
              Datapoints
            </th>
            <th className="p-2 text-left border font-normal border-theme">
              Location
            </th>
            <th className="p-2 text-center border font-normal border-theme">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {zones.map(zone => (
            <tr key={zone.id} className="hover:bg-opacity-50">
              <td className="p-2 border border-theme">
                {editingZoneId === zone.id ? (
                  <input
                    type="text"
                    value={editingValues.name || zone.name}
                    onChange={(e) => setEditingValues({ ...editingValues, name: e.target.value })}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                  />
                ) : (
                  zone.name
                )}
              </td>
              <td className="p-2 border border-theme">
                {zone.datapoints?.length || 0} datapoints
              </td>
              <td className="p-2 border border-theme">
                {editingZoneId === zone.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingValues.latitude || zone.latitude || ''}
                      onChange={(e) => setEditingValues({ ...editingValues, latitude: e.target.value })}
                      placeholder="Latitude"
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    />
                    <input
                      type="text"
                      value={editingValues.longitude || zone.longitude || ''}
                      onChange={(e) => setEditingValues({ ...editingValues, longitude: e.target.value })}
                      placeholder="Longitude"
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    />
                  </div>
                ) : zone.latitude && zone.longitude ? (
                  <button
                    onClick={() => window.open(`https://www.google.com/maps?q=${zone.latitude},${zone.longitude}`, '_blank')}
                    className="text-sm hover:underline text-accent-primary"
                  >
                    View on map
                  </button>
                ) : (
                  <span className="text-secondary">No location set</span>
                )}
              </td>
              <td className="p-2 border border-theme">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => editingZoneId === zone.id ? (
                      handleUpdateZone(zone.id, editingValues)
                    ) : (
                      setEditingZoneId(zone.id)
                    )}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    disabled={updatingZone}
                  >
                    {editingZoneId === zone.id ? <Save size={14} /> : <Edit2 size={14} />}
                  </button>
                  {editingZoneId === zone.id && (
                    <>
                      <button
                        onClick={() => handleDeleteZone(zone.id)}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setEditingZoneId(null);
                          setEditingValues({});
                        }}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onSelectZone(zone.id)}
                    className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    style={{ color: currentTheme.colors.accent.primary }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ZoneList;