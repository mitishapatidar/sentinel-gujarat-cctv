'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Camera, TrajectoryPoint } from '../types';
import { Shield, Navigation, Compass, Radio } from 'lucide-react';

interface SentinelMapProps {
  cameras: Camera[];
  trajectory: TrajectoryPoint[];
  selectedCamera: Camera | null;
  onSelectCamera: (cam: Camera) => void;
  latestAlertCameraId?: number | null;
}

// Auto-adjust map bounds when trajectory or selected camera changes
function MapBoundsUpdater({
  trajectory,
  selectedCamera,
}: {
  trajectory: TrajectoryPoint[];
  selectedCamera: Camera | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (trajectory.length > 1) {
      const bounds = L.latLngBounds(trajectory.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    } else if (selectedCamera) {
      map.flyTo([selectedCamera.lat, selectedCamera.lng], 13, { duration: 1.2 });
    }
  }, [trajectory, selectedCamera, map]);

  return null;
}

export const SentinelMap: React.FC<SentinelMapProps> = ({
  cameras,
  trajectory,
  selectedCamera,
  onSelectCamera,
  latestAlertCameraId,
}) => {
  // Centered strictly at Ahmedabad (23.0225, 72.5714) as specified
  const ahmedabadCenter: [number, number] = [23.0225, 72.5714];
  const defaultZoom = 11;

  // Polyline coordinates for route reconstruction
  const polylineCoords: [number, number][] = useMemo(() => {
    return trajectory.map((point) => [point.lat, point.lng]);
  }, [trajectory]);

  // Generate tactical radar SVG DivIcon for cameras (Green for online, pulsing red for alerted)
  const createCameraIcon = (cam: Camera, isAlert: boolean, isSelected: boolean) => {
    const isPolice = cam.department?.toUpperCase().includes('POLICE');
    const isRTO = cam.department?.toUpperCase().includes('RTO');
    // Default green or tactical department tint
    const baseColor = isPolice ? '#10b981' : isRTO ? '#f59e0b' : '#3b82f6';

    const html = `
      <div class="relative flex items-center justify-center w-8 h-8 cursor-pointer">
        ${
          isAlert
            ? `<div class="absolute w-8 h-8 rounded-full bg-red-500/50 radar-ping"></div>
               <div class="absolute w-12 h-12 rounded-full border-2 border-red-500 animate-ping"></div>`
            : `<div class="absolute w-6 h-6 rounded-full bg-emerald-500/20"></div>`
        }
        <div class="relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 shadow-lg ${
          isAlert 
            ? 'bg-red-600 border-white ring-4 ring-red-500/70' 
            : isSelected 
            ? 'bg-cyan-400 border-white ring-2 ring-cyan-300' 
            : 'border-slate-900'
        }" style="background-color: ${isAlert ? '#dc2626' : baseColor}">
          <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-radar-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  // Generate numbered waypoint icon for route reconstruction
  const createWaypointIcon = (index: number) => {
    const html = `
      <div class="relative flex items-center justify-center w-7 h-7 bg-red-600 text-white rounded-full font-mono text-xs font-bold border-2 border-white shadow-2xl ring-2 ring-red-400">
        <span>${index + 1}</span>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-waypoint-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-slate-800 rounded-xl overflow-hidden shadow-xl relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 z-10">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-200 font-mono">
            Statewide GIS Grid ({cameras.length} Nodes Loaded)
          </h2>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center space-x-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active Cameras</span>
          </span>
          <span className="flex items-center space-x-1.5 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Pulsing Hotlist Alert</span>
          </span>
          {trajectory.length > 0 && (
            <span className="flex items-center space-x-1 text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-800 animate-pulse">
              <span>ACTIVE RECONSTRUCTED ROUTE</span>
            </span>
          )}
        </div>
      </div>

      {/* Map Surface */}
      <div className="flex-1 w-full h-full min-h-[360px] relative">
        <MapContainer
          center={ahmedabadCenter}
          zoom={defaultZoom}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* CartoDB Dark Matter tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <MapBoundsUpdater trajectory={trajectory} selectedCamera={selectedCamera} />

          {/* Glowing Red Directional Route Polyline */}
          {polylineCoords.length > 1 && (
            <>
              {/* Outer neon red aura line */}
              <Polyline
                positions={polylineCoords}
                pathOptions={{
                  color: '#ef4444',
                  weight: 8,
                  opacity: 0.35,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              {/* Sharp inner dashed directional polyline */}
              <Polyline
                positions={polylineCoords}
                pathOptions={{
                  color: '#f87171',
                  weight: 3.5,
                  opacity: 0.95,
                  dashArray: '10, 8',
                }}
              >
                <Tooltip sticky>
                  <div className="font-mono text-xs">
                    <span className="text-red-400 font-bold">Vehicle Movement Corridor</span>
                    <div>Total Checkpoints: {trajectory.length}</div>
                  </div>
                </Tooltip>
              </Polyline>
            </>
          )}

          {/* Numbered Waypoint Markers on Trajectory */}
          {trajectory.map((point, idx) => (
            <Marker
              key={`waypoint-${point.detection_id}-${idx}`}
              position={[point.lat, point.lng]}
              icon={createWaypointIcon(idx)}
            >
              <Tooltip permanent={idx === 0 || idx === trajectory.length - 1} direction="top" offset={[0, -16]}>
                <div className="p-1 font-mono text-[10px] bg-slate-950 text-white rounded border border-red-500">
                  <div className="font-bold text-yellow-300">#{idx + 1} • {new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-slate-300">{point.camera_name}</div>
                </div>
              </Tooltip>
              <Popup>
                <div className="p-2 space-y-1 font-mono text-xs">
                  <div className="font-bold text-red-400 flex items-center space-x-1">
                    <Navigation className="w-3 h-3" />
                    <span>Checkpoint #{idx + 1} (Suspect Sighted)</span>
                  </div>
                  <div className="text-white font-semibold">{point.camera_name}</div>
                  <div className="text-slate-300">Target Plate: <span className="text-yellow-300 font-bold">{point.plate_number}</span></div>
                  <div className="text-slate-400">Timestamp: {new Date(point.timestamp).toLocaleTimeString()}</div>
                  <div className="text-emerald-400">Confidence: {(point.confidence * 100).toFixed(1)}%</div>
                  <div className="text-cyan-400">Agency: {point.department}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Statewide Camera Registry Pins */}
          {cameras.map((cam, idx) => {
            const isAlerted = latestAlertCameraId === cam.id || cam.recent_alert;
            const isSelected = selectedCamera?.id === cam.id;

            return (
              <Marker
                key={`cam-${cam.id}-${idx}`}
                position={[cam.lat, cam.lng]}
                icon={createCameraIcon(cam, Boolean(isAlerted), isSelected)}
                eventHandlers={{
                  click: () => onSelectCamera(cam),
                }}
              >
                <Popup>
                  <div className="p-2 font-mono text-xs space-y-1.5 min-w-[210px]">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                      <span className="font-bold text-slate-100">{cam.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900 text-blue-300">
                        {cam.department}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Jurisdiction: {cam.city || 'Gujarat'}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Coords: {cam.lat.toFixed(4)}, {cam.lng.toFixed(4)}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-emerald-400 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Status: {cam.status}</span>
                      </span>
                      <button
                        onClick={() => onSelectCamera(cam)}
                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-sans"
                      >
                        Inspect Stream
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 shadow-xl text-[11px] font-mono space-y-1">
          <div className="font-bold text-slate-300 text-xs flex items-center space-x-1 mb-1">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>GIS Sentinel Layer</span>
          </div>
          <div className="text-slate-400">Total Cameras: <span className="text-white font-bold">{cameras.length} nodes</span></div>
          {trajectory.length > 0 && (
            <div className="text-red-400 font-semibold">
              Trajectory: <span>{trajectory.length} Sighted Checkpoints</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SentinelMap;
