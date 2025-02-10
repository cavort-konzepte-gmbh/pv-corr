import { supabase } from '../lib/supabase';
import { Parameter, ParameterUnit } from '../types/parameters';
import { generateHiddenId } from '../utils/generateHiddenId';

export type { Parameter }

export const fetchParameters = async (): Promise<Parameter[]> => {
  const { data, error } = await supabase
    .from('parameters')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching parameters:', error);
    throw error;
  }

  return data.map(param => ({
    id: param.id,
    hiddenId: param.hidden_id,
    name: param.name,
    customName: param.custom_name,
    shortName: param.short_name,
    unit: param.unit,
    rangeType: param.range_type,
    rangeValue: param.range_value
  }));
};

export const createParameter = async (parameter: Omit<Parameter, 'id' | 'hiddenId'>) => {
  // Validate required fields
  if (!parameter.name) {
    throw new Error('Parameter name is required');
  }

  if (!parameter.rangeType) {
    throw new Error('Range type is required');
  }

  // Prepare parameter data
  const parameterData = {
    hidden_id: generateHiddenId(),
    name: parameter.name,
    custom_name: parameter.name !== parameter.customName ? parameter.customName : null,
    short_name: parameter.shortName || null,
    unit: parameter.unit || null,
    range_type: parameter.rangeType,
    range_value: parameter.rangeValue || ''
  };

  const { data, error } = await supabase
    .from('parameters')
    .insert(parameterData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateParameter = async (id: string, parameter: Partial<Parameter>) => {
  if (!id) {
    throw new Error('Parameter ID is required for update');
  }

  const updateData: Record<string, any> = {};
  
  // Only include fields that are actually provided
  if (parameter.name !== undefined) updateData.name = parameter.name;
  if (parameter.customName !== undefined) updateData.custom_name = parameter.customName;
  if (parameter.shortName !== undefined) updateData.short_name = parameter.shortName;
  if (parameter.unit !== undefined) updateData.unit = parameter.unit === '' ? null : parameter.unit;
  if (parameter.rangeType !== undefined) updateData.range_type = parameter.rangeType;
  if (parameter.rangeValue !== undefined) updateData.range_value = parameter.rangeValue;

  const { data, error } = await supabase
    .from('parameters')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteParameter = async (id: string) => {
  const { error } = await supabase
    .from('parameters')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting parameter:', error);
    throw error;
  }
};