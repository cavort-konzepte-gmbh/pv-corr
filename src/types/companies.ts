export interface Company {
  id: string
  hiddenId: string
  name: string
  ceoId?: string
  contactPersonId?: string
  website?: string
  email?: string
  phone?: string
  vatId?: string
  registrationNumber?: string
}

export interface CompanyField {
  id: string
  label: string
  type: 'text' | 'email' | 'tel' | 'url'
  required: boolean
}

export const COMPANY_FIELDS: CompanyField[] = [
  {
    id: 'name',
    label: 'company.name',
    type: 'text',
    required: true,
  },
  {
    id: 'website',
    label: 'company.website',
    type: 'url',
    required: false,
  },
  {
    id: 'email',
    label: 'company.email',
    type: 'email',
    required: false,
  },
  {
    id: 'phone',
    label: 'company.phone',
    type: 'tel',
    required: false,
  },
  {
    id: 'vatId',
    label: 'company.vat_id',
    type: 'text',
    required: false,
  },
  {
    id: 'registrationNumber',
    label: 'company.registration_number',
    type: 'text',
    required: false,
  },
]
