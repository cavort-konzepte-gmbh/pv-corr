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
        <table
          key={customer.id}
          className="w-full border-collapse rounded-lg border transition-all hover:translate-x-1 text-primary border-theme bg-surface hover:cursor-pointer"
          onClick={() => onSelectCustomer(customer.id)}
        >
          <thead>
            <tr>
              <th colSpan={2} className="p-4 text-left border-b font-semibold border-theme">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {customer.personId ? (
                      <User className="text-accent-primary" size={16} />
                    ) : (
                      <Building2 className="text-accent-primary" size={16} />
                    )}
                    <span>{customer.name}</span>
                  </div>
                  <ChevronRight className="text-secondary" size={16} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {customer.personId && (() => {
              const person = savedPeople.find(p => p.id === customer.personId);
              return person && (
                <>
                  <tr>
                    <td className="p-2 border-b border-r border-theme w-1/4 text-secondary">Name</td>
                    <td className="p-2 border-b border-theme">{person.firstName} {person.lastName}</td>
                  </tr>
                  {person.email && (
                    <tr>
                      <td className="p-2 border-b border-r border-theme w-1/4 text-secondary">Email</td>
                      <td className="p-2 border-b border-theme">
                        <a href={`mailto:${person.email}`} onClick={e => e.stopPropagation()} className="text-accent-primary hover:underline">
                          {person.email}
                        </a>
                      </td>
                    </tr>
                  )}
                  {person.phone && (
                    <tr>
                      <td className="p-2 border-b border-r border-theme w-1/4 text-secondary">Phone</td>
                      <td className="p-2 border-b border-theme">
                        <a href={`tel:${person.phone}`} onClick={e => e.stopPropagation()} className="text-accent-primary hover:underline">
                          {person.phone}
                        </a>
                      </td>
                    </tr>
                  )}
                </>
              );
            })()}
            {customer.companyId && (() => {
              const company = savedCompanies.find(c => c.id === customer.companyId);
              return company && (
                <>
                  {company.website && (
                    <tr>
                      <td className="p-2 border-b border-r border-theme w-1/4 text-secondary">Website</td>
                      <td className="p-2 border-b border-theme">
                        <a href={company.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-accent-primary hover:underline">
                          {company.website}
                        </a>
                      </td>
                    </tr>
                  )}
                  {company.email && (
                    <tr>
                      <td className="p-2 border-b border-r border-theme w-1/4 text-secondary">Email</td>
                      <td className="p-2 border-b border-theme">
                        <a href={`mailto:${company.email}`} onClick={e => e.stopPropagation()} className="text-accent-primary hover:underline">
                          {company.email}
                        </a>
                      </td>
                    </tr>
                  )}
                  {company.phone && (
                    <tr>
                      <td className="p-2 border-b border-r border-theme w-1/4 text-secondary">Phone</td>
                      <td className="p-2 border-b border-theme">
                        <a href={`tel:${company.phone}`} onClick={e => e.stopPropagation()} className="text-accent-primary hover:underline">
                          {company.phone}
                        </a>
                      </td>
                    </tr>
                  )}
                  {company.vatId && (
                    <tr>
                      <td className="p-2 border-b border-r border-theme w-1/4 text-secondary">VAT ID</td>
                      <td className="p-2 border-b border-theme">{company.vatId}</td>
                    </tr>
                  )}
                  {company.registrationNumber && (
                    <tr>
                      <td className="p-2 border-r border-theme w-1/4 text-secondary">Reg. No.</td>
                      <td className="p-2 border-theme">{company.registrationNumber}</td>
                    </tr>
                  )}
                </>
              );
            })()}
          </tbody>
        </table>
      ))}
    </div>
  );
};

export default CustomerList;