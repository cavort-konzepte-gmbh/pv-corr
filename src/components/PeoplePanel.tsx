import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Theme } from '../types/theme';
import { PERSON_FIELDS } from '../types/people';
import { User, Plus, ChevronRight, MapPin } from 'lucide-react';
import { generateHiddenId } from '../utils/generateHiddenId';
import { SavedPlace } from './PlacesPanel';
import { Language, useTranslation } from '../types/language';

interface PeoplePanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
  savedPlaces: SavedPlace[];
  savedPeople: SavedPerson[];
  onSavePeople: (people: SavedPerson[]) => void;
}

interface SavedPerson {
  id: string;
  hiddenId: string;
  values: {
    salutation: string;
    title?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  addresses: {
    private?: string | null;
    business?: string;
  };
}

const PeoplePanel: React.FC<PeoplePanelProps> = ({ 
  currentTheme,
  currentLanguage,
  savedPlaces, 
  savedPeople,
  onSavePeople 
}) => {
  const [showNewPersonForm, setShowNewPersonForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<SavedPerson | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddresses, setSelectedAddresses] = useState<{
    private?: string;
    business?: string;
  }>({});
  const [showAddressSelect, setShowAddressSelect] = useState<'private' | 'business' | null>(null);
  const translation = useTranslation(currentLanguage);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select(`
          id,
          hidden_id,
          salutation,
          title,
          first_name,
          last_name,
          email,
          phone,
          private_address_id,
          business_address_id
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedPeople = data.map(person => ({
        id: person.id,
        hiddenId: person.hidden_id,
        values: {
          salutation: person.salutation,
          title: person.title || '',
          firstName: person.first_name,
          lastName: person.last_name,
          email: person.email,
          phone: person.phone || ''
        },
        addresses: {
          private: person.private_address_id || null,
          business: person.business_address_id
        }
      }));

      onSavePeople(formattedPeople);
    } catch (err) {
      console.error('Error fetching people:', err);
      setError('Failed to load people');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPerson = (person: SavedPerson) => {
    setEditingPerson(person);
    setFormValues({
      salutation: person.values.salutation || '',
      title: person.values.title || '',
      firstName: person.values.firstName || '',
      lastName: person.values.lastName || '',
      email: person.values.email || '',
      phone: person.values.phone || ''
    });
    setSelectedAddresses(person.addresses);
    setShowNewPersonForm(true);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues(prev => {
      const newValues = { ...prev };
      newValues[fieldId] = value;
      return newValues;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formValues.salutation || !formValues.firstName || !formValues.lastName || !formValues.email) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const personData = {
        salutation: formValues.salutation,
        title: formValues.title || null,
        first_name: formValues.firstName,
        last_name: formValues.lastName,
        email: formValues.email,
        phone: formValues.phone || null,
        private_address_id: selectedAddresses.private || null,
        business_address_id: selectedAddresses.business || null
      };

      if (editingPerson) {
        const { error } = await supabase
          .from('people')
          .update(personData)
          .eq('id', editingPerson.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('people')
          .insert({
            ...personData,
            hidden_id: generateHiddenId()
          });

        if (error) throw error;
      }

      await fetchPeople();
      setShowNewPersonForm(false);
      setEditingPerson(null);
      setFormValues({});
      setSelectedAddresses({});
    } catch (err) {
      console.error('Error saving person:', err);
      setError(err instanceof Error ? err.message : 'Failed to save person');
    }
  };

  const handleDelete = async (personId: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', personId);

      if (error) throw error;
      await fetchPeople();
    } catch (err) {
      console.error('Error deleting person:', err);
      setError('Failed to delete person');
    }
  };

  if (loading) {
    return (
      <div 
        className="text-center p-4"
        style={{ color: currentTheme.colors.text.secondary }}
      >
        {translation("people.loading")}
      </div>
    );
  };

  const handleAddressSelect = (type: 'private' | 'business', addressId: string) => {
    setSelectedAddresses(prev => ({
      ...prev,
      [type === 'private' ? 'private' : 'business']: addressId
    }));
    setShowAddressSelect(null);
  };

  return (
    <div className="p-6">
      {error && (
        <div 
          className="p-4 mb-4 rounded"
          style={{ 
            backgroundColor: currentTheme.colors.surface,
            color: currentTheme.colors.accent.primary,
            border: `1px solid ${currentTheme.colors.accent.primary}`
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={() => setShowNewPersonForm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6"
        style={{ 
          backgroundColor: currentTheme.colors.accent.primary,
          color: 'white'
        }}
      >
        <Plus size={16} />
        {translation("people.new")}
      </button>

      {showNewPersonForm ? (
        <div>
          <h3 
            className="text-lg mb-6 flex items-center gap-2"
            style={{ color: currentTheme.colors.text.primary }}
          >
            <User size={16} style={{ color: currentTheme.colors.accent.primary }} />
            {editingPerson ? translation("people.edit") : translation("people.new")}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {PERSON_FIELDS.map(field => (
                <div key={field.id}>
                  <label 
                    className="block text-sm mb-1"
                    style={{ color: currentTheme.colors.text.secondary }}
                  >
                    {translation(field.label as any)}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'address' ? (
                    <button
                      type="button"
                      onClick={() => setShowAddressSelect(field.id === 'privateAddress' ? 'private' : 'business')}
                      className="w-full p-2 rounded text-sm text-left flex items-center justify-between"
                      style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text.primary,
                        border: `1px solid ${currentTheme.colors.border}`
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <MapPin size={16} />
                        {(() => {
                          const addressType = field.id === 'privateAddress' ? 'private' : 'business';
                          const selectedId = addressType === 'private' ? selectedAddresses.private : selectedAddresses.business;
                          if (selectedId) {
                            const place = savedPlaces.find(p => p.id === selectedId);
                            return place ? place.name : `Select ${field.label}`;
                          }
                          return `Select ${field.label}`;
                        })()}
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  ) : field.type === 'select' ? (
                    <select
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      className="w-full p-2 rounded text-sm"
                      style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text.primary,
                        border: `1px solid ${currentTheme.colors.border}`
                      }}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      required={field.required}
                      className="w-full p-2 rounded text-sm"
                      style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text.primary,
                        border: `1px solid ${currentTheme.colors.border}`
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewPersonForm(false);
                  setFormValues({});
                  setEditingPerson(null);
                  setSelectedAddresses({});
                }}
                className="px-4 py-2 rounded text-sm"
                style={{
                  backgroundColor: 'transparent',
                  color: currentTheme.colors.text.secondary,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              >
                {translation("actions.cancel")}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded text-sm"
                style={{
                  backgroundColor: currentTheme.colors.accent.primary,
                  color: 'white'
                }}
              >
                {editingPerson ? translation("settings.autosave") : translation("people.add")}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPeople.map(person => (
            <div
              key={person.id}
              className="p-4 rounded-lg border transition-all hover:translate-x-1"
              onClick={() => handleEditPerson(person)}
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text.primary,
                cursor: 'pointer'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} style={{ color: currentTheme.colors.accent.primary }} />
                  <span className="font-medium">
                    {person.values.salutation} 
                    {person.values.title ? ` ${person.values.title}` : ''} 
                    {` ${person.values.firstName} ${person.values.lastName}`}
                  </span>
                </div>
                <ChevronRight size={16} style={{ color: currentTheme.colors.text.secondary }} />
              </div>
              <div className="text-sm flex flex-col gap-1"
                style={{ color: currentTheme.colors.text.secondary }}
              >
                <div>{person.values.email} • {person.values.phone || 'No phone'}</div>
                {(person.addresses.private || person.addresses.business) && (
                  <div className="flex flex-col gap-2 mt-2">
                    {person.addresses.private && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                        <MapPin size={12} />
                        <span>Private: {
                          savedPlaces?.find(p => p.id === person.addresses.private)?.name || 'Address not found'
                        }</span>
                      </div>
                    )}
                    {person.addresses.business && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                        <MapPin size={12} />
                        <span>Business: {
                          savedPlaces?.find(p => p.id === person.addresses.business)?.name || 'Address not found'
                        }</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddressSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div 
            className="p-6 rounded-lg max-w-md w-full"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <h3 className="text-lg font-mono mb-4" style={{ color: currentTheme.colors.text.primary }}>
              Select {showAddressSelect === 'private' ? 'Private' : 'Business'} Address
            </h3>
            <div className="space-y-2">
              {savedPlaces.map(place => {
                const country = place.country;
                const address = Object.entries(place.values)
                  .filter(([key]) => key !== 'name')
                  .map(([_, value]) => value)
                  .join(', ');
                 
                return (
                  <button
                    key={place.id}
                    onClick={() => handleAddressSelect(showAddressSelect, place.id)}
                    className="w-full p-4 rounded text-left hover:translate-x-1 transition-transform flex flex-col gap-1"
                    style={{ 
                      backgroundColor: currentTheme.colors.border,
                      color: currentTheme.colors.text.primary
                    }}
                  >
                    <div className="font-medium">{place?.name || 'Unnamed Place'}</div>
                    <div className="text-sm mt-1" style={{ color: currentTheme.colors.text.secondary }}>
                      {[
                        place?.street_name,
                        place?.house_number,
                        place?.postal_code,
                        place?.city,
                        place?.state
                      ].filter(Boolean).join(', ')}
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => setShowAddressSelect(null)}
                className="w-full mt-4 p-2 rounded text-sm"
                style={{ 
                  backgroundColor: 'transparent',
                  color: currentTheme.colors.text.secondary,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              >
                {translation("actions.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeoplePanel;