'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CaseCheckpoint } from '../data/casesData';
import { Navigation, AlertTriangle, ShieldCheck, MapPin, Radio } from 'lucide-react';

interface WarRoomMapProps {
  checkpoints: CaseCheckpoint[];
  projectedNaka: {
    name: string;
    lat: number;
    lng: number;
    etaMinutes: number;
    barricadeStatus: 'PENDING' | 'DEPLOYED';
  };
  targetPlate: string;
}

function MapCenterBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [points, map]);
  return null;
}

export const WarRoomMap: React.FC<WarRoomMapProps> = ({
  checkpoints,
  projectedNaka,
  targetPlate,
}) => {
  const pointsList: [number, number][] = useMemo(() => {
    const pts: [number, number][] = checkpoints.map((c) => [c.lat, c.lng]);
    if (projectedNaka) {
      pts.push([projectedNaka.lat, projectedNaka.lng]);
    }
    return pts;
  }, [checkpoints, projectedNaka]);

  // Numbered Waypoint Marker Icon
  const createWaypointIcon = (index: number) => {
    const html = `
      <div class="relative flex items-center justify-center w-7 h-7 bg-red-600 text-white rounded-full font-mono text-xs font-bold border-2 border-white shadow-xl ring-2 ring-red-500/70">
        <span>${index + 1}</span>
      </div>
    `;
    return L.divIcon({
      html,
      className: 'war-waypoint-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  };

  // Projected Interception Naka Hazard Icon (Yellow Blinking Barricade)
  const createProjectedNakaIcon = (isDeployed: boolean) => {
    const html = `
      <div class="relative flex items-center justify-center w-10 h-10 cursor-pointer">
        <div class="absolute w-10 h-10 rounded-full ${isDeployed ? 'bg-emerald-500/40' : 'bg-yellow-400/40'} animate-ping"></div>
        <div class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          isDeployed ? 'bg-emerald-600 border-white text-white' : 'bg-yellow-500 border-black text-black'
        } shadow-2xl font-bold">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    `;
    return L.divIcon({
      html,
      className: 'naka-hazard-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[23.1000, 72.5800]}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* OpenStreetMap Standard Free Tiles - 100% Watermark Free! */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterBounds points={pointsList} />

        {/* Historical Vehicle Sighting Polyline */}
        {checkpoints.length > 1 && (
          <>
            <Polyline
              positions={checkpoints.map((c) => [c.lat, c.lng])}
              pathOptions={{
                color: '#ef4444',
                weight: 6,
                opacity: 0.85,
                dashArray: '10, 8',
              }}
            />
            {/* Projected route to Naka (Yellow dashed line) */}
            {projectedNaka && (
              <Polyline
                positions={[
                  [checkpoints[checkpoints.length - 1].lat, checkpoints[checkpoints.length - 1].lng],
                  [projectedNaka.lat, projectedNaka.lng],
                ]}
                pathOptions={{
                  color: '#eab308',
                  weight: 4,
                  opacity: 0.9,
                  dashArray: '6, 6',
                }}
              />
            )}
          </>
        )}

        {/* Checkpoint Markers */}
        {checkpoints.map((cp, idx) => (
          <Marker
            key={`cp-${cp.cameraId}-${idx}`}
            position={[cp.lat, cp.lng]}
            icon={createWaypointIcon(idx)}
          >
            <Tooltip permanent={idx === 0 || idx === checkpoints.length - 1} direction="top" offset={[0, -14]}>
              <div className="bg-black text-white p-1 text-[10px] font-mono rounded border border-red-500">
                <strong className="text-yellow-300">#{idx + 1} Sighting</strong> • {cp.timestamp}
                <div>{cp.cameraName}</div>
              </div>
            </Tooltip>
            <Popup>
              <div className="p-2 font-mono text-xs space-y-1">
                <div className="font-bold text-red-400">Checkpoint #{idx + 1} — Sighted</div>
                <div className="text-white font-semibold">{cp.cameraName}</div>
                <div className="text-slate-300">Time: {cp.timestamp} ({cp.speedKmH} km/h)</div>
                <div className="text-cyan-300 text-[11px]">{cp.snapshotNote}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Next Projected Interception Toll Naka */}
        {projectedNaka && (
          <Marker
            position={[projectedNaka.lat, projectedNaka.lng]}
            icon={createProjectedNakaIcon(projectedNaka.barricadeStatus === 'DEPLOYED')}
          >
            <Tooltip permanent direction="top" offset={[0, -20]}>
              <div className="bg-yellow-950 text-yellow-300 p-1.5 text-[10px] font-mono rounded border border-yellow-500 font-bold">
                ⚠️ PROJECTED INTERCEPTION NAKA
                <div className="text-white">{projectedNaka.name}</div>
                <div className="text-emerald-400">Status: {projectedNaka.barricadeStatus}</div>
              </div>
            </Tooltip>
            <Popup>
              <div className="p-2 font-mono text-xs space-y-1">
                <div className="font-bold text-yellow-400">Projected Interception Toll Naka</div>
                <div className="text-white font-semibold">{projectedNaka.name}</div>
                <div className="text-slate-300">Estimated Target Arrival: ~{projectedNaka.etaMinutes} mins</div>
                <div className="text-emerald-400 font-bold">Barricade Status: {projectedNaka.barricadeStatus}</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Tactical Watermark / Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2.5 rounded-lg text-[10px] font-mono space-y-1 shadow-xl">
        <div className="font-bold text-slate-200 flex items-center space-x-1">
          <Radio className="w-3 h-3 text-red-500 animate-ping" />
          <span>REAL-TIME PURSUIT VECTOR</span>
        </div>
        <div className="text-slate-400">Target Plate: <strong className="text-yellow-300">{targetPlate}</strong></div>
        <div className="text-red-400">Checkpoints Traversed: {checkpoints.length} nodes</div>
        <div className="text-yellow-400">Projected Intercept ETA: ~{projectedNaka?.etaMinutes || 5} mins</div>
      </div>
    </div>
  );
};
export default WarRoomMap;
