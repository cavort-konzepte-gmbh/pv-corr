import React from 'react';
import { Theme } from '../../../../types/theme';
import { Language } from '../../../../types/language';
import { Standard } from '../../../../types/standards';
import { Parameter } from '../../../../types/parameters';
import { fetchParameters } from '../../../../services/parameters';
import { Plus, Edit2, Save, X } from 'lucide-react';

interface DatapointsSettingsProps {
  currentTheme: Theme;
  currentLanguage: Language;
  standards: Standard[];
  onStandardsChange: (standards: Standard[]) => void;
}

const DatapointsSettings: React.FC<DatapointsSettingsProps> = ({
  currentTheme,
  currentLanguage,
  standards,
  onStandardsChange
}) => {
  const [parameters, setParameters] = React.useState<Parameter[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadParameters = async () => {
      try {
        const fetchedParams = await fetchParameters();
        setParameters(fetchedParams);
      } catch (err) {
        console.error('Error loading parameters:', err);
        setError('Failed to load parameters');
      } finally {
        setLoading(false);
      }
    };
    loadParameters();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-4 text-secondary">
        Loading parameters...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg text-primary">
          Parameters
        </h3>
        <button
          className="px-3 py-1 rounded text-sm flex items-center gap-2 text-white bg-accent-primary"
        >
          <Plus size={14} />
          Add Parameter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-theme text-primary">
          <thead>
            <tr>
              <th className="p-2 text-left border font-normal border-theme">
                Name
              </th>
              <th className="p-2 text-left border font-normal border-theme">
                Short Name
              </th>
              <th className="p-2 text-left border font-normal border-theme">
                Unit
              </th>
              <th className="p-2 text-left border font-normal border-theme">
                Range Type
              </th>
              <th className="p-2 text-center border font-normal border-theme">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {parameters.map(param => (
              <tr key={param.id}>
                <td className="p-2 border border-theme">
                  {param.name}
                </td>
                <td className="p-2 border border-theme">
                  {param.shortName || '-'}
                </td>
                <td className="p-2 border border-theme">
                  {param.unit || '-'}
                </td>
                <td className="p-2 border border-theme">
                  {param.rangeType}
                </td>
                <td className="p-2 border border-theme">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatapointsSettings;