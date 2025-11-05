import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2xUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

const DEFAULT_CENTER = [25.2048, 55.2708];

function resolvePosition(entity, fallback = DEFAULT_CENTER) {
  if (!entity) return fallback;
  const { latitude, longitude } = entity;
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return [latitude, longitude];
  }
  return fallback;
}

export default function HospitalMap({ hospitals = [], selectedHospital, patientLocation }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const center = useMemo(() => {
    if (patientLocation) {
      return resolvePosition(patientLocation);
    }
    if (selectedHospital) {
      return resolvePosition(selectedHospital);
    }
    return DEFAULT_CENTER;
  }, [patientLocation, selectedHospital]);

  if (!isClient) {
    return <div style={{ height: 360, borderRadius: 16, background: '#eef3f7' }} />;
  }

  return (
    <MapContainer center={center} zoom={11} scrollWheelZoom style={{ height: 360, width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
      />

      {patientLocation && (
        <Marker position={resolvePosition(patientLocation)}>
          <Popup>
            <strong>Patient location</strong>
          </Popup>
        </Marker>
      )}

      {selectedHospital && (
        <Circle
          center={resolvePosition(selectedHospital)}
          radius={1000}
          pathOptions={{ color: '#0066CC', fillOpacity: 0.1 }}
        />
      )}

      {hospitals.map((hospital) => (
        <Marker key={hospital.id ?? hospital.name} position={resolvePosition(hospital)}>
          <Popup>
            <strong>{hospital.name}</strong>
            <br />
            ICU beds: {hospital.icu_beds_available ?? 0}/{hospital.icu_beds_total ?? 0}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
