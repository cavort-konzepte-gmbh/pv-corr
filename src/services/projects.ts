import { supabase } from '../lib/supabase';
import { Project } from '../types/projects';
import { toCase } from '../utils/cases';

export const createProject = async (project: Omit<Project, 'id' | 'fields'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Prepare project data with explicit imageUrl
  const toSnakeCase = toCase<Omit<Project, "id" | "fields">>(project, "snakeCase")

  // Use RPC call to handle project creation and user association atomically
  const { data, error } = await supabase.rpc('create_project_with_owner', {
    project_data: toSnakeCase
  });
  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  return toCase<Project>(data, "camelCase");
};

export const updateProject = async (project: Project) => {
  // Extract only the fields that belong to the projects table
  const updateData = {
    name: project.name,
    client_ref: project.clientRef || null,
    latitude: project.latitude,
    longitude: project.longitude,
    image_url: project.imageUrl || null,
    company_id: project.companyId || null,
    manager_id: project.managerId || null,
    type_project: project.typeProject || 'field',
    customer_id: project.customerId || null
  };
  
  // First update the project
  const { error: updateError } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', project.id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating project:', updateError);
    throw updateError;
  }
  
  // Fetch the complete project data after update
  const { data: completeProject, error: fetchError } = await supabase
    .from('user_projects')
    .select(`
      project:projects (
        id,
        hidden_id,
        name,
        client_ref,
        latitude,
        longitude,
        image_url,
        company_id,
        manager_id,
        type_project,
        customer_id,
        fields:fields (
        id,
        hidden_id,
        name,
        latitude,
        longitude,
        has_fence,
        gates:gates (*),
        zones:zones (
          id,
          hidden_id,
          name,
          latitude,
          longitude,
          datapoints:datapoints (*)
        )
        )
      )`)
    .eq('project.id', project.id)
    .single();

  if (fetchError) {
    console.error('Error fetching updated project:', fetchError);
    throw fetchError;
  }

  return toCase<Project>(completeProject.project, "camelCase");
};

export const moveProject = async (projectId: string, customerId: string | null) => {
  try {
    const { error } = await supabase
      .from('projects')
      .update({ customer_id: customerId })
      .eq('id', projectId);

    if (error) throw error;
  } catch (err) {
    console.error('Error moving project:', err);
    throw err;
  }
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

export const fetchProjects = async (customerId?: string): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('user_projects')
      .select(`
        project:projects (
          id,
          hidden_id,
          name,
          client_ref,
          latitude,
          longitude,
          image_url,
          company_id,
          manager_id,
          type_project,
          customer_id,
          fields:fields (
          id,
          hidden_id,
          name,
          latitude,
          longitude,
          has_fence,
          gates:gates (*),
          zones:zones (
            id,
            hidden_id,
            name,
            latitude,
            longitude,
            datapoints:datapoints (*)
          )
          )
        )`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error(error.message);
    }

    if (!data) {
      return [];
    }
    
    // Filter projects based on customerId after fetching
    const projects = data.map(({ project }) => ({
      id: project.id,
      hiddenId: project.hidden_id,
      name: project.name,
      clientRef: project.client_ref,
      latitude: project.latitude,
      longitude: project.longitude,
      imageUrl: project.image_url,
      companyId: project.company_id,
      managerId: project.manager_id,
      typeProject: project.type_project,
      customerId: project.customer_id,
      fields: (project.fields || []).map(field => ({
        id: field.id,
        hiddenId: field.hidden_id,
        name: field.name,
        latitude: field.latitude,
        longitude: field.longitude,
        has_fence: field.has_fence,
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
          substructureId: zone.substructure_id,
          foundationId: zone.foundation_id,
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

    // Filter projects based on customerId
    return projects.filter(project => {
      if (customerId === null) {
        return !project.customerId;
      }
      if (customerId) {
        return project.customerId === customerId;
      }
      return true;
    });
  } catch (err) {
    console.error('Error fetching projects:', err);
    throw new Error('Failed to load projects');
  }
};