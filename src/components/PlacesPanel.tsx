import React, { useState, useEffect } from 'react';
import { Theme } from '../types/theme';
import { COUNTRIES, Country } from '../types/places';
import { MapPin, Plus, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateHiddenId } from '../utils/generateHiddenId';

interface PlacesPanelProps {
  currentTheme: Theme;
  savedPlaces: SavedPlace[];
  onSavePlaces: (places: SavedPlace[]) => void;
}

export interface SavedPlace {
  id: string;
  country: string;
  name: string;
  street_number?: string;
  street_name?: string;
  apartment?: string;
  city: string;
  state?: string;
  postal_code?: string;
  district?: string;
  building?: string;
  room?: string;
  province?: string;
}

const PlacesPanel: React.FC<PlacesPanelProps> = ({ 
  currentTheme, 
  savedPlaces: initialSavedPlaces,
  onSavePlaces 
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showNewPlaceForm, setShowNewPlaceForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<SavedPlace | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState<SavedPlace[]>([]);

  useEffect(() => {
    fetchPlaces();
  }, []);

  useEffect(() => {
    // Filter places based on search term
    const filtered = savedPlaces.filter(place => 
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.entries(place)
        .filter(([key]) => key !== 'id' && key !== 'country')
        .some(([_, value]) => value && value.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPlaces(filtered);
  }, [searchTerm, savedPlaces]);

  const fetchPlaces = async () => {
    try {
      const { data, error } = await supabase
        .from('places').select(`
          id,
          hidden_id,
          name,
          country,
          street_number,
          street_name,
          apartment,
          city,
          state,
          postal_code,
          district,
          building,
          room,
          province,
          created_at
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedPlaces = data.map(place => ({
        id: place.id,
        country: place.country,
        name: place.name,
        street_number: place.street_number || '',
        street_name: place.street_name || '',
        apartment: place.apartment || '',
        city: place.city || '',
        state: place.state || '',
        postal_code: place.postal_code || '',
        district: place.district || '',
        building: place.building || '',
        room: place.room || '',
        province: place.province || ''
      }));

      setSavedPlaces(formattedPlaces);
      onSavePlaces(formattedPlaces);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError('Failed to load places');
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setFormValues({});
    setShowNewPlaceForm(true);
  };

  const handleEditPlace = (place: SavedPlace) => {
    const country = COUNTRIES.find(c => c.id === place.country);
    if (!country) return;

    setEditingPlace(place);
    setSelectedCountry(country);
    // Set form values from the place's individual fields
    setFormValues({
      name: place.name || '',
      street_number: place.street_number || '',
      street_name: place.street_name || '',
      apartment: place.apartment || '',
      city: place.city || '',
      state: place.state || '',
      postal_code: place.postal_code || '',
      district: place.district || '',
      building: place.building || '',
      room: place.room || '',
      province: place.province || ''
    });
    setShowNewPlaceForm(true);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) return;
    setError(null);

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('You must be logged in to save places');
      return;
    }

    try {
      const placeData = {
        name: formValues.name,
        street_number: formValues.street_number,
        street_name: formValues.street_name,
        apartment: formValues.apartment,
        city: formValues.city,
        state: formValues.state,
        postal_code: formValues.postal_code || formValues.zip,
        district: formValues.district,
        building: formValues.building,
        room: formValues.room,
        province: formValues.province,
        country: selectedCountry.id,
        hidden_id: generateHiddenId()
      };
    
      if (editingPlace) {
        const { error } = await supabase
          .from('places').update(placeData)
          .eq('id', editingPlace.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('places').insert(placeData);

        if (error) throw error;
      }

      await fetchPlaces();
      setShowNewPlaceForm(false);
      setSelectedCountry(null);
      setEditingPlace(null);
      setFormValues({});
    } catch (err) {
      if (err.code === '23505') {
        setError(`A place with the name "${formValues.name}" already exists in ${selectedCountry.name}. Please use a different name.`);
      } else {
        console.error('Error saving place:', err);
        setError('Failed to save place');
      }
      return;
    }
  };

  const handleDelete = async (placeId: string) => {
    try {
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', placeId);

      if (error) throw error;
      await fetchPlaces();
    } catch (err) {
      console.error('Error deleting place:', err);
      setError('Failed to delete place');
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => setShowNewPlaceForm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6"
        style={{ 
          backgroundColor: currentTheme.colors.accent.primary,
          color: 'white'
        }}
      >
        <Plus size={16} />
        Add New Place
      </button>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search places..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded text-sm"
          style={{
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border,
            color: currentTheme.colors.text.primary,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        />
      </div>

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

      {loading ? (
        <div 
          className="text-center p-4"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          Loading places...
        </div>
      ) : (
        <>
          {showNewPlaceForm ? (
            <div>
              <h3 
                className="text-lg mb-6 flex items-center gap-2"
                style={{ color: currentTheme.colors.text.primary }}
              >
                <MapPin size={16} style={{ color: currentTheme.colors.accent.primary }} />
                {editingPlace ? 'Edit Place' : 
                  selectedCountry ? `New Place in ${selectedCountry.name}` : 'Select Country'}
              </h3>
              
              {!selectedCountry ? (
                <div className="grid grid-cols-2 gap-4">
                  {COUNTRIES.map(country => (
                    <button
                      key={country.id}
                      onClick={() => handleCountrySelect(country)}
                      className="p-4 rounded-lg border transition-all hover:translate-y-[-2px]"
                      style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text.primary
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={16} style={{ color: currentTheme.colors.accent.primary }} />
                        <span>{country.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCountry.fields.map(field => (
                      <div key={field.id}>
                        <label 
                          className="block text-sm mb-1"
                          style={{ color: currentTheme.colors.text.secondary }}
                        >
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                          type={field.type}
                          value={formValues[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          required={field.required}
                          placeholder={field.placeholder}
                          className="w-full p-2 rounded text-sm"
                          autoFocus={field.id === 'name'}
                          style={{
                            backgroundColor: currentTheme.colors.surface,
                            borderColor: currentTheme.colors.border,
                            color: currentTheme.colors.text.primary,
                            border: `1px solid ${currentTheme.colors.border}`
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewPlaceForm(false);
                        setSelectedCountry(null);
                        setEditingPlace(null);
                        setFormValues({});
                      }}
                      className="px-4 py-2 rounded text-sm"
                      style={{
                        backgroundColor: 'transparent',
                        color: currentTheme.colors.text.secondary,
                        border: `1px solid ${currentTheme.colors.border}`
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded text-sm"
                      style={{
                        backgroundColor: currentTheme.colors.accent.primary,
                        color: 'white'
                      }}
                    >
                      {editingPlace ? 'Save Changes' : 'Add Place'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlaces.map(place => {
                const country = COUNTRIES.find(c => c.id === place.country);
                if (!country) return null;

                return (
                  <div
                    key={place.id}
                    className="p-4 rounded-lg border transition-all hover:translate-x-1"
                    onClick={() => handleEditPlace(place)}
                    style={{
                      backgroundColor: currentTheme.colors.surface,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text.primary,
                      cursor: 'pointer'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} style={{ color: currentTheme.colors.accent.primary }} />
                        <span className="font-medium">{place.name}</span>
                      </div>
                      <ChevronRight size={16} style={{ color: currentTheme.colors.text.secondary }} />
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      {Object.entries(place)
                        .filter(([key]) => !['id', 'country', 'name'].includes(key))
                        .map(([_, value]) => value)
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PlacesPanel;