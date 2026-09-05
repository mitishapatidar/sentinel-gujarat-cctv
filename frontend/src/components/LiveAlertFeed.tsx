'use client';

import React, { useState } from 'react';
import { Alert } from '../types';
import { 
  Bell, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Navigation, 
  Eye, 
  AlertOctagon, 
  Clock, 
  Users, 
  Bike, 
  CheckCircle2, 
  Megaphone,
  FileCheck
} from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dispatchedActions, setDispatchedActions] = useState<Record<number, string>>({});

  const filterCategories = [
    { id: 'ALL', label: 'All' },
    { id: 'WRONG_WAY_DRIVING', label: 'Wrong-Way' },
    { id: 'ATM_LOITERING', label: 'ATM Loiter' },
    { id: 'CROWD_SURGE', label: 'Crowd Panic' },
    { id: 'TRAFFIC_VIOLATION', label: 'Violations' },
    { id: 'HOTLIST_VEHICLE', label: 'Hotlist' },
  ];

  const filteredAlerts = alerts.filter(alert => {
    if (selectedCategory === 'ALL') return true;
    const cat = (alert.category || 'HOTLIST_VEHICLE').toUpperCase();
    return cat === selectedCategory;
  });

  const handleActionDispatch = (alertId: number, actionLabel: string) => {
    setDispatchedActions(prev => ({
      ...prev,
      [alertId]: actionLabel
    }));
  };

  const getCategoryBadge = (category?: string) => {
    switch (category?.toUpperCase()) {
      case 'WRONG_WAY_DRIVING':
        return {
          label: 'WRONG-WAY DRIVING',
          bg: 'bg-red-950/80 text-red-300 border-red-500/60',
          icon: AlertOctagon,
          indicator: 'bg-red-500'
        };
      case 'ATM_LOITERING':
        return {
          label: 'ATM LOITERING (>5m)',
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500/60',
          icon: Clock,
          indicator: 'bg-amber-500'
        };
      case 'CROWD_SURGE':
        return {
          label: 'CROWD SURGE / PANIC',
          bg: 'bg-purple-950/80 text-purple-300 border-purple-500/60',
          icon: Users,
          indicator: 'bg-purple-500'
        };
      case 'TRAFFIC_VIOLATION':
        return {
          label: 'TRIPLE RIDING / HELMET',
          bg: 'bg-blue-950/80 text-blue-300 border-blue-500/60',
          icon: Bike,
          indicator: 'bg-blue-500'
        };
      default:
        return {
          label: 'HOTLIST ANPR',
          bg: 'bg-yellow-950/80 text-yellow-300 border-yellow-500/60',
          icon: ShieldAlert,
          indicator: 'bg-yellow-500'
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bell className="w-4 h-4 text-red-500 animate-bounce" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            </div>
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-200 font-mono">
              Live Alert & Anomaly Incident Stream
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute alert siren' : 'Enable alert siren'}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
            </button>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
              {filteredAlerts.length} / {alerts.length} Incidents
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
          {filterCategories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Incident List */}
      <div className="p-3 space-y-2.5 flex-1 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs font-mono space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-700" />
            <div>No active alerts under {selectedCategory} filter</div>
            <div className="text-[10px] text-slate-600">Monitoring 50+ statewide feeds in real-time...</div>
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => {
            const isCritical = alert.alert_level?.toUpperCase() === 'CRITICAL';
            const isHigh = alert.alert_level?.toUpperCase() === 'HIGH';
            const catBadge = getCategoryBadge(alert.category);
            const CategoryIcon = catBadge.icon;
            const dispatchedStatus = dispatchedActions[alert.id];

            return (
              <div
                key={`alert-${alert.id}-${idx}-${alert.timestamp}`}
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
                  className={`absolute left-0 inset-y-0 w-1 ${catBadge.indicator}`}
                />

                {/* Card Top: Category Badge, Identifier & Severity */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border flex items-center space-x-1 ${catBadge.bg}`}>
                      <CategoryIcon className="w-2.5 h-2.5" />
                      <span>{catBadge.label}</span>
                    </span>

                    <span className="text-xs font-black font-mono tracking-wider text-yellow-300 bg-black/80 px-1.5 py-0.5 rounded border border-yellow-500/40">
                      {alert.plate_number}
                    </span>

                    <span
                      className={`text-[8px] font-bold font-mono px-1 py-0.5 rounded uppercase border ${
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
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-1">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Incident Title & Context Details */}
                <div className="mt-2 text-xs font-mono space-y-1">
                  <div className="font-semibold text-slate-100 flex items-center space-x-1">
                    <span className="text-red-400">Incident:</span>
                    <span className="text-white font-bold">{alert.crime_type || 'Active Violation'}</span>
                  </div>
                  {alert.details && (
                    <div className="text-[11px] text-slate-300 leading-snug bg-slate-950/60 p-1.5 rounded border border-slate-800">
                      {alert.details}
                    </div>
                  )}
                  {dispatchedStatus && (
                    <div className="text-[10px] text-emerald-400 flex items-center space-x-1 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{dispatchedStatus}</span>
                    </div>
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
                      Confidence: {((alert.confidence || 0.95) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Contextual Action Buttons */}
                <div className="mt-2.5 flex items-center space-x-1.5">
                  {/* Category-Specific Primary Action */}
                  {alert.category === 'WRONG_WAY_DRIVING' && (
                    <button
                      onClick={() => handleActionDispatch(alert.id, 'Overhead VMS Caution Activated')}
                      className="flex-1 flex items-center justify-center space-x-1 bg-red-600/30 hover:bg-red-600/50 border border-red-500/60 text-red-200 text-[10px] font-mono font-bold py-1 px-1.5 rounded transition-all"
                    >
                      <Megaphone className="w-3 h-3" />
                      <span>Trigger VMS Caution</span>
                    </button>
                  )}

                  {alert.category === 'ATM_LOITERING' && (
                    <button
                      onClick={() => handleActionDispatch(alert.id, '110dB Audio Strobe Alarm Fired')}
                      className="flex-1 flex items-center justify-center space-x-1 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/60 text-amber-200 text-[10px] font-mono font-bold py-1 px-1.5 rounded transition-all"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Trigger Audio Strobe</span>
                    </button>
                  )}

                  {alert.category === 'CROWD_SURGE' && (
                    <button
                      onClick={() => handleActionDispatch(alert.id, 'Quick Response Team (QRT) Mobilized')}
                      className="flex-1 flex items-center justify-center space-x-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/60 text-purple-200 text-[10px] font-mono font-bold py-1 px-1.5 rounded transition-all"
                    >
                      <Users className="w-3 h-3" />
                      <span>Mobilize QRT Unit</span>
                    </button>
                  )}

                  {alert.category === 'TRAFFIC_VIOLATION' && (
                    <button
                      onClick={() => handleActionDispatch(alert.id, 'Automated e-Challan #ECH-8819 Dispatched')}
                      className="flex-1 flex items-center justify-center space-x-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/60 text-blue-200 text-[10px] font-mono font-bold py-1 px-1.5 rounded transition-all"
                    >
                      <FileCheck className="w-3 h-3" />
                      <span>Issue e-Challan (₹1,500)</span>
                    </button>
                  )}

                  {(!alert.category || alert.category === 'HOTLIST_VEHICLE') && (
                    <button
                      onClick={() => onTrackPlate(alert.plate_number)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 text-[10px] font-mono font-bold py-1 px-1.5 rounded transition-all"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Reconstruct Route</span>
                    </button>
                  )}

                  {/* Focus Camera Button */}
                  <button
                    onClick={() => onFocusCamera(alert.camera_id)}
                    className="flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono py-1 px-2 rounded transition-all shrink-0"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Focus Feed</span>
                  </button>

                  {/* CCTV Snapshot Frame if available */}
                  {(alert.snapshot || alert.snapshot_url) && onViewSnapshot && (
                    <button
                      onClick={() => onViewSnapshot((alert.snapshot || alert.snapshot_url)!, alert.plate_number)}
                      className="bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-[10px] font-mono py-1 px-1.5 rounded border border-blue-700 shrink-0"
                    >
                      Proof
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
