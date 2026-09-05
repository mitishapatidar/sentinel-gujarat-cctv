'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PlausibilityResult, PlausibilitySegment, DetectionAttribute } from '../types';
import { AlertTriangle, CheckCircle2, Compass } from 'lucide-react';

interface TrailPlausibilityMapProps {
  plausibility: PlausibilityResult | null;
  selectedSegment?: PlausibilitySegment | null;
}

function MapViewController({ sightings }: { sightings: DetectionAttribute[] }) {
  const map = useMap();

  useEffect(() => {
    if (sightings.length > 1) {
      const bounds = L.latLngBounds(sightings.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
    } else if (sightings.length === 1) {
      map.flyTo([sightings[0].lat, sightings[0].lng], 12, { duration: 1.2 });
    }
  }, [sightings, map]);

  return null;
}

export const TrailPlausibilityMap: React.FC<TrailPlausibilityMapProps> = ({
  plausibility,
}) => {
  const gujaratCenter: [number, number] = [22.8, 71.8];
  const defaultZoom = 7.5;

  const sightings = plausibility?.sightings || [];
  const segments = plausibility?.segments || [];

  // Create Step Pin Marker Icon
  const createStepIcon = (index: number, isAnomalous: boolean) => {
    const bgColor = isAnomalous ? '#DC2626' : '#1E3A8A';
    const html = `
      <div class="relative flex items-center justify-center w-7 h-7 ${
        isAnomalous ? 'beacon-ping' : ''
      }">
        <div class="relative z-10 flex items-center justify-center w-6 h-6 rounded-full text-white font-mono text-[11px] font-extrabold border-2 border-white shadow-lg" style="background-color: ${bgColor};">
          <span>${index + 1}</span>
        </div>
      </div>
    `;
    return L.divIcon({
      html,
      className: 'trail-step-pin',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={gujaratCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController sightings={sightings} />

        {/* Draw Individual Segments with Physical Status Coloring */}
        {segments.map((seg, idx) => {
          const fromSighting = sightings.find((s) => s.camera_id === seg.from_camera_id);
          const toSighting = sightings.find((s) => s.camera_id === seg.to_camera_id);
          if (!fromSighting || !toSighting) return null;

          const coords: [number, number][] = [
            [fromSighting.lat, fromSighting.lng],
            [toSighting.lat, toSighting.lng],
          ];

          const isTeleportation = seg.is_physically_impossible;

          return (
            <Polyline
              key={`trail-seg-${seg.from_camera_id}-${seg.to_camera_id}-${idx}`}
              positions={coords}
              pathOptions={{
                color: isTeleportation ? '#DC2626' : '#2563EB',
                weight: isTeleportation ? 5 : 4,
                opacity: 0.95,
                dashArray: isTeleportation ? '10, 8' : undefined,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            >
              <Tooltip sticky>
                <div className="font-sans text-xs p-1 space-y-0.5">
                  <div className="font-bold flex items-center space-x-1">
                    {isTeleportation ? (
                      <span className="text-red-700 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>IMPOSSIBLE TELEPORTATION JUMP</span>
                      </span>
                    ) : (
                      <span className="text-blue-700 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Plausible Transit Corridor</span>
                      </span>
                    )}
                  </div>
                  <div>Leg #{idx + 1}: {seg.from_city} ➔ {seg.to_city}</div>
                  <div className="font-mono text-[11px] text-slate-600">
                    Distance: <strong>{seg.distance_km} km</strong> • Time: <strong>{seg.duration_minutes}m</strong>
                  </div>
                  <div className="font-mono text-[11px]">
                    Calculated Speed: <strong className={isTeleportation ? 'text-red-700' : 'text-slate-900'}>{seg.calculated_speed_kmh} km/h</strong>
                  </div>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* Step Markers along the route */}
        {sightings.map((sighting, idx) => {
          const isAnomalous = segments.some(
            (seg) =>
              seg.is_physically_impossible &&
              (seg.from_camera_id === sighting.camera_id || seg.to_camera_id === sighting.camera_id)
          );

          return (
            <Marker
              key={`sighting-marker-${sighting.id}-${idx}`}
              position={[sighting.lat, sighting.lng]}
              icon={createStepIcon(idx, isAnomalous)}
            >
              <Tooltip direction="top" offset={[0, -14]} permanent={idx === 0 || idx === sightings.length - 1}>
                <div className="bg-white text-slate-900 px-2 py-1 text-[10px] font-mono font-bold rounded shadow-md border border-slate-300">
                  <span className={isAnomalous ? 'text-red-600' : 'text-blue-700'}>
                    Point #{idx + 1}
                  </span>{' '}
                  • {sighting.city}
                  <div className="font-normal text-slate-600 text-[9px] truncate max-w-[140px]">
                    {sighting.camera_name}
                  </div>
                </div>
              </Tooltip>

              <Popup>
                <div className="p-2 space-y-1.5 text-xs min-w-[210px] font-sans">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <span className="font-bold text-slate-900">Sighting Checkpoint #{idx + 1}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#1E3A8A] font-mono">
                      {sighting.city}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-800 text-[11px]">
                    {sighting.camera_name}
                  </div>

                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-[11px] font-mono space-y-0.5">
                    <div>Plate: <strong className="text-slate-900">{sighting.plate_number}</strong></div>
                    <div>Vehicle: {sighting.vehicle_color} {sighting.vehicle_make}</div>
                    <div>Timestamp: {new Date(sighting.timestamp).toLocaleTimeString()} IST</div>
                    <div>Recorded Speed: {sighting.speed_kmh} km/h</div>
                  </div>

                  {isAnomalous && (
                    <div className="bg-red-50 text-red-800 border border-red-200 p-1.5 rounded text-[10px] font-bold">
                      ⚠️ Cloned Sighting: Simultaneous occurrence in distant jurisdiction.
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm border border-slate-200 p-2.5 rounded-xl shadow-md text-xs font-mono space-y-1.5">
        <div className="font-bold text-slate-800 text-[11px] flex items-center space-x-1.5">
          <Compass className="w-3.5 h-3.5 text-[#1E3A8A]" />
          <span>Road-Graph Kinematic Vector Layer</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600">
          <span className="flex items-center space-x-1 text-blue-700 font-bold">
            <span className="w-4 h-1 bg-blue-600 rounded" />
            <span>Plausible Transit (&le; 120 km/h)</span>
          </span>
          <span className="flex items-center space-x-1 text-red-700 font-bold">
            <span className="w-4 h-1 bg-red-600 border border-dashed border-red-800 rounded animate-pulse" />
            <span>Teleportation Anomaly (&gt; 180 km/h / Cloned)</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrailPlausibilityMap;
