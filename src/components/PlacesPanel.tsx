import React, { useState, useEffect } from 'react';
import { Theme } from '../types/theme';
import { COUNTRIES, Country } from '../types/places';
import { MapPin, Plus, ChevronRight } from 'lucide-react';
import { fetchPlaces as fetchPlacesFromDB } from '../services/places';
import { useKeyAction } from '../hooks/useKeyAction';
import { useDebounce } from '../hooks/useDebounce';

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
  house_number?: string;
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
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(initialSavedPlaces || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState<SavedPlace[]>([]);

  const debouncedPlacesSearch = useDebounce((search: string) => {
    const filtered = savedPlaces.filter(place => 
      place.name?.toLowerCase().includes(search.toLowerCase()) ||
      [
        place.street_name,
        place.street_number,
        place.house_number,
        place.city,
        place.postal_code,
        place.state,
        place.province
      ].some(value => value && value.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredPlaces(filtered);
  }, 500)

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      const places = await fetchPlacesFromDB();
      setSavedPlaces(places);
      onSavePlaces(places);
      setFilteredPlaces(places);
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
    // Set form values from all available place fields
    setFormValues({
      name: place.name || '',
      street_number: place.street_number || '',
      house_number: place.house_number || '',
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

  const updateSelectedPlace = async () => {
    setError(null);
    const houseNumber = formValues.house_number || formValues.street_number;

    try {
      const placeData = {
        country: selectedCountry?.id,
        name: formValues.name,
        street_number: houseNumber,
        street_name: formValues.street_name || '',
        apartment: formValues.apartment || '',
        city: formValues.city || '',
        state: formValues.state || '',
        postal_code: formValues.postal_code || formValues.zip || '',
        district: formValues.district || '',
        building: formValues.building || '',
        room: formValues.room || '',
        province: formValues.province || '',
        house_number: houseNumber
      };
    
      if (editingPlace) {
        // Placeholder for update logic
      } else {
        // Placeholder for insert logic
      }

      await loadPlaces();
      setShowNewPlaceForm(false);
      setSelectedCountry(null);
      setEditingPlace(null);
      setFormValues({});
    } catch (err) {
      console.error('Error saving place:', err);
      setError('Failed to save place');
      return;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSelectedPlace();
  };

  const handleDelete = async (placeId: string) => {
    try {
      // Placeholder for delete logic
      await loadPlaces();
    } catch (err) {
      console.error('Error deleting place:', err);
      setError('Failed to delete place');
    }
  };

  useKeyAction(() => {
    updateSelectedPlace();
  }, showNewPlaceForm)

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
          onChange={(e) => {
            setSearchTerm(e.target.value)
            debouncedPlacesSearch(e.target.value)
          }}
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
                        <span className="font-medium">{place?.name || 'Unnamed Place'}</span>
                      </div>
                      <ChevronRight size={16} style={{ color: currentTheme.colors.text.secondary }} />
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      {[
                        place.street_name,
                        place.house_number || place.street_number,
                        place.postal_code,
                        place.city,
                        place.state,
                        place.province
                      ].filter(Boolean).join(', ')}
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