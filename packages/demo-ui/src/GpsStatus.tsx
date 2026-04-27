export type GpsStatusKind = 'found' | 'missing';

export interface GpsStatusProps {
  message: string | null | undefined;
  kind?: GpsStatusKind;
}

export function GpsStatus({ message, kind = 'missing' }: GpsStatusProps) {
  if (!message) return null;
  return <div className={`du-gps-status du-gps-${kind}`}>{message}</div>;
}
