import React, { useState } from 'react'
import { Theme } from '../../types/theme'
import { Language, useTranslation } from '../../types/language'
import { Project, Zone } from '../../types/projects'
import { FileText, ChevronRight, Download, Eye, History } from 'lucide-react'
import PDFPreview from './elements/output/PDFPreview'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'

interface OutputProps {
  currentTheme: Theme
  currentLanguage: Language
  projects: Project[]
}

interface Report {
  id: string
  hiddenId: string
  projectId: string
  zoneId: string
  normId: string
  createdAt: string
  versions: {
    id: string
    versionNumber: number
    totalRating: number
    classification: string
    createdAt: string
  }[]
}

const Output: React.FC<OutputProps> = ({ currentTheme, currentLanguage, projects }) => {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<any>(null)
  const [selectedNorm, setSelectedNorm] = useState<any>(null)
  const location = useLocation()
  const t = useTranslation(currentLanguage)

  useEffect(() => {
    const loadPreview = async () => {
      const params = new URLSearchParams(location.search)
      const preview = params.get('preview')
      const projectId = params.get('projectId')
      const zoneId = params.get('zoneId')
      const normId = params.get('normId')

      if (preview === 'true' && projectId && zoneId && normId) {
        try {
          // Load norm data
          const { data: norm, error: normError } = await supabase.from('norms').select('*').eq('id', normId).single()

          if (normError) throw normError
          setSelectedNorm(norm)

          // Get user info from auth
          const {
            data: { user },
          } = await supabase.auth.getUser()

          setSelectedVersion({
            projectId,
            zoneId,
            normId,
            analyst: {
              name: user?.user_metadata?.display_name || user?.email || '',
              title: user?.user_metadata?.title || '',
              email: user?.email || '',
            },
          })
          setShowPreview(true)
        } catch (err) {
          console.error('Error loading preview data:', err)
        }
      }
    }

    loadPreview()
  }, [location.search])

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

  if (showPreview && selectedVersion) {
    const project = projects.find((p) => p.id === selectedVersion.projectId)
    const zone = project?.fields.flatMap((f) => f.zones).find((z) => z.id === selectedVersion.zoneId)

    return (
      <PDFPreview
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        project={project}
        zone={zone}
        norm={selectedNorm}
        analyst={selectedVersion.analyst}
        onBack={() => {
          setShowPreview(false)
          setSelectedVersion(null)
          setSelectedNorm(null)
        }}
      />
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">{t('output.title')}</h2>

      <div className="space-y-4">
        {/* Example report card */}
        <div className="p-4 rounded-lg border border-theme bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="text-accent-primary" size={16} />
                <span className="font-medium text-primary">Example Project - Zone A</span>
              </div>
              <div className="text-sm text-secondary mt-1">DIN 50929-3:2018</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setSelectedReport('example')}
                className="p-2 rounded hover:bg-opacity-80 text-secondary"
                title={t('output.view_history')}
              >
                <History size={16} />
              </Button>
              <Button
                onClick={() => {
                  setSelectedVersion({
                    projectId: projects[0]?.id,
                    zoneId: projects[0]?.fields[0]?.zones[0]?.id,
                    standardId: standards[0]?.id,
                    analyst: {
                      name: 'John Doe',
                      title: 'Senior Analyst',
                      email: 'john@example.com',
                    },
                  })
                  setShowPreview(true)
                }}
                className="p-2 rounded hover:bg-opacity-80 text-secondary"
                title={t('output.view_report')}
              >
                <Eye size={16} />
              </Button>
              <Button className="p-2 rounded hover:bg-opacity-80 text-secondary" title={t('output.download_report')}>
                <Download size={16} />
              </Button>
            </div>
          </div>

          {selectedReport === 'example' && (
            <div className="mt-4 border-t border-theme pt-4">
              <h4 className="text-sm font-medium text-secondary mb-2">{t('output.version_history')}</h4>
              <div className="space-y-2">
                {[1, 2].map((version) => (
                  <div key={version} className="flex items-center justify-between p-2 rounded bg-theme">
                    <div>
                      <div className="text-sm text-primary">
                        {t('output.version')} {version}
                      </div>
                      <div className="text-xs text-secondary">{new Date().toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-secondary">
                        {t('analysis.total_rating')}: {version === 1 ? -4 : -2}
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedVersion({
                            projectId: projects[0]?.id,
                            zoneId: projects[0]?.fields[0]?.zones[0]?.id,
                            standardId: standards[0]?.id,
                            analyst: {
                              name: 'John Doe',
                              title: 'Senior Analyst',
                              email: 'john@example.com',
                            },
                          })
                          setShowPreview(true)
                        }}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        title={t('output.view_version')}
                      >
                        <Eye size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Output
