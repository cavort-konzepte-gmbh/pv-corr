export interface Person {
  id: string;
  hiddenId: string;
  salutation: string;
  title?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface PersonField {
  id: string;
  hiddenId?: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "address";
  required: boolean;
  options?: string[];
}

export const PERSON_FIELDS: PersonField[] = [
  {
    id: "salutation",
    label: "people.salutation",
    type: "select",
    required: true,
    options: ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."],
  },
  {
    id: "title",
    label: "people.title",
    type: "select",
    required: false,
    options: ["Dr.", "Prof."],
  },
  {
    id: "firstName",
    label: "people.firstName",
    type: "text",
    required: true,
  },
  {
    id: "lastName",
    label: "people.lastName",
    type: "text",
    required: true,
  },
  {
    id: "email",
    label: "company.email",
    type: "email",
    required: true,
  },
  {
    id: "phone",
    label: "company.phone",
    type: "tel",
    required: false,
  },
];
