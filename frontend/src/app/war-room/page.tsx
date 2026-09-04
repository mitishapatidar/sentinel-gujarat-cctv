'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { OfficialGovBar } from '../../components/OfficialGovBar';
import { TACTICAL_CASES, TacticalCase, CaseCheckpoint } from '../../data/casesData';
import { ShieldAlert, Crosshair, Radio, Clock, Siren, Lock, AlertTriangle, CheckCircle2, ShieldCheck, MapPin, Activity, ListFilter, Volume2 } from 'lucide-react';

// SSR-safe dynamic import for WarRoomMap
const DynamicWarRoomMap = dynamic(() => import('../../components/WarRoomMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-[#0b0e14] border border-slate-800 rounded-xl text-slate-500 font-mono text-xs">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
      <span>RENDERING VECTOR GIS INTERCEPTION GRID...</span>
    </div>
  ),
});

interface AuditLog {
  id: string;
  badge: string;
  timestamp: string;
  action: string;
  status: 'CONFIRMED' | 'SECURITY_FLAG';
}

function WarRoomContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const caseId = searchParams.get('caseId') || 'case-01';

  const [activeCase, setActiveCase] = useState<TacticalCase>(
    TACTICAL_CASES.find((c) => c.id === caseId) || TACTICAL_CASES[0]
  );
  const [barricadeStatus, setBarricadeStatus] = useState<'PENDING' | 'DEPLOYED'>('PENDING');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'LOG-001',
      badge: 'GP-CID-7809',
      timestamp: '14:22:15 IST',
      action: 'Initial ANPR Match Verified at Vastrapur Promenade',
      status: 'CONFIRMED',
    },
    {
      id: 'LOG-002',
      badge: 'GP-CID-7809',
      timestamp: '15:06:40 IST',
      action: 'Statewide Amber Alert broadcast to Highway Patrolling Units',
      status: 'CONFIRMED',
    },
    {
      id: 'LOG-003',
      badge: 'GP-CID-7809',
      timestamp: '15:24:12 IST',
      action: 'Target sighted at Vaishnodevi Circle, heading towards Gandhinagar',
      status: 'CONFIRMED',
    },
  ]);

  const [isAlertPlaying, setIsAlertPlaying] = useState(false);
  const [officerBadge, setOfficerBadge] = useState('GP-CID-7809');

  useEffect(() => {
    const matched = TACTICAL_CASES.find((c) => c.id === caseId);
    if (matched) {
      setActiveCase(matched);
      setBarricadeStatus(matched.nextProjectedCheckpoint.barricadeStatus);
    }
    const saved = localStorage.getItem('sentinel_officer');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.badgeId) setOfficerBadge(p.badgeId);
      } catch {}
    }
  }, [caseId]);

  // Audio tone synthesizer for PCR Siren Alert
  const triggerPCRSiren = useCallback(() => {
    setIsAlertPlaying(true);
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.3);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {}

    // Add to audit trail
    const now = new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      badge: officerBadge,
      timestamp: now,
      action: `URGENT: PCR High-Priority Audio Alert Broadcast for ${activeCase.targetPlate}`,
      status: 'CONFIRMED',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    setTimeout(() => setIsAlertPlaying(false), 2000);
  }, [activeCase, officerBadge]);

  // Trigger automated barricade at next checkpoint
  const handleDeployBarricade = () => {
    const newStatus = barricadeStatus === 'PENDING' ? 'DEPLOYED' : 'PENDING';
    setBarricadeStatus(newStatus);

    const now = new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      badge: officerBadge,
      timestamp: now,
      action: `COMMAND: Automated Barricade ${newStatus === 'DEPLOYED' ? 'LOCKED & DEPLOYED' : 'DISENGAGED'} at ${activeCase.nextProjectedCheckpoint.name}`,
      status: 'CONFIRMED',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const projectedData = {
    ...activeCase.nextProjectedCheckpoint,
    barricadeStatus: barricadeStatus,
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans select-none">
      <OfficialGovBar />

      {/* Case Pursuit Banner Bar */}
      <div className="bg-red-950/80 border-b border-red-700/80 px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-red-300 font-bold uppercase bg-red-900/90 px-2.5 py-1 rounded border border-red-600 animate-pulse">
            <Crosshair className="w-4 h-4 text-white" />
            <span>PURSUIT IN PROGRESS</span>
          </div>
          <div className="text-white font-bold tracking-wide">
            {activeCase.firNumber} • Target: <span className="text-yellow-300 font-black">{activeCase.targetPlate}</span> ({activeCase.vehicleColor} {activeCase.vehicleModel})
          </div>
        </div>

        {/* Action button: Dispatch PCR Alert */}
        <div className="flex items-center space-x-3">
          <button
            onClick={triggerPCRSiren}
            disabled={isAlertPlaying}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-md shadow-lg shadow-red-950 transition-transform active:scale-95 disabled:opacity-50"
          >
            <Siren className="w-3.5 h-3.5 animate-spin" />
            <span>{isAlertPlaying ? 'BROADCASTING...' : 'DISPATCH PCR ALERT'}</span>
          </button>

          {/* Quick Case Switcher Dropdown */}
          <select
            value={activeCase.id}
            onChange={(e) => {
              const selected = TACTICAL_CASES.find((c) => c.id === e.target.value);
              if (selected) {
                setActiveCase(selected);
                setBarricadeStatus(selected.nextProjectedCheckpoint.barricadeStatus);
              }
            }}
            className="bg-black/70 border border-slate-700 text-slate-200 text-xs font-mono px-2 py-1 rounded outline-none cursor-pointer"
          >
            {TACTICAL_CASES.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900">
                {c.firNumber} - {c.targetPlate} ({c.category.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Tactical Grid */}
      <main className="flex-1 p-4 space-y-4 max-w-[1920px] mx-auto w-full">
        {/* TOP ROW: Video Wall (Left 45%) & GIS Interception Map (Right 55%) */}
        <div className="flex flex-col lg:flex-row gap-4 h-[440px]">
          {/* Top-Left: Tactical Video Wall (Exact Sighted Cameras) */}
          <div className="w-full lg:w-[45%] h-full bg-[#0b0e14] border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-2 font-bold text-slate-200 uppercase">
                <Radio className="w-3.5 h-3.5 text-red-500 animate-ping" />
                <span>Tactical Sighting Video Wall ({activeCase.checkpoints.length} Camera Hits)</span>
              </div>
              <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 text-[10px]">
                ANPR MATCH VERIFIED
              </span>
            </div>

            {/* 2x2 Sighting Feeds Grid */}
            <div className="grid grid-cols-2 grid-rows-2 gap-2 p-2 flex-1 min-h-[360px]">
              {activeCase.checkpoints.slice(0, 4).map((cp, idx) => (
                <div
                  key={`feed-${cp.cameraId}-${idx}`}
                  className="relative rounded-lg overflow-hidden border border-red-500/70 bg-[#121620] flex flex-col justify-between p-2 shadow-inner"
                >
                  {/* Overlay Top Bar */}
                  <div className="flex items-center justify-between z-10 text-[10px] font-mono">
                    <span className="bg-red-900/90 text-white font-bold px-1.5 py-0.5 rounded border border-red-600">
                      SIGHTING #{idx + 1}
                    </span>
                    <span className="bg-black/80 text-yellow-300 font-bold px-1.5 py-0.5 rounded border border-slate-700">
                      {cp.timestamp}
                    </span>
                  </div>

                  {/* Simulated Optical Crosshair Reticle & Bounding Box */}
                  <div className="my-auto flex flex-col items-center justify-center relative py-4">
                    <div className="w-32 h-16 border-2 border-red-500 bg-red-950/20 rounded relative flex flex-col items-center justify-center">
                      <span className="text-[10px] font-mono font-black text-yellow-300 bg-black/80 px-1.5 py-0.2 rounded border border-yellow-500">
                        {activeCase.targetPlate}
                      </span>
                      <span className="text-[8px] font-mono text-red-400 mt-1 font-bold">
                        ANPR MATCH 98%
                      </span>
                      {/* Laser crosshair */}
                      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-red-500/40" />
                      <div className="absolute inset-y-0 left-1/2 w-[1px] bg-red-500/40" />
                    </div>
                  </div>

                  {/* Camera Name & Telemetry */}
                  <div className="z-10 bg-black/80 p-1.5 rounded border border-slate-800 text-[10px] font-mono">
                    <div className="font-semibold text-slate-200 truncate">{cp.cameraName}</div>
                    <div className="text-slate-400 flex items-center justify-between text-[9px] mt-0.5">
                      <span>Speed: {cp.speedKmH} km/h</span>
                      <span className="text-cyan-400">Agency: {cp.department}</span>
                    </div>
                  </div>

                  {/* CRT scanline */}
                  <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-30" />
                </div>
              ))}
            </div>
          </div>

          {/* Top-Right: GIS Interception Map (OpenStreetMap watermark-free tiles) */}
          <div className="w-full lg:w-[55%] h-full bg-[#0b0e14] border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-2 font-bold text-slate-200 uppercase">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>GIS Real-Time Interception Map (OpenStreetMap Grid)</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="text-red-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Sighted Checkpoints</span>
                </span>
                <span className="text-yellow-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                  <span>Projected Intercept Naka</span>
                </span>
              </div>
            </div>

            <div className="flex-1 w-full h-full min-h-[360px] relative">
              <DynamicWarRoomMap
                checkpoints={activeCase.checkpoints}
                projectedNaka={projectedData}
                targetPlate={activeCase.targetPlate}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Automated Dispatch Action & Audit Trail Logger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[300px]">
          {/* Automated Dispatch Action (Col 5) */}
          <div className="lg:col-span-5 h-full bg-[#0b0e14] border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Automated Interception Dispatch</span>
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                  barricadeStatus === 'DEPLOYED'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : 'bg-yellow-950 text-yellow-300 border-yellow-600'
                }`}>
                  {barricadeStatus === 'DEPLOYED' ? 'BARRICADE ACTIVE' : 'STANDBY READY'}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Targeted Checkpoint:</span>
                  <strong className="text-yellow-400 text-sm">{activeCase.nextProjectedCheckpoint.name}</strong>
                  <div className="text-slate-400 text-[11px] mt-1">
                    ETA: ~{activeCase.nextProjectedCheckpoint.etaMinutes} mins • Coords: {activeCase.nextProjectedCheckpoint.lat.toFixed(4)}°N, {activeCase.nextProjectedCheckpoint.lng.toFixed(4)}°E
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Triggering dispatch transmits instant tire-spike lockdown commands to the automated toll barrier and alerts nearby PCR vans.
                </p>
              </div>
            </div>

            {/* Barricade Toggle Button */}
            <button
              onClick={handleDeployBarricade}
              className={`w-full py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider shadow-xl transition-all flex items-center justify-center space-x-2 ${
                barricadeStatus === 'DEPLOYED'
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-950'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>
                {barricadeStatus === 'DEPLOYED'
                  ? 'BARRICADE ACTIVE — CLICK TO DISENGAGE'
                  : 'TRIGGER AUTOMATED BARRICADE AT NEXT CHECKPOINT'}
              </span>
            </button>
          </div>

          {/* Tamper-Proof Audit Trail Logger (Col 7) */}
          <div className="lg:col-span-7 h-full bg-[#0b0e14] border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-2 font-bold text-slate-200 uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tamper-Proof Audit Trail Logger (Section 66 IT Act)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">ENCRYPTED STREAM</span>
            </div>

            <div className="p-3 flex-1 overflow-y-auto space-y-2 font-mono text-xs">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/90 flex items-start justify-between gap-3 text-[11px]"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-cyan-300">{log.badge}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{log.timestamp}</span>
                      <span className="text-emerald-400 bg-emerald-950 text-[9px] px-1.5 py-0.2 rounded border border-emerald-800">
                        {log.status}
                      </span>
                    </div>
                    <div className="text-slate-200">{log.action}</div>
                  </div>
                  <span className="text-slate-600 text-[10px] shrink-0 font-bold">{log.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function WarRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400 font-mono text-xs">
          LOADING TACTICAL WAR-ROOM TELEMETRY...
        </div>
      }
    >
      <WarRoomContent />
    </Suspense>
  );
}
