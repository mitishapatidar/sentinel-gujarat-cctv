'use client';

import React, { useState } from 'react';
import { Alert } from '../types';
import { Bell, ShieldAlert, Volume2, VolumeX, MapPin, Navigation, Eye } from 'lucide-react';

interface LiveAlertFeedProps {
  alerts: Alert[];
  onTrackPlate: (plate: string) => void;
  onFocusCamera: (cameraId: number) => void;
  onViewSnapshot?: (snapshotUri: string, plate: string) => void;
}

export const LiveAlertFeed: React.FC<LiveAlertFeedProps> = ({
  alerts,
  onTrackPlate,
  onFocusCamera,
  onViewSnapshot,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Bell className="w-4 h-4 text-red-500 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </div>
          <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-200 font-mono">
            Live Alert Incident Feed (Real-Time Stream)
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute alert siren' : 'Enable alert siren'}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
          </button>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
            {alerts.length} Incidents
          </span>
        </div>
      </div>

      {/* Incident List */}
      <div className="p-3 space-y-2.5 flex-1 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs font-mono space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-700" />
            <div>No active hotlist alerts in memory buffer</div>
            <div className="text-[10px] text-slate-600">Monitoring 50+ statewide feeds in real-time...</div>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.alert_level?.toUpperCase() === 'CRITICAL';
            const isHigh = alert.alert_level?.toUpperCase() === 'HIGH';

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border transition-all relative overflow-hidden ${
                  isCritical
                    ? 'border-red-600/70 bg-red-950/20 hover:bg-red-950/30'
                    : isHigh
                    ? 'border-amber-600/60 bg-amber-950/20 hover:bg-amber-950/30'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/60'
                }`}
              >
                {/* Left accent bar */}
                <div
                  className={`absolute left-0 inset-y-0 w-1 ${
                    isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                />

                {/* Card Top: Plate Number & Severity Tag */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black font-mono tracking-wider text-yellow-300 bg-black/70 px-2 py-0.5 rounded border border-yellow-500/40">
                      {alert.plate_number}
                    </span>
                    <span
                      className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase border ${
                        isCritical
                          ? 'bg-red-900/80 text-red-200 border-red-500'
                          : isHigh
                          ? 'bg-amber-900/80 text-amber-200 border-amber-500'
                          : 'bg-blue-900/80 text-blue-200 border-blue-500'
                      }`}
                    >
                      {alert.alert_level || 'Critical'}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Crime Type & Vehicle Details */}
                <div className="mt-2 text-xs font-mono">
                  <div className="font-semibold text-slate-100 flex items-center space-x-1">
                    <span className="text-red-400">Crime:</span>
                    <span className="text-white font-bold">{alert.crime_type || 'Stolen'}</span>
                  </div>
                  {alert.vehicle_model && (
                    <div className="text-[11px] text-slate-400">{alert.vehicle_model}</div>
                  )}
                </div>

                {/* Camera Location */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-1 text-slate-400 truncate max-w-[210px]">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{alert.camera_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-emerald-400">
                      Match: {((alert.similarity || 0.95) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-2.5 flex items-center space-x-2">
                  <button
                    onClick={() => onTrackPlate(alert.plate_number)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 text-[10px] font-mono font-bold py-1 px-2 rounded transition-all"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Reconstruct Route</span>
                  </button>

                  <button
                    onClick={() => onFocusCamera(alert.camera_id)}
                    className="flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono py-1 px-2.5 rounded transition-all"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Focus Camera</span>
                  </button>

                  {alert.snapshot && onViewSnapshot && (
                    <button
                      onClick={() => onViewSnapshot(alert.snapshot!, alert.plate_number)}
                      className="bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-[10px] font-mono py-1 px-2 rounded border border-blue-700"
                    >
                      CCTV Frame
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
