'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Camera, Watchlist, TrajectoryPoint, Alert, CameraHealthSummary } from '../../types';
import { OfficialGovBar } from '../../components/OfficialGovBar';
import { OfficialGovFooter } from '../../components/OfficialGovFooter';
import { TACTICAL_CASES, TacticalCase } from '../../data/casesData';
import { Video, Shield, Navigation, AlertTriangle, Bell, Search, MapPin, Radio, Car, ShieldCheck, Download, Siren, Lock, CheckCircle2, ChevronRight, Activity, Filter, AlertOctagon, ArrowRight, X, Cpu, Server, HardDrive, EyeOff, WifiOff, RefreshCw, SlidersHorizontal, AlertCircle, Eye, Wrench } from 'lucide-react';

// SSR-safe dynamic import for LightGujaratMap
const DynamicLightGujaratMap = dynamic(() => import('../../components/LightGujaratMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[450px] bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 font-sans text-xs">
      <div className="w-8 h-8 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mb-2.5" />
      <span className="font-semibold text-slate-700">INITIALIZING GUJARAT STATE GIS LAYER...</span>
    </div>
  ),
});

const API_BASE = 'http://localhost:8000';
const WS_BASE = 'ws://localhost:8000';

// Shard stream endpoints across localhost and 127.0.0.1 to prevent Chrome's 6-socket HTTP/1.1 bottleneck
const getStreamUrl = (feedId: number) => {
  const host = feedId <= 2 ? 'http://localhost:8000' : 'http://127.0.0.1:8000';
  return `${host}/api/stream/${feedId}`;
};

function CommandCenterInner() {
  const searchParams = useSearchParams();
  const caseIdFromUrl = searchParams.get('caseId');

  const [cameras, setCameras] = useState<Camera[]>([]);
  const [healthSummary, setHealthSummary] = useState<CameraHealthSummary | null>(null);
  const [healthFilter, setHealthFilter] = useState<'ALL' | 'ONLINE' | 'TAMPERED' | 'OFFLINE'>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');
  const [selectedTamperCam, setSelectedTamperCam] = useState<Camera | null>(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [searchedPlate, setSearchedPlate] = useState('GJ06XX9999');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [latestAlertCameraId, setLatestAlertCameraId] = useState<number | null>(null);
  const [cityFilter, setCityFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [activeCase, setActiveCase] = useState<TacticalCase | null>(null);

  // Intervention tool state
  const [pcrDispatched, setPcrDispatched] = useState(false);
  const [barricadeSignaled, setBarricadeSignaled] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // Initial mock seeded alerts for instant high-visibility demonstration
  const defaultAlerts: Alert[] = [
    {
      id: 105,
      camera_id: 2,
      camera_name: 'SG Highway - Pakwan Cross Road',
      department: 'Police',
      lat: 23.0396,
      lng: 72.5126,
      plate_number: 'DA07CLX',
      timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
      confidence: 0.98,
      crime_type: 'Stolen / Lost Mazda Sedan',
      vehicle_model: 'Silver Mazda 3',
      alert_level: 'Critical',
      similarity: 0.98,
    },
    {
      id: 106,
      camera_id: 8,
      camera_name: 'SG Highway - Gota Flyover',
      department: 'Police',
      lat: 23.0988,
      lng: 72.5312,
      plate_number: 'EY09VWS',
      timestamp: new Date(Date.now() - 7 * 60000).toISOString(),
      confidence: 0.97,
      crime_type: 'Stolen Cargo Delivery Van',
      vehicle_model: 'Silver Nissan Primastar',
      alert_level: 'High',
      similarity: 0.96,
    },
    {
      id: 107,
      camera_id: 4,
      camera_name: 'Kalupur Railway Station Circle',
      department: 'Police',
      lat: 23.0232,
      lng: 72.5997,
      plate_number: 'MH46T7527',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      confidence: 0.96,
      crime_type: 'Missing / Lost Taxi (Inter-State)',
      vehicle_model: 'White Maruti Ertiga',
      alert_level: 'High',
      similarity: 0.95,
    },
    {
      id: 108,
      camera_id: 2,
      camera_name: 'SG Highway - Pakwan Cross Road',
      department: 'Police',
      lat: 23.0396,
      lng: 72.5126,
      plate_number: 'MH04EE1980',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      confidence: 0.97,
      crime_type: 'Hit-and-Run Suspect',
      vehicle_model: 'Red Hyundai i20',
      alert_level: 'Critical',
      similarity: 0.97,
    },
    {
      id: 101,
      camera_id: 19,
      camera_name: 'Vastrapur Lake Junction',
      department: 'Police',
      lat: 23.0367,
      lng: 72.5305,
      plate_number: 'GJ06XX9999',
      timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      confidence: 0.98,
      crime_type: 'AMBER ALERT: Kidnapping Suspect',
      vehicle_model: 'Red Hyundai Creta',
      alert_level: 'Critical',
      similarity: 0.98,
    },
    {
      id: 102,
      camera_id: 2,
      camera_name: 'SG Highway - Pakwan Cross Road',
      department: 'Police',
      lat: 23.0396,
      lng: 72.5126,
      plate_number: 'GJ01AB1234',
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      confidence: 0.96,
      crime_type: 'Armed Robbery Getaway',
      vehicle_model: 'White Maruti Swift',
      alert_level: 'Critical',
      similarity: 0.95,
    },
  ];

  // Convert Case Checkpoints to Trajectory Points
  const loadCaseTrajectory = useCallback((targetCase: TacticalCase) => {
    setActiveCase(targetCase);
    setSearchedPlate(targetCase.targetPlate);
    const pts: TrajectoryPoint[] = targetCase.checkpoints.map((cp, idx) => ({
      detection_id: cp.cameraId * 100 + idx,
      camera_id: cp.cameraId,
      camera_name: cp.cameraName,
      department: cp.department,
      lat: cp.lat,
      lng: cp.lng,
      plate_number: targetCase.targetPlate,
      timestamp: new Date(Date.now() - (targetCase.checkpoints.length - idx) * 15 * 60000).toISOString(),
      confidence: 0.98,
      is_alert: true,
    }));
    setTrajectory(pts);
  }, []);

  // Fetch cameras from backend
  const fetchCameras = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cameras`);
      if (res.ok) {
        const data: Camera[] = await res.json();
        setCameras(data);
      }
    } catch (err) {
      console.error('Camera fetch notice:', err);
    }
  }, []);

  // Fetch statewide camera health & edge bandwidth audit summary
  const fetchHealthSummary = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cameras/health-summary`);
      if (res.ok) {
        const data: CameraHealthSummary = await res.json();
        setHealthSummary(data);
      }
    } catch (err) {
      console.error('Health summary notice:', err);
    }
  }, []);

  // Fetch or construct Trajectory for any search plate
  const handleSearchPlate = useCallback(async (plate: string) => {
    const clean = plate.trim().toUpperCase();
    setSearchedPlate(clean);

    // 1. Check if plate belongs to a predefined Tactical Case
    const matched = TACTICAL_CASES.find(
      (c) => c.targetPlate.toUpperCase() === clean || clean.includes(c.targetPlate.toUpperCase())
    );
    if (matched) {
      loadCaseTrajectory(matched);
      return;
    }

    // 2. Fetch from backend API
    try {
      const res = await fetch(`${API_BASE}/api/track/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data: TrajectoryPoint[] = await res.json();
        if (data.length > 0) {
          setActiveCase(null);
          setTrajectory(data);
          return;
        }
      }
    } catch (err) {
      console.error('Track error:', err);
    }
  }, [loadCaseTrajectory]);

  // Handle caseId param from URL or default
  useEffect(() => {
    fetchCameras();
    fetchHealthSummary();
    setAlerts(defaultAlerts);

    if (caseIdFromUrl) {
      const found = TACTICAL_CASES.find((c) => c.id === caseIdFromUrl);
      if (found) {
        loadCaseTrajectory(found);
        return;
      }
    }

    // Default to Case-01 (Aarav Kidnapping)
    const defaultCase = TACTICAL_CASES[0];
    if (defaultCase) {
      loadCaseTrajectory(defaultCase);
    }
  }, [caseIdFromUrl, fetchCameras, fetchHealthSummary, loadCaseTrajectory]);

  // WebSocket lifecycle
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    const connectWS = () => {
      const ws = new WebSocket(`${WS_BASE}/ws/alerts`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'HOTLIST_ALERT') {
            const newAlert: Alert = {
              id: data.detection_id || Date.now(),
              camera_id: data.camera_id,
              camera_name: data.camera_name,
              department: data.department,
              lat: data.lat,
              lng: data.lng,
              plate_number: data.plate_number,
              timestamp: data.timestamp,
              confidence: data.confidence,
              crime_type: data.matched_watchlist?.crime_type || 'Hotlist Vehicle Sighted',
              vehicle_model: data.matched_watchlist?.vehicle_model || 'Vehicle Sighted',
              alert_level: 'Critical',
              similarity: data.similarity,
            };

            // Deduplicate incoming alerts to prevent duplicate cards
            setAlerts((prev) => {
              const exists = prev.some(
                (a) => a.plate_number === newAlert.plate_number && a.camera_id === newAlert.camera_id
              );
              if (exists) return prev;
              return [newAlert, ...prev.slice(0, 7)];
            });
            setLatestAlertCameraId(data.camera_id);
          }
        } catch {}
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connectWS, 3500);
      };
    };

    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  // Filter cameras by city, department, VMS vendor, and automated health status
  const filteredCameras = cameras.filter((c) => {
    if (cityFilter !== 'ALL' && c.city?.toUpperCase() !== cityFilter.toUpperCase()) return false;
    if (departmentFilter !== 'ALL' && c.department?.toUpperCase() !== departmentFilter.toUpperCase()) return false;
    if (vendorFilter !== 'ALL' && c.vendor !== vendorFilter) return false;
    if (healthFilter === 'ONLINE' && c.health_status !== 'ONLINE') return false;
    if (healthFilter === 'TAMPERED' && !c.tamper_alert && c.health_status !== 'TAMPERED_OCCLUDED') return false;
    if (healthFilter === 'OFFLINE' && c.health_status !== 'OFFLINE_TIMEOUT' && c.health_status !== 'VIDEO_LOSS') return false;
    return true;
  });

  // Action Dock Handlers
  const handleDispatchPCR = () => {
    setPcrDispatched(true);
    setActionNotice(`Dispatched Nearest Patrol Unit (PCR-08) to intercept target vector ${searchedPlate}.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleSignalBarricade = () => {
    setBarricadeSignaled(true);
    const nakaName = activeCase?.nextProjectedCheckpoint?.name || 'Upcoming Toll Naka';
    setActionNotice(`Signal transmitted: Automated barricade and tire-spikes engaged at ${nakaName}.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleExportPDF = () => {
    setPdfGenerating(true);
    setTimeout(() => {
      setPdfGenerating(false);
      setActionNotice(`Evidence Dossier for ${searchedPlate} compiled & digitally signed for eGujCop Court Repository.`);
      setTimeout(() => setActionNotice(null), 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans select-none">
      <OfficialGovBar activeAlertsCount={alerts.length} />

      {/* Active Case Dossier Bar (Displayed when pursuing a specific case) */}
      {activeCase && (
        <div className="bg-gradient-to-r from-red-50 via-amber-50 to-blue-50 border-b border-slate-300 px-6 py-2.5 shadow-sm">
          <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <span className="bg-red-600 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px] flex items-center space-x-1 shadow-sm animate-pulse">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>ACTIVE INVESTIGATION</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                  {activeCase.firNumber}
                </span>
                <span className="font-bold text-slate-800">{activeCase.title}</span>
                <span className="text-slate-500 font-mono text-[11px]">({activeCase.policeStation})</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-white border border-slate-300 px-2.5 py-1 rounded-lg text-[11px] font-mono shadow-xs">
                Target: <strong className="text-red-700">{activeCase.targetPlate}</strong> ({activeCase.vehicleModel})
              </div>
              <div className="bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                <span>Interception Naka: <strong>{activeCase.nextProjectedCheckpoint.name}</strong> (ETA ~{activeCase.nextProjectedCheckpoint.etaMinutes}m)</span>
              </div>
              <button
                onClick={() => {
                  setActiveCase(null);
                  handleSearchPlate('GJ06XX9999');
                }}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                title="Exit Case Pursuit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2 text-xs font-mono text-[#1E3A8A] flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <strong>COMMAND EXECUTED:</strong>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Gujarat State Integrated Surveillance Command Overview */}
      <div className="px-5 pt-4 max-w-[1920px] mx-auto w-full">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          {/* Header row with Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#1E3A8A] tracking-wider">
                    GUJARAT STATE INTEGRATED CCTV NETWORK
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hidden sm:inline-flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>80,000 Nodes Active • GSWAN Grid Secured</span>
                  </span>
                </div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight mt-0.5">
                  Real-time Multi-Agency Surveillance & Autonomous Alert Grid
                </h2>
              </div>
            </div>

            {/* View Mode Toggle Button */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setIsDiagnosticsOpen(false)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                  !isDiagnosticsOpen
                    ? 'bg-white text-[#1E3A8A] font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Officer View</span>
              </button>
              <button
                onClick={() => setIsDiagnosticsOpen(true)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isDiagnosticsOpen
                    ? 'bg-[#1E3A8A] text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>VMS & Tamper Diagnostics</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isDiagnosticsOpen ? 'bg-blue-800 text-blue-200' : 'bg-slate-200 text-slate-700'}`}>
                  7 Adapters
                </span>
              </button>
            </div>
          </div>

          {/* Simple Officer View: 4 High-Impact Clear Metric Cards */}
          {!isDiagnosticsOpen ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              {/* Card 1: Camera Grid Status */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="font-bold">TOTAL CAMERAS</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-xl font-black text-slate-900 font-mono mt-1">
                  80,000 <span className="text-xs font-normal text-slate-500">Nodes</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1">
                  {healthSummary?.uptime_percentage ?? 90.4}% Operational • 52 Live Ingest Streams
                </div>
              </div>

              {/* Card 2: Active Pursuits / Alerts */}
              <div className="bg-red-50/70 border border-red-200 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-mono text-red-700 font-bold">
                  <span>ACTIVE PURSUITS</span>
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                </div>
                <div className="text-xl font-black text-red-900 font-mono mt-1">
                  {alerts.length} <span className="text-xs font-normal text-red-700">Flagged Targets</span>
                </div>
                <div className="text-[11px] text-red-700 font-medium mt-1">
                  Amber Alerts, Stolen & Cloned Vehicles
                </div>
              </div>

              {/* Card 3: Network Bandwidth */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-mono text-blue-800 font-bold">
                  <span>STATE WAN BANDWIDTH</span>
                  <span className="text-[10px] font-extrabold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded">500x SAVINGS</span>
                </div>
                <div className="text-xl font-black text-[#1E3A8A] font-mono mt-1">
                  320 Mbps <span className="text-xs font-normal text-slate-500">vs 160 Gbps</span>
                </div>
                <div className="text-[11px] text-blue-800 font-medium mt-1">
                  Edge Triage Active (99.8% GSWAN Relief)
                </div>
              </div>

              {/* Card 4: Automated Tamper Watchdog */}
              <div 
                onClick={() => {
                  const tCam = cameras.find((c) => c.tamper_alert || c.health_status === 'TAMPERED_OCCLUDED');
                  if (tCam) setSelectedTamperCam(tCam);
                }}
                className="bg-amber-50/80 border border-amber-200 hover:border-amber-300 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:bg-amber-100/60"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-amber-800 font-bold">
                  <span>TAMPER WATCHDOG</span>
                  <span className="text-[10px] font-bold text-amber-700 underline">Inspect Alert →</span>
                </div>
                <div className="text-xl font-black text-amber-900 font-mono mt-1 flex items-center space-x-2">
                  <span>{healthSummary?.tampered_count ?? 2} Occluded</span>
                  <span className="text-[10px] font-bold font-sans bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    Action Required
                  </span>
                </div>
                <div className="text-[11px] text-amber-800 font-medium mt-1">
                  Lens Spray / Physical Obstruction Flagged
                </div>
              </div>
            </div>
          ) : (
            /* Technical Diagnostics View: Detailed VMS Filters & Protocol Telemetry */
            <div className="space-y-3 pt-1 border-t border-slate-100 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* 1. Statewide Health / Uptime */}
                <div
                  onClick={() => setHealthFilter('ONLINE')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    healthFilter === 'ONLINE'
                      ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>OPERATIONAL UPTIME</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                    {healthSummary?.uptime_percentage ?? 90.4}%
                    <span className="text-xs font-semibold text-slate-500 ml-1.5 font-sans">
                      ({healthSummary?.online_count ?? 47}/{healthSummary?.total_registered ?? 52} Online)
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono font-medium mt-1">
                    Heartbeat Verified (30 FPS Ingest)
                  </div>
                </div>

                {/* 2. Automated Tamper Watchdog */}
                <div
                  onClick={() => {
                    setHealthFilter('TAMPERED');
                    const tCam = cameras.find((c) => c.tamper_alert || c.health_status === 'TAMPERED_OCCLUDED');
                    if (tCam) setSelectedTamperCam(tCam);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    healthFilter === 'TAMPERED'
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>TAMPER DETECTIONS</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  </div>
                  <div className="text-lg font-black text-amber-900 font-mono mt-0.5 flex items-center space-x-2">
                    <span>{healthSummary?.tampered_count ?? 2} Occluded Cams</span>
                  </div>
                  <div className="text-[10px] text-amber-800 font-mono font-medium mt-1 flex items-center space-x-1">
                    <span>Lens Spray / Obstruction Flagged</span>
                  </div>
                </div>

                {/* 3. Offline / Loss Watchdog */}
                <div
                  onClick={() => setHealthFilter('OFFLINE')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    healthFilter === 'OFFLINE'
                      ? 'bg-red-50 border-red-300 ring-2 ring-red-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>OFFLINE / SIGNAL LOSS</span>
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                  <div className="text-lg font-black text-red-700 font-mono mt-0.5">
                    {(healthSummary?.offline_count ?? 2) + (healthSummary?.video_loss_count ?? 1)} Dead Feeds
                  </div>
                  <div className="text-[10px] text-red-600 font-mono font-medium mt-1">
                    Ping Timeout (&gt;60s) • Auto-Failover
                  </div>
                </div>

                {/* 4. Bandwidth Savings Arithmetic */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>STATE WAN BANDWIDTH</span>
                    <span className="text-[10px] font-bold text-[#1E3A8A] font-mono">500x SAVINGS</span>
                  </div>
                  <div className="text-lg font-black text-[#1E3A8A] font-mono mt-0.5">
                    320 Mbps <span className="text-xs text-slate-400 font-normal">vs 160 Gbps</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono mt-1">
                    Edge Metadata Triage (99.8% Saved)
                  </div>
                </div>
              </div>

              {/* Filter Ribbon: Health Quick-Filters + Vendor Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-700 font-mono text-[11px]">Audit Filter:</span>
                  <button
                    onClick={() => setHealthFilter('ALL')}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                      healthFilter === 'ALL'
                        ? 'bg-[#1E3A8A] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All Feeds ({cameras.length})
                  </button>
                  <button
                    onClick={() => setHealthFilter('ONLINE')}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      healthFilter === 'ONLINE'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Online ({cameras.filter((c) => c.health_status === 'ONLINE').length})</span>
                  </button>
                  <button
                    onClick={() => {
                      setHealthFilter('TAMPERED');
                      const tCam = cameras.find((c) => c.tamper_alert || c.health_status === 'TAMPERED_OCCLUDED');
                      if (tCam) setSelectedTamperCam(tCam);
                    }}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      healthFilter === 'TAMPERED'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Tampered ({cameras.filter((c) => c.health_status === 'TAMPERED_OCCLUDED' || c.tamper_alert).length})</span>
                  </button>
                  <button
                    onClick={() => setHealthFilter('OFFLINE')}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      healthFilter === 'OFFLINE'
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>Offline / Loss ({cameras.filter((c) => c.health_status === 'OFFLINE_TIMEOUT' || c.health_status === 'VIDEO_LOSS').length})</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2 font-mono text-[11px]">
                  <span className="text-slate-500 font-bold">VMS Vendor:</span>
                  <select
                    value={vendorFilter}
                    onChange={(e) => setVendorFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 px-2.5 py-1 rounded-lg text-slate-800 font-bold outline-none cursor-pointer hover:bg-white shadow-xs"
                  >
                    <option value="ALL">All VMS Platforms (7 Vendors)</option>
                    <option value="Hikvision DarkFighter">Hikvision DarkFighter (ISAPI)</option>
                    <option value="CP Plus Intelli-Vision">CP Plus Intelli-Vision</option>
                    <option value="Milestone XProtect">Milestone XProtect (REST API)</option>
                    <option value="Genetec Omnicast">Genetec Omnicast</option>
                    <option value="Axis Q-Series">Axis Q-Series (ONVIF Profile T)</option>
                    <option value="Honeywell MAXPRO">Honeywell MAXPRO</option>
                    <option value="Dahua Starlight">Dahua Starlight</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Command Dashboard (Split View) */}
      <main className="flex-1 p-5 max-w-[1920px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT PANEL (35% Width -> lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* 1. Live CCTV Video Wall (2x2 Matrix) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-[#1E3A8A]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Live CCTV Video Wall (2x2 Multi-VMS Matrix)
                </h2>
              </div>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>30 FPS LIVE • ONEFEED INGEST</span>
              </span>
            </div>

            {/* 2x2 Video Feeds with Protocol & Vendor Badging */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  id: 1,
                  name: 'SG Highway - Overpass (CAM-01)',
                  tag: 'POLICE',
                  vendor: 'Hikvision DarkFighter',
                  protocol: 'ONVIF-T',
                  alert: true,
                  fps: 30,
                  res: '1080p',
                },
                {
                  id: 2,
                  name: 'SG Highway - Pakwan Cross (CAM-02)',
                  tag: 'POLICE',
                  vendor: 'CP Plus Intelli-Vision',
                  protocol: 'Hikvision ISAPI',
                  alert: true,
                  fps: 30,
                  res: '1080p',
                },
                {
                  id: 3,
                  name: 'Ashram Road - Metro Flyover (CAM-03)',
                  tag: 'RTO',
                  vendor: 'Milestone XProtect',
                  protocol: 'Milestone REST',
                  alert: true,
                  fps: 30,
                  res: '1080p',
                },
                {
                  id: 4,
                  name: 'SP Ring Road - Vaishnodevi (CAM-04)',
                  tag: 'POLICE',
                  vendor: 'Genetec Omnicast',
                  protocol: 'RTSP H.265',
                  alert: true,
                  fps: 30,
                  res: '1080p',
                },
              ].map((feed) => (
                <div
                  key={feed.id}
                  className={`bg-slate-900 rounded-xl overflow-hidden relative border flex flex-col justify-between p-2.5 h-38 shadow-sm ${
                    feed.alert ? 'border-red-500 ring-2 ring-red-400' : 'border-slate-300'
                  }`}
                >
                  {/* Real Live MJPEG Surveillance Video Feed */}
                  <img
                    src={getStreamUrl(feed.id)}
                    alt={feed.name}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    loading="eager"
                  />

                  {/* Top Bar: Tag + Protocol Adapter Badge + Health/Hit */}
                  <div className="flex items-center justify-between z-10 text-[10px] font-mono gap-1">
                    <div className="flex items-center space-x-1">
                      <span className="bg-black/75 backdrop-blur-xs text-white font-bold px-1.5 py-0.5 rounded text-[9px] border border-white/20">
                        {feed.tag}
                      </span>
                      <span className="bg-blue-900/80 backdrop-blur-xs text-blue-200 font-bold px-1.5 py-0.5 rounded text-[8px] border border-blue-400/30">
                        {feed.protocol}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold px-1.5 py-0.5 rounded text-[8px] flex items-center space-x-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{feed.fps} FPS</span>
                      </span>
                      {feed.alert && (
                        <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 rounded animate-pulse text-[9px] shadow-sm">
                          HOTLIST HIT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Bar: Camera Name + Vendor Badge */}
                  <div className="flex items-center justify-between z-10 text-[9px] font-mono gap-2">
                    <div className="text-white/95 truncate bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded border border-white/10 max-w-[65%] font-medium">
                      {feed.name}
                    </div>
                    <div className="text-amber-300 font-bold bg-black/75 backdrop-blur-xs px-1.5 py-0.5 rounded border border-amber-500/30 text-[8px] uppercase shrink-0">
                      {feed.vendor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Real-time Alert Notification Feed */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-1 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-red-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Real-time Alert Notification Feed
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                {alerts.length} Incidents
              </span>
            </div>

            {/* Alert Cards List */}
            <div className="space-y-2.5 overflow-y-auto max-h-[340px] pr-1">
              {alerts.map((alert, idx) => (
                <div
                  key={`alert-${alert.id}-${idx}`}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm border-l-4 border-l-red-600 space-y-1.5 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-900 font-mono tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                        {alert.plate_number}
                      </span>
                      <span className="text-[10px] text-red-600 font-bold ml-2 uppercase">
                        {alert.crime_type}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{alert.camera_name} ({alert.vehicle_model})</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-700">
                      Match: {((alert.similarity || 0.95) * 100).toFixed(0)}%
                    </span>
                    <button
                      onClick={() => handleSearchPlate(alert.plate_number)}
                      className="px-3 py-1 bg-[#1E3A8A] hover:bg-[#193073] text-white text-[10px] font-bold rounded-md shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Track & Reconstruct Route</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (65% Width -> lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Real Gujarat GIS Map Container */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[520px] relative">
            {/* Top Map Controls Bar */}
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Jurisdiction Filter:</span>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="bg-white border border-slate-300 px-2.5 py-1 rounded-lg text-slate-800 font-medium outline-none shadow-sm cursor-pointer"
                >
                  <option value="ALL">All Gujarat State</option>
                  <option value="AHMEDABAD">Ahmedabad Metropolitan</option>
                  <option value="GANDHINAGAR">Gandhinagar Capital / GIFT City</option>
                  <option value="SURAT">Surat Municipal</option>
                  <option value="VADODARA">Vadodara Region</option>
                  <option value="RAJKOT">Rajkot Saurashtra</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Agency:</span>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="bg-white border border-slate-300 px-2.5 py-1 rounded-lg text-slate-800 font-medium outline-none shadow-sm cursor-pointer"
                >
                  <option value="ALL">All Departments</option>
                  <option value="POLICE">Police Only</option>
                  <option value="RTO">Traffic / RTO</option>
                  <option value="CIVIL SUPPLIES">Civil Supplies</option>
                </select>
              </div>
            </div>

            {/* Active Vehicle Pursuit Bar (Floating Top Overlay) */}
            <div className="absolute top-14 inset-x-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-2.5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchedPlate.trim()) handleSearchPlate(searchedPlate.trim());
                  }}
                  className="flex items-center space-x-2"
                >
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchedPlate}
                      onChange={(e) => setSearchedPlate(e.target.value.toUpperCase())}
                      placeholder="Enter Registration (e.g. GJ06XX9999)"
                      className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none w-56 uppercase tracking-wider focus:bg-white focus:border-[#1E3A8A]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#193073] text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    Plot Route
                  </button>
                </form>

                {/* Quick 1-Click Target Registration Chips */}
                <div className="hidden xl:flex items-center space-x-1.5 text-[10px] font-mono text-slate-500 pl-1">
                  <span className="font-semibold">Quick Targets:</span>
                  {[
                    { plate: 'GJ06XX9999', label: 'Amber Alert' },
                    { plate: 'GJ01AB1234', label: 'Robbery' },
                    { plate: 'MH46T7527', label: 'Missing Taxi' },
                  ].map((target) => (
                    <button
                      key={target.plate}
                      type="button"
                      onClick={() => {
                        setSearchedPlate(target.plate);
                        handleSearchPlate(target.plate);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2 py-1 rounded border border-slate-200 cursor-pointer transition-colors"
                      title={target.label}
                    >
                      {target.plate}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trajectory Stats Panel */}
              {trajectory.length > 0 && (
                <div className="flex items-center space-x-2.5 text-xs font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                  <span>Waypoints: <strong className="text-slate-900">{trajectory.length} Checkpoints</strong></span>
                  <span>Target: <strong className="text-red-700">{searchedPlate}</strong></span>
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Vector Active</span>
                  </span>
                </div>
              )}
            </div>

            {/* Map Area */}
            <div className="flex-1 w-full h-full relative">
              <DynamicLightGujaratMap
                cameras={filteredCameras}
                trajectory={trajectory}
                selectedCamera={selectedCamera}
                onSelectCamera={(cam) => {
                  setSelectedCamera(cam);
                  if (cam.health_status === 'TAMPERED_OCCLUDED' || cam.tamper_alert) {
                    setSelectedTamperCam(cam);
                  }
                }}
                latestAlertCameraId={latestAlertCameraId}
              />
            </div>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-3 py-2 shadow-md text-[11px] font-mono flex items-center space-x-4">
              <div className="font-bold text-slate-700 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 bg-white"></span>
                <span>Gujarat Unified Camera Layer</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#1E3A8A]"></span>
                <span>Regular CCTV ({filteredCameras.length} Filtered)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-red-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>Hotlist Sighting</span>
              </div>
            </div>
          </div>

          {/* 3. Action Dock / Tactical Intervention Tools */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Tactical Intervention Tools (Authorized Dispatch)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Button 1: PCR Dispatch */}
              <button
                onClick={handleDispatchPCR}
                className={`p-3 rounded-xl border flex items-center space-x-3 transition-all text-left cursor-pointer ${
                  pcrDispatched
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 text-slate-800'
                }`}
              >
                <div className={`p-2 rounded-lg ${pcrDispatched ? 'bg-emerald-600 text-white' : 'bg-blue-100 text-[#1E3A8A]'}`}>
                  <Siren className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Dispatch Mobile Patrol</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {pcrDispatched ? 'Unit PCR-08 En Route' : 'PCR-08 SG Highway Unit'}
                  </div>
                </div>
              </button>

              {/* Button 2: Signal Barricade */}
              <button
                onClick={handleSignalBarricade}
                className={`p-3 rounded-xl border flex items-center space-x-3 transition-all text-left cursor-pointer ${
                  barricadeSignaled
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 text-slate-800'
                }`}
              >
                <div className={`p-2 rounded-lg ${barricadeSignaled ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Signal Toll Barricade</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {barricadeSignaled ? 'Toll Barrier Locked' : 'Trigger Automated Gate Spikes'}
                  </div>
                </div>
              </button>

              {/* Button 3: PDF Export */}
              <button
                onClick={handleExportPDF}
                disabled={pdfGenerating}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-800 flex items-center space-x-3 transition-all text-left cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-slate-200 text-slate-700">
                  <Download className={`w-5 h-5 ${pdfGenerating ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <div className="text-xs font-bold">
                    {pdfGenerating ? 'Compiling Dossier...' : 'Export Signed Dossier'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Court-admissible PDF Record</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Edge Tamper Diagnostic Modal */}
      {selectedTamperCam && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900">
                  <AlertTriangle className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    ONEFEED™ TAMPER AUDIT INCIDENT
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Physical Lens Occlusion / Spray Paint Alert
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedTamperCam(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Camera Node:</span>
                <span className="font-bold text-slate-900">{selectedTamperCam.name} (ID: #{selectedTamperCam.id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location / City:</span>
                <span className="text-slate-800">{selectedTamperCam.city || 'Gujarat'} • {selectedTamperCam.lat.toFixed(4)}°N, {selectedTamperCam.lng.toFixed(4)}°E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">VMS Platform:</span>
                <span className="font-bold text-slate-800">{selectedTamperCam.vendor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ingestion Protocol:</span>
                <span className="font-bold text-[#1E3A8A]">{selectedTamperCam.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Edge AI Diagnosis:</span>
                <span className="text-amber-800 font-bold">Optical Flow Variance: 0.0018 (Threshold &gt; 0.1500)</span>
              </div>
              <div className="text-[11px] text-slate-600 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 leading-relaxed font-sans">
                <strong>Incident Analysis:</strong> High-frequency edge definition dropped by 98.4% with zero inter-frame optical flow variance. Physical lens occlusion, cloth covering, or paint spray detected over camera aperture.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setSelectedCamera(selectedTamperCam);
                  setSelectedTamperCam(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                View on Map
              </button>
              <button
                onClick={() => {
                  setActionNotice(`Gujarat Police Field Technical Unit dispatched to ${selectedTamperCam.name} for physical lens restoration.`);
                  setSelectedTamperCam(null);
                  setTimeout(() => setActionNotice(null), 5000);
                }}
                className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#193073] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center space-x-1.5"
              >
                <Siren className="w-4 h-4" />
                <span>Dispatch Field Tech Unit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Government Footer */}
      <OfficialGovFooter />
    </div>
  );
}

export default function CommandCenterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-mono text-xs text-slate-600">
          <div className="w-8 h-8 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mb-3" />
          <span>INITIALIZING SENTINEL COMMAND CENTER...</span>
        </div>
      }
    >
      <CommandCenterInner />
    </Suspense>
  );
}
