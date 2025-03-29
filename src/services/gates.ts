import { supabase } from "../lib/supabase";
import { Gate } from "../types/projects";
import { generateHiddenId } from "../utils/generateHiddenId";

export const createGate = async (fieldId: string, gate: Omit<Gate, "id" | "hiddenId">) => {
  try {
    // First check if field exists
    const { data: field, error: fieldError } = await supabase.from("fields").select("id").eq("id", fieldId).single();

    if (fieldError) {
      console.error("Error finding field:", fieldError);
      throw fieldError;
    }

    // Then create the gate
    const { data, error } = await supabase
      .from("gates")
      .insert({
        field_id: fieldId,
        hidden_id: generateHiddenId(),
        name: gate.name,
        latitude: gate.latitude,
        longitude: gate.longitude,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating gate:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error in createGate:", err);
    throw err;
  }
};

export const updateGate = async (gateId: string, gate: Partial<Gate>) => {
  // First get the field_id
  const { data: gateData, error: gateError } = await supabase.from("gates").select("field_id").eq("id", gateId).single();

  if (gateError) {
    console.error("Error finding gate:", gateError);
    throw gateError;
  }

  // Then update the gate
  const { data, error } = await supabase
    .from("gates")
    .update({
      name: gate.name,
      latitude: gate.latitude,
      longitude: gate.longitude,
    })
    .eq("id", gateId)
    .select()
    .single();

  if (error) {
    console.error("Error updating gate:", error);
    throw error;
  }

  // Return the complete field data with gates
  const { data: updatedField, error: refreshError } = await supabase
    .from("fields")
    .select(
      `
      *,
      gates (*)
    `,
    )
    .eq("id", gateData.field_id)
    .single();

  if (refreshError) {
    console.error("Error refreshing field data:", refreshError);
    throw refreshError;
  }

  return updatedField;
};

export const deleteGate = async (gateId: string) => {
  // First get the field_id
  const { data: gateData, error: gateError } = await supabase.from("gates").select("field_id").eq("id", gateId).single();

  if (gateError) {
    console.error("Error finding gate:", gateError);
    throw gateError;
  }

  // Then delete the gate
  const { error } = await supabase.from("gates").delete().eq("id", gateId);

  if (error) {
    console.error("Error deleting gate:", error);
    throw error;
  }

  // Return the complete field data with remaining gates
  const { data: updatedField, error: refreshError } = await supabase
    .from("fields")
    .select(
      `
      *,
      gates (*)
    `,
    )
    .eq("id", gateData.field_id)
    .single();

  if (refreshError) {
    console.error("Error refreshing field data:", refreshError);
    throw refreshError;
  }

  return updatedField;
};
