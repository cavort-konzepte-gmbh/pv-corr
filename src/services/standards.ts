import { supabase } from '../lib/supabase';
import { Standard } from '../types/standards';
import { toCase } from '../utils/cases';
import { generateHiddenId } from '../utils/generateHiddenId';

export const fetchStandards = async (): Promise<Standard[]> => {
  const { data, error } = await supabase
    .from('standards')
    .select(`
      id,
      hidden_id,
      name,
      description,
      version,
      parameters:standard_parameters (
        parameter_id,
        parameter_code,
        rating_ranges
      )
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching standards:', error);
    throw error;
  }
  return data.map(standard => toCase<Standard>(standard, "camelCase"))
};

export const createStandard = async (standard: Omit<Standard, 'id' | 'hiddenId'>) => {
  // First create the standard
  const { data: newStandard, error: standardError } = await supabase
    .from('standards')
    .insert({
      hidden_id: generateHiddenId(),
      name: standard.name,
      description: standard.description
    })
    .select()
    .single();

  if (standardError) {
    console.error('Error creating standard:', standardError);
    throw standardError;
  }

  // Then create the parameter associations
  if (standard.parameters && standard.parameters.length > 0) {
    const { error: paramsError } = await supabase
      .from('standard_parameters')
      .insert(
        standard.parameters.map(param => ({
          standard_id: newStandard.id,
          parameter_id: param.parameterId,
          parameter_code: param.parameterCode,
          rating_ranges: param.ratingRanges || []
        }))
      );

    if (paramsError) {
      console.error('Error adding standard parameters:', paramsError);
      throw paramsError;
    }
  }

  return newStandard;
};

export const updateStandard = async (id: string, standard: Partial<Standard>) => {
  // Update standard info
  const { data: updatedStandard, error: standardError } = await supabase
    .from('standards')
    .update({
      name: standard.name,
      description: standard.description
    })
    .eq('id', id)
    .select()
    .single();

  if (standardError) {
    console.error('Error updating standard:', standardError);
    throw standardError;
  }

  // Update parameters if provided
  if (standard.parameters) {
    // First delete existing parameters
    const { error: deleteError } = await supabase
      .from('standard_parameters')
      .delete()
      .eq('standard_id', id);

    if (deleteError) {
      console.error('Error deleting standard parameters:', deleteError);
      throw deleteError;
    }

    // Then add new ones
    const { error: paramsError } = await supabase
      .from('standard_parameters')
      .insert(
        standard.parameters.map(param => ({
          standard_id: id,
          parameter_id: param.parameterId,
          parameter_code: param.parameterCode,
          rating_ranges: param.ratingRanges || []
        }))
      );

    if (paramsError) {
      console.error('Error updating standard parameters:', paramsError);
      throw paramsError;
    }
  }

  return updatedStandard;
};

export const deleteStandard = async (id: string) => {
  const { error } = await supabase
    .from('standards')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting standard:', error);
    throw error;
  }
};