import { supabase } from "../lib/supabase";
import { generateHiddenId } from "../utils/generateHiddenId";
import { Datapoint } from "../types/projects";
import { showToast } from "../lib/toast";

export const deleteDatapoint = async (datapointId: string) => {
  try {
    const { error } = await supabase.from("datapoints").delete().eq("id", datapointId);

    if (error) {
      showToast(`Failed to delete datapoint: ${error.message}`, "error");
      throw error;
    }
    
    showToast("Datapoint deleted successfully", "success");
  } catch (err) {
    console.error("Error deleting datapoint:", err);
    showToast(`Failed to delete datapoint: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    throw err;
  }
};

export const updateDatapoint = async (
  datapointId: string,
  data: {
    values: Record<string, string>;
    name?: string;
  },
) => {
  try {
    if (!data.name?.trim()) {
      throw new Error("Name is required");
    }

    // Debug the values being updated
    console.log("Updating datapoint with values:", data.values);
    
    // Process values to ensure proper number formatting
    const processedValues = { ...data.values };
    Object.keys(processedValues).forEach(key => {
      const value = processedValues[key];
      // Skip conversion for special values like 'impurities'
      if (typeof value === 'string' && value !== 'impurities' && value.trim() !== '' && !isNaN(parseFloat(value))) {
        processedValues[key] = parseFloat(value);
      }
    });
    
    console.log("Processed values:", processedValues);
    
    const updateData = {
      values: processedValues,
      name: data.name.trim(),
      updated_at: new Date().toISOString(),
    };

    const { data: updatedDatapoint, error } = await supabase.from("datapoints").update(updateData).eq("id", datapointId).select().single();

    if (error) {
      showToast(`Failed to update datapoint: ${error.message}`, "error");
      throw error;
    }

    console.log("Datapoint updated successfully:", updatedDatapoint);
    showToast("Datapoint updated successfully", "success");
    return updatedDatapoint;
  } catch (err) {
    console.error("Error updating datapoint:", err);
    showToast(`Failed to update datapoint: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    throw err;
  }
};

export const createDatapoint = async (
  zoneId: string,
  data: {
    type: string;
    name: string;
    values: Record<string, string>;
    ratings: Record<string, number>;
  },
) => {
  try {
    // First verify the zone exists
    const { data: zone, error: zoneError } = await supabase.from("zones").select("id").eq("id", zoneId).single();

    if (zoneError) {
      throw new Error("Zone not found");
    }

    // Process values to ensure proper number formatting
    const processedValues = { ...data.values };
    Object.keys(processedValues).forEach(key => {
      const value = processedValues[key];
      // Skip conversion for special values like 'impurities'
      if (typeof value === 'string' && value !== 'impurities' && !isNaN(parseFloat(value))) {
        processedValues[key] = parseFloat(value);
      }
    });
    
    console.log("Creating datapoint with processed values:", processedValues);
    
    const { data: newDatapoint, error } = await supabase
      .from("datapoints")
      .insert({
        zone_id: zoneId,
        hidden_id: generateHiddenId(),
        name: data.name.trim(),
        type: data.type,
        values: processedValues,
        ratings: data.ratings,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating datapoint:", error.message);
      showToast(`Failed to create datapoint: ${error.message}`, "error");
      throw error;
    }

    console.log("Datapoint created successfully:", newDatapoint);
    showToast("Datapoint created successfully", "success");
    return newDatapoint;
  } catch (err) {
    console.error("Error in createDatapoint:", err instanceof Error ? err.message : err);
    showToast(`Failed to create datapoint: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    throw err;
  }
};

export const fetchDatapointsByZoneId = async (zoneId: string): Promise<Datapoint[]> => {
  try {
    const { data, error } = await supabase.from("datapoints").select().eq("zone_id", zoneId);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Error fetching datapoints:", err);
    throw err;
  }
};