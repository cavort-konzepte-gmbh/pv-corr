import React from "react";
import { Theme } from "../../types/theme";
import { Customer } from "../../types/customers";
import { ChevronRight } from "lucide-react";
import CustomerList from "./elements/customers/CustomerList";
import { Person } from "../../types/people";
import { Company } from "../../types/companies";

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
  onSelectUncategorized,
}) => {
  return (
    <div className="p-6">
      <div
        className="p-4 border transition-all hover:translate-x-1 text-primary hover:cursor-pointer mb-4 bg-card rounded-sm"
        onClick={onSelectUncategorized}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">No Customer</span>
          </div>
          <ChevronRight className="text-secondary" size={16} />
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
};

export default Customers;
