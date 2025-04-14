import React from "react";
import { Theme } from "../../../../types/theme";
import { Customer } from "../../../../types/customers";
import { Building2, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Person } from "../../../../types/people";
import { Company } from "../../../../types/companies";

interface CustomerListProps {
  currentTheme: Theme;
  customers: Customer[];
  savedPeople: Person[];
  savedCompanies: Company[];
  onSelectCustomer: (customerId: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ currentTheme, customers, savedPeople, savedCompanies, onSelectCustomer }) => {
  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <div
          onClick={() => onSelectCustomer(customer.id)}
          key={customer.id}
          className="p-4 border transition-all border-accent hover:cursor-pointer bg-card hover:bg-muted/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {customer.personId ? (
                <User className="text-accent-primary" size={16} />
              ) : (
                <Building2 className="text-accent-primary" size={16} />
              )}
              <span className="font-medium">{customer.name}</span>
            </div>
            <ChevronRight className="text-foreground" size={16} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerList;
