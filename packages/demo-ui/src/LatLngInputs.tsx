import { useId } from 'react';

export interface LatLngInputsProps {
  lat: string;
  lng: string;
  onLatChange: (value: string) => void;
  onLngChange: (value: string) => void;
  required?: boolean;
}

export function LatLngInputs({ lat, lng, onLatChange, onLngChange, required }: LatLngInputsProps) {
  const latId = useId();
  const lngId = useId();
  return (
    <div className="du-field du-row">
      <div>
        <label htmlFor={latId}>Latitude</label>
        <input
          id={latId}
          type="number"
          step="any"
          min={-90}
          max={90}
          required={required}
          placeholder="e.g. 40.7128"
          value={lat}
          onChange={(e) => onLatChange(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={lngId}>Longitude</label>
        <input
          id={lngId}
          type="number"
          step="any"
          min={-180}
          max={180}
          required={required}
          placeholder="e.g. -74.0060"
          value={lng}
          onChange={(e) => onLngChange(e.target.value)}
        />
      </div>
    </div>
  );
}
