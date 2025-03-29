import React, { useState, useEffect } from 'react';
import { Theme } from '../../../../types/theme';
import { Language, useTranslation } from '../../../../types/language';
import { supabase } from '../../../../lib/supabase';
import { Plus, ChevronRight, MapPin, Edit2, X } from 'lucide-react';
import { generateHiddenId } from '../../../../utils/generateHiddenId';
import { useKeyAction } from '../../../../hooks/useKeyAction';
import { Button } from '@/components/ui/button';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';

interface PlacesSettingsProps {
  currentTheme: Theme;
  currentLanguage: Language;
  places: SavedPlace[];
}

interface Country {
  id: string;
  code: string;
  name: string;
  native_name: string;
  format_template: string;
}

interface AddressField {
  id: string;
  code: string;
  field_type: string;
  required: boolean;
  display_order: number;
  label: string;
}

interface SavedPlace {
  id: string;
  name: string;
  country: string;
  [key: string]: any;
}

const PlacesSettings: React.FC<PlacesSettingsProps> = ({ currentTheme, currentLanguage, places }) => {
  const [showNewPlaceForm, setShowNewPlaceForm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [addressFields, setAddressFields] = useState<AddressField[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlace, setEditingPlace] = useState<SavedPlace | null>(null);
  const translation = useTranslation(currentLanguage);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const { data: countriesData, error: countriesError } = await supabase.from('countries').select('*').order('name');

      if (countriesError) throw countriesError;
      setCountries(countriesData);
    } catch (err) {
      console.error('Error loading countries:', err);
      setError('Failed to load countries');
    } finally {
      setLoading(false);
    }
  };

  const loadAddressFields = async (countryId: string) => {
    try {
      const { data, error } = await supabase
        .from('country_address_fields')
        .select(
          `
          field_id,
          required,
          display_order,
          address_fields!inner (
            id,
            code,
            field_type
          ),
          address_field_translations!inner (
            label
          )
        `,
        )
        .eq('country_id', countryId)
        .eq('address_field_translations.language', currentLanguage)
        .eq('address_field_translations.field_id', 'address_fields.id')
        .order('display_order');

      if (error) throw error;

      const fields = data.map((field) => ({
        id: field.address_fields.id,
        code: field.address_fields.code,
        field_type: field.address_fields.field_type,
        required: field.required,
        display_order: field.display_order,
        label: field.address_field_translations[0]?.label || field.address_fields.code,
      }));

      setAddressFields(fields);
    } catch (err) {
      console.error('Error loading address fields:', err);
      setError('Failed to load address fields');
    }
  };

  const handleCountrySelect = async (country: Country) => {
    setSelectedCountry(country);
    await loadAddressFields(country.id);
    setFormValues({ name: '', country: country.code });
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleEditPlace = async (place: SavedPlace) => {
    const country = countries.find((c) => c.code === place.country);
    if (!country) return;

    setEditingPlace(place);
    setSelectedCountry(country);
    await loadAddressFields(country.id);
    setFormValues(place);
    setShowNewPlaceForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) return;

    try {
      const data = {
        hidden_id: generateHiddenId(),
        ...formValues,
      };

      const { error } = editingPlace
        ? await supabase.from('places').update(data).eq('id', editingPlace.id)
        : await supabase.from('places').insert(data);

      if (error) throw error;

      setShowNewPlaceForm(false);
      setSelectedCountry(null);
      setFormValues({});
      setEditingPlace(null);
    } catch (err) {
      console.error('Error saving place:', err);
      setError('Failed to save place');
    }
  };

  useKeyAction(() => {
    if (showNewPlaceForm && selectedCountry) {
      handleSubmit(new Event('submit') as any);
    }
  }, showNewPlaceForm && !!selectedCountry);

  return (
    <div className="p-6">
      <Button
        onClick={() => setShowNewPlaceForm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6 text-white bg-accent-primary"
      >
        <Plus size={16} />
        {translation('place.new')}
      </Button>

      {error && <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">{error}</div>}

      {loading ? (
        <div className="text-center p-4 text-secondary">{translation('place.loading')}</div>
      ) : (
        <>
          {showNewPlaceForm ? (
            <div>
              <h3 className="text-lg mb-6 flex items-center gap-2 text-primary">
                <MapPin className="text-accent-primary" size={16} />
                {selectedCountry ? `${translation('place.new_place')} ${selectedCountry.name}` : translation('place.select_country')}
              </h3>

              {!selectedCountry ? (
                <div className="grid grid-cols-2 gap-4">
                  {countries.map((country) => (
                    <Button
                      key={country.id}
                      onClick={() => handleCountrySelect(country)}
                      className="p-4 rounded-lg border transition-all hover:translate-y-[-2px] text-primary border-theme border-solid bg-surface"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="text-accent-primary" size={16} />
                        <span>{country.name}</span>
                        {country.native_name && country.native_name !== country.name && (
                          <span className="text-sm text-secondary">({country.native_name})</span>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {addressFields.map((field) => (
                      <div key={field.id}>
                        <Label className="block text-sm mb-1 text-secondary">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                          type={field.field_type === 'number' ? 'number' : 'text'}
                          value={formValues[field.code] || ''}
                          onChange={(e) => handleInputChange(field.code, e.target.value)}
                          required={field.required}
                          className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
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
                        setFormValues({});
                        setEditingPlace(null);
                      }}
                      className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
                    >
                      {translation('actions.cancel')}
                    </Button>
                    <Button type="submit" className="px-4 py-2 rounded text-sm text-white bg-accent-primary">
                      {editingPlace ? translation('actions.save') : translation('place.add')}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {places.map((place) => {
                const country = countries.find((c) => c.code === place.country);
                if (!country) return null;

                return (
                  <div
                    key={place.id}
                    className="p-4 rounded-lg border transition-all hover:translate-x-1 text-primary border-theme border-solid bg-surface"
                    onClick={() => handleEditPlace(place)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-accent-primary" size={16} />
                        <span className="font-medium">{place.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Edit2 className="text-secondary" size={14} />
                        <ChevronRight className="text-secondary" size={16} />
                      </div>
                    </div>
                    <div className="text-sm text-secondary">
                      {[
                        place.street_name,
                        place.house_number || place.street_number,
                        place.postal_code,
                        place.city,
                        place.state,
                        place.province,
                      ]
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

export default PlacesSettings;
