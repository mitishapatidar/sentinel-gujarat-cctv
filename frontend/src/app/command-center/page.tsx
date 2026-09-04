'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Camera, Watchlist, TrajectoryPoint, Alert } from '../../types';
import { OfficialGovBar } from '../../components/OfficialGovBar';
import { TACTICAL_CASES, TacticalCase } from '../../data/casesData';
import { Video, Shield, Navigation, AlertTriangle, Bell, Search, MapPin, Radio, Car, ShieldCheck, Download, Siren, Lock, CheckCircle2, ChevronRight, Activity, Filter, AlertOctagon, ArrowRight, X } from 'lucide-react';

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

function CommandCenterInner() {
  const searchParams = useSearchParams();
  const caseIdFromUrl = searchParams.get('caseId');

  const [cameras, setCameras] = useState<Camera[]>([]);
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
      id: 101,
      camera_id: 19,
      camera_name: 'Vastrapur Lake Junction',
      department: 'Police',
      lat: 23.0367,
      lng: 72.5305,
      plate_number: 'GJ06XX9999',
      timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
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
      timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
      confidence: 0.96,
      crime_type: 'Armed Robbery Getaway',
      vehicle_model: 'White Maruti Swift',
      alert_level: 'Critical',
      similarity: 0.95,
    },
    {
      id: 103,
      camera_id: 6,
      camera_name: 'Narol Circle - Industrial Hub',
      department: 'RTO',
      lat: 22.9734,
      lng: 72.5925,
      plate_number: 'GJ27CD5678',
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      confidence: 0.94,
      crime_type: 'Fatal Hit-and-Run Investigation',
      vehicle_model: 'Black Scorpio-N',
      alert_level: 'High',
      similarity: 0.92,
    },
    {
      id: 104,
      camera_id: 42,
      camera_name: 'Surat - Kamrej Toll Plaza NH-48',
      department: 'RTO',
      lat: 21.2712,
      lng: 72.9645,
      plate_number: 'GJ05EF9012',
      timestamp: new Date(Date.now() - 50 * 60000).toISOString(),
      confidence: 0.95,
      crime_type: 'Stolen Luxury SUV / Contraband',
      vehicle_model: 'Silver Toyota Fortuner',
      alert_level: 'High',
      similarity: 0.94,
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
  }, [caseIdFromUrl, fetchCameras, loadCaseTrajectory]);

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

  // Filter cameras
  const filteredCameras = cameras.filter((c) => {
    if (cityFilter !== 'ALL' && c.city?.toUpperCase() !== cityFilter.toUpperCase()) return false;
    if (departmentFilter !== 'ALL' && c.department?.toUpperCase() !== departmentFilter.toUpperCase()) return false;
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
                  Live CCTV Video Wall (2x2 Matrix)
                </h2>
              </div>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>30 FPS LIVE</span>
              </span>
            </div>

            {/* 2x2 Clean Video Feeds */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 1, name: 'SG Highway - ISCON Cross Road', tag: 'POLICE', plate: 'GJ01TR9876', alert: false },
                { id: 2, name: 'SG Highway - Pakwan Cross Road', tag: 'POLICE', plate: 'GJ06XX9999', alert: true },
                { id: 3, name: 'Ashram Road - Income Tax Circle', tag: 'RTO', plate: 'GJ01AB1234', alert: false },
                { id: 4, name: 'SP Ring Road - Vaishnodevi Circle', tag: 'POLICE', plate: 'GJ06XX9999', alert: true },
              ].map((feed) => (
                <div
                  key={feed.id}
                  className={`bg-slate-900 rounded-xl overflow-hidden relative border flex flex-col justify-between p-2.5 h-36 shadow-sm ${
                    feed.alert ? 'border-red-500 ring-2 ring-red-400' : 'border-slate-300'
                  }`}
                >
                  {/* Real Live MJPEG Surveillance Video Feed */}
                  <img
                    src={`${API_BASE}/api/stream/${feed.id}`}
                    alt={feed.name}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    onError={(e) => {
                      e.currentTarget.style.opacity = '0';
                    }}
                  />

                  {/* Top Bar */}
                  <div className="flex items-center justify-between z-10 text-[10px] font-mono">
                    <span className="bg-black/75 backdrop-blur-xs text-white font-bold px-1.5 py-0.5 rounded text-[9px] border border-white/20">
                      {feed.tag}
                    </span>
                    {feed.alert && (
                      <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 rounded animate-pulse text-[9px] shadow-sm">
                        HOTLIST HIT
                      </span>
                    )}
                  </div>

                  {/* Bottom Meta */}
                  <div className="z-10 text-[9px] text-white/90 truncate font-mono bg-black/70 backdrop-blur-xs px-1.5 py-0.5 rounded max-w-fit border border-white/10">
                    {feed.name}
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
            <div className="absolute top-14 inset-x-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchedPlate.trim()) handleSearchPlate(searchedPlate.trim());
                }}
                className="flex items-center space-x-2 w-full sm:w-auto"
              >
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchedPlate}
                    onChange={(e) => setSearchedPlate(e.target.value.toUpperCase())}
                    placeholder="Enter Registration (e.g. GJ05EF9012)"
                    className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none w-64 uppercase tracking-wider focus:bg-white focus:border-[#1E3A8A]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#1E3A8A] hover:bg-[#193073] text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Generate Trajectory
                </button>
              </form>

              {/* Trajectory Stats Panel */}
              {trajectory.length > 0 && (
                <div className="flex items-center space-x-3 text-xs font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span>Waypoints: <strong className="text-slate-900">{trajectory.length} Checkpoints</strong></span>
                  <span className="hidden md:inline">Target: <strong className="text-red-700">{searchedPlate}</strong></span>
                  <span className="text-emerald-700 font-bold">Status: Real-time Vector Active</span>
                </div>
              )}
            </div>

            {/* Map Area */}
            <div className="flex-1 w-full h-full relative">
              <DynamicLightGujaratMap
                cameras={filteredCameras}
                trajectory={trajectory}
                selectedCamera={selectedCamera}
                onSelectCamera={(cam) => setSelectedCamera(cam)}
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
                <span>Regular CCTV ({filteredCameras.length} Active)</span>
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

      {/* Official Government Footer */}
      <footer className="py-3 px-8 bg-white border-t border-slate-200 text-center text-xs text-slate-500 font-mono flex flex-wrap items-center justify-between">
        <span>SENTINEL GIS Tactical Command Center • Home Department, Government of Gujarat</span>
        <span className="text-slate-400">Restricted Law Enforcement Network • Encrypted State VPN</span>
      </footer>
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
