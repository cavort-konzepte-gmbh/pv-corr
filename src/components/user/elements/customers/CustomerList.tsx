import React from 'react';
import { Theme } from '../../../../types/theme';
import { Customer } from '../../../../types/customers';
import { Building2, ChevronRight, Mail, Phone, Link, User } from 'lucide-react';
import { Person } from '../../../../types/people';
import { Company } from '../../../../types/companies';

interface CustomerListProps {
  currentTheme: Theme;
  customers: Customer[];
  savedPeople: Person[];
  savedCompanies: Company[];
  onSelectCustomer: (customerId: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  currentTheme,
  customers,
  savedPeople,
  savedCompanies,
  onSelectCustomer
}) => {
  return (
    <div className="space-y-4">
      {customers.map(customer => (
        <div
          key={customer.id}
          className="p-4 rounded-lg border transition-all hover:translate-x-1 text-primary border-theme bg-surface hover:cursor-pointer"
          onClick={() => onSelectCustomer(customer.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {customer.personId ? (
                <User className="text-accent-primary" size={16} />
              ) : (
                <Building2 className="text-accent-primary" size={16} />
              )}
              <span className="font-medium">{customer.name}</span>
            </div>
            <ChevronRight className="text-secondary" size={16} />
          </div>
          <div className="text-sm space-y-1 text-secondary">
            {customer.personId && (
              <>
                {(() => {
                  const person = savedPeople.find(p => p.id === customer.personId);
                  return person && (
                    <div>{person.firstName} {person.lastName}</div>
                  );
                })()}
                {customer.person?.email && (
                  <a
                    href={`mailto:${customer.person.email}`}
                    className="flex items-center gap-2 hover:underline text-accent-primary"
                    onClick={e => e.stopPropagation()}
                  >
                    <Mail size={12} />
                    {customer.person.email}
                  </a>
                )}
                {customer.person?.phone && (
                  <a
                    href={`tel:${customer.person.phone}`}
                    className="flex items-center gap-2 hover:underline text-accent-primary"
                    onClick={e => e.stopPropagation()}
                  >
                    <Phone size={12} />
                    {customer.person.phone}
                  </a>
                )}
              </>
            )}
            {customer.companyId && (
              <>
                {(() => {
                  const company = savedCompanies.find(c => c.id === customer.companyId);
                  return company && (
                    <>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:underline text-accent-primary"
                          onClick={e => e.stopPropagation()}
                        >
                          <Link size={12} />
                          {company.website}
                        </a>
                      )}
                      {company.email && (
                        <a
                          href={`mailto:${company.email}`}
                          className="flex items-center gap-2 hover:underline text-accent-primary"
                          onClick={e => e.stopPropagation()}
                        >
                          <Mail size={12} />
                          {company.email}
                        </a>
                      )}
                      {company.phone && (
                        <a
                          href={`tel:${company.phone}`}
                          className="flex items-center gap-2 hover:underline text-accent-primary"
                          onClick={e => e.stopPropagation()}
                        >
                          <Phone size={12} />
                          {company.phone}
                        </a>
                      )}
                      {company.vatId && (
                        <div>VAT ID: {company.vatId}</div>
                      )}
                      {company.registrationNumber && (
                        <div>Reg. No.: {company.registrationNumber}</div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerList;