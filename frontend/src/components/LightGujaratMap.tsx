'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Camera, TrajectoryPoint } from '../types';
import { Shield, Navigation, AlertTriangle, Video, MapPin } from 'lucide-react';

interface LightGujaratMapProps {
  cameras: Camera[];
  trajectory: TrajectoryPoint[];
  selectedCamera: Camera | null;
  onSelectCamera: (cam: Camera) => void;
  latestAlertCameraId?: number | null;
}

function MapViewController({
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

export const LightGujaratMap: React.FC<LightGujaratMapProps> = ({
  cameras,
  trajectory,
  selectedCamera,
  onSelectCamera,
  latestAlertCameraId,
}) => {
  // Centered precisely on Gujarat state as requested: [22.8, 71.8], zoom 7.5
  const gujaratCenter: [number, number] = [22.8, 71.8];
  const defaultZoom = 7.5;

  const polylineCoords: [number, number][] = useMemo(() => {
    return trajectory.map((point) => [point.lat, point.lng]);
  }, [trajectory]);

  // Clean Circular SVG Pin
  const createCameraIcon = (cam: Camera, isAlert: boolean, isSelected: boolean) => {
    const html = isAlert
      ? `
        <div class="relative flex items-center justify-center w-7 h-7 cursor-pointer">
          <div class="absolute w-7 h-7 rounded-full bg-red-500/40 beacon-ping"></div>
          <div class="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-[#DC2626] border-2 border-white shadow-lg text-white">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          </div>
        </div>
      `
      : `
        <div class="relative flex items-center justify-center w-6 h-6 cursor-pointer">
          <div class="relative z-10 flex items-center justify-center w-4 h-4 rounded-full ${
            isSelected ? 'bg-amber-500 ring-2 ring-amber-300' : 'bg-[#1E3A8A]'
          } border-2 border-white shadow-md">
            <span class="w-1 h-1 rounded-full bg-white"></span>
          </div>
        </div>
      `;

    return L.divIcon({
      html,
      className: 'light-cam-pin',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  };

  // Sequential Step Number Marker Icon (1, 2, 3...)
  const createStepIcon = (index: number) => {
    const html = `
      <div class="relative flex items-center justify-center w-6 h-6 bg-[#DC2626] text-white rounded-full font-mono text-[11px] font-bold border-2 border-white shadow-md ring-1 ring-red-400">
        <span>${index + 1}</span>
      </div>
    `;
    return L.divIcon({
      html,
      className: 'trajectory-step-pin',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
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
        {/* OpenStreetMap Standard Free Tiles - 100% Free, NO API Key, NO Watermarks */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController trajectory={trajectory} selectedCamera={selectedCamera} />

        {/* Crisp Solid Red Trajectory Line (weight: 4, color: '#DC2626') */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: '#DC2626',
              weight: 4,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          >
            <Tooltip sticky>
              <div className="font-sans text-xs">
                <strong className="text-red-700">Reconstructed Gujarat Pursuit Route</strong>
                <div>Total Waypoints: {trajectory.length} checkpoints</div>
              </div>
            </Tooltip>
          </Polyline>
        )}

        {/* Sequential Step Waypoints */}
        {trajectory.map((point, idx) => (
          <Marker
            key={`traj-step-${point.detection_id}-${idx}`}
            position={[point.lat, point.lng]}
            icon={createStepIcon(idx)}
          >
            <Tooltip permanent={idx === 0 || idx === trajectory.length - 1} direction="top" offset={[0, -12]}>
              <div className="bg-white text-slate-900 px-2 py-1 text-[10px] font-mono font-bold rounded shadow border border-red-300">
                <span className="text-red-600">Checkpoint #{idx + 1}</span> • {new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                <div className="font-normal text-slate-600 truncate max-w-[150px]">{point.camera_name}</div>
              </div>
            </Tooltip>
            <Popup>
              <div className="p-2 space-y-1 text-xs">
                <div className="font-bold text-red-600 flex items-center space-x-1">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Sighting #{idx + 1}</span>
                </div>
                <div className="font-semibold text-slate-900">{point.camera_name}</div>
                <div className="text-slate-600 font-mono">Plate: <strong className="text-slate-900">{point.plate_number}</strong></div>
                <div className="text-slate-500 font-mono text-[11px]">{new Date(point.timestamp).toLocaleTimeString()}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Regular CCTV Camera Markers across Gujarat */}
        {cameras.map((cam, idx) => {
          const isAlerted = latestAlertCameraId === cam.id || cam.recent_alert;
          const isSelected = selectedCamera?.id === cam.id;

          return (
            <Marker
              key={`cam-node-${cam.id}-${idx}`}
              position={[cam.lat, cam.lng]}
              icon={createCameraIcon(cam, Boolean(isAlerted), isSelected)}
              eventHandlers={{
                click: () => onSelectCamera(cam),
              }}
            >
              <Popup>
                <div className="p-2 text-xs space-y-1.5 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <span className="font-bold text-slate-900">{cam.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#1E3A8A]">
                      {cam.department}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] font-mono">
                    Jurisdiction: {cam.city || 'Gujarat'}
                  </div>
                  <div className="text-slate-500 text-[11px] font-mono">
                    GPS: {cam.lat.toFixed(4)}°N, {cam.lng.toFixed(4)}°E
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-emerald-700 font-semibold text-[11px] flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>{cam.status.toUpperCase()}</span>
                    </span>
                    <button
                      onClick={() => onSelectCamera(cam)}
                      className="px-2 py-0.5 bg-[#1E3A8A] text-white rounded text-[10px] font-medium hover:bg-[#193073]"
                    >
                      Inspect Feed
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend in Bottom Left */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm border border-slate-200 p-2.5 rounded-xl shadow-md text-xs space-y-1">
        <div className="font-bold text-slate-800 text-[11px] flex items-center space-x-1.5">
          <Shield className="w-3.5 h-3.5 text-[#1E3A8A]" />
          <span>Gujarat Unified Camera Layer</span>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-600">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A] border border-white" />
            <span>Regular CCTV ({cameras.length} Active)</span>
          </span>
          <span className="flex items-center space-x-1 text-red-600 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] border border-white animate-pulse" />
            <span>Hotlist Sighting</span>
          </span>
        </div>
      </div>
    </div>
  );
};
export default LightGujaratMap;
