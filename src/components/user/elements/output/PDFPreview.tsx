import React from 'react';
import { Theme } from '../../../../types/theme';
import { Language, useTranslation } from '../../../../types/language';
import { Project, Zone } from '../../../../types/projects';
import { FileText, Calendar, User, Building2 } from 'lucide-react';

interface PDFPreviewProps {
  currentTheme: Theme;
  currentLanguage: Language;
  project?: Project;
  zone?: Zone;
  norm?: any;
  analyst?: {
    name: string;
    title?: string;
    email?: string;
  };
  onBack: () => void;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  currentTheme,
  currentLanguage,
  project,
  zone,
  norm,
  analyst,
  onBack
}) => {
  const t = useTranslation(currentLanguage);

  if (!project || !zone || !norm) {
    return (
      <div className="p-6 text-center text-secondary">
        {t("analysis.select_data")}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[210mm] mx-auto bg-white text-black">
      {/* Report Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {t("analysis.report_title")}
            </h1>
            <div className="text-sm text-gray-600">
              {t("analysis.report_subtitle", { norm: norm.name })}
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>{new Date().toLocaleDateString()}</div>
            <div>{t("analysis.report_id")}: {zone.hiddenId}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {t("analysis.project_info")}
            </h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-indigo-600" />
                <span>{project.name}</span>
              </div>
              <div className="text-sm text-gray-600">
                {t("project.type")}: {t(`project.type.${project.typeProject}`)}
              </div>
              {project.clientRef && (
                <div className="text-sm text-gray-600">
                  {t("project.client_ref")}: {project.clientRef}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {t("analysis.location_info")}
            </h3>
            <div className="space-y-1">
              <div>{zone.name}</div>
              {zone.latitude && zone.longitude && (
                <div className="text-sm text-gray-600">
                  {zone.latitude}, {zone.longitude}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">
          {t("analysis.parameters_results")}
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left font-medium">
                  {t("analysis.parameter")}
                </th>
                <th className="p-2 text-left font-medium">
                  {t("analysis.value")}
                </th>
                <th className="p-2 text-left font-medium">
                  {t("analysis.unit")}
                </th>
                <th className="p-2 text-left font-medium">
                  {t("analysis.rating")}
                </th>
              </tr>
            </thead>
            <tbody>
              {zone.datapoints?.[0]?.values && Object.entries(zone.datapoints[0].values).map(([key, value]) => {
                const parameter = norm.parameters?.find(p => p.parameter_code === key);
                const rating = zone.datapoints?.[0]?.ratings?.[key];
                
                if (!parameter) return null;

                return (
                  <tr key={key} className="border-b">
                    <td className="p-2">
                      {parameter.parameter_code}
                    </td>
                    <td className="p-2">
                      {value}
                    </td>
                    <td className="p-2">
                      {parameter.unit || '-'}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: rating >= 0 ? '#22c55e' : '#ef4444'
                          }}
                        />
                        {rating}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Final Results */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium mb-4">
          {t("analysis.final_results")}
        </h2>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">
              {t("analysis.total_rating")}
            </div>
            <div className="text-3xl font-bold">
              {Object.values(zone.datapoints?.[0]?.ratings || {}).reduce((a, b) => a + b, 0)}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">
              {t("analysis.classification")}
            </div>
            <div>
              {t("analysis.classification_result")}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">
              {t("analysis.recommendations")}
            </div>
            <div>
              {t("analysis.recommendations_text")}
            </div>
          </div>
        </div>
      </div>

      {/* Report Footer */}
      <div className="text-sm text-gray-600 border-t pt-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <User size={14} />
              <span>{analyst?.name}</span>
              {analyst?.title && <span>• {analyst.title}</span>}
              {analyst?.email && <span>• {analyst.email}</span>}
            </div>
            <div>{new Date().toLocaleDateString()}</div>
          </div>
          <div className="text-right">
            <div>{t("analysis.page")} 1/1</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;