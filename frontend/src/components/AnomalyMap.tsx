'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AnomalyAlert } from '../types';
import { AlertOctagon, Clock, Users, Bike, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';

interface AnomalyMapProps {
  anomalies: AnomalyAlert[];
  selectedAnomaly: AnomalyAlert | null;
  onSelectAnomaly: (anomaly: AnomalyAlert) => void;
  onQuickDispatch?: (anomalyId: number, actionType: string) => void;
}

function MapViewController({ selectedAnomaly }: { selectedAnomaly: AnomalyAlert | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedAnomaly) {
      map.flyTo([selectedAnomaly.lat, selectedAnomaly.lng], 13, { duration: 1.2 });
    }
  }, [selectedAnomaly, map]);

  return null;
}

export const AnomalyMap: React.FC<AnomalyMapProps> = ({
  anomalies,
  selectedAnomaly,
  onSelectAnomaly,
  onQuickDispatch,
}) => {
  const gujaratCenter: [number, number] = [22.8, 72.2];
  const defaultZoom = 8;

  const createAnomalyIcon = (anomaly: AnomalyAlert, isSelected: boolean) => {
    let colorClass = 'bg-red-600 border-red-400 text-white';
    let pulseColor = 'bg-red-500';
    let iconLetter = '!';

    switch (anomaly.category) {
      case 'WRONG_WAY_DRIVING':
        colorClass = 'bg-red-600 border-red-400 text-white';
        pulseColor = 'bg-red-500';
        iconLetter = 'WW';
        break;
      case 'ATM_LOITERING':
        colorClass = 'bg-amber-600 border-amber-300 text-white';
        pulseColor = 'bg-amber-500';
        iconLetter = 'ATM';
        break;
      case 'CROWD_SURGE':
        colorClass = 'bg-purple-600 border-purple-300 text-white';
        pulseColor = 'bg-purple-500';
        iconLetter = 'CS';
        break;
      case 'TRAFFIC_VIOLATION':
        colorClass = 'bg-blue-600 border-blue-300 text-white';
        pulseColor = 'bg-blue-500';
        iconLetter = '3R';
        break;
    }

    const ring = isSelected ? 'ring-4 ring-yellow-400 ring-offset-2 scale-125' : '';

    return L.divIcon({
      className: 'anomaly-custom-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 rounded-full ${pulseColor} animate-ping opacity-40"></span>
          <div class="w-7 h-7 rounded-full ${colorClass} border-2 shadow-lg flex items-center justify-center font-mono font-black text-[9px] transition-transform ${ring}">
            ${iconLetter}
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  return (
    <div className="w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={gujaratCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', backgroundColor: '#f8fafc' }}
        attributionControl={false}
      >
        {/* OpenStreetMap Self-Hosted Clean Vector Tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapViewController selectedAnomaly={selectedAnomaly} />

        {anomalies.map((a) => {
          const isSelected = selectedAnomaly?.id === a.id;
          const markerIcon = createAnomalyIcon(a, isSelected);

          return (
            <Marker
              key={`anomaly-marker-${a.id}`}
              position={[a.lat, a.lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onSelectAnomaly(a),
              }}
            >
              <Popup className="anomaly-popup">
                <div className="p-2 space-y-1.5 font-sans min-w-[240px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-900 text-white uppercase">
                      {a.category.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                      a.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {a.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {a.title}
                  </h4>

                  <div className="text-[11px] text-slate-600 flex items-start space-x-1">
                    <MapPin className="w-3 h-3 text-[#1E3A8A] shrink-0 mt-0.5" />
                    <span>{a.location_name} ({a.city})</span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-200">
                    <strong>Target:</strong> {a.target_identifier}
                    <div className="mt-0.5">{a.details}</div>
                  </div>

                  {a.status !== 'RESOLVED' && onQuickDispatch && (
                    <button
                      onClick={() => {
                        const actionMap: Record<string, string> = {
                          WRONG_WAY_DRIVING: 'VMS_CAUTION',
                          ATM_LOITERING: 'AUDIO_STROBE',
                          CROWD_SURGE: 'QRT_MOBILIZE',
                          TRAFFIC_VIOLATION: 'ECHALLAN_ISSUE',
                        };
                        onQuickDispatch(a.id, actionMap[a.category] || 'PCR_DISPATCH');
                      }}
                      className="w-full mt-1 bg-[#1E3A8A] hover:bg-[#193073] text-white text-[10px] font-bold font-mono py-1 px-2 rounded flex items-center justify-center space-x-1"
                    >
                      <span>1-Click Tactical Dispatch</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default AnomalyMap;
