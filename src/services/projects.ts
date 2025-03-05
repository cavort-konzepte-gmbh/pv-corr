import { supabase } from '../lib/supabase';
import { Project } from '../types/projects';
import { toCase } from '../utils/cases';
import { generateHiddenId } from '../utils/generateHiddenId';

interface CreateProjectOptions {
  createDefaultField?: boolean;
  defaultFieldName?: string;
  createDefaultZone?: boolean;
  defaultZoneName?: string;
}

export const createProject = async (
  project: Omit<Project, 'id' | 'fields'>, 
  options: CreateProjectOptions = {
    createDefaultField: true,
    defaultFieldName: 'Field 1',
    createDefaultZone: true,
    defaultZoneName: 'Zone 1'
  }
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([{
        name: project.name,
        client_ref: project.clientRef || null,
        latitude: project.latitude,
        longitude: project.longitude,
        image_url: project.imageUrl || null,
        company_id: project.companyId || null,
        manager_id: project.managerId || null,
        type_project: project.typeProject || 'field',
        customer_id: project.customerId || null,
        hidden_id: generateHiddenId()
      }])
      .select(`
        *,
        fields (
          id,
          hidden_id,
          name,
          latitude,
          longitude,
          has_fence,
          gates (*),
          zones (
            id,
            hidden_id,
            name,
            latitude,
            longitude,
            datapoints (*)
          )
        )
      `)
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      throw new Error(projectError.message);
    }
    if (!projectData) {
      throw new Error('No project data returned after creation');
    }

    // Create default field if requested
    if (options.createDefaultField) {
      const { data: fieldData, error: fieldError } = await supabase
        .from('fields')
        .insert([{
          project_id: projectData.id,
          name: options.defaultFieldName || 'Field 1',
          hidden_id: generateHiddenId(),
          has_fence: 'no'
        }])
        .select()
        .single();

      if (fieldError) {
        console.error('Field creation error:', fieldError);
        throw new Error(fieldError.message);
      }

      // Create default zone if requested
      if (options.createDefaultZone && fieldData) {
        const { error: zoneError } = await supabase
          .from('zones')
          .insert([{
            field_id: fieldData.id,
            name: options.defaultZoneName || 'Zone 1',
            hidden_id: generateHiddenId()
          }]);

        if (zoneError) {
          console.error('Zone creation error:', zoneError);
          throw new Error(zoneError.message);
        }
      }
    }

    return toCase<Project>(projectData, "camelCase");
  } catch (err) {
    console.error('Error creating project:', err);
    throw err instanceof Error ? err : new Error('Failed to create project');
  }
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
    .select();

  if (updateError) {
    console.error('Error updating project:', updateError);
    throw updateError;
  }
  
  // Fetch the complete project data after update
  const { data: completeProject, error: fetchError } = await supabase
    .from('projects')
    .select(`
      *,
      fields!inner (
        id,
        hidden_id,
        name,
        latitude,
        longitude,
        has_fence,
        gates:gates (*),
        zones!inner (
          id,
          hidden_id,
          name,
          latitude,
          longitude,
          datapoints:datapoints (*)
        )
      )`)
    .eq('id', project.id)
    .single();

  if (fetchError) {
    console.error('Error fetching updated project:', fetchError);
    throw fetchError;
  }

  return toCase<Project>(completeProject, "camelCase");
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
  try {
    // Verify project exists before deletion
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (fetchError) {
      throw new Error('Project not found');
    }

    if (!project) {
      throw new Error('Project does not exist');
    }

    const { error: deleteProjectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (deleteProjectError) {
      console.error('Error deleting project:', deleteProjectError);
      throw new Error(deleteProjectError.message);
    }

    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete project';
    console.error('Error deleting project:', message);
    throw new Error(message);
  }
};

export const fetchProjects = async (customerId?: string): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`*,
        fields (
          id, hidden_id, name, latitude, longitude, has_fence,
          gates (*),
          zones (
            id, hidden_id, name, latitude, longitude, substructure_id, foundation_id,
            datapoints (*)
          )
        )`)
      .order('created_at', { ascending: true });
      console.log(data)

    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error(error.message);
    }

    if (!data) {
      return [];
    }

    // Filter projects based on customerId after fetching
    const projects = data.map(project => ({
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
            name: dp.name,
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