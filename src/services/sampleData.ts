{
    id: 'project-1',
    hiddenId: generateHiddenId(),
    name: 'Pipeline Network East',
    imageUrl: 'https://imagizer.imageshack.com/img924/3171/H6IMCR.png',
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
  }