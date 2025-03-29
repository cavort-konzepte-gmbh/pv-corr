import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Theme } from '../types/theme';
import { Person, PERSON_FIELDS } from '../types/people';
import { User, Plus, ChevronRight } from 'lucide-react';
import { generateHiddenId } from '../utils/generateHiddenId';
import { Language, useTranslation } from '../types/language';
import { useKeyAction } from '../hooks/useKeyAction';
import { toCase } from '../utils/cases';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface PeoplePanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
  savedPeople: Person[];
  onSavePeople: (people: Person[]) => void;
  onCreateCustomer?: (personId: string, name: string) => void;
}

const PeoplePanel: React.FC<PeoplePanelProps> = ({ currentTheme, currentLanguage, savedPeople, onSavePeople, onCreateCustomer }) => {
  const [showNewPersonForm, setShowNewPersonForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const translation = useTranslation(currentLanguage);

  useEffect(() => {
    fetchPeople();
  }, []);
  const fetchPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select(
          `
          id,
          hidden_id,
          salutation,
          title,
          first_name,
          last_name,
          email,
          phone
        `,
        )
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching people:', error);
        throw error;
      }

      const formattedPeople = data.map((person) => ({
        id: person.id,
        hiddenId: person.hidden_id,
        salutation: person.salutation,
        title: person.title,
        firstName: person.first_name,
        lastName: person.last_name,
        email: person.email,
        phone: person.phone,
      }));

      onSavePeople(formattedPeople);
    } catch (err) {
      console.error('Error in fetchPeople:', err);
      setError('Failed to fetch people');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
    setFormValues({
      salutation: person.salutation,
      title: person.title || '',
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone || '',
    });
    setShowNewPersonForm(true);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => {
      const newValues = { ...prev };
      newValues[fieldId] = value;
      return newValues;
    });
  };

  const updateSelectedProject = async () => {
    setError(null);

    if (!formValues.salutation || !formValues.firstName || !formValues.lastName || !formValues.email) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const personData = {
        ...toCase(formValues, 'snakeCase'),
      };

      if (editingPerson) {
        const { error } = await supabase.from('people').update(personData).eq('id', editingPerson.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('people').insert({
          ...personData,
          hidden_id: generateHiddenId(),
        });

        if (error) throw error;
      }

      await fetchPeople();
      setShowNewPersonForm(false);
      setEditingPerson(null);
      setFormValues({});
    } catch (err) {
      console.error('Error saving person:', err);
      setError(err instanceof Error ? err.message : 'Failed to save person');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSelectedProject();
  };

  const handleDelete = async (personId: string) => {
    try {
      const { error } = await supabase.from('people').delete().eq('id', personId);

      if (error) throw error;
      await fetchPeople();
    } catch (err) {
      console.error('Error deleting person:', err);
      setError('Failed to delete person');
    }
  };

  useKeyAction(() => {
    updateSelectedProject();
  }, showNewPersonForm);

  if (loading) {
    return <div className="text-center p-4 text-secondary">{translation('people.loading')}</div>;
  }

  return (
    <div className="p-6">
      {error && <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary bg-surface">{error}</div>}

      <Button onClick={() => setShowNewPersonForm(true)} className="w-full px-4 py-3 duration-200 mb-6">
        <Plus size={16} />
        {translation('people.new')}
      </Button>

      {showNewPersonForm ? (
        <div>
          <h3 className="text-lg mb-6 flex items-center gap-2 text-primary">
            <User className="text-accent-primary" size={16} />
            {editingPerson ? translation('people.edit') : translation('people.new')}
          </h3>

          <form onSubmit={handleSubmit} className="text-card-foreground space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {PERSON_FIELDS.map((field) => (
                <div key={field.id}>
                  <Label className="block text-sm mb-1">
                    {translation(field.label as any)}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.type === 'select' ? (
                    <select
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      className="w-full p-2 rounded text-sm text-primary border border-input shadow-sm bg-accent"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={field.type}
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      className="w-full p-2 rounded text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setShowNewPersonForm(false);
                  setFormValues({});
                  setEditingPerson(null);
                }}
              >
                {translation('actions.cancel')}
              </Button>
              <Button type="submit">{editingPerson ? translation('settings.autosave') : translation('people.add')}</Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPeople.map((person) => (
            <div
              key={person.id}
              className="p-4 rounded-lg border transition-all hover:translate-x-1 text-primary border-accent hover:cursor-pointer"
              onClick={() => handleEditPerson(person)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="text-primary" size={16} />
                  <span className="font-medium">
                    {person.salutation}
                    {person.title ? ` ${person.title}` : ''}
                    {` ${person.firstName} ${person.lastName}`}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {onCreateCustomer && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateCustomer(person.id, `${person.firstName} ${person.lastName}`);
                      }}
                      className="px-2 py-1 text-xs hover:bg-opacity-80"
                    >
                      Make Customer
                    </Button>
                  )}
                  <ChevronRight className="text-primary" size={16} />
                </div>
              </div>
              <div className="text-sm flex flex-col gap-1 text-muted-foreground">
                <div>
                  {person.email} • {person.phone || 'No phone'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeoplePanel;
