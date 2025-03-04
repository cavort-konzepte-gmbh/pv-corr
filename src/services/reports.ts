import { supabase } from '../lib/supabase';
import { generateHiddenId } from '../utils/generateHiddenId';

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
    const { data: report, error: reportError } = await supabase
      .from('analysis_reports')
      .insert({
        hidden_id: generateHiddenId(),
        project_id: data.projectId,
        zone_id: data.zoneId,
        standard_id: data.standardId,
        analyst_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (reportError) throw reportError;

    // Then create the first version
    const { data: version, error: versionError } = await supabase
      .from('report_versions')
      .insert({
        report_id: report.id,
        version_number: 1,
        content: data.content,
        parameters: data.parameters,
        ratings: data.ratings,
        total_rating: data.totalRating,
        classification: data.classification,
        recommendations: data.recommendations,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (versionError) throw versionError;

    return {
      report,
      version
    };
  } catch (err) {
    console.error('Error creating report:', err);
    throw err;
  }
};

export const createReportVersion = async (reportId: string, data: Omit<CreateReportData, 'projectId' | 'zoneId' | 'standardId'>) => {
  try {
    // Get the latest version number
    const { data: versions, error: versionsError } = await supabase
      .from('report_versions')
      .select('version_number')
      .eq('report_id', reportId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (versionsError) throw versionsError;

    const nextVersion = versions?.[0] ? versions[0].version_number + 1 : 1;

    // Create new version
    const { data: version, error: versionError } = await supabase
      .from('report_versions')
      .insert({
        report_id: reportId,
        version_number: nextVersion,
        content: data.content,
        parameters: data.parameters,
        ratings: data.ratings,
        total_rating: data.totalRating,
        classification: data.classification,
        recommendations: data.recommendations,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (versionError) throw versionError;

    return version;
  } catch (err) {
    console.error('Error creating report version:', err);
    throw err;
  }
};

export const fetchReports = async () => {
  try {
    const { data, error } = await supabase
      .from('analysis_outputs')
      .select(`
        *,
        versions:analysis_versions (
          id,
          version_number,
          total_rating,
          classification,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching reports:', err);
    throw err;
  }
};

export const fetchReportVersion = async (reportId: string, versionNumber?: number) => {
  try {
    let query = supabase
      .from('analysis_versions')
      .select('*')
      .eq('output_id', reportId);

    if (versionNumber) {
      query = query.eq('version_number', versionNumber);
    } else {
      query = query.order('version_number', { ascending: false }).limit(1);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching report version:', err);
    throw err;
  }
};