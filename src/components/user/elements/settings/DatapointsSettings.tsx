import React from 'react';
import { Theme } from '../../../../types/theme';
import { Language } from '../../../../types/language';
import { Standard } from '../../../../types/standards';
import { Parameter } from '../../../../types/parameters';
import { fetchParameters } from '../../../../services/parameters';
import { Plus, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DatapointsSettingsProps {
  currentTheme: Theme;
  currentLanguage: Language;
  standards: Standard[];
  onStandardsChange: (standards: Standard[]) => void;
}

const DatapointsSettings: React.FC<DatapointsSettingsProps> = () => {
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
        <Button
          className="px-3 py-1 rounded text-sm flex items-center gap-2 text-white bg-accent-primary"
        >
          <Plus size={14} />
          Add Parameter
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table >
          <TableHeader>
            <TableRow>
              <TableHead >
                Name
              </TableHead>
              <TableHead >
                Short Name
              </TableHead>
              <TableHead >
                Unit
              </TableHead>
              <TableHead >
                Range Type
              </TableHead>
              <TableHead>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parameters.map(param => (
              <TableRow key={param.id}>
                <TableCell className="p-2 border border-theme">
                  {param.name}
                </TableCell>
                <TableCell className="p-2 border border-theme">
                  {param.shortName || '-'}
                </TableCell>
                <TableCell className="p-2 border border-theme">
                  {param.unit || '-'}
                </TableCell>
                <TableCell className="p-2 border border-theme">
                  {param.rangeType}
                </TableCell>
                <TableCell className="p-2 border border-theme">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DatapointsSettings;