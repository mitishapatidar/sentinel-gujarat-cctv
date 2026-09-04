'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Radio, Activity, Eye, AlertTriangle, Clock } from 'lucide-react';

interface TopNavProps {
  activeAlertsCount: number;
  camerasCount: number;
  wsConnected: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeAlertsCount,
  camerasCount,
  wsConnected,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-[#0c1017]/95 backdrop-blur-md px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Brand & Badge */}
      <div className="flex items-center space-x-4">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-950 border border-blue-400/40 shadow-lg shadow-blue-900/40">
          <Shield className="w-6 h-6 text-blue-200" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-200 to-indigo-200">
              SENTINEL | Gujarat State CCTV Command Center
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 tracking-wider">
              HIGH DENSITY
            </span>
          </div>
          <p className="text-xs text-slate-400 tracking-tight font-mono">
            Statewide Heterogeneous Surveillance Network & AI ANPR Pursuit Grid
          </p>
        </div>
      </div>

      {/* Center Stats (50+ Cameras scale indicator) */}
      <div className="hidden lg:flex items-center space-x-6 bg-slate-900/70 border border-slate-800/80 rounded-lg px-5 py-2">
        <div className="flex items-center space-x-2.5">
          <Eye className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-mono tracking-wider">Active Cameras</div>
            <div className="text-sm font-bold text-slate-100 font-mono">
              {camerasCount} <span className="text-xs text-emerald-400 font-semibold">Online</span>
            </div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-800" />

        <div className="flex items-center space-x-2.5">
          <Activity className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-mono tracking-wider">Jurisdiction Grid</div>
            <div className="text-sm font-bold text-slate-100 font-mono">5 Major Cities</div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-800" />

        {/* Alert Badge Counter */}
        <div className="flex items-center space-x-2.5">
          <AlertTriangle className={`w-4 h-4 ${activeAlertsCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-mono tracking-wider">Alert Counter</div>
            <div className="text-sm font-bold text-red-400 font-mono">
              {activeAlertsCount} Hotlist Hits
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls: Live indicator & Clock */}
      <div className="flex items-center space-x-4">
        {/* Live Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
          <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-500'}`} />
          <span className="text-xs font-mono font-medium text-slate-300">
            {wsConnected ? 'LIVE FEED' : 'CONNECTING...'}
          </span>
        </div>

        {/* Real-Time Clock */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-cyan-300 font-mono text-sm">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{time || '--:--:-- IST'}</span>
        </div>
      </div>
    </header>
  );
};
