import React, { useState, useEffect } from 'react'
import { Theme } from '../../types/theme'
import { Language, useTranslation } from '../../types/language'
import { Project, Zone, Datapoint } from '../../types/projects'
import { Standard } from '../../types/standards'
import { FileText, ChevronRight, Download, Eye, History, Building2, User, Calendar, Info } from 'lucide-react'
import { fetchReports } from '../../services/reports'
import AnalysisReport from '../analysis/AnalysisReport'
import { getCurrentVersion } from '../../services/versions'
import { supabase } from '../../lib/supabase'

interface OutputPanelProps {
  currentTheme: Theme
  currentLanguage: Language
  projects: Project[]
  standards: Standard[]
}

interface Report {
  id: string
  hiddenId: string
  projectId: string
  zoneId: string
  standardId: string
  createdAt: string
  versions: {
    id: string
    versionNumber: number
    totalRating: number
    classification: string
    createdAt: string
  }[]
}

const OutputPanel: React.FC<OutputPanelProps> = ({ currentTheme, currentLanguage, projects, standards }) => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<any>(null)
  const [selectedNorm, setSelectedNorm] = useState<any>(null)
  const [currentVersion, setCurrentVersion] = React.useState<string>('1.0.0')
  const [analyst, setAnalyst] = useState<{
    name: string
    title?: string
    email?: string
  } | null>(null)
  const t = useTranslation(currentLanguage)

  useEffect(() => {
    const loadVersion = async () => {
      const version = await getCurrentVersion()
      if (version) {
        setCurrentVersion(version.version)
      }
    }
    loadVersion()

    // Get current user info
    const loadUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setAnalyst({
          name: user.user_metadata?.display_name || user.email || '',
          title: user.user_metadata?.title || '',
          email: user.email || '',
        })
      }
    }
    loadUserInfo()
  }, [])

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await fetchReports()
      setReports(data)
    } catch (err) {
      console.error('Error loading reports:', err)
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || 'Unknown Project'
  }

  const getZoneName = (projectId: string, zoneId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return 'Unknown Zone'

    for (const field of project.fields) {
      const zone = field.zones.find((z) => z.id === zoneId)
      if (zone) return zone.name
    }
    return 'Unknown Zone'
  }

  const getStandardName = (standardId: string) => {
    return standards.find((s) => s.id === standardId)?.name || 'Unknown Standard'
  }

  const handleShowPreview = (report: Report, version: any) => {
    setSelectedVersion(version)
    setShowPreview(true)
  }

  if (showPreview && selectedVersion) {
    const project = projects.find((p) => p.id === selectedVersion.projectId)
    const zone = project?.fields.flatMap((f) => f.zones).find((z) => z.id === selectedVersion.zoneId)
    const standard = standards.find((s) => s.id === selectedVersion.standardId)

    // Get all entered parameters
    const enteredParameters = zone?.datapoints?.[0]?.values || {}
    const parameterDescriptions = Object.entries(enteredParameters).map(([key, value]) => {
      const param = standard?.parameters?.find((p) => p.parameterId === key)
      return {
        code: param?.parameterCode || key,
        value: value,
        unit: param?.unit,
      }
    })

    return (
      <div className="p-6 max-w-[210mm] mx-auto bg-theme">
        {/* Report Header */}
        <div className="mb-8 p-6 rounded-lg border border-theme bg-surface">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-primary">{t('analysis.report_title')}</h1>
              <div className="text-sm text-secondary">{t('analysis.report_subtitle', { standard: standard?.name })}</div>
            </div>
            <div className="text-right text-sm text-secondary">
              <div>{new Date().toLocaleDateString()}</div>
              <div>
                {t('analysis.report_id')}: {zone?.hiddenId}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-secondary mb-2">{t('analysis.project_info')}</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-accent-primary" />
                  <span className="text-primary">{project?.name}</span>
                </div>
                <div className="text-sm text-secondary">
                  {t('project.type')}: {t(`project.type.${project?.typeProject}`)}
                </div>
                {project?.clientRef && (
                  <div className="text-sm text-secondary">
                    {t('project.client_ref')}: {project.clientRef}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-secondary mb-2">{t('analysis.location_info')}</h3>
              <div className="space-y-1">
                <div className="text-primary">{zone?.name}</div>
                {zone?.latitude && zone?.longitude && (
                  <div className="text-sm text-secondary">
                    {zone.latitude}, {zone.longitude}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Parameters Overview */}
        <div className="mb-8 p-6 rounded-lg border border-theme bg-surface">
          <h2 className="text-lg font-medium mb-4 text-primary">{t('analysis.parameters_overview')}</h2>
          <div className="space-y-2">
            {parameterDescriptions.map((param) => (
              <div key={param.code} className="flex items-center justify-between">
                <span className="text-primary">{param.code}</span>
                <span className="text-secondary">
                  {param.value} {param.unit && `(${param.unit})`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="mb-8 p-6 rounded-lg border border-theme bg-surface">
          <h2 className="text-lg font-medium mb-4 text-primary">{t('analysis.final_results')}</h2>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-secondary mb-2">{t('analysis.total_rating')}</div>
              <div className="text-3xl font-bold text-primary">
                {Object.values(zone?.datapoints?.[0]?.ratings || {}).reduce((a, b) => a + b, 0)}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-secondary mb-2">{t('analysis.classification')}</div>
              <div className="text-primary">{t('analysis.classification_result')}</div>
            </div>
          </div>
        </div>

        {/* Report Footer */}
        <div className="text-sm text-secondary border-t border-theme pt-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <User size={14} />
                <span>{analyst?.name}</span>
                {analyst?.title && <span>• {analyst.title}</span>}
                {analyst?.email && <span>• {analyst.email}</span>}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Info size={14} />
                <span>v{currentVersion}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="p-6 text-center text-secondary">{t('output.loading')}</div>
  }

  if (error) {
    return <div className="p-6 text-center text-accent-primary">{error}</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">{t('output.title')}</h2>

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="p-4 rounded-lg border border-theme bg-surface">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="text-accent-primary" size={16} />
                  <span className="font-medium text-primary">
                    {getProjectName(report.projectId)} - {getZoneName(report.projectId, report.zoneId)}
                  </span>
                </div>
                <div className="text-sm text-secondary mt-1">{getStandardName(report.standardId)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedReport(report.id)}
                  className="p-2 rounded hover:bg-opacity-80 text-secondary"
                  title={t('output.view_history')}
                >
                  <History size={16} />
                </button>
                <button
                  onClick={() => window.open(`/reports/${report.id}/latest`, '_blank')}
                  className="p-2 rounded hover:bg-opacity-80 text-secondary"
                  title={t('output.view_report')}
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => window.open(`/reports/${report.id}/latest/download`, '_blank')}
                  className="p-2 rounded hover:bg-opacity-80 text-secondary"
                  title={t('output.download_report')}
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            {selectedReport === report.id && (
              <div className="mt-4 border-t border-theme pt-4">
                <h4 className="text-sm font-medium text-secondary mb-2">{t('output.version_history')}</h4>
                <div className="space-y-2">
                  {report.versions.map((version) => (
                    <div key={version.id} className="flex items-center justify-between p-2 rounded bg-theme">
                      <div>
                        <div className="text-sm text-primary">
                          {t('output.version')} {version.versionNumber}
                        </div>
                        <div className="text-xs text-secondary">{new Date(version.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-secondary">
                          {t('analysis.total_rating')}: {version.totalRating}
                        </div>
                        <button
                          onClick={() =>
                            handleShowPreview(report, {
                              ...version,
                              projectId: report.projectId,
                              zoneId: report.zoneId,
                              standardId: report.standardId,
                              analyst: {
                                name: 'John Doe',
                                title: 'Senior Analyst',
                              },
                            })
                          }
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                          title={t('output.view_version')}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default OutputPanel
