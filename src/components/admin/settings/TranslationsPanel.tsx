import React, { useState, useEffect } from 'react';
import { Theme } from '../../../types/theme';
import { Language, LANGUAGES } from '../../../types/language';
import { Plus, Save, X, Edit2, Search } from 'lucide-react';
import { fetchAllTranslations, fetchLanguages, updateTranslation, deleteTranslation } from '../../../services/translations';
import { FormHandler } from '../../shared/FormHandler';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface TranslationsPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
}

const TranslationsPanel: React.FC<TranslationsPanelProps> = ({
  currentTheme,
  currentLanguage
}) => {
  const [translations, setTranslations] = useState<Record<string, Record<Language, string>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newValues, setNewValues] = useState<{
    key: string;
    translations: Record<Language, string>;
  }>({
    key: '',
    translations: {}
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const translationsData = await fetchAllTranslations();
      setTranslations(translationsData);
    } catch (err) {
      console.error('Error loading translations:', err);
      setError('Failed to load translations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string) => {
    try {
      setError(null);
      const promises = Object.entries(editValues).map(([langId, value]) =>
        updateTranslation(key, langId, value)
      );
      await Promise.all(promises);
      await loadData();
      setEditingKey(null);
      setEditValues({});
    } catch (err) {
      console.error('Error saving translations:', err);
      setError('Failed to save translations');
    }
  };

  const handleAddNew = async () => {
    try {
      setError(null);
      if (!newValues.key.trim()) {
        setError('Translation key is required');
        return;
      }

      const promises = Object.entries(newValues.translations).map(([langId, value]) =>
        updateTranslation(newValues.key.trim(), langId, value)
      );
      await Promise.all(promises);
      await loadData();
      setIsAdding(false);
      setNewValues({
        key: '',
        translations: {}
      });
    } catch (err) {
      console.error('Error adding translation:', err);
      setError('Failed to add translation');
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteTranslation(key);
      await loadData();
    } catch (err) {
      console.error('Error deleting translation:', err);
      setError('Failed to delete translation');
    }
  };

  const filteredTranslations = Object.entries(translations)
    .filter(([key]) => key.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-1">
          <Search size={20} className="text-secondary" />
          <input
            type="text"
            placeholder="Search translations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-primary"
          />
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 rounded text-sm flex items-center gap-2 text-white bg-accent-primary"
        >
          <Plus size={16} />
          Add Translation
        </Button>
      </div>

      {error && (
        <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Translations</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              {LANGUAGES.map(lang => (
                <TableHead key={lang.id}>{lang.name}</TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
   <TableBody>


            {isAdding && (
              <TableRow>
                <TableCell className="p-2 border border-theme text-secondary">
                  <FormHandler
                    isEditing={true}
                    onSave={handleAddNew}
                    onCancel={() => {
                      setIsAdding(false);
                      setNewValues({
                        key: '',
                        translations: {}
                      });
                    }}
                  >
                    <input
                      type="text"
                      value={newValues.key}
                      onChange={(e) => setNewValues(prev => ({
                        ...prev,
                        key: e.target.value
                      }))}
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                      placeholder="Enter translation key"
                    />
                  </FormHandler>
                </TableCell>
                {LANGUAGES.map(lang => (
                  <TableCell key={lang.id} className="p-2 border border-theme text-secondary">
                    <input
                      type="text"
                      value={newValues.translations[lang.id] || ''}
                      onChange={(e) => setNewValues(prev => ({
                        ...prev,
                        translations: {
                          ...prev.translations,
                          [lang.id]: e.target.value
                        }
                      }))}
                      className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                      dir={lang.direction}
                      placeholder={`Enter ${lang.name} translation`}
                    />
                  </TableCell>
                ))}
                <TableCell className="p-2 border border-theme text-secondary">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={handleAddNew}
                      className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    >
                      <Save size={14} />
                    </Button>
                    <Button
                      onClick={() => {
                        setIsAdding(false);
                        setNewValues({
                          key: '',
                          translations: {}
                        });
                      }}
                      className="p-1 rounded hover:bg-opacity-80 text-secondary"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filteredTranslations.map(([key, values]) => (
              <TableRow key={key}>
                <TableCell className="p-2 border border-theme text-secondary">
                  <code className="font-mono text-sm">{key}</code>
                </TableCell>
                {LANGUAGES.map(lang => (
                  <TableCell key={lang.id} className="p-2 border border-theme text-secondary">
                    {editingKey === key ? (
                      <input
                        type="text"
                        value={editValues[lang.id] || values[lang.id] || ''}
                        onChange={(e) => setEditValues(prev => ({
                          ...prev,
                          [lang.id]: e.target.value
                        }))}
                        className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        dir={lang.direction}
                      />
                    ) : (
                      <div dir={lang.direction}>
                        {values[lang.id] || '-'}
                      </div>
                    )}
                  </TableCell>
                ))}
                <TableCell className="p-2 border border-theme text-secondary">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={() => {
                        if (editingKey === key) {
                          handleSave(key);
                        } else {
                          setEditingKey(key);
                          setEditValues(values);
                        }
                      }}
                      className="p-1 rounded hover:bg-opacity-80 text-secondary"
                      variant="ghost"
                    >
                      {editingKey === key ? <Save size={14} /> : <Edit2 size={14} />}
                    </Button>
                    {editingKey === key ? (
                      <Button
                        onClick={() => {
                          setEditingKey(null);
                          setEditValues({});
                        }}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        variant="ghost"
                      >
                        <X size={14} />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleDelete(key)}
                        className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        variant="ghost"
                      >
                        <X size={14} />
                      </Button>
                    )}
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

export default TranslationsPanel;