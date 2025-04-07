import { supabase } from "../lib/supabase";
import { generateHiddenId } from "../utils/generateHiddenId";

interface CreateReportData {
  projectId: string;
  zoneId: string;
  standardId: string;
  content: any;
  parameters: any;
  ratings: any;
  totalRating: number;
  classification: string;
  recommendations?: string;
}

export const createReport = async (data: CreateReportData) => {
  try {
    // First create the report
    const currentUser = await supabase.auth.getUser();
    const userId = currentUser.data.user?.id;
    
    const { data: report, error: reportError } = await supabase
      .from("analysis_outputs")  // Changed from analysis_reports to analysis_outputs
      .insert({
        hidden_id: generateHiddenId(),
        project_id: data.projectId,
        zone_id: data.zoneId,
        norm_id: data.standardId,
        analyst_id: userId,
      })
      .select()
      .single();

    if (reportError) throw reportError;

    // Then create the first version
    const { data: version, error: versionError } = await supabase
      .from("analysis_versions")
      .insert({
        output_id: report.id,
        version_number: 1,
        content: data.content,
        parameters: data.parameters,
        ratings: data.ratings,
        total_rating: data.totalRating,
        classification: data.classification,
        recommendations: data.recommendations,
        created_by: userId,
      })
      .select()
      .single();

    if (versionError) throw versionError;

    return {
      report,
      version,
    };
  } catch (err) {
    console.error("Error creating report:", err);
    throw new Error(`Failed to create report: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

export const createReportVersion = async (reportId: string, data: Omit<CreateReportData, "projectId" | "zoneId" | "standardId">) => {
  try {
    // Get the latest version number
    const { data: versions, error: versionsError } = await supabase
      .from("analysis_versions")  // Changed from report_versions to analysis_versions
      .select("version_number")
      .eq("output_id", reportId)  // Changed from report_id to output_id
      .order("version_number", { ascending: false })
      .limit(1);

    if (versionsError) throw versionsError;

    const nextVersion = versions?.[0] ? versions[0].version_number + 1 : 1;

    // Create new version
    const { data: version, error: versionError } = await supabase
      .from("analysis_versions")  // Changed from report_versions to analysis_versions
      .insert({
        output_id: reportId,  // Changed from report_id to output_id
        version_number: nextVersion,
        content: data.content,
        parameters: data.parameters,
        ratings: data.ratings,
        total_rating: data.totalRating,
        classification: data.classification,
        recommendations: data.recommendations,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (versionError) throw versionError;

    return version;
  } catch (err) {
    console.error("Error creating report version:", err);
    throw new Error(`Failed to create report version: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

export const fetchReports = async () => {
  try {
    // Check if Supabase client is properly initialized
    if (!supabase) {
      throw new Error("Supabase client is not initialized");
    }

    // Validate Supabase URL
    const supabaseUrl = supabase.supabaseUrl;
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      throw new Error("Invalid Supabase URL configuration");
    }

    // Add exponential backoff retry logic
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    let attempt = 0;
    let lastError;

    while (attempt < maxRetries) {
      try {
        const { data, error } = await supabase
          .from("analysis_outputs") 
          .select(
            `
            id,
            hidden_id,
            project_id,
            zone_id,
            norm_id,
            analyst_id,
            created_at,
            updated_at,
            versions:analysis_versions (
              id,
              version_number,
              total_rating,
              classification,
              created_at
            )
          `,
          )
          .order("created_at", { ascending: false });

        if (error) {
          // Handle specific Supabase errors
          if (error.code === 'PGRST301') {
            throw new Error("Database connection error");
          }
          throw error;
        }

        // Return empty array if no data found
        return data || [];
      } catch (err) {
        lastError = err;
        attempt++;

        if (attempt < maxRetries) {
          // Exponential backoff with jitter
          const delay = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 1000, 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If we've exhausted all retries, throw a more descriptive error
    const errorMessage = lastError instanceof Error ? lastError.message : 'Network error';
    throw new Error(`Failed to fetch reports after ${maxRetries} attempts: ${errorMessage}`);
  } catch (err) {
    console.error("Error fetching reports:", err);
    // Throw a user-friendly error message
    if (err instanceof Error && err.message.includes('Invalid Supabase URL')) {
      throw new Error("Application configuration error. Please contact support.");
    }
    throw new Error(`Unable to load reports. Please try again later. ${err instanceof Error ? err.message : ''}`);
  }
};

export const deleteReport = async (reportId: string) => {
  try {
    // First delete all associated versions
    const { data: versions, error: versionsError } = await supabase
      .from("analysis_versions")
      .select("id")
      .eq("output_id", reportId);

    if (versionsError) throw versionsError;

    // Log the versions to be deleted
    console.log(`Deleting ${versions?.length || 0} versions for report ${reportId}`);

    // Delete each version individually to ensure they're all removed
    if (versions && versions.length > 0) {
      for (const version of versions) {
        const { error: deleteVersionError } = await supabase
          .from("analysis_versions")
          .delete()
          .eq("id", version.id);
          
        if (deleteVersionError) {
          console.error(`Error deleting version ${version.id}:`, deleteVersionError);
          throw deleteVersionError;
        }
      }
    } else {
      // If no versions found, try bulk delete as fallback
      const { error: bulkDeleteError } = await supabase
      .from("analysis_versions")
      .delete()
      .eq("output_id", reportId);

      if (bulkDeleteError) throw bulkDeleteError;
    }

    // Then delete the report itself
    const { error: reportError } = await supabase
      .from("analysis_outputs")
      .delete()
      .eq("id", reportId);

    if (reportError) {
      console.error(`Error deleting report ${reportId}:`, reportError);
      throw reportError;
    }
    
    console.log(`Successfully deleted report ${reportId} and its versions`);

    return true;
  } catch (err) {
    console.error("Error deleting report:", err);
    throw new Error(`Failed to delete report: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

export const fetchReportVersion = async (reportId: string, versionNumber?: number) => {
  try {
    let query = supabase
      .from("analysis_versions")
      .select("*")
      .eq("output_id", reportId);

    if (versionNumber) {
      query = query.eq("version_number", versionNumber);
    } else {
      query = query.order("version_number", { ascending: false }).limit(1);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching report version:", err);
    throw new Error(`Failed to fetch report version: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};