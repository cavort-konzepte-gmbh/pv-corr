import React, { useState, useEffect } from 'react';
import { Theme } from '../types/theme';
import { COUNTRIES, Country } from '../types/places';
import { MapPin, Plus, ChevronRight } from 'lucide-react';
import { fetchPlaces as fetchPlacesFromDB } from '../services/places';
import { useKeyAction } from '../hooks/useKeyAction';
import { useDebounce } from '../hooks/useDebounce';
import { Language, useTranslation } from '../types/language';
import { toCase } from '../utils/cases';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface PlacesPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
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
  currentLanguage,
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
  const translation = useTranslation(currentLanguage)

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
  })

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
        street_number: houseNumber,
        house_number: houseNumber,
        ...toCase(formValues, "snakeCase"),
        postal_code: formValues.postal_code || formValues.zip || '',
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
      <Button
        onClick={() => setShowNewPlaceForm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6 text-white bg-accent-primary"        
      >
        <Plus size={16} />
        {translation("place.new")}
      </Button>

      <div className="mb-6">
        <Input
          type="text"
          placeholder={translation("place.search")}
          value={searchTerm}
          className="w-full p-3 rounded text-sm text-primary border-theme border-solid bg-surface"          
          onChange={(e) => {
            setSearchTerm(e.target.value)
            debouncedPlacesSearch(e.target.value)
          }}
        />
      </div>

      {error && (
        <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center p-4 text-secondary">
          {translation("place.loading")}
        </div>
      ) : (
        <>
          {showNewPlaceForm ? (
            <div>
              <h3 className="text-lg mb-6 flex items-center gap-2 text-primary">
                <MapPin className="text-accent-primary" size={16} />
                {editingPlace ? translation("place.edit") : 
                  selectedCountry ? `${translation("place.new_place")} ${selectedCountry.name}` : translation("place.select_country")}
              </h3>
              
              {!selectedCountry ? (
                <div className="grid grid-cols-2 gap-4">
                  {COUNTRIES.map(country => (
                    <Button
                      key={country.id}
                      onClick={() => handleCountrySelect(country)}
                      className="p-4 rounded-lg border transition-all hover:translate-y-[-2px] text-primary border-theme border-solid bg-surface"                      
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="text-accent-primary" size={16} />
                        <span>{country.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCountry.fields.map(field => (
                      <div key={field.id}>
                        <Label className="block text-sm mb-1 text-secondary">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                          type={field.type}
                          value={formValues[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          required={field.required}
                          placeholder={field.placeholder}
                          className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                          autoFocus={field.id === 'name'}                          
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowNewPlaceForm(false);
                        setSelectedCountry(null);
                        setEditingPlace(null);
                        setFormValues({});
                      }}
                      className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-surface"                      
                    >
                      {translation("actions.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      className="px-4 py-2 rounded text-sm text-white bg-accent-primary"                      
                    >
                      {editingPlace ? translation("general.save_changes") : translation("place.add")}
                    </Button>
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
                    className="p-4 rounded-lg border transition-all hover:translate-x-1 text-primary border-theme border-solid bg-surface hover:cursor-pointer"
                    onClick={() => handleEditPlace(place)}                    
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-accent-primary" size={16} />
                        <span className="font-medium">{place?.name || 'Unnamed Place'}</span>
                      </div>
                      <ChevronRight className="text-secondary" size={16} />
                    </div>
                    <div className="text-sm text-secondary">
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