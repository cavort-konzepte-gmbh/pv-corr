import { supabase } from "../lib/supabase";
import { generateHiddenId } from "../utils/generateHiddenId";
import { Datapoint } from "../types/projects";
import { showToast } from "../lib/toast";

export const deleteDatapoint = async (datapointId: string) => {
  try {
    const { data, error } = await supabase.rpc('handle_datapoint_operation', {
      dp_id: datapointId,
      dp_name: null,
      dp_values: null,
      operation: 'delete'
    });

    if (error) {
      showToast(`Failed to delete datapoint: ${error.message}`, "error");
      throw error;
    }
    
    if (data && data.success === false) {
      showToast(`Failed to delete datapoint: ${data.error}`, "error");
      throw new Error(data.error);
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
    
    const { data: result, error } = await supabase.rpc('handle_datapoint_operation', {
      dp_id: datapointId,
      dp_name: data.name.trim(),
      dp_values: processedValues,
      operation: 'update'
    });

    if (error) {
      showToast(`Failed to update datapoint: ${error.message}`, "error");
      throw error;
    }

    console.log("Datapoint updated successfully");
    showToast("Datapoint updated successfully", "success");
    return result.data;
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
    console.log("Creating datapoint for zone:", zoneId);
    
    // Validate zoneId
    if (!zoneId || typeof zoneId !== 'string' || zoneId.trim() === '') {
      const error = "Zone ID is required and must be a valid string";
      console.error(error);
      showToast(error, "error");
      throw new Error(error);
    }

    // Remove any 'uuid.' prefix if present
    const cleanZoneId = zoneId.startsWith('uuid.') ? zoneId.substring(5) : zoneId;

    // Process values to ensure proper number formatting
    const processedValues = { ...data.values };
    Object.keys(processedValues).forEach(key => {
      const value = processedValues[key];
      // Skip conversion for special values like 'impurities'
      if (typeof value === 'string' && value !== 'impurities' && !isNaN(parseFloat(value))) {
        processedValues[key] = parseFloat(value);
      }
    });
    
    console.log("Creating datapoint with processed values:", JSON.stringify(processedValues));
    
    const hiddenId = generateHiddenId();
    const datapointData = {
      hidden_id: hiddenId,
      name: data.name.trim(),
      type: data.type,
      values: processedValues,
      ratings: data.ratings,
      timestamp: new Date().toISOString(),
      zone_id: cleanZoneId
    };

    console.log("Full datapoint data being sent:", JSON.stringify(datapointData, null, 2));

    const { data: result, error } = await supabase.rpc('handle_datapoint_operation', {
      dp_id: null,
      dp_name: data.name.trim(),
      dp_values: datapointData,
      operation: 'create'
    });

    if (error) {
      console.error("Error creating datapoint:", error.message);
      showToast(`Failed to create datapoint: ${error.message}`, "error");
      throw error;
    }
    
    console.log("RPC result:", result);
    
    if (result && result.success === false) {
      showToast(`Failed to create datapoint: ${result.error}`, "error");
      throw new Error(result.error);
    }

    console.log("Datapoint created successfully");
    showToast("Datapoint created successfully", "success");
    
    // If we don't have data in the result, try to fetch the newly created datapoint
    if (!result.data) {
      console.log("No data returned from RPC, attempting to fetch datapoints for zone");
      // Wait a moment for the database to complete the operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch all datapoints for this zone to ensure we have the latest data
      const datapoints = await fetchDatapointsByZoneId(zoneId);
      console.log("Fetched datapoints after creation:", datapoints.length);
      return datapoints;
    }
    
    return result.data || [];
  } catch (err) {
    console.error("Error in createDatapoint:", err instanceof Error ? err.message : err);
    showToast(`Failed to create datapoint: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    throw err;
  }
};

export const fetchDatapointsByZoneId = async (zoneId: string): Promise<Datapoint[]> => {
  try {
    console.log("Fetching datapoints for zone:", zoneId);

    // Remove any 'uuid.' prefix if present
    const cleanZoneId = zoneId.startsWith('uuid.') ? zoneId.substring(5) : zoneId;
    
    // First check if the zone exists
    const { data: zoneExists, error: zoneError } = await supabase
      .from("zones")
      .select("id")
      .eq("id", cleanZoneId)
      .single();
      
    if (zoneError) {
      console.error("Error checking zone existence:", zoneError);
      if (zoneError.code === 'PGRST116') {
        throw new Error(`Zone with ID ${cleanZoneId} not found`);
      }
      throw zoneError;
    }
    
    if (!zoneExists) {
      throw new Error(`Zone with ID ${cleanZoneId} not found`);
    }

    const { data: result, error } = await supabase.rpc('handle_datapoint_operation', {
      dp_id: null,
      dp_name: null,
      dp_values: { zone_id: cleanZoneId },
      operation: 'get_by_zone'
    });

    if (error) {
      console.error("Error in RPC call:", error);
      throw error;
    }
    
    if (result && result.success === false) {
      console.error("RPC returned error:", result.error);
      throw new Error(result.error);
    }

    console.log("Datapoints fetched successfully:", result?.data?.length || 0);
    return result.data || [];
  } catch (err) {
    console.error("Error fetching datapoints:", err);
    throw err;
  }
};