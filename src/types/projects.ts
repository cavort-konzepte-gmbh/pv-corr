export interface Zone {
  id: string;
  hiddenId: string;
  name: string;
  latitude?: string;
  longitude?: string;
  substructureId?: string;
  foundationId?: string;
  datapoints: Datapoint[];
}