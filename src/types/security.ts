export type NotificationDuration = 'timed' | 'acknowledge' | 'persistent';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error';
  name: string;
  description: string;
  duration: NotificationDuration;
  timeout?: number; // in seconds, for timed notifications
  created_at: string;
  acknowledged_at?: string;
  dismissed_at?: string;
}

export const DURATION_OPTIONS = [
  { value: 'timed', label: 'Timed (auto-dismisses after specified time)' },
  { value: 'acknowledge', label: 'Acknowledge (requires user acknowledgment)' },
  { value: 'persistent', label: 'Persistent (can be manually dismissed)' },
] as const;
