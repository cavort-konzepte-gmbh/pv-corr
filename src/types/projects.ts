export interface Project {
  id: string;
  hiddenId: string;
  name: string;
  gates: Gate[];
  placeId?: string;
  companyId?: string;
  imageUrl?: string;
  clientRef?: string;
  latitude?: string;
  longitude?: string;
  managerId?: string;
  fields: Field[];
  activityLog?: ActivityLog[];
}

export interface Gate {
  id: string;
  hiddenId: string;
  name: string;
  latitude: string;
  longitude: string;
}

export interface Field {
  id: string;
  hiddenId: string;
  name: string;
  latitude?: string;
  longitude?: string;
  gates: Gate[];
  zones: Zone[];
}

export interface Zone {
  id: string;
  hiddenId: string;
  name: string;
  latitude?: string;
  longitude?: string;
  datapoints: Datapoint[];
}

export interface Datapoint {
  id: string;
  hiddenId: string;
  sequentialId: string;
  values: Record<string, string>;
  ratings: Record<string, number>;
  timestamp: string;
}

export interface ActivityLog {
  timestamp: string;
  datapointId: string;
  parameter: string;
  oldValue: string;
  newValue: string;
}