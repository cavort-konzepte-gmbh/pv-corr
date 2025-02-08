import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Theme } from '../types/theme';
import { Company, COMPANY_FIELDS } from '../types/companies';
import { Building2, Plus, ChevronRight, Trash2, MapPin, User } from 'lucide-react';
import { SavedPlace } from './PlacesPanel';
import { generateHiddenId } from '../utils/generateHiddenId';
import { Person } from '../types/people';
import { fetchPeople } from '../services/people';
import { useKeyAction } from '../hooks/useKeyAction';

interface CompaniesPanelProps {
  currentTheme: Theme;
  savedPlaces: SavedPlace[];
  savedPeople: Person[];
  savedCompanies: Company[];
  onSaveCompanies: (companies: Company[]) => void;
}

const CompaniesPanel: React.FC<CompaniesPanelProps> = ({
  currentTheme,
  savedPlaces,
  savedPeople,
  savedCompanies,
  onSaveCompanies
}) => {
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [selectedCeoId, setSelectedCeoId] = useState<string>('');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [savedCompaniesList, setSavedCompaniesList] = useState<Company[]>(savedCompanies || []);
  const [availablePeople, setAvailablePeople] = useState<Person[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [companies, people] = await Promise.all([
          fetchCompanies(),
          fetchPeople()
        ]);
        setAvailablePeople(people);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      }
    };
    
    loadData();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedCompanies = data.map(company => ({
        id: company.id,
        hiddenId: company.hidden_id,
        name: company.name,
        website: company.website,
        email: company.email,
        phone: company.phone,
        vatId: company.vat_id,
        registrationNumber: company.registration_number,
        placeId: company.place_id,
        ceoId: company.ceo_id,
        contactPersonId: company.contact_person_id
      }));

      onSaveCompanies(formattedCompanies);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedCompany = async () => {
    setError(null);
    
    try {
      const companyData = {
        name: formValues.name,
        website: formValues.website,
        email: formValues.email,
        phone: formValues.phone,
        vat_id: formValues.vatId,
        registration_number: formValues.registrationNumber,
        place_id: selectedPlaceId || null,
        ceo_id: selectedCeoId || null,
        contact_person_id: selectedContactId || null
      };

      if (editingCompany) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', editingCompany.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('companies')
          .insert({
            ...companyData,
            hidden_id: generateHiddenId()
          });

        if (error) throw error;
      }

      await fetchCompanies();
      setShowNewCompanyForm(false);
      setEditingCompany(null);
      setFormValues({});
      setSelectedPlaceId('');
      setSelectedCeoId('');
      setSelectedContactId('');
    } catch (err) {
      console.error('Error saving company:', err);
      setError(err instanceof Error ? err.message : 'Failed to save company');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSelectedCompany();
  };

  const handleDelete = async (companyId: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;
      await fetchCompanies();
    } catch (err) {
      console.error('Error deleting company:', err);
      setError('Failed to delete company');
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormValues({
      name: company.name,
      website: company.website || '',
      email: company.email || '',
      phone: company.phone || '',
      vatId: company.vatId || '',
      registrationNumber: company.registrationNumber || ''
    });
    setSelectedPlaceId(company.placeId || '');
    setSelectedCeoId(company.ceoId || '');
    setSelectedContactId(company.contactPersonId || '');
    setShowNewCompanyForm(true);
  };

  useKeyAction(() => {
    updateSelectedCompany();
  }, showNewCompanyForm)

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

      {loading ? (
        <div 
          className="text-center p-4"
          style={{ color: currentTheme.colors.text.secondary }}
        >
          Loading companies...
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowNewCompanyForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6"
            style={{ 
              backgroundColor: currentTheme.colors.accent.primary,
              color: 'white'
            }}
          >
            <Plus size={16} />
            Add New Company
          </button>

          {showNewCompanyForm ? (
            <div>
          <h3 
            className="text-lg mb-6 flex items-center gap-2"
            style={{ color: currentTheme.colors.text.primary }}
          >
            <Building2 size={16} style={{ color: currentTheme.colors.accent.primary }} />
            {editingCompany ? 'Edit Company' : 'New Company'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {COMPANY_FIELDS.map(field => (
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
                  onChange={(e) => setFormValues(prev => ({
                    ...prev,
                    [field.id]: e.target.value
                  }))}
                  required={field.required}
                  className="w-full p-2 rounded text-sm"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                />
              </div>
            ))}
            <div>
              <label 
                className="block text-sm mb-1"
                style={{ color: currentTheme.colors.text.secondary }}
              >
                Company Address
              </label>
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full p-2 rounded text-sm"
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text.primary,
                  border: `1px solid ${currentTheme.colors.border}`
                }}
              >
                <option value="">Select project site</option>
                {savedPlaces?.map(place => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label 
                className="block text-sm mb-1"
                style={{ color: currentTheme.colors.text.secondary }}
              >
                CEO
              </label>
              <div className="relative">
                <select
                  value={selectedCeoId}
                  onChange={(e) => setSelectedCeoId(e.target.value)}
                  className="w-full p-2 rounded text-sm appearance-none"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                >
                  <option value="">Select CEO</option>
                  {availablePeople.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.salutation} {person.title ? `${person.title} ` : ''}
                      {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
                <ChevronRight 
                  size={14} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
                  style={{ color: currentTheme.colors.text.secondary }}
                />
              </div>
            </div>
            <div>
              <label 
                className="block text-sm mb-1"
                style={{ color: currentTheme.colors.text.secondary }}
              >
                Contact Person
              </label>
              <div className="relative">
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="w-full p-2 rounded text-sm appearance-none"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text.primary,
                    border: `1px solid ${currentTheme.colors.border}`
                  }}
                >
                  <option value="">Select Contact Person</option>
                  {availablePeople.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.salutation} {person.title ? `${person.title} ` : ''}
                      {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
                <ChevronRight 
                  size={14} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
                  style={{ color: currentTheme.colors.text.secondary }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewCompanyForm(false);
                  setEditingCompany(null);
                  setFormValues({});
                  setSelectedPlaceId('');
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
                {editingCompany ? 'Save Changes' : 'Create Company'}
              </button>
            </div>
          </form>
            </div>
          ) : (
            <div className="space-y-4">
          {savedCompanies.map(company => (
            <div
              key={company.id}
              className="p-4 rounded-lg border transition-all hover:translate-x-1"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.text.primary
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 size={16} style={{ color: currentTheme.colors.accent.primary }} />
                  <span className="font-medium">{company.name}</span>
                  {company.placeId && (
                    <div className="flex items-center gap-1 text-xs" style={{ color: currentTheme.colors.text.secondary }}>
                      <MapPin size={12} />
                      {savedPlaces?.find(p => p.id === company.placeId)?.name || 'Unknown location'}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(company)}
                    className="p-1 rounded hover:bg-opacity-80"
                    style={{ color: currentTheme.colors.text.secondary }}
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="p-1 rounded hover:bg-opacity-80"
                    style={{ color: currentTheme.colors.text.secondary }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div 
                className="text-sm space-y-2"
                style={{ color: currentTheme.colors.text.secondary }}
              >
                {company.placeId && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    {savedPlaces?.find(p => p.id === company.placeId)?.name || 'Unknown location'}
                  </div>
                )}
                {company.ceoId && (
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    CEO: {(() => {
                      const manager = availablePeople.find(p => p.id === company.ceoId);
                      if (!manager) return 'Unknown manager';
                      return `${manager.salutation} ${manager.title ? `${manager.title} ` : ''}${manager.firstName} ${manager.lastName}`;
                    })()}
                  </div>
                )}
                {company.contactPersonId && (
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    Contact: {(() => {
                      const contact = availablePeople.find(p => p.id === company.contactPersonId);
                      if (!contact) return 'Unknown contact';
                      return `${contact.salutation} ${contact.title ? `${contact.title} ` : ''}${contact.firstName} ${contact.lastName}`;
                    })()}
                  </div>
                )}
                {company.website && (
                  <div>
                    <a 
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: currentTheme.colors.accent.primary }}
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.email && (
                  <div>
                    <a 
                      href={`mailto:${company.email}`}
                      style={{ color: currentTheme.colors.accent.primary }}
                    >
                      {company.email}
                    </a>
                  </div>
                )}
                {company.phone && (
                  <div>
                    <a 
                      href={`tel:${company.phone}`}
                      style={{ color: currentTheme.colors.accent.primary }}
                    >
                      {company.phone}
                    </a>
                  </div>
                )}
                {company.vatId && (
                  <div>VAT ID: {company.vatId}</div>
                )}
                {company.registrationNumber && (
                  <div>Reg. No.: {company.registrationNumber}</div>
                )}
              </div>
            </div>
          ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CompaniesPanel;