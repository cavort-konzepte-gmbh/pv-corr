import React from 'react';
import { Theme } from '../../types/theme';
import { Customer } from '../../types/customers';
import CustomerList from './elements/customers/CustomerList';
import { Plus } from 'lucide-react';

interface CustomersProps {
  currentTheme: Theme;
  customers: Customer[];
  savedPeople: Person[];
  savedCompanies: Company[];
  onSelectCustomer: (customerId: string) => void;
  onSelectUncategorized: () => void;
}

const Customers: React.FC<CustomersProps> = ({
  currentTheme,
  customers,
  savedPeople,
  savedCompanies,
  onSelectCustomer,
  onSelectUncategorized
}) => {
  return (
    <div className="p-6">
      <div 
        className="p-4 mb-4 rounded-lg border transition-all hover:translate-x-1 text-primary border-theme bg-surface hover:cursor-pointer"
        onClick={onSelectUncategorized}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">No Customer</span>
          </div>
        </div>
      </div>

      <CustomerList
        currentTheme={currentTheme}
        customers={customers}
        savedPeople={savedPeople}
        savedCompanies={savedCompanies}
        onSelectCustomer={onSelectCustomer}
      />
    </div>
  );
}

export default Customers;