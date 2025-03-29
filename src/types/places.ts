export interface AddressField {
  id: string
  label: string
  type: 'text' | 'number'
  required: boolean
  placeholder?: string
}

export interface Country {
  id: string
  name: string
  code: string
  fields: AddressField[]
}

export const COUNTRIES: Country[] = [
  {
    id: 'usa',
    name: 'United States',
    code: 'USA',
    fields: [
      { id: 'name', label: 'Name', type: 'text', required: true },
      { id: 'street_number', label: 'Street Number', type: 'text', required: true },
      { id: 'street_name', label: 'Street Name', type: 'text', required: true },
      { id: 'apartment', label: 'Apartment/Unit Number', type: 'text', required: false },
      { id: 'city', label: 'City', type: 'text', required: true },
      { id: 'state', label: 'State', type: 'text', required: true },
      { id: 'zip', label: 'ZIP Code', type: 'text', required: true },
    ],
  },
  {
    id: 'germany',
    name: 'Germany',
    code: 'GERMANY',
    fields: [
      { id: 'name', label: 'Name', type: 'text', required: true },
      { id: 'street_name', label: 'Street Name', type: 'text', required: true },
      { id: 'house_number', label: 'House Number', type: 'text', required: true },
      { id: 'postal_code', label: 'Postal Code', type: 'text', required: true },
      { id: 'city', label: 'City', type: 'text', required: true },
    ],
  },
  {
    id: 'france',
    name: 'France',
    code: 'FRANCE',
    fields: [
      { id: 'name', label: 'Name', type: 'text', required: true },
      { id: 'street_number', label: 'Street Number', type: 'text', required: true },
      { id: 'street_name', label: 'Street Name', type: 'text', required: true },
      { id: 'postal_code', label: 'Postal Code', type: 'text', required: true },
      { id: 'city', label: 'City', type: 'text', required: true },
    ],
  },
  {
    id: 'italy',
    name: 'Italy',
    code: 'ITALY',
    fields: [
      { id: 'name', label: 'Name', type: 'text', required: true },
      { id: 'street_name', label: 'Street Name', type: 'text', required: true },
      { id: 'street_number', label: 'Street Number', type: 'text', required: true },
      { id: 'postal_code', label: 'Postal Code', type: 'text', required: true },
      { id: 'city', label: 'City', type: 'text', required: true },
      { id: 'province', label: 'Province Abbreviation', type: 'text', required: true },
    ],
  },
  {
    id: 'china',
    name: 'China',
    code: 'CHINA',
    fields: [
      { id: 'name', label: 'Name', type: 'text', required: true },
      { id: 'room', label: 'Room/Floor Number', type: 'text', required: true },
      { id: 'building', label: 'Building Name/Number', type: 'text', required: true },
      { id: 'street_number', label: 'Street Number', type: 'text', required: true },
      { id: 'street_name', label: 'Street Name', type: 'text', required: true },
      { id: 'district', label: 'District', type: 'text', required: true },
      { id: 'city', label: 'City', type: 'text', required: true },
      { id: 'province', label: 'Province', type: 'text', required: true },
      { id: 'postal_code', label: 'Postal Code', type: 'text', required: true },
    ],
  },
]
