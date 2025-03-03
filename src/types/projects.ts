export interface Datapoint {
  id: string;
  hiddenId: string;
  name?: string;
  sequentialId: string;
  type: string;
  values: Record<string, string>;
  ratings: Record<string, number>;
  timestamp: string;
}

/**
 * These types are are imported from others files in the project however
 * these types are not defined in the project.
 */
export type Zone = any
export type Project = any
export type Gate = any
export type Field = any