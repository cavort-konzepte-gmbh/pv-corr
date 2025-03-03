import React from 'react';
import { Theme } from '../../types/theme';
import { Customer } from '../../types/customers';
import { ChevronRight } from 'lucide-react';
import CustomerList from './elements/customers/CustomerList';
import { Person } from '../../types/people';
import { Company } from '../../types/companies';

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
      <table
        className="w-full border-collapse rounded-lg border transition-all hover:translate-x-1 text-primary border-theme bg-surface hover:cursor-pointer mb-4"
        onClick={onSelectUncategorized}
      >
        <thead>
          <tr>
            <th colSpan={2} className="p-4 text-left border-b font-semibold border-theme">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>No Customer</span>
                </div>
                <ChevronRight className="text-secondary" size={16} />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-r border-theme w-1/4 text-secondary">Projects</td>
            <td className="p-2 border-theme">Uncategorized projects</td>
          </tr>
        </tbody>
      </table>

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