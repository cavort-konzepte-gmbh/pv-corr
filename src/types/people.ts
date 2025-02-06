export interface PersonField {
  id: string;
  hiddenId: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'address';
  required: boolean;
  options?: string[];
}

export const PERSON_FIELDS: PersonField[] = [
  {
    id: 'salutation',
    label: 'Salutation',
    type: 'select',
    required: true,
    options: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.']
  },
  {
    id: 'title',
    label: 'Title',
    type: 'select',
    required: false,
    options: ['Dr.', 'Prof.']
  },
  {
    id: 'firstName',
    label: 'First Name',
    type: 'text',
    required: true
  },
  {
    id: 'lastName',
    label: 'Last Name',
    type: 'text',
    required: true
  },
  {
    id: 'email',
    label: 'Email Address',
    type: 'email',
    required: true
  },
  {
    id: 'phone',
    label: 'Phone Number',
    type: 'tel',
    required: false
  },
  {
    id: 'privateAddress',
    label: 'Private Address',
    type: 'address',
    required: false
  },
  {
    id: 'businessAddress',
    label: 'Business Address',
    type: 'address',
    required: false
  }
];