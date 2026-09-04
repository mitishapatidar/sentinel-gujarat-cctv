'use client';

import React, { useState } from 'react';
import { Watchlist, TrajectoryPoint } from '../types';
import { Search, Navigation, AlertTriangle, Play, RefreshCw, PlusCircle, ShieldAlert } from 'lucide-react';

interface RouteTrackerProps {
  watchlist: Watchlist[];
  trajectory: TrajectoryPoint[];
  searchedPlate: string;
  onSearchPlate: (plate: string) => void;
  onClearTrajectory: () => void;
  onSimulateDetection: (plate?: string) => Promise<void>;
  onAddWatchlist: (entry: { plate_number: string; vehicle_model: string; crime_type: string; alert_level: string }) => Promise<void>;
  isSearching: boolean;
  isSimulating: boolean;
}

export const RouteTracker: React.FC<RouteTrackerProps> = ({
  watchlist,
  trajectory,
  searchedPlate,
  onSearchPlate,
  onClearTrajectory,
  onSimulateDetection,
  onAddWatchlist,
  isSearching,
  isSimulating,
}) => {
  const [inputPlate, setInputPlate] = useState(searchedPlate || 'GJ01AB1234');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newCrime, setNewCrime] = useState('Wanted Suspect');
  const [newLevel, setNewLevel] = useState('Critical');
  const [addLoading, setAddLoading] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPlate.trim()) {
      onSearchPlate(inputPlate.trim());
    }
  };

  const handleSelectQuickVehicle = (plate: string) => {
    setInputPlate(plate);
    onSearchPlate(plate);
  };

  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newModel) return;
    setAddLoading(true);
    try {
      await onAddWatchlist({
        plate_number: newPlate.toUpperCase().trim(),
        vehicle_model: newModel.trim(),
        crime_type: newCrime,
        alert_level: newLevel,
      });
      setShowAddModal(false);
      setNewPlate('');
      setNewModel('');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-200 font-mono">
            Vehicle Route Reconstruction & Hotlist
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800"
          >
            <PlusCircle className="w-3 h-3" />
            <span>Add to Watchlist</span>
          </button>
          {trajectory.length > 0 && (
            <button
              onClick={onClearTrajectory}
              className="flex items-center space-x-1 text-[11px] font-mono text-slate-400 hover:text-slate-200"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Vehicle Search Box as requested */}
        <form onSubmit={handleFormSubmit} className="space-y-1.5">
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Enter Plate Number e.g. GJ01AB1234
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputPlate}
                onChange={(e) => setInputPlate(e.target.value.toUpperCase())}
                placeholder="Enter Plate Number e.g. GJ01AB1234"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-sm text-yellow-400 font-mono tracking-widest placeholder:text-slate-600 outline-none uppercase font-bold"
              />
              <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono">IND</span>
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-mono font-bold rounded-lg shadow-lg shadow-red-950/40 transition-all disabled:opacity-50"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isSearching ? 'TRACKING...' : 'Reconstruct Route'}</span>
            </button>
          </div>
        </form>

        {/* Quick Hotlist Vehicles */}
        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Active Watchlist Targets (Click to Track):
          </div>
          <div className="grid grid-cols-3 gap-2">
            {watchlist.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectQuickVehicle(item.plate_number)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  searchedPlate === item.plate_number
                    ? 'border-red-500 bg-red-950/30'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-mono font-bold text-yellow-400">{item.plate_number}</div>
                <div className="text-[10px] text-slate-400 truncate">{item.vehicle_model}</div>
                <div className="text-[9px] font-mono font-bold text-red-400 mt-1 uppercase truncate flex items-center space-x-1">
                  <ShieldAlert className="w-2.5 h-2.5" />
                  <span>{item.crime_type}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Simulation trigger */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            Automated ANPR Test Bench
          </div>
          <button
            onClick={() => onSimulateDetection(inputPlate)}
            disabled={isSimulating}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-mono font-semibold rounded-lg transition-all"
          >
            <Play className="w-3 h-3 text-blue-400" />
            <span>{isSimulating ? 'SIMULATING...' : 'Simulate ANPR Scan'}</span>
          </button>
        </div>

        {/* Checkpoint Sequence Timeline */}
        {trajectory.length > 0 && (
          <div className="pt-2 space-y-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-red-400 font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reconstructed Checkpoint Path ({trajectory.length} Nodes)</span>
              </span>
              <span className="text-slate-400">Connected via GIS</span>
            </div>

            <div className="relative pl-6 space-y-2.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-red-500 before:to-amber-500">
              {trajectory.map((point, idx) => (
                <div key={point.detection_id} className="relative group">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-red-500 flex items-center justify-center text-[9px] font-mono font-bold text-red-400">
                    {idx + 1}
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 rounded p-2 text-xs font-mono space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{point.camera_name}</span>
                      <span className="text-[10px] text-cyan-400">
                        {new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Agency: {point.department}</span>
                      <span className="text-emerald-400">Match Confidence: {(point.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add to Watchlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden max-w-md w-full shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>Enroll Vehicle into Gujarat Police Watchlist</span>
            </h3>
            <form onSubmit={handleCreateWatchlist} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">License Plate Number</label>
                <input
                  type="text"
                  required
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  placeholder="e.g. GJ01XX5555"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-yellow-300 font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Vehicle Description & Model</label>
                <input
                  type="text"
                  required
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="e.g. Silver Toyota Innova Crysta"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Crime Type</label>
                  <select
                    value={newCrime}
                    onChange={(e) => setNewCrime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  >
                    <option value="Stolen">Stolen</option>
                    <option value="Wanted Suspect">Wanted Suspect</option>
                    <option value="Hit and Run">Hit and Run</option>
                    <option value="Smuggling">Smuggling</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Alert Level</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow"
                >
                  {addLoading ? 'Saving...' : 'Add Watchlist Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
