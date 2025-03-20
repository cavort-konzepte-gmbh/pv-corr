import React from 'react';
import { Theme } from '../../types/theme';
import { Language, useTranslation } from '../../types/language';
import { Project, Zone } from '../../types/projects';
import { Standard } from '../../types/standards'; 
import { getCurrentVersion } from '../../services/versions';
import { Building2, FileText, Calendar, User, ChevronDown, ChevronRight, Table } from 'lucide-react';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface AnalysisReportProps {
  currentTheme: Theme;
  currentLanguage: Language;
  project?: Project;
  zone?: Zone;
  standard?: Standard;
  analyst: {
    name: string;
    title?: string;
    email?: string;
  };
  onBack: () => void;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({
  currentTheme,
  currentLanguage,
  project,
  zone,
  standard,
  analyst,
  onBack
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [currentVersion, setCurrentVersion] = React.useState<string>('1.0.0');
  const t = useTranslation(currentLanguage);

  React.useEffect(() => {
    const loadVersion = async () => {
      const version = await getCurrentVersion();
      if (version) {
        setCurrentVersion(version.version);
      }
    };
    loadVersion();
  }, []);

  if (!project || !zone || !standard) {
    return (
      <div className="p-6 text-center text-secondary">
        {t("analysis.select_data")}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[210mm] mx-auto bg-theme">
      {/* Report Header */}
      <div className="mb-8 p-6 rounded-lg border border-theme bg-surface">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              {t("analysis.report_title")}
            </h1>
            <div className="text-sm text-secondary">
              {t("analysis.report_subtitle", { standard: standard.name })}
            </div>
          </div>
          <div className="text-right text-sm text-secondary">
            <div>{new Date().toLocaleDateString()}</div>
            <div>{t("analysis.report_id")}: {zone.hiddenId}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-secondary mb-2">
              {t("analysis.project_info")}
            </h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-accent-primary" />
                <span className="text-primary">{project.name}</span>
              </div>
              <div className="text-sm text-secondary">
                {t("project.type")}: {t(`project.type.${project.typeProject}`)}
              </div>
              {project.clientRef && (
                <div className="text-sm text-secondary">
                  {t("project.client_ref")}: {project.clientRef}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-secondary mb-2">
              {t("analysis.location_info")}
            </h3>
            <div className="space-y-1">
              <div className="text-primary">{zone.name}</div>
              {zone.latitude && zone.longitude && (
                <div className="text-sm text-secondary">
                  {zone.latitude}, {zone.longitude}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Methodology */}
      <div className="mb-8 p-6 rounded-lg border border-theme bg-surface">
        <h2 className="text-lg font-medium text-primary mb-4">
          {t("analysis.methodology")}
        </h2>
        <div className="space-y-4 text-sm text-secondary">
          <p>{t("analysis.methodology_description")}</p>
          <div>
            <strong>{t("analysis.standard_reference")}:</strong>
            <div>{standard.name}</div>
            {standard.description && <div>{standard.description}</div>}
          </div>
        </div>
      </div>

      {/* Parameters and Results */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-primary mb-4">
          {t("analysis.parameters_results")}
        </h2>
        
        <div className="overflow-x-auto">

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead> {t("analysis.parameter")}</TableHead>
                <TableHead> {t("analysis.value")}</TableHead>
                <TableHead> {t("analysis.unit")}</TableHead>
                <TableHead> {t("analysis.rating")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>

          
    
    
              {zone.datapoints?.[0]?.values && Object.entries(zone.datapoints[0].values).map(([key, value]) => {
                const parameter = standard.parameters?.find(p => p.parameterCode === key);
                const rating = zone.datapoints?.[0]?.ratings?.[key];
                
                if (!parameter) return null;

                return (
                  <TableRow key={key}>
                    <TableCell className="p-2 border border-theme">
                      {parameter.parameterCode}
                    </TableCell>
                    <TableCell className="p-2 border border-theme">
                      {value}
                    </TableCell>
                    <TableCell className="p-2 border border-theme">
                      {parameter.unit || '-'}
                    </TableCell>
                    <TableCell className="p-2 border border-theme">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: rating >= 0 ? '#22c55e' : '#ef4444'
                          }}
                        />
                        {rating}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
          </Table>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="mb-8 p-6 rounded-lg border border-theme bg-surface">
        <h2 className="text-lg font-medium text-primary mb-4">
          {t("analysis.final_results")}
        </h2>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-secondary mb-2">
              {t("analysis.total_rating")}
            </div>
            <div className="text-3xl font-bold text-primary">
              {Object.values(zone.datapoints?.[0]?.ratings || {}).reduce((a, b) => a + b, 0)}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-secondary mb-2">
              {t("analysis.classification")}
            </div>
            <div className="text-primary">
              {t("analysis.classification_result")}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-secondary mb-2">
              {t("analysis.recommendations")}
            </div>
            <div className="text-primary">
              {t("analysis.recommendations_text")}
            </div>
          </div>
        </div>
      </div>

      {/* Report Footer */}
      <div className="text-sm text-secondary border-t border-theme pt-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <User size={14} />
              <span>{analyst.name}</span>
              {analyst.title && <span>• {analyst.title}</span>}
              {analyst.email && <span>• {analyst.email}</span>}
            </div>
            <div>{new Date().toLocaleDateString()}</div>
          </div>
          <div className="text-right">
            <div>{t("analysis.software_version")}: {currentVersion}</div>
            <div>{t("analysis.page")} 1/1</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;