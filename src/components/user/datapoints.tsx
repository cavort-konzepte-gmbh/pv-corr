import React, { useState, useEffect } from 'react'
import { Theme } from '../../types/theme'
import { Language, useTranslation } from '../../types/language'
import { Project, Zone } from '../../types/projects'
import { Parameter } from '../../types/parameters'
import ZoneSummary from './elements/datapoints/ZoneSummary'
import ParameterFilter from './elements/datapoints/ParameterFilter'
import DatapointList from './elements/datapoints/DatapointList'
import { fetchParameters } from '../../services/parameters'
import ProjectSummary from './elements/fields/ProjectSummary'
import FieldSummary from './elements/zones/FieldSummary'
import { Person } from '../../types/people'

interface DatapointsProps {
  currentTheme: Theme
  currentLanguage: Language
  project?: Project
  field?: {
    name: string
    latitude?: string
    longitude?: string
  }
  selectedZone?: Zone
  onBack: () => void
  onProjectsChange: (projects: Project[]) => void
  savedPeople?: Person[]
  selectedCustomerId: string | null
}

const Datapoints: React.FC<DatapointsProps> = ({
  currentTheme,
  currentLanguage,
  project,
  field,
  selectedZone,
  onBack,
  onProjectsChange,
  savedPeople = [],
  selectedCustomerId,
}) => {
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [filteredParameters, setFilteredParameters] = useState<Parameter[]>([])
  const [showProjectSummary, setShowProjectSummary] = useState(false)
  const [showFieldSummary, setShowFieldSummary] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const translation = useTranslation(currentLanguage)

  useEffect(() => {
    const loadParameters = async () => {
      try {
        const fetchedParams = await fetchParameters()
        setParameters(fetchedParams)
        setFilteredParameters(fetchedParams)
      } catch (err) {
        console.error('Error loading parameters:', err)
        setError('Failed to load parameters')
      } finally {
        setLoading(false)
      }
    }
    loadParameters()
  }, [])

  if (!project || !field || !selectedZone) {
    return <div className="p-6 text-center text-secondary">{translation('datapoint.please_select_zone')}</div>
  }

  if (loading) {
    return <div className="p-6 text-center text-secondary">{translation('datapoint.loading_parameters')}</div>
  }

  if (error) {
    return <div className="p-6 text-center text-accent-primary">{error}</div>
  }

  return (
    <div className="p-6">
      <ProjectSummary
        isExpanded={showProjectSummary}
        onToggle={() => setShowProjectSummary(!showProjectSummary)}
        project={project}
        manager={savedPeople?.find((p) => p.id === project.managerId)}
        company={undefined}
        savedPeople={savedPeople || []}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        onProjectsChange={onProjectsChange}
        selectedCustomerId={selectedCustomerId}
      />

      <FieldSummary
        isExpanded={showFieldSummary}
        onToggle={() => setShowFieldSummary(!showFieldSummary)}
        field={field}
        onProjectsChange={onProjectsChange}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
      />

      <ZoneSummary
        zone={selectedZone}
        project={project}
        field={field}
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        onProjectsChange={onProjectsChange}
      />

      <ParameterFilter
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        parameters={parameters}
        onParametersChange={setFilteredParameters}
      />

      <DatapointList
        currentTheme={currentTheme}
        currentLanguage={currentLanguage}
        zoneId={selectedZone.id}
        datapoints={selectedZone.datapoints || []}
        parameters={filteredParameters}
        onProjectsChange={onProjectsChange}
      />
    </div>
  )
}

export default Datapoints
