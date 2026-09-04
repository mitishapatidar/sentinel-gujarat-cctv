'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OfficialGovBar } from '../../components/OfficialGovBar';
import { TACTICAL_CASES, TacticalCase } from '../../data/casesData';
import { ShieldAlert, Crosshair, MapPin, Car, AlertOctagon, Search, FileBadge, ArrowRight, Radio } from 'lucide-react';

export default function CasesDirectoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ALL' | 'KIDNAPPING' | 'FUGITIVE_ROBBERY' | 'STOLEN_VEHICLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = TACTICAL_CASES.filter((c) => {
    if (activeTab !== 'ALL' && c.category !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.firNumber.toLowerCase().includes(q) ||
        c.targetPlate.toLowerCase().includes(q) ||
        c.vehicleModel.toLowerCase().includes(q) ||
        c.suspectInfo.toLowerCase().includes(q) ||
        c.policeStation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleLaunchWarRoom = (caseId: string) => {
    router.push(`/command-center?caseId=${caseId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans select-none">
      <OfficialGovBar activeAlertsCount={12} />

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                CRIME INTELLIGENCE REGISTRY
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5 font-serif">
              Statewide Case Directory & Vehicle Hotlist
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Active Amber Alerts, wanted fugitives, and stolen vehicles synchronized live with eGujCop and State Crime Records Bureau (SCRB).
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FIR, plate, suspect..."
              className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
            />
          </div>
        </div>

        {/* Filterable Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'ALL'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Active Cases ({TACTICAL_CASES.length})
          </button>
          <button
            onClick={() => setActiveTab('KIDNAPPING')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'KIDNAPPING'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-red-700 border border-slate-200 hover:bg-red-50'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Amber Alert / Kidnapping</span>
          </button>
          <button
            onClick={() => setActiveTab('FUGITIVE_ROBBERY')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'FUGITIVE_ROBBERY'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-amber-700 border border-slate-200 hover:bg-amber-50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Fugitives & Armed Robbery</span>
          </button>
          <button
            onClick={() => setActiveTab('STOLEN_VEHICLE')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'STOLEN_VEHICLE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-emerald-700 border border-slate-200 hover:bg-emerald-50'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Stolen Vehicles (VAHAN Sync)</span>
          </button>
        </div>

        {/* Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCases.map((item) => {
            const isAmber = item.category === 'KIDNAPPING';
            const isCritical = item.threatLevel === 'CRITICAL_AMBER';

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: FIR & Plate */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
                          {item.firNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isAmber
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : isCritical
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {item.threatLevel.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Station: <strong className="text-slate-700">{item.policeStation}</strong>
                      </div>
                    </div>

                    {/* Plate Tag */}
                    <div className="text-right">
                      <div className="text-sm font-black font-mono tracking-wider text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-300">
                        {item.targetPlate}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">IND REGISTRATION</div>
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-serif leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      <strong className="text-red-700">Suspect Profile:</strong> {item.suspectInfo}
                    </p>
                    {item.victimInfo && (
                      <p className="text-xs text-blue-800 bg-blue-50 p-2 rounded-lg border border-blue-200 mt-1">
                        <strong>Victim Details:</strong> {item.victimInfo}
                      </p>
                    )}
                  </div>

                  {/* Telemetry snippet */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Vehicle: <strong className="text-slate-800">{item.vehicleModel} ({item.vehicleColor})</strong></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Last Sighted: <strong className="text-slate-800">{item.lastSightedCamera}</strong></span>
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">{item.lastSightedTime}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {item.checkpoints.length} Sightings Logged
                  </span>

                  <button
                    onClick={() => handleLaunchWarRoom(item.id)}
                    className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#193073] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <span>Launch War-Room & Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-8 bg-white border-t border-slate-200 text-center text-xs text-slate-500 font-mono">
        SENTINEL Criminal Pursuit Grid • Home Department, Government of Gujarat
      </footer>
    </div>
  );
}
