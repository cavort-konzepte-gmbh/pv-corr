/*
  # Add Companies, Places and People Schema

  1. New Tables
    - `places`
      - `id` (uuid, primary key)
      - `name` (text)
      - `hidden_id` (text)
      - `country` (text)
      - `values` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `people`
      - `id` (uuid, primary key)
      - `hidden_id` (text)
      - `values` (jsonb)
      - `private_address_id` (uuid, foreign key to places)
      - `business_address_id` (uuid, foreign key to places)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `companies`
      - `id` (uuid, primary key)
      - `hidden_id` (text)
      - `name` (text)
      - `website` (text)
      - `email` (text)
      - `phone` (text)
      - `vat_id` (text)
      - `registration_number` (text)
      - `place_id` (uuid, foreign key to places)
      - `ceo_id` (uuid, foreign key to people)
      - `contact_person_id` (uuid, foreign key to people)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Sample Data
    - Add sample places, people and companies
*/

-- Create places table
CREATE TABLE IF NOT EXISTS places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hidden_id text NOT NULL,
  country text NOT NULL,
  values jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create people table
CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hidden_id text NOT NULL,
  values jsonb NOT NULL DEFAULT '{}',
  private_address_id uuid REFERENCES places(id),
  business_address_id uuid REFERENCES places(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hidden_id text NOT NULL,
  name text NOT NULL,
  website text,
  email text,
  phone text,
  vat_id text,
  registration_number text,
  place_id uuid REFERENCES places(id),
  ceo_id uuid REFERENCES people(id),
  contact_person_id uuid REFERENCES people(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key references to projects table
ALTER TABLE projects
  ADD COLUMN place_id uuid REFERENCES places(id),
  ADD COLUMN company_id uuid REFERENCES companies(id),
  ADD COLUMN manager_id uuid REFERENCES people(id);

-- Enable Row Level Security
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_people_private_address ON people(private_address_id);
CREATE INDEX IF NOT EXISTS idx_people_business_address ON people(business_address_id);
CREATE INDEX IF NOT EXISTS idx_companies_place ON companies(place_id);
CREATE INDEX IF NOT EXISTS idx_companies_ceo ON companies(ceo_id);
CREATE INDEX IF NOT EXISTS idx_companies_contact ON companies(contact_person_id);
CREATE INDEX IF NOT EXISTS idx_projects_place ON projects(place_id);
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(manager_id);

-- Create RLS policies for places
CREATE POLICY "Users can view all places"
  ON places
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create places"
  ON places
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update places"
  ON places
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete places"
  ON places
  FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for people
CREATE POLICY "Users can view all people"
  ON people
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create people"
  ON people
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update people"
  ON people
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete people"
  ON people
  FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS policies for companies
CREATE POLICY "Users can view all companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete companies"
  ON companies
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_places_updated_at
  BEFORE UPDATE ON places
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data
-- Sample Places
INSERT INTO places (id, name, hidden_id, country, values) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Tech Solutions HQ', 'abc123', 'usa', '{"street_number": "123", "street_name": "Main Street", "city": "New York", "state": "NY", "zip": "10001"}'),
  ('22222222-2222-2222-2222-222222222222', 'Innovation Labs Berlin', 'def456', 'germany', '{"street_name": "Hauptstraße", "house_number": "45", "postal_code": "10115", "city": "Berlin"}'),
  ('33333333-3333-3333-3333-333333333333', 'Digital Dynamics Paris', 'ghi789', 'france', '{"street_number": "78", "street_name": "Rue de la Paix", "postal_code": "75002", "city": "Paris"}');

-- Sample People
INSERT INTO people (id, hidden_id, values, private_address_id, business_address_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'person123', '{"salutation": "Mr.", "title": "Dr.", "firstName": "John", "lastName": "Smith", "email": "john.smith@example.com", "phone": "+1234567890"}', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'person456', '{"salutation": "Ms.", "firstName": "Sarah", "lastName": "Johnson", "email": "sarah.j@example.com", "phone": "+0987654321"}', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'person789', '{"salutation": "Mrs.", "title": "Prof.", "firstName": "Emma", "lastName": "Davis", "email": "emma.d@example.com", "phone": "+1122334455"}', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111');

-- Sample Companies
INSERT INTO companies (id, hidden_id, name, website, email, phone, vat_id, registration_number, place_id, ceo_id, contact_person_id) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'company123', 'Tech Solutions Global', 'https://www.techsolutions.example.com', 'info@techsolutions.example.com', '+1234567890', 'VAT123456789', 'REG123456', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'company456', 'Innovation Labs', 'https://www.innovationlabs.example.com', 'contact@innovationlabs.example.com', '+0987654321', 'VAT987654321', 'REG987654', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'company789', 'Digital Dynamics', 'https://www.digitaldynamics.example.com', 'hello@digitaldynamics.example.com', '+1122334455', 'VAT112233445', 'REG112233', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');