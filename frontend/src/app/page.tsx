'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Camera, Watchlist, TrajectoryPoint, Alert } from '../types';
import { TopNav } from '../components/TopNav';
import { VideoGrid } from '../components/VideoGrid';
import { RouteTracker } from '../components/RouteTracker';
import { LiveAlertFeed } from '../components/LiveAlertFeed';
import { X, AlertOctagon } from 'lucide-react';

// SSR-safe dynamic Leaflet map import
const DynamicSentinelMap = dynamic(() => import('../components/SentinelMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[380px] bg-[#0b0e14] border border-slate-800 rounded-xl text-slate-500 font-mono text-sm">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
      <span>INITIALIZING STATEWIDE GIS SATELLITE MESH...</span>
    </div>
  ),
});

const API_BASE = 'http://localhost:8000';
const WS_BASE = 'ws://localhost:8000';

export default function CommandCenter() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [searchedPlate, setSearchedPlate] = useState<string>('GJ01AB1234');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [latestAlertCameraId, setLatestAlertCameraId] = useState<number | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeSnapshot, setActiveSnapshot] = useState<{ uri: string; plate: string } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // Play tactical alert sound using Web Audio API
  const playAlertSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context may be restricted before user clicks
    }
  }, []);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      // 1. Cameras (50+ feeds)
      const camRes = await fetch(`${API_BASE}/api/cameras`);
      if (camRes.ok) {
        const camData = await camRes.json();
        setCameras(camData);
      }

      // 2. Watchlist
      const wlRes = await fetch(`${API_BASE}/api/watchlist`);
      if (wlRes.ok) {
        const wlData = await wlRes.json();
        setWatchlist(wlData);
      }

      // 3. Alerts (latest 10)
      const alertRes = await fetch(`${API_BASE}/api/alerts?limit=10`);
      if (alertRes.ok) {
        const alertData = await alertRes.json();
        setAlerts(alertData);
      }
    } catch (err) {
      console.error('Initial telemetry fetch failed:', err);
    }
  }, []);

  // Track specific plate trajectory
  const handleSearchPlate = async (plate: string) => {
    setIsSearching(true);
    setSearchedPlate(plate);
    try {
      const res = await fetch(`${API_BASE}/api/track/${encodeURIComponent(plate)}`);
      if (res.ok) {
        const data: TrajectoryPoint[] = await res.json();
        setTrajectory(data);
      }
    } catch (err) {
      console.error('Tracking query failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Add vehicle to watchlist
  const handleAddWatchlist = async (entry: {
    plate_number: string;
    vehicle_model: string;
    crime_type: string;
    alert_level: string;
  }) => {
    const res = await fetch(`${API_BASE}/api/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (res.ok) {
      const newEntry = await res.json();
      setWatchlist((prev) => [newEntry, ...prev]);
    } else {
      const err = await res.json();
      alert(err.detail || 'Could not enroll vehicle into Watchlist.');
    }
  };

  // Trigger manual or test detection
  const handleSimulateDetection = async (plate?: string) => {
    setIsSimulating(true);
    try {
      const payload: { plate_number?: string } = {};
      if (plate) payload.plate_number = plate;

      const res = await fetch(`${API_BASE}/api/simulate-detection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.is_alert) {
          playAlertSound();
          setLatestAlertCameraId(result.camera_id);
          if (plate && result.plate_number.includes(plate.slice(0, 6))) {
            handleSearchPlate(plate);
          }
        }
      }
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Focus a camera on map
  const handleFocusCamera = (cameraId: number) => {
    const target = cameras.find((c) => c.id === cameraId);
    if (target) {
      setSelectedCamera(target);
    }
  };

  // WebSocket lifecycle
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      const ws = new WebSocket(`${WS_BASE}/ws/alerts`);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
      };

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
              crime_type: data.matched_watchlist?.crime_type || 'Stolen',
              vehicle_model: data.matched_watchlist?.vehicle_model,
              alert_level: data.matched_watchlist?.alert_level || 'Critical',
              similarity: data.similarity,
              snapshot: data.snapshot,
            };

            setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]);
            setLatestAlertCameraId(data.camera_id);
            playAlertSound();

            setCameras((prevCams) =>
              prevCams.map((c) => (c.id === data.camera_id ? { ...c, recent_alert: true } : c))
            );
          }
        } catch (e) {
          console.error('WS payload parse error:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    fetchData();
    connectWebSocket();
    handleSearchPlate('GJ01AB1234');

    return () => {
      if (wsRef.current) wsRef.current.close();
      clearTimeout(reconnectTimeout);
    };
  }, [fetchData, playAlertSound]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans select-none">
      {/* Header Bar */}
      <TopNav
        activeAlertsCount={alerts.length}
        camerasCount={cameras.length}
        wsConnected={wsConnected}
      />

      {/* High-density Command Center Layout */}
      <main className="flex-1 p-3.5 space-y-3.5 max-w-[1920px] mx-auto w-full">
        {/* TOP SECTION: Left 45% (2x2 Video Wall), Right 55% (Leaflet Map centered at Ahmedabad) */}
        <div className="flex flex-col lg:flex-row gap-3.5 h-[440px]">
          {/* Top Section Left 45% */}
          <div className="w-full lg:w-[45%] h-full">
            <VideoGrid
              cameras={cameras}
              selectedCameraId={selectedCamera?.id || null}
              onSelectCamera={(cam) => setSelectedCamera(cam)}
              latestAlertCameraId={latestAlertCameraId}
            />
          </div>

          {/* Top Section Right 55% */}
          <div className="w-full lg:w-[55%] h-full">
            <DynamicSentinelMap
              cameras={cameras}
              trajectory={trajectory}
              selectedCamera={selectedCamera}
              onSelectCamera={(cam) => setSelectedCamera(cam)}
              latestAlertCameraId={latestAlertCameraId}
            />
          </div>
        </div>

        {/* BOTTOM SECTION: Left (Vehicle Search & Route Reconstruction), Right (Live Alert Feed) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 h-[440px]">
          {/* Bottom Left: Vehicle Search Box & Route Reconstruction */}
          <div className="h-full">
            <RouteTracker
              watchlist={watchlist}
              trajectory={trajectory}
              searchedPlate={searchedPlate}
              onSearchPlate={handleSearchPlate}
              onClearTrajectory={() => setTrajectory([])}
              onSimulateDetection={handleSimulateDetection}
              onAddWatchlist={handleAddWatchlist}
              isSearching={isSearching}
              isSimulating={isSimulating}
            />
          </div>

          {/* Bottom Right: Live Alert Incident Feed */}
          <div className="h-full">
            <LiveAlertFeed
              alerts={alerts}
              onTrackPlate={handleSearchPlate}
              onFocusCamera={handleFocusCamera}
              onViewSnapshot={(uri, plate) => setActiveSnapshot({ uri, plate })}
            />
          </div>
        </div>
      </main>

      {/* High-Resolution OpenCV Snapshot Inspector Modal */}
      {activeSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="w-5 h-5 text-red-500" />
                <span className="font-mono text-sm font-bold text-white">
                  OPTICAL RECOGNITION FORENSIC CAPTURE — {activeSnapshot.plate}
                </span>
              </div>
              <button
                onClick={() => setActiveSnapshot(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-black flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeSnapshot.uri}
                alt="Captured CCTV frame"
                className="w-full h-auto rounded border border-slate-800 shadow-inner"
              />
            </div>
            <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>OpenCV AI Neural Reticle • Optical Timestamp Authenticated</span>
              <button
                onClick={() => setActiveSnapshot(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
