export interface Customer {
  id: string
  hiddenId: string
  name: string
  personId?: string
  companyId?: string
  person?: {
    firstName: string
    lastName: string
    email?: string
    phone?: string
  }
  company?: {
    name: string
    website?: string
    email?: string
    phone?: string
    vatId?: string
    registrationNumber?: string
  }
}
