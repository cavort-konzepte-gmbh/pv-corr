import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Zone } from '../../../../types/projects';
import { ChevronRight, Edit2, Save, X, Building2, Wrench } from 'lucide-react';
import { updateZone, deleteZone } from '../../../../services/zones';
import { fetchProjects } from '../../../../services/projects';
import { useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

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
  const [substructures, setSubstructures] = useState<any[]>([]);
  const [foundations, setFoundations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [{ data: subData }, { data: foundData }] = await Promise.all([
          supabase.from('substructures_view').select('*'),
          supabase.from('foundations').select('*')
        ]);

        setSubstructures(subData || []);
        setFoundations(foundData || []);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUpdateZone = async (zoneId: string, values: Record<string, string>) => {
    if (updatingZone) return;
    try {
      setUpdatingZone(true);
      
      // Prepare update data
      const updateData = {
        name: values.name,
        latitude: values.latitude || null,
        longitude: values.longitude || null,
        substructureId: values.substructureId || null,
        foundationId: values.foundationId || null
      };

      await updateZone(zoneId, updateData);
      
      // Wait a moment before refreshing to ensure DB update is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }
      
      // Reset editing state
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
            <th className="p-2 text-left border font-normal border-theme">
              Substructure
            </th>
            <th className="p-2 text-left border font-normal border-theme">
              Foundation
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
                    name="name"
                    type="text"
                    value={editingValues.name || zone.name}
                    onChange={(e) => setEditingValues({ ...editingValues, name: e.target.value })}
                    className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                    required
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
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editingValues.latitude || zone.latitude || ''}
                        onChange={(e) => setEditingValues({ ...editingValues, latitude: e.target.value })}
                        placeholder="Latitude"
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editingValues.longitude || zone.longitude || ''}
                        onChange={(e) => setEditingValues({ ...editingValues, longitude: e.target.value })}
                        placeholder="Longitude"
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                      />
                    </div>
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
                {editingZoneId === zone.id ? (
                  <select
                    value={editingValues.substructureId || zone.substructureId || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, substructureId: e.target.value })}
                    className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  >
                    <option value="">Select Substructure</option>
                    {substructures.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.manufacturer} - {sub.system} ({sub.version})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wrench size={14} className="text-secondary" />
                    {(() => {
                      const sub = substructures.find(s => s.id === zone.substructureId);
                      return sub ? (
                        <span>{sub.manufacturer} - {sub.system}</span>
                      ) : (
                        <span className="text-secondary">Not set</span>
                      );
                    })()}
                  </div>
                )}
              </td>
              <td className="p-2 border border-theme">
                {editingZoneId === zone.id ? (
                  <select
                    value={editingValues.foundationId || zone.foundationId || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, foundationId: e.target.value })}
                    className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  >
                    <option value="">Select Foundation</option>
                    {foundations.map(foundation => (
                      <option key={foundation.id} value={foundation.id}>
                        {foundation.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-secondary" />
                    {(() => {
                      const foundation = foundations.find(f => f.id === zone.foundationId);
                      return foundation ? (
                        <span>{foundation.name}</span>
                      ) : (
                        <span className="text-secondary">Not set</span>
                      );
                    })()}
                  </div>
                )}
              </td>
              <td className="p-2 border border-theme">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => editingZoneId === zone.id ? (
                      handleUpdateZone(zone.id, editingValues)
                    ) : (
                      (() => {
                        setEditingZoneId(zone.id);
                        setEditingValues({
                          name: zone.name,
                          latitude: zone.latitude || '',
                          longitude: zone.longitude || '',
                          substructureId: zone.substructureId || '',
                          foundationId: zone.foundationId || ''
                        });
                      })()
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
                    className="p-1 rounded hover:bg-opacity-80 text-accent-primary"
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