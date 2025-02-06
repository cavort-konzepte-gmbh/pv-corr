import { SavedPlace } from '../components/PlacesPanel';
import { COUNTRIES } from '../types/places';
import { Company } from '../types/companies';

export interface SavedPerson {
  id: string;
  values: Record<string, string>;
  addresses: {
    homeAddress?: string;
    business?: string;
  };
}

const FIRST_NAMES_MALE = [
  'James', 'John', 'Robert', 'Michael', 'William',
  'David', 'Richard', 'Joseph', 'Thomas', 'Charles'
];

const FIRST_NAMES_FEMALE = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth',
  'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'
];

const COMPANY_NAMES = [
  'Tech Solutions', 'Global Industries', 'Innovation Labs',
  'Digital Dynamics', 'Future Systems', 'Smart Solutions',
  'Peak Performance', 'Elite Enterprises', 'Prime Partners',
  'Strategic Services'
];

const COMPANY_DESCRIPTIONS = [
  'Construction & Engineering',
  'Infrastructure Development',
  'Building Solutions',
  'Civil Engineering',
  'Project Management'
];

const generateRandomCompanies = (count: number, places: SavedPlace[], people: SavedPerson[]): Company[] => {
  const companies: Company[] = [];
  
  for (let i = 0; i < count; i++) {
    const companyName = `${pickRandom(COMPANY_NAMES)} ${pickRandom(COMPANY_DESCRIPTIONS)}`;
    const vatId = `VAT${generateRandomNumber(100000000, 999999999)}`;
    const regNumber = `REG${generateRandomNumber(10000, 99999)}`;
    
    companies.push({
      id: `sample-company-${i + 1}`,
      hiddenId: generateHiddenId(),
      name: companyName,
      placeId: places.length > 0 ? pickRandom(places).id : undefined,
      ceoId: people.length > 0 ? pickRandom(people).id : undefined,
      contactPersonId: people.length > 0 ? pickRandom(people).id : undefined,
      website: `https://www.${companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.example.com`,
      email: `info@${companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.example.com`,
      phone: `+${generateRandomNumber(1, 9)}${generateRandomNumber(100000000, 999999999)}`,
      vatId,
      registrationNumber: regNumber
    });
  }
  
  return companies;
};

const STREET_NAMES = {
  usa: ['Main Street', 'Broadway', 'Park Avenue', 'Oak Street', 'Maple Drive'],
  germany: ['Hauptstraße', 'Schulstraße', 'Bahnhofstraße', 'Kirchstraße', 'Gartenstraße'],
  france: ['Rue de la Paix', 'Avenue des Champs-Élysées', 'Boulevard Saint-Germain'],
  italy: ['Via Roma', 'Corso Italia', 'Via Veneto', 'Via Nazionale', 'Corso Vittorio Emanuele'],
  china: ['Nanjing Road', 'Huaihai Road', 'Century Avenue', 'Zhongshan Road', 'Jianguo Road']
};

const CITIES = {
  usa: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
  germany: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt'],
  france: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
  italy: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence'],
  china: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu']
};

const STATES = {
  usa: ['NY', 'CA', 'IL', 'TX', 'AZ'],
  china: ['Shanghai', 'Beijing', 'Guangdong', 'Sichuan', 'Zhejiang']
};

const generateRandomNumber = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = <T>(array: T[]): T => 
  array[Math.floor(Math.random() * array.length)];

const generateRandomPlaces = (count: number): SavedPlace[] => {
  const places: SavedPlace[] = [];
  
  for (let i = 0; i < count; i++) {
    const country = pickRandom(COUNTRIES);
    const companyName = `${pickRandom(COMPANY_NAMES)} ${country.name}`;
    
    let values: Record<string, string> = {
      name: companyName
    };

    switch (country.id) {
      case 'usa':
        values = {
          ...values,
          street_number: generateRandomNumber(1, 999).toString(),
          street_name: pickRandom(STREET_NAMES.usa),
          city: pickRandom(CITIES.usa),
          state: pickRandom(STATES.usa),
          zip: generateRandomNumber(10000, 99999).toString()
        };
        break;
      case 'germany':
        values = {
          ...values,
          street_name: pickRandom(STREET_NAMES.germany),
          house_number: generateRandomNumber(1, 150).toString(),
          postal_code: generateRandomNumber(10000, 99999).toString(),
          city: pickRandom(CITIES.germany)
        };
        break;
      case 'france':
        values = {
          ...values,
          street_number: generateRandomNumber(1, 200).toString(),
          street_name: pickRandom(STREET_NAMES.france),
          postal_code: generateRandomNumber(10000, 99999).toString(),
          city: pickRandom(CITIES.france)
        };
        break;
      case 'italy':
        values = {
          ...values,
          street_name: pickRandom(STREET_NAMES.italy),
          street_number: generateRandomNumber(1, 200).toString(),
          postal_code: generateRandomNumber(10000, 99999).toString(),
          city: pickRandom(CITIES.italy),
          province: pickRandom(['MI', 'RM', 'NA', 'TO', 'FI'])
        };
        break;
      case 'china':
        values = {
          ...values,
          room: `${generateRandomNumber(1, 50)}F-${generateRandomNumber(1, 20)}`,
          building: `${companyName} Building`,
          street_number: generateRandomNumber(1, 999).toString(),
          street_name: pickRandom(STREET_NAMES.china),
          district: pickRandom(['Pudong', 'Huangpu', 'Jing\'an', 'Xuhui']),
          city: pickRandom(CITIES.china),
          province: pickRandom(STATES.china),
          postal_code: generateRandomNumber(100000, 999999).toString()
        };
        break;
    }

    places.push({
      id: `sample-${i + 1}`,
      hiddenId: generateHiddenId(),
      country: country.id,
      values
    });
  }

  return places;
};

const generateRandomPeople = (count: number, places: SavedPlace[]) => {
  const people = [];
  
  // If no places are available, return empty array
  if (!places || places.length === 0) {
    return [];
  }
  
  for (let i = 0; i < count; i++) {
    const isFemale = Math.random() < 0.5;
    const firstName = pickRandom(isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE);
    const lastName = pickRandom(LAST_NAMES);
    const hasTitle = Math.random() < 0.3;
    
    const person = {
      id: `sample-person-${i + 1}`,
      hiddenId: generateHiddenId(),
      values: {
        salutation: isFemale ? pickRandom(['Mrs.', 'Ms.']) : 'Mr.',
        title: hasTitle ? pickRandom(['Dr.', 'Prof.']) : '',
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+${generateRandomNumber(1, 9)}${generateRandomNumber(100000000, 999999999)}`
      },
      addresses: {
        homeAddress: places.length > 0 ? pickRandom(places).id : undefined,
        business: places.length > 0 ? pickRandom(places).id : undefined
      }
    };
    
    people.push(person);
  }
  
  return people;
};

import { generateHiddenId } from './generateHiddenId';

// Initialize activity log for sample data
const generateInitialActivityLog = () => [
  {
    timestamp: new Date('2024-01-15T10:30:00').toISOString(),
    datapointId: 'dp-1',
    parameter: 'pH value (Z4)',
    oldValue: '7.0',
    newValue: '7.2'
  },
  {
    timestamp: new Date('2024-01-16T14:20:00').toISOString(),
    datapointId: 'dp-2',
    parameter: 'Water content (Z3)',
    oldValue: '25',
    newValue: '30'
  },
  {
    timestamp: new Date('2024-01-20T09:15:00').toISOString(),
    datapointId: 'dp-6',
    parameter: 'Sulphate content (Z8)',
    oldValue: '4.5',
    newValue: '5.2'
  }
];

const generateRandomDatapoint = (id: string, sequentialId: string, timestamp: string) => ({
  id,
  hiddenId: generateHiddenId(),
  sequentialId,
  type: 'DIN50929-3:2018',
  timestamp,
  values: {
    z1: generateRandomNumber(0, 100).toString(),
    z2: generateRandomNumber(10, 1000).toString(),
    z3: generateRandomNumber(0, 60).toString(),
    z4: (generateRandomNumber(0, 140) / 10).toString(),
    z5: generateRandomNumber(0, 30).toString(),
    z6: generateRandomNumber(0, 20).toString(),
    z7: generateRandomNumber(0, 15).toString(),
    z8: (generateRandomNumber(0, 200) / 10).toString(),
    z9: generateRandomNumber(0, 150).toString(),
    z10: pickRandom(['never', 'constant', 'intermittent'])
  },
  ratings: {
    z1: pickRandom([-4, -2, 0, 2, 4]),
    z2: pickRandom([-6, -4, -2, 0, 2, 4]),
    z3: pickRandom([-2, -1, 0]),
    z4: pickRandom([-2, -1, 0]),
    z5: pickRandom([-3, -2, -1, 0]),
    z6: pickRandom([-2, -1, 0, 1]),
    z7: pickRandom([-6, -3, 0]),
    z8: pickRandom([-3, -2, -1, 0]),
    z9: pickRandom([-4, -3, -2, -1, 0]),
    z10: pickRandom([-2, -1, 0])
  }
});

const generateInitialHistory = (datapointId: string, timestamp: string) => {
  const parameters = ['z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7', 'z8', 'z9', 'z10'];
  const initialEntries = [];
  
  // Generate 2-3 random history entries for each datapoint
  const numEntries = generateRandomNumber(2, 3);
  
  for (let i = 0; i < numEntries; i++) {
    const param = pickRandom(parameters);
    const oldValue = generateRandomNumber(0, 100).toString();
    const newValue = generateRandomNumber(0, 100).toString();
    
    initialEntries.push({
      timestamp: new Date(new Date(timestamp).getTime() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      datapointId,
      parameter: param.toUpperCase(),
      oldValue,
      newValue
    });
  }
  
  return initialEntries;
};

const generateSampleProjects = () => [
  {
    id: 'project-1',
    hiddenId: generateHiddenId(),
    name: 'Pipeline Network East',
    imageUrl: 'https://imagizer.imageshack.com/img924/3171/H6IMCR.png',
    placeId: 'sample-1', // Link to first sample place
    managerId: 'sample-person-1', // Link to first sample person
    companyId: 'sample-company-1', // Link to first sample company
    clientRef: 'PRJ-2024-001',
    latitude: '51.5074',
    longitude: '-0.1278',
    activityLog: generateInitialActivityLog(),
    fields: [
      {
        id: 'field-1',
        hiddenId: generateHiddenId(),
        name: 'Industrial Area',
        gates: [],
        latitude: '51.5080',
        longitude: '-0.1280',
        gates: [
          {
            id: 'gate-1',
            hiddenId: generateHiddenId(),
            name: 'Main Entrance',
            latitude: '51.5080',
            longitude: '-0.1275'
          },
          {
            id: 'gate-2',
            hiddenId: generateHiddenId(),
            name: 'Service Gate',
            latitude: '51.5068',
            longitude: '-0.1282'
          }
        ],
        zones: [
          {
            id: 'zone-1',
            hiddenId: generateHiddenId(),
            name: 'Section A-1',
            latitude: '51.5082',
            longitude: '-0.1282',
            datapoints: Array.from({ length: 5 }, (_, i) => {
              const timestamp = new Date(2024, 0, 15 + i).toISOString();
              const datapointId = `dp-${i + 1}`;
              const datapoint = generateRandomDatapoint(
                `dp-${i + 1}`,
                `DP${String(i + 1).padStart(3, '0')}`,
                timestamp
              );
              return datapoint;
            })
          },
          {
            id: 'zone-2',
            hiddenId: `hidden-zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: 'Section A-2',
            latitude: '51.5078',
            longitude: '-0.1285',
            datapoints: Array.from({ length: 3 }, (_, i) => 
              generateRandomDatapoint(
                `dp-${i + 6}`,
                `DP${String(i + 6).padStart(3, '0')}`,
                new Date(2024, 0, 20 + i).toISOString()
              )
            )
          },
          {
            id: 'zone-3',
            hiddenId: `hidden-zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: 'Section A-3',
            latitude: '51.5076',
            longitude: '-0.1288',
            datapoints: Array.from({ length: 4 }, (_, i) => 
              generateRandomDatapoint(
                `dp-${i + 9}`,
                `DP${String(i + 9).padStart(3, '0')}`,
                new Date(2024, 0, 25 + i).toISOString()
              )
            )
          }
        ]
      },
      {
        id: 'field-2',
        hiddenId: `hidden-field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'Residential District',
        gates: [],
        latitude: '51.5070',
        longitude: '-0.1290',
        gates: [
          {
            id: 'gate-3',
            hiddenId: generateHiddenId(),
            name: 'Emergency Exit',
            latitude: '51.5072',
            longitude: '-0.1270'
          }
        ],
        zones: [
          {
            id: 'zone-4',
            hiddenId: `hidden-zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: 'Block R-1',
            latitude: '51.5068',
            longitude: '-0.1292',
            datapoints: Array.from({ length: 6 }, (_, i) => 
              generateRandomDatapoint(
                `dp-${i + 13}`,
                `DP${String(i + 13).padStart(3, '0')}`,
                new Date(2024, 1, 1 + i).toISOString()
              )
            )
          },
          {
            id: 'zone-5',
            hiddenId: `hidden-zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: 'Block R-2',
            latitude: '51.5066',
            longitude: '-0.1294',
            datapoints: Array.from({ length: 4 }, (_, i) => 
              generateRandomDatapoint(
                `dp-${i + 19}`,
                `DP${String(i + 19).padStart(3, '0')}`,
                new Date(2024, 1, 7 + i).toISOString()
              )
            )
          }
        ]
      },
      {
        id: 'field-3',
        hiddenId: `hidden-field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'Commercial Zone',
        gates: [],
        latitude: '51.5064',
        longitude: '-0.1296',
        gates: [],
        zones: [
          {
            id: 'zone-6',
            hiddenId: `hidden-zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: 'Shopping District',
            latitude: '51.5062',
            longitude: '-0.1298',
            datapoints: Array.from({ length: 5 }, (_, i) => 
              generateRandomDatapoint(
                `dp-${i + 23}`,
                `DP${String(i + 23).padStart(3, '0')}`,
                new Date(2024, 1, 15 + i).toISOString()
              )
            )
          }
        ]
      }
    ],
    activityLog: [
      {
        timestamp: new Date('2024-01-15T10:30:00').toISOString(),
        datapointId: 'dp-1',
        parameter: 'pH value (Z4)',
        oldValue: '7.0',
        newValue: '7.2'
      },
      {
        timestamp: new Date('2024-01-16T14:20:00').toISOString(),
        datapointId: 'dp-2',
        parameter: 'Water content (Z3)',
        oldValue: '25',
        newValue: '30'
      },
      {
        timestamp: new Date('2024-01-20T09:15:00').toISOString(),
        datapointId: 'dp-6',
        parameter: 'Sulphate content (Z8)',
        oldValue: '4.5',
        newValue: '5.2'
      }
    ]
  },
  {
    id: 'project-2',
    hiddenId: `hidden-project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Urban Distribution System',
    placeId: 'sample-2', // Link to second sample place
    managerId: 'sample-person-2', // Link to second sample person
    companyId: 'sample-company-2', // Link to second sample company
    clientRef: 'PRJ-2024-002',
    latitude: '48.8566',
    longitude: '2.3522',
    activityLog: [],
    fields: [
      {
        id: 'field-3',
        hiddenId: `hidden-field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'City Center',
        latitude: '48.8570',
        longitude: '2.3525',
        gates: [
          {
            id: 'gate-4',
            hiddenId: generateHiddenId(),
            name: 'North Gate',
            latitude: '48.8570',
            longitude: '2.3525'
          }
        ],
        zones: [
          {
            id: 'zone-4',
            hiddenId: `hidden-zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: 'Main Square',
            latitude: '48.8572',
            longitude: '2.3528',
            datapoints: Array.from({ length: 4 }, (_, i) => 
              generateRandomDatapoint(
                `dp-${i + 28}`,
                `DP${String(i + 28).padStart(3, '0')}`,
                new Date(2024, 2, 1 + i).toISOString()
              )
            )
          },
          {
            id: 'zone-5',
            hiddenId: `hidden-zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: 'Business District',
            latitude: '48.8574',
            longitude: '2.3530',
            datapoints: Array.from({ length: 3 }, (_, i) => 
              generateRandomDatapoint(
                `dp-${i + 32}`,
                `DP${String(i + 32).padStart(3, '0')}`,
                new Date(2024, 2, 5 + i).toISOString()
              )
            )
          }
        ]
      },
      {
        id: 'field-4',
        hiddenId: `hidden-field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'Harbor Area',
        latitude: '48.8562',
        longitude: '2.3520',
        gates: [
          {
            id: 'gate-5',
            hiddenId: generateHiddenId(),
            name: 'South Gate',
            latitude: '48.8562',
            longitude: '2.3520'
          }
        ],
        zones: [
          {
            id: 'zone-6',
            hiddenId: `hidden-zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: 'Dock Section 1',
            latitude: '48.8560',
            longitude: '2.3518',
            datapoints: Array.from({ length: 5 }, (_, i) => 
              generateRandomDatapoint(
                `dp-${i + 35}`,
                `DP${String(i + 35).padStart(3, '0')}`,
                new Date(2024, 2, 10 + i).toISOString()
              )
            )
          },
          {
            id: 'zone-7',
            hiddenId: `hidden-zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: 'Dock Section 2',
            latitude: '48.8558',
            longitude: '2.3516',
            datapoints: Array.from({ length: 4 }, (_, i) => 
              generateRandomDatapoint(
                `dp-${i + 40}`,
                `DP${String(i + 40).padStart(3, '0')}`,
                new Date(2024, 2, 15 + i).toISOString()
              )
            )
          }
        ]
      }
    ]
  }
];

export { 
  generateRandomPlaces, 
  generateRandomPeople, 
  generateSampleProjects,
  generateRandomCompanies 
};