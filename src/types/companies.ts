export interface Company {
  id: string;
  hiddenId: string;
  name: string;
  placeId?: string;
  ceoId?: string;
  contactPersonId?: string;
  website?: string;
  email?: string;
  phone?: string;
  vatId?: string;
  registrationNumber?: string;
}

export interface CompanyField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url';
  required: boolean;
}

export const COMPANY_FIELDS: CompanyField[] = [
  {
    id: 'name',
    label: 'Company Name',
    type: 'text',
    required: true
  },
  {
    id: 'website',
    label: 'Website',
    type: 'url',
    required: false
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    required: false
  },
  {
    id: 'phone',
    label: 'Phone',
    type: 'tel',
    required: false
  },
  {
    id: 'vatId',
    label: 'VAT ID',
    type: 'text',
    required: false
  },
  {
    id: 'registrationNumber',
    label: 'Registration Number',
    type: 'text',
    required: false
  }
];