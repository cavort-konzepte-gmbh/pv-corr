import { supabase } from '../lib/supabase'
import { Customer } from '../types/customers'
import { toCase } from '../utils/cases'

export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select(
        `
        *,
        person:person_id (
          first_name,
          last_name,
          email,
          phone
        ),
        company:company_id (
          name,
          website,
          email,
          phone,
          vat_id,
          registration_number
        )
      `,
      )
      .order('created_at', { ascending: true })

    if (error) throw error
    return data.map((customer) => toCase<Customer>(customer, 'camelCase'))
  } catch (err) {
    console.error('Error fetching customers:', err)
    throw new Error('Failed to fetch customers')
  }
}

export const createCustomer = async (customer: { name: string; personId?: string; companyId?: string }) => {
  try {
    // Validate that either personId or companyId is provided, but not both
    if ((!customer.personId && !customer.companyId) || (customer.personId && customer.companyId)) {
      throw new Error('Must provide either a person or company ID')
    }

    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: customer.name,
        person_id: customer.personId,
        company_id: customer.companyId,
        hidden_id: generateHiddenId(),
      })
      .select(
        `
        *,
        person:person_id (
          first_name,
          last_name,
          email,
          phone
        ),
        company:company_id (
          name,
          website,
          email,
          phone,
          vat_id,
          registration_number
        )
      `,
      )
      .single()

    if (error) throw error
    return toCase<Customer>(data, 'camelCase')
  } catch (err) {
    console.error('Error creating customer:', err)
    throw err
  }
}

export const updateCustomer = async (
  customerId: string,
  customer: {
    name?: string
    personId?: string
    companyId?: string
  },
) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(toCase(customer, 'snakeCase'))
      .eq('id', customerId)
      .select(
        `
        *,
        person:person_id (
          first_name,
          last_name,
          email,
          phone
        ),
        company:company_id (
          name,
          website,
          email,
          phone,
          vat_id,
          registration_number
        )
      `,
      )
      .single()

    if (error) throw error
    return toCase<Customer>(data, 'camelCase')
  } catch (err) {
    console.error('Error updating customer:', err)
    throw err
  }
}

export const deleteCustomer = async (customerId: string) => {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', customerId)

    if (error) throw error
  } catch (err) {
    console.error('Error deleting customer:', err)
    throw err
  }
}
