import { supabase } from "../lib/supabase";
import { generateHiddenId } from "../utils/generateHiddenId";
import { Datapoint } from "../types/projects";
import { showToast } from "../lib/toast";

// Helper function to convert string to UUID format
const toUUID = (id: string) => {
  // Remove any 'uuid.' prefix if present
  const cleanId = id.startsWith("uuid.") ? id.substring(5) : id;
  return cleanId;
};

export const deleteDatapoint = async (datapointId: string) => {
  try {
    const { data, error } = await supabase.rpc("handle_datapoint_operation_v2", {
      dp_id: toUUID(datapointId),
      dp_name: null,
      dp_values: null,
      operation: "delete",
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
    Object.keys(processedValues).forEach((key) => {
      const value = processedValues[key];
      // Skip conversion for special values like 'impurities'
      if (typeof value === "string" && value !== "impurities" && value.trim() !== "" && !isNaN(parseFloat(value))) {
        // Keep as string to ensure consistent handling
        processedValues[key] = value;
      }
    });

    console.log("Processed values:", processedValues);

    const { data: result, error } = await supabase
      .from("datapoints")
      .update({
        name: data.name.trim(),
        values: processedValues,
      })
      .eq("id", toUUID(datapointId))
      .select("*");

    if (error) {
      showToast(`Failed to update datapoint: ${error.message}`, "error");
      throw error;
    }

    console.log("Datapoint updated successfully");
    showToast("Datapoint updated successfully", "success");

    const { data: zoneData, error: zoneError } = await supabase.from("datapoints").select("zone_id").eq("id", toUUID(datapointId)).single();

    if (zoneError) {
      console.error("Error fetching zone_id:", zoneError);
    } else if (zoneData?.zone_id) {
      // Refresh datapoints after update
      await fetchDatapointsByZoneId(zoneData.zone_id);
    }

    return result;
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
    console.log("Zone ID type:", typeof zoneId);
    console.log("Zone ID value:", zoneId);

    // Validate zoneId
    if (!zoneId || typeof zoneId !== "string" || zoneId.trim() === "") {
      const error = "Zone ID is required and must be a valid string";
      console.error(error);
      showToast(error, "error");
      throw new Error(error);
    }

    // Convert zoneId to UUID format
    const zoneUUID = toUUID(zoneId);
    console.log("Converted Zone UUID:", zoneUUID);

    // Process values to ensure proper number formatting
    const processedValues = { ...data.values };
    Object.keys(processedValues).forEach((key) => {
      const value = processedValues[key];
      // Skip conversion for special values like 'impurities'
      if (typeof value === "string" && value !== "impurities" && !isNaN(parseFloat(value))) {
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
      zone_id: zoneUUID, // Use the converted UUID
    };

    console.log("Full datapoint data being sent:", JSON.stringify(datapointData, null, 2));

    const { data: result, error } = await supabase.rpc("handle_datapoint_operation_v2", {
      dp_id: null,
      dp_name: data.name.trim(),
      dp_values: datapointData,
      operation: "create",
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
      await new Promise((resolve) => setTimeout(resolve, 500));

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

    if (!zoneId) {
      console.error("No zone ID provided for fetching datapoints");
      return [];
    }

    // First check if the zone exists
    const { data: zoneExists, error: zoneError } = await supabase.from("zones").select("id").eq("id", toUUID(zoneId)).single();

    if (zoneError) {
      console.error("Error checking zone existence:", zoneError);
      if (zoneError.code === "PGRST116") {
        throw new Error(`Zone with ID ${zoneId} not found`);
      }
      throw zoneError;
    }

    if (!zoneExists) {
      throw new Error(`Zone with ID ${zoneId} not found`);
    }

    // Query datapoints
    const { data, error } = await supabase
      .from("datapoints")
      .select("*")
      .eq("zone_id", toUUID(zoneId))
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching datapoints:", error);
      throw error;
    }

    if (!data) {
      console.warn("No datapoints found for zone:", zoneId);
      return [];
    }

    console.log("Datapoints fetched successfully:", data.length);
    return data;
  } catch (err) {
    console.error("Error fetching datapoints:", err);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
};
