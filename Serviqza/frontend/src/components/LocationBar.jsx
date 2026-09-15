import React from 'react';
import { useAuth, PRESET_LOCATIONS } from '../context/AuthContext';
import { MapPin, Navigation } from 'lucide-react';

export default function LocationBar() {
  const { coords, updateLocation, detectDeviceLocation } = useAuth();

  return (
    <div className="location-simulator-bar">
      <div className="location-chip">
        <MapPin size={15} color="#4f46e5" />
        <span>Current Simulated Coords: <strong>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</strong> ({coords.label})</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Demo Preset:</span>
        <select
          value={coords.label}
          onChange={(e) => {
            const loc = PRESET_LOCATIONS.find(p => p.label.startsWith(e.target.value));
            if (loc) updateLocation(loc.lat, loc.lon, loc.label);
          }}
          className="form-select"
          style={{ padding: '2px 8px', fontSize: '0.75rem', width: 'auto' }}
        >
          {PRESET_LOCATIONS.map((p, idx) => (
            <option key={idx} value={p.label.split(' ')[0]}>{p.label}</option>
          ))}
        </select>

        <button
          onClick={detectDeviceLocation}
          className="btn btn-secondary btn-sm"
          style={{ padding: '2px 8px', fontSize: '0.75rem' }}
          title="Use browser Geolocation API"
        >
          <Navigation size={12} />
          GPS
        </button>
      </div>
    </div>
  );
}
