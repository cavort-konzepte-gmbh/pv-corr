import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Project, Zone } from '../../../../types/projects';
import { ChevronRight, Edit2, Save, X, Building2, Wrench, Plus } from 'lucide-react';
import { updateZone, deleteZone } from '../../../../services/zones';
import { fetchProjects } from '../../../../services/projects';
import { useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Language, useTranslation } from '../../../../types/language';
import { FormHandler } from '../../../shared/FormHandler';
import { createZone } from '../../../../services/zones';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ZoneListProps {
  currentTheme: Theme;
  zones: Zone[];
  onSelectZone: (zoneId: string) => void;
  onProjectsChange: (projects: Project[]) => void;
  currentLanguage: Language;
  selectedFieldId: string;
}

const ZoneList: React.FC<ZoneListProps> = ({
  currentTheme,
  zones,
  onSelectZone,
  onProjectsChange,
  currentLanguage,
  selectedFieldId
}) => {
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [updatingZone, setUpdatingZone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubstructure, setSelectedSubstructure] = useState<any>(null);
  const [selectedFoundation, setSelectedFoundation] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newValues, setNewValues] = useState({
    name: '',
    latitude: '',
    longitude: '',
    substructureId: '',
    foundationId: ''
  });
  const [substructures, setSubstructures] = useState<any[]>([]);
  const [foundations, setFoundations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const translation = useTranslation(currentLanguage)

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
      setError(null);
      setUpdatingZone(true);
      
      // Prepare update data
      const updateData = {
        name: values.name,
        latitude: values.latitude || null,
        longitude: values.longitude || null,
        substructureId: values.substructureId === '' ? null : values.substructureId,
        foundationId: values.foundationId === '' ? null : values.foundationId
      };

      await updateZone(zoneId, updateData);
      
      // Wait a moment before refreshing to ensure DB update is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedProjects = await fetchProjects();
      onProjectsChange(updatedProjects);
      
      // Reset editing state
      setEditingZoneId(null);
      setEditingValues({});
      setError(null);

    } catch (err) {
      console.error('Error updating zone:', err);
      setError(err instanceof Error ? err.message : 'Failed to update zone');
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

  const handleAddZone = async () => {
    if (!newValues.name?.trim()) {
      setError('Zone name is required');
      return;
    }

    try {
      await createZone(selectedFieldId, {
        name: newValues.name.trim(),
        latitude: newValues.latitude || undefined,
        longitude: newValues.longitude || undefined,
        substructureId: newValues.substructureId || undefined,
        foundationId: newValues.foundationId || undefined
      });

      const updatedProjects = await fetchProjects();
      if (updatedProjects) {
        onProjectsChange(updatedProjects);
      }

      setIsAdding(false);
      setNewValues({
        name: '',
        latitude: '',
        longitude: '',
        substructureId: '',
        foundationId: ''
      });
    } catch (err) {
      console.error('Error creating zone:', err);
      setError('Failed to create zone');
    }
  };

  return (
    <div >
      <Button
        onClick={() => setIsAdding(true)}
        className="w-full py-3 px-4 mb-4"
      >
        <Plus size={16} />
        {translation("zones.add")}
      </Button>
      <section className="border border-input rounded-md bg-card">
      <div className="w-full relative overflow-auto">
      <Table >
        <TableHeader>
          <TableRow>
            <TableHead >
              {translation("zones.short_name")}
            </TableHead>
            <TableHead >
              {translation("zones.location")}
            </TableHead>
            <TableHead>
              Substructure
            </TableHead>
            <TableHead >
              Foundation
            </TableHead>
            <TableHead >
              {translation("zones.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isAdding && (
            <TableRow>
              <TableCell className="p-2">
                <FormHandler
                  isEditing={true}
                  onSave={handleAddZone}
                  onCancel={() => {
                    setIsAdding(false);
                    setNewValues({
                      name: '',
                      latitude: '',
                      longitude: '',
                      substructureId: '',
                      foundationId: ''
                    });
                  }}
                >
                  <Input
                    type="text"
                    value={newValues.name}
                    onChange={(e) => setNewValues({ ...newValues, name: e.target.value })}
                    className="w-full p-1"
                    placeholder="Enter zone name"
                  />
                </FormHandler>
              </TableCell>
              <TableCell className="p-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newValues.latitude}
                    onChange={(e) => setNewValues({ ...newValues, latitude: e.target.value })}
                    className="w-full p-1"
                    placeholder="Latitude"
                  />
                  <Input
                    type="text"
                    value={newValues.longitude}
                    onChange={(e) => setNewValues({ ...newValues, longitude: e.target.value })}
                    className="w-full p-1 rounded text-sm text-primary border border-input shadow-sm bg-accent"
                    placeholder="Longitude"
                  />
                </div>
              </TableCell>
              <TableCell className="p-2">
                <select
                  value={newValues.substructureId}
                  onChange={(e) => setNewValues({ ...newValues, substructureId: e.target.value })}
                  className="w-full p-2 rounded text-sm text-primary border border-input shadow-sm bg-accent"
                >
                  <option value="">Select Substructure</option>
                  {substructures.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.manufacturer} - {sub.system} ({sub.version})
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell className="p-2">
                <select
                  value={newValues.foundationId}
                  onChange={(e) => setNewValues({ ...newValues, foundationId: e.target.value })}
                  className="w-full p-2 rounded text-sm text-primary border border-input shadow-sm bg-accent"
                >
                  <option value="">Select Foundation</option>
                  {foundations.map(foundation => (
                    <option key={foundation.id} value={foundation.id}>
                      {foundation.name}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell className="p-2">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={handleAddZone}
                    className="size-8"
                  >
                    <Save size={14} />
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAdding(false);
                      setNewValues({
                        name: '',
                        latitude: '',
                        longitude: '',
                        substructureId: '',
                        foundationId: ''
                      });
                    }}
                    className="size-8"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
          {zones.map(zone => (
            <TableRow key={zone.id} >
              <TableCell className="p-2">
                {editingZoneId === zone.id ? (
                  <Input
                    name="name"
                    type="text"
                    value={editingValues.name || zone.name}
                    onChange={(e) => setEditingValues({ ...editingValues, name: e.target.value })}
                    className="w-full p-1"
                    required
                  />
                ) : (
                  zone.name
                )}
              </TableCell>
              <TableCell className="p-2">
                {editingZoneId === zone.id ? (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={editingValues.latitude || zone.latitude || ''}
                      onChange={(e) => setEditingValues({ ...editingValues, latitude: e.target.value })}
                      placeholder="Latitude"
                      className="w-full p-1"
                    />
                    <Input
                      type="text"
                      value={editingValues.longitude || zone.longitude || ''}
                      onChange={(e) => setEditingValues({ ...editingValues, longitude: e.target.value })}
                      placeholder="Longitude"
                      className="w-full p-1"
                    />
                  </div>
                ) : zone.latitude && zone.longitude ? (
                  <Button
                    onClick={() => window.open(`https://www.google.com/maps?q=${zone.latitude},${zone.longitude}`, '_blank')}
                  >
                    View on map
                  </Button>
                ) : (
                  <span >{translation("general.location_not_set")}</span>
                )}
              </TableCell>
              <TableCell className="p-2">
                {editingZoneId === zone.id ? (
                  <select
                    value={editingValues.substructureId || zone.substructureId || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, substructureId: e.target.value })}
                    className="w-full p-2 rounded text-sm  border border-input shadow-sm bg-accent"
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
                    <Wrench size={14} className="text-primary" />
                    {zone.substructureId ? (
                      (() => {
                        const sub = substructures.find(s => s.id === zone.substructureId);
                        return sub ? (
                          <span>{sub.manufacturer} - {sub.system}</span>
                        ) : (
                          <span className="text-primary">Not set</span>
                        );
                      })()
                    ) : (
                      <span className="text-primary">Not set</span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell className="p-2">
                {editingZoneId === zone.id ? (
                  <select
                    value={editingValues.foundationId || zone.foundationId || ''}
                    onChange={(e) => setEditingValues({ ...editingValues, foundationId: e.target.value })}
                    className="w-full p-2 rounded text-sm  border border-input shadow-sm bg-accent"
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
                    <Building2 size={14} className="text-primary" />
                    {zone.foundationId ? (
                      (() => {
                        const foundation = foundations.find(f => f.id === zone.foundationId);
                        return foundation ? (
                          <span>{foundation.name}</span>
                        ) : (
                          <span className="text-primary">Not set</span>
                        );
                      })()
                    ) : (
                      <span className="text-primary">Not set</span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell className="p-2">
                <div className="flex items-center justify-center gap-2">
                  <Button
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
                    className="size-8"
                    variant="ghost"
                    disabled={updatingZone}
                  >
                    {editingZoneId === zone.id ? <Save size={14} /> : <Edit2 size={14} />}
                  </Button>
                  {editingZoneId === zone.id && (
                    <>
                      <Button
                        onClick={() => handleDeleteZone(zone.id)}
                        variant="ghost"
                      >
                        {translation("actions.delete")}
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingZoneId(null);
                          setEditingValues({});
                        }}
                        className="size-8"
                        variant="ghost"
                        
                      >
                        <X size={14} />
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => onSelectZone(zone.id)}
                    className="size-8"
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      </section>

    </div>
  );
};

export default ZoneList;