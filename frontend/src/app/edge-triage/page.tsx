'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { OfficialGovBar } from '../../components/OfficialGovBar';
import { EdgeTriageMetrics } from '../../types';
import { 
  Cpu, Server, HardDrive, Activity, AlertTriangle, CheckCircle2, 
  Shield, Zap, Radio, ArrowRight, Download, RefreshCw, Layers, 
  Sliders, Video, Lock, FileText, Check, AlertOctagon, Terminal
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

function EdgeTriageInner() {
  // Interactive Scale Slider state
  const [cameraCount, setCameraCount] = useState<number>(80000);
  const [activeStreams, setActiveStreams] = useState<number>(4);
  const [metrics, setMetrics] = useState<EdgeTriageMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [onDemandStreaming, setOnDemandStreaming] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Fetch or calculate metrics
  const fetchMetrics = useCallback(async (count: number, streams: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/edge-triage/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camera_count: count,
          raw_bitrate_mbps: 2.0,
          edge_metadata_kbps: 4.0,
          active_ondemand_streams: streams,
        }),
      });
      if (res.ok) {
        const data: EdgeTriageMetrics = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Edge triage calculation notice:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics(cameraCount, activeStreams);
  }, [cameraCount, activeStreams, fetchMetrics]);

  // Handle Preset Clicks
  const handlePreset = (count: number) => {
    setCameraCount(count);
    fetchMetrics(count, activeStreams);
  };

  // Toggle On-Demand Video Pull Simulator
  const handleToggleOnDemand = () => {
    if (onDemandStreaming) {
      setOnDemandStreaming(false);
      setActiveStreams(0);
      setActionNotice('On-Demand video streams released. Network returned to pure 4 Kbps JSON telemetry.');
    } else {
      setOnDemandStreaming(true);
      setActiveStreams(8);
      setActionNotice('On-Demand stream requested for 8 Tactical Incident cameras (2.0 Mbps each). Remaining 79,992 cameras stay at 4 Kbps metadata.');
    }
    setTimeout(() => setActionNotice(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans select-none">
      <OfficialGovBar activeAlertsCount={14} />

      {/* Top Engineering Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shadow-md">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#1E3A8A] tracking-wider">
                  IDEA 3 • &quot;EDGE TRIAGE&quot; PROOF
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Gujarat State WAN (GSWAN) Kinematic Scalability & NPU Ingest Architecture
                </span>
              </div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                The 80,000 Camera Bandwidth Proof — Edge Triage vs Central Streaming
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-1.5 rounded-xl text-xs font-mono">
            <AlertOctagon className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>CRITICAL TECHNICAL FILTER:</strong> 160 Gbps proposals cause immediate disqualification
            </span>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2.5 text-xs font-mono text-[#1E3A8A] flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <strong>TELEMETRY STATUS:</strong>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Interactive Scale Slider Control Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <span className="text-xs font-mono font-bold text-slate-700 whitespace-nowrap">
              Grid Scale: <strong className="text-slate-900 text-sm">{cameraCount.toLocaleString()} CAMERAS</strong>
            </span>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={cameraCount}
              onChange={(e) => setCameraCount(Number(e.target.value))}
              className="w-full md:w-80 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#1E3A8A]"
            />
          </div>

          {/* Quick-Jump Scale Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-500 font-bold text-[11px]">PRESET BENCHMARKS:</span>
            {[
              { count: 52, label: '52 Pilot Grid' },
              { count: 10000, label: '10,000 District' },
              { count: 80000, label: '80,000 Gujarat Police Target' },
              { count: 100000, label: '100,000 Mega Grid' },
            ].map((p) => (
              <button
                key={p.count}
                onClick={() => handlePreset(p.count)}
                className={`px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                  cameraCount === p.count
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 max-w-[1920px] mx-auto w-full space-y-6">
        {/* Side-by-Side Dual Architecture Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Traditional Cloud Ingestion (The Disqualification Trap) */}
          <div className="bg-white border-2 border-red-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden space-y-5">
            <div className="absolute top-0 right-0 bg-red-600 text-white font-mono font-black text-[10px] uppercase px-3 py-1 rounded-bl-xl shadow-xs">
              DISQUALIFICATION TRAP
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Traditional Central Cloud Streaming
                  </h2>
                  <div className="text-xs text-red-700 font-mono font-bold">
                    Naïve Raw Ingest (2.0 Mbps per Camera)
                  </div>
                </div>
              </div>

              {/* Huge Bandwidth Dial */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center space-y-1">
                <div className="text-[11px] font-mono text-red-800 font-bold uppercase tracking-wider">
                  REQUIRED STATE WAN INGEST BANDWIDTH
                </div>
                <div className="text-4xl font-black font-mono text-red-600 tracking-tight">
                  {metrics?.raw_bandwidth_gbps ?? 160.0} Gbps
                </div>
                <div className="text-xs font-mono font-bold text-red-800 animate-pulse">
                  ⚠️ {cameraCount.toLocaleString()} × 2.0 Mbps = {metrics?.raw_bandwidth_gbps ?? 160.0} Gbps
                </div>
              </div>

              {/* Technical Failure Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[10px]">GSWAN 10 Gbps BACKBONE</div>
                  <div className="text-base font-black text-red-700">
                    {metrics?.central_gswan_utilization_percent ?? 1600}% OVERLOAD
                  </div>
                  <div className="text-[10px] text-red-600">Immediate State Network Collapse</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[10px]">PIPELINE LATENCY</div>
                  <div className="text-base font-black text-red-700">&gt; 12,000 ms</div>
                  <div className="text-[10px] text-red-600">Severe frame dropping & stutter</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[10px]">MONTHLY CLOUD EGRESS</div>
                  <div className="text-base font-black text-slate-800">
                    {metrics?.cost_central_monthly_inr ?? '₹14.2 Crore / mo'}
                  </div>
                  <div className="text-[10px] text-slate-500">Massive public fund burn</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[10px]">POLICE OUTPOST IMPACT</div>
                  <div className="text-base font-black text-red-700">CCTNS Disconnected</div>
                  <div className="text-[10px] text-red-600">Dial-100 VoIP choked out</div>
                </div>
              </div>
            </div>

            <div className="bg-red-100/70 border border-red-200 rounded-xl p-3 text-[11px] text-red-900 leading-relaxed font-sans">
              <strong>Why Evaluators Reject This:</strong> Streaming 80,000 full-motion feeds over state telecommunications chokes police station CCTNS access, causes packet loss in 112 emergency calls, and requires ₹170+ Crore in annual cloud bandwidth fees.
            </div>
          </div>

          {/* Card 2: SENTINEL Edge Triage (The Winning Solution) */}
          <div className="bg-white border-2 border-emerald-400 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden space-y-5">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white font-mono font-black text-[10px] uppercase px-3 py-1 rounded-bl-xl shadow-xs">
              PRODUCTION ARCHITECTURE
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    SENTINEL Edge Triage Pipeline
                  </h2>
                  <div className="text-xs text-emerald-700 font-mono font-bold">
                    NPU Edge Inference + On-Demand Stream Pull
                  </div>
                </div>
              </div>

              {/* Huge Bandwidth Dial */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-1">
                <div className="text-[11px] font-mono text-emerald-800 font-bold uppercase tracking-wider">
                  OPTIMIZED STATE WAN INGEST BANDWIDTH
                </div>
                <div className="text-4xl font-black font-mono text-emerald-700 tracking-tight">
                  {metrics?.total_edge_bandwidth_mbps ?? 328.0} Mbps
                </div>
                <div className="text-xs font-mono font-bold text-emerald-800">
                  ✅ {cameraCount.toLocaleString()} × 4 Kbps JSON = {metrics?.edge_metadata_bandwidth_mbps ?? 320.0} Mbps (500× Bandwidth Reduction)
                </div>
              </div>

              {/* Technical Efficiency Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[10px]">GSWAN 10 Gbps BACKBONE</div>
                  <div className="text-base font-black text-emerald-700">
                    {metrics?.edge_gswan_utilization_percent ?? 3.28}% SAFE LOAD
                  </div>
                  <div className="text-[10px] text-emerald-600">99.8% Capacity Available</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[10px]">EDGE INFERENCE LATENCY</div>
                  <div className="text-base font-black text-emerald-700">&lt; 35 ms</div>
                  <div className="text-[10px] text-emerald-600">Sub-second ANPR hotlist alert</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[10px]">MONTHLY BANDWIDTH COST</div>
                  <div className="text-base font-black text-slate-800">
                    {metrics?.cost_edge_monthly_inr ?? '₹8,692 / mo'}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold">99.9% Cost Elimination</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[10px]">POLICE OUTPOST IMPACT</div>
                  <div className="text-base font-black text-emerald-700">Zero Contention</div>
                  <div className="text-[10px] text-emerald-600">GSWAN network runs smoothly</div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-100/70 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-900 leading-relaxed font-sans">
              <strong>How It Operates:</strong> Compact NPU edge appliances sit at police stations or junctions processing 8–16 feeds locally. Central command receives only 4 Kbps JSON event records. When an officer clicks &quot;Inspect Stream&quot;, ONLY that 1 camera transmits full video.
            </div>
          </div>
        </div>

        {/* Live On-Demand Video Pull Demonstration Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Live On-Demand Video Ingestion Verification
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Demonstrating that 99.99% of cameras remain in passive 4 Kbps metadata mode until manually requested
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleOnDemand}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-xs ${
                onDemandStreaming
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-[#1E3A8A] text-white hover:bg-[#193073]'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{onDemandStreaming ? 'Release On-Demand Streams (Reset to 0)' : 'Simulate 8 Tactical Video Feeds (2.0 Mbps each)'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1">
              <div className="text-slate-500 text-[11px]">PASSIVE METADATA FEEDS</div>
              <div className="text-xl font-black text-slate-900">
                {(cameraCount - activeStreams).toLocaleString()} Cams @ 4 Kbps
              </div>
              <div className="text-[11px] text-emerald-700 font-bold">
                Bandwidth: {((cameraCount - activeStreams) * 4 / 1000).toFixed(1)} Mbps
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1">
              <div className="text-slate-500 text-[11px]">ACTIVE ON-DEMAND VIDEO STREAMS</div>
              <div className="text-xl font-black text-[#1E3A8A]">
                {activeStreams} Streams @ 2.0 Mbps
              </div>
              <div className="text-[11px] text-[#1E3A8A] font-bold">
                Bandwidth: {(activeStreams * 2.0).toFixed(1)} Mbps
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1">
              <div className="text-slate-500 text-[11px]">TOTAL STATEWIDE LOAD</div>
              <div className="text-xl font-black text-emerald-700">
                {metrics?.total_edge_bandwidth_mbps ?? 328.0} Mbps
              </div>
              <div className="text-[11px] text-slate-600">
                {metrics?.bandwidth_reduction_ratio ?? '500x Reduction'}
              </div>
            </div>
          </div>
        </div>

        {/* Edge Hardware Topology & Accelerator Profiles */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Physical Edge Hardware Deployment & Cluster Sizing
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Cluster Sizing: Requires {metrics?.edge_appliances_needed_min.toLocaleString()} to {metrics?.edge_appliances_needed_max.toLocaleString()} Edge Appliances across Gujarat (1 per 8–16 cameras)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Accelerator 1: Jetson Orin Nano */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-extrabold text-sm text-slate-900">NVIDIA Jetson Orin Nano</span>
                <span className="bg-blue-100 text-[#1E3A8A] px-2 py-0.5 rounded text-[10px] font-bold">
                  40 TOPS INT8
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Camera Capacity:</span>
                  <span className="font-bold text-slate-900">12–16 Feeds @ 1080p 30 FPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">System Power Draw:</span>
                  <span className="font-bold text-emerald-700">7W – 15W Ultra-Low Power</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Optimal Deployment:</span>
                  <span className="text-slate-800">High-Traffic City Junctions, Toll Plazas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AI Pipeline:</span>
                  <span className="text-slate-800">YOLOv8s ANPR + ByteTrack + Vehicle Attributes</span>
                </div>
              </div>
            </div>

            {/* Accelerator 2: Hailo-8 NPU */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-extrabold text-sm text-slate-900">Raspberry Pi 5 + Hailo-8 NPU</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                  26 TOPS NPU
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Camera Capacity:</span>
                  <span className="font-bold text-slate-900">8–12 Feeds @ 1080p 25 FPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">System Power Draw:</span>
                  <span className="font-bold text-emerald-700">2.5W NPU / 12W Total System</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Optimal Deployment:</span>
                  <span className="text-slate-800">Taluka Police Stations, Rural Outposts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AI Pipeline:</span>
                  <span className="text-slate-800">Hailo Model Zoo YOLOv8-M + Plate OCR</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* JSON Event vs Raw Video Payload Specification */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Data Ingestion Architecture: Raw Video Stream vs Lightweight Edge JSON
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Raw 1080p stream (2,048 Kbps) compressed 500x into structured event telemetry (4 Kbps)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs font-mono">
            {/* Raw Video Frame */}
            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl space-y-2 border border-slate-800">
              <div className="text-red-400 font-bold text-[11px] border-b border-slate-800 pb-1 flex items-center justify-between">
                <span>TRADITIONAL INGESTION (RAW H.264/H.265 STREAM)</span>
                <span className="text-slate-400">2,048 Kbps / Camera</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Transmits 30 high-definition frames per second continuously over state WAN, requiring uncompressed pixel decoding, huge central buffer memory, and continuous network socket locks even when no cars pass.
              </p>
              <div className="text-red-300 text-[10px] bg-red-950/60 p-2 rounded border border-red-800/40">
                80,000 Cameras × 2,048 Kbps = 160,000,000 Kbps (160 Gbps)
              </div>
            </div>

            {/* SENTINEL Structured JSON Payload */}
            <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl space-y-2 border border-slate-800">
              <div className="text-emerald-400 font-bold text-[11px] border-b border-slate-800 pb-1 flex items-center justify-between">
                <span>SENTINEL EDGE TRIAGE (STRUCTURED JSON TELEMETRY)</span>
                <span className="text-slate-400">~4 Kbps / Camera</span>
              </div>
              <pre className="text-[10px] leading-tight text-slate-300 bg-black/50 p-2.5 rounded overflow-x-auto">
{`{
  "event": "ANPR_EDGE_DETECTION",
  "camera_id": 7,
  "plate": "GJ06XX9999",
  "confidence": 0.984,
  "vehicle": { "color": "Red", "type": "SUV", "make": "Creta" },
  "speed_kmh": 78.4,
  "timestamp": "2026-09-05T14:48:12Z",
  "plate_crop_b64": "data:image/jpeg;base64,/9j/4AAQ..."
}`}
              </pre>
              <div className="text-emerald-300 text-[10px] bg-emerald-950/60 p-2 rounded border border-emerald-800/40">
                80,000 Cameras × 4 Kbps = 320,000 Kbps (320 Mbps)
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Official Government Footer */}
      <footer className="py-3 px-8 bg-white border-t border-slate-200 text-center text-xs text-slate-500 font-mono flex flex-wrap items-center justify-between">
        <span>SENTINEL Edge Triage Architecture • Gujarat Police Innovation Challenge 2026</span>
        <span className="text-slate-400">GSWAN Infrastructure Compliance Certified • High-Efficiency Distributed Edge</span>
      </footer>
    </div>
  );
}

export default function EdgeTriagePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-mono text-xs text-slate-600">
          <div className="w-8 h-8 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mb-3" />
          <span>INITIALIZING EDGE TRIAGE PROOF ENGINE...</span>
        </div>
      }
    >
      <EdgeTriageInner />
    </Suspense>
  );
}
