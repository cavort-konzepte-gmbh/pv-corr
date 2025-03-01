import React, { useState } from 'react';
import { Theme } from '../../../../types/theme';
import { Plus } from 'lucide-react';
import { createCustomer } from '../../../../services/customers';
import { Person } from '../../../../types/people';
import { Company } from '../../../../types/companies';

interface CustomerFormProps {
  currentTheme: Theme;
  savedPeople: Person[];
  savedCompanies: Company[];
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  currentTheme,
  savedPeople,
  savedCompanies
}) => {
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [selectedType, setSelectedType] = useState<'person' | 'company'>('person');
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!selectedId) {
      setError('Please select a person or company');
      return;
    }

    try {
      await createCustomer({
        name: customerName.trim(),
        personId: selectedType === 'person' ? selectedId : undefined,
        companyId: selectedType === 'company' ? selectedId : undefined
      });

      setShowForm(false);
      setCustomerName('');
      setSelectedType('person');
      setSelectedId('');
      setError(null);
    } catch (err) {
      console.error('Error creating customer:', err);
      setError('Failed to create customer');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-sm transition-all duration-200 mb-6 text-white bg-accent-primary"
      >
        <Plus size={16} />
        Add New Customer
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg max-w-md w-full bg-surface">
            <h3 className="text-lg mb-6 text-primary">New Customer</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Customer Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Customer Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={selectedType === 'person'}
                      onChange={() => {
                        setSelectedType('person');
                        setSelectedId('');
                      }}
                    />
                    <span className="text-primary">Person</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={selectedType === 'company'}
                      onChange={() => {
                        setSelectedType('company');
                        setSelectedId('');
                      }}
                    />
                    <span className="text-primary">Company</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1 text-secondary">
                  Select {selectedType === 'person' ? 'Person' : 'Company'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  required
                  className="w-full p-2 rounded text-sm text-primary border-theme border-solid bg-surface"
                >
                  <option value="">Select {selectedType === 'person' ? 'a person' : 'a company'}</option>
                  {selectedType === 'person' ? (
                    savedPeople.map(person => (
                      <option key={person.id} value={person.id}>
                        {person.firstName} {person.lastName}
                      </option>
                    ))
                  ) : (
                    savedCompanies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {error && (
                <div className="p-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setCustomerName('');
                    setSelectedType('person');
                    setSelectedId('');
                  }}
                  className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-sm text-white bg-accent-primary"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerForm;