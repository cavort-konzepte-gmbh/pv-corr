import { supabase } from '../lib/supabase';
import { Project } from '../types/projects';

export const createProject = async (project: Omit<Project, 'id' | 'fields'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Prepare project data with explicit imageUrl
  const projectData = {
    name: project.name,
    hidden_id: project.hiddenId,
    client_ref: project.clientRef,
    latitude: project.latitude,
    longitude: project.longitude,
    image_url: project.imageUrl,
    place_id: project.placeId || null,
    manager_id: project.managerId || null,
    company_id: project.companyId || null
  };
  // Use RPC call to handle project creation and user association atomically
  const { data, error } = await supabase.rpc('create_project_with_owner', {
    project_data: projectData
  });

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  return data;
};

export const updateProject = async (project: Project) => {
  // Prepare update data with explicit imageUrl
  const updateData = {
    name: project.name,
    client_ref: project.clientRef,
    latitude: project.latitude,
    longitude: project.longitude,
    image_url: project.imageUrl,
    place_id: project.placeId,
    company_id: project.companyId || null,
    manager_id: project.managerId || null
  };

  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', project.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }

  return data;
};

export const deleteProject = async (projectId: string) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        fields!fields_project_id_fkey (
          *,
          gates!gates_field_id_fkey (*),
          zones!zones_field_id_fkey (
            *,
            datapoints!datapoints_zone_id_fkey (*)
          )
        )
      `)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error(error.message);
    }

    if (!data) {
      return [];
    }

    return data.map(project => ({
      id: project.id,
      hiddenId: project.hidden_id,
      name: project.name,
      clientRef: project.client_ref,
      latitude: project.latitude,
      longitude: project.longitude,
      imageUrl: project.image_url,
      placeId: project.place_id,
      companyId: project.company_id,
      managerId: project.manager_id,
      fields: (project.fields || []).map(field => ({
        id: field.id,
        hiddenId: field.hidden_id,
        name: field.name,
        latitude: field.latitude,
        longitude: field.longitude,
        gates: (field.gates || []).map(gate => ({
          id: gate.id,
          hiddenId: gate.hidden_id,
          name: gate.name,
          latitude: gate.latitude,
          longitude: gate.longitude
        })),
        zones: (field.zones || []).map(zone => ({
          id: zone.id,
          hiddenId: zone.hidden_id,
          name: zone.name,
          latitude: zone.latitude,
          longitude: zone.longitude,
          datapoints: (zone.datapoints || []).map(dp => ({
            id: dp.id,
            hiddenId: dp.hidden_id,
            sequentialId: dp.sequential_id,
            type: dp.type,
            values: dp.values || {},
            ratings: dp.ratings || {},
            timestamp: dp.timestamp
          }))
        }))
      }))
    }));
  } catch (err) {
    console.error('Error fetching projects:', err);
    throw new Error('Failed to load projects');
  }
};