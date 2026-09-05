'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { OfficialGovBar } from '../../components/OfficialGovBar';
import { AnomalyAlert, AnomalyCategory, AnomalySummary } from '../../types';
import { 
  AlertOctagon, 
  Clock, 
  Users, 
  Bike, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  Filter, 
  RefreshCw, 
  Megaphone, 
  Volume2, 
  FileCheck, 
  Eye, 
  Radio, 
  AlertTriangle,
  ChevronRight,
  Shield,
  Send,
  Sparkles,
  Compass,
  Gauge,
  X
} from 'lucide-react';

const DynamicAnomalyMap = dynamic(
  () => import('../../components/AnomalyMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full min-h-[420px] bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 font-sans text-xs">
        <div className="w-8 h-8 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mb-2" />
        <span className="font-semibold text-slate-700 font-mono">LOADING ANOMALY SITUATIONAL GIS MAP...</span>
      </div>
    ),
  }
);

const API_BASE = 'http://localhost:8000';

function AnomaliesInner() {
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [summary, setSummary] = useState<AnomalySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyAlert | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [activeModalSnapshot, setActiveModalSnapshot] = useState<{ url: string; title: string } | null>(null);

  // Fetch anomalies and summary
  const fetchAnomalies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/anomalies`);
      if (res.ok) {
        const data: AnomalyAlert[] = await res.json();
        setAnomalies(data);
        if (data.length > 0 && !selectedAnomaly) {
          setSelectedAnomaly(data[0]);
        }
      }

      const sumRes = await fetch(`${API_BASE}/api/anomalies/summary`);
      if (sumRes.ok) {
        const sumData: AnomalySummary = await sumRes.json();
        setSummary(sumData);
      }
    } catch (err) {
      console.error('Failed to load anomalies:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedAnomaly]);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  // Filter anomalies based on selected category and city
  const filteredAnomalies = anomalies.filter((a) => {
    const matchCat = selectedCategory === 'ALL' || a.category === selectedCategory;
    const matchCity = selectedCity === 'ALL' || a.city.toLowerCase() === selectedCity.toLowerCase();
    return matchCat && matchCity;
  });

  // Handle 1-click tactical dispatch
  const handleDispatchAction = async (anomalyId: number, actionType: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/anomalies/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomaly_id: anomalyId,
          action_type: actionType,
          officer_badge: 'GP-CID-7809',
          officer_notes: 'Immediate tactical intervention dispatched from Behavioral Command Center',
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setActionMessage(`Action Dispatched: ${result.action_taken}`);
        setTimeout(() => setActionMessage(null), 5000);

        // Update local state
        setAnomalies((prev) =>
          prev.map((item) =>
            item.id === anomalyId
              ? { ...item, status: result.status, action_taken: result.action_taken }
              : item
          )
        );

        if (selectedAnomaly?.id === anomalyId) {
          setSelectedAnomaly((prev) =>
            prev ? { ...prev, status: result.status, action_taken: result.action_taken } : null
          );
        }
      }
    } catch (err) {
      console.error('Dispatch failed:', err);
    }
  };

  // Handle resolve
  const handleResolveAction = async (anomalyId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/anomalies/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomaly_id: anomalyId,
          action_type: 'RESOLVE',
          officer_badge: 'GP-CID-7809',
          officer_notes: 'Investigated and verified safe by Zone Patrol Officers',
        }),
      });

      if (res.ok) {
        setActionMessage('Incident marked RESOLVED and archived into eGujCop Daily Incident Diary');
        setTimeout(() => setActionMessage(null), 5000);

        setAnomalies((prev) =>
          prev.map((item) =>
            item.id === anomalyId
              ? { ...item, status: 'RESOLVED', action_taken: '[GP-CID-7809] Incident Closed & Resolved' }
              : item
          )
        );

        if (selectedAnomaly?.id === anomalyId) {
          setSelectedAnomaly((prev) =>
            prev ? { ...prev, status: 'RESOLVED', action_taken: '[GP-CID-7809] Incident Closed & Resolved' } : null
          );
        }
      }
    } catch (err) {
      console.error('Resolve failed:', err);
    }
  };

  const categoryPills = [
    { id: 'ALL', label: 'All Anomalies', icon: ShieldAlert, count: anomalies.length },
    { 
      id: 'WRONG_WAY_DRIVING', 
      label: 'Wrong-Way Driving', 
      icon: AlertOctagon, 
      count: anomalies.filter(a => a.category === 'WRONG_WAY_DRIVING').length,
      badgeColor: 'text-red-700 bg-red-50 border-red-200' 
    },
    { 
      id: 'ATM_LOITERING', 
      label: 'ATM Loitering (>5m)', 
      icon: Clock, 
      count: anomalies.filter(a => a.category === 'ATM_LOITERING').length,
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200' 
    },
    { 
      id: 'CROWD_SURGE', 
      label: 'Crowd Panic / Surge', 
      icon: Users, 
      count: anomalies.filter(a => a.category === 'CROWD_SURGE').length,
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200' 
    },
    { 
      id: 'TRAFFIC_VIOLATION', 
      label: 'Triple Riding / Helmet', 
      icon: Bike, 
      count: anomalies.filter(a => a.category === 'TRAFFIC_VIOLATION').length,
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200' 
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <OfficialGovBar activeAlertsCount={anomalies.filter(a => a.status !== 'RESOLVED').length} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Executive Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-[#1E3A8A]" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200 flex items-center space-x-1">
                  <Radio className="w-3 h-3 animate-pulse text-red-600" />
                  <span>BEHAVIORAL AI SURVEILLANCE • GUJARAT POLICE CHALLENGE 2026</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  80,000 Heterogeneous Cameras
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-serif mt-2">
                Multi-Modal Behavioral & Activity Anomaly Hub
              </h1>
              <p className="text-xs text-slate-600 max-w-3xl mt-1 leading-relaxed">
                Automated optical flow, pose estimation, and velocity vector detection identifying 
                <strong> Wrong-Way Driving</strong>, <strong>After-Hours ATM Loitering</strong>, 
                <strong> Crowd Surge & Stampedes</strong>, and <strong>Two-Wheeler Traffic Violations</strong>.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={fetchAnomalies}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Matrix</span>
              </button>
            </div>
          </div>

          {/* Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-500 font-mono font-medium">Active Incidents</div>
              <div className="text-2xl font-black text-slate-900 font-serif mt-0.5">
                {summary ? summary.total_active : 8}
              </div>
              <span className="text-[10px] font-bold text-red-600">Real-Time Queue</span>
            </div>

            <div className="bg-red-50/50 border border-red-200 rounded-xl p-3 text-center">
              <div className="text-xs text-red-700 font-mono font-medium">Critical Collision / Panic</div>
              <div className="text-2xl font-black text-red-700 font-serif mt-0.5">
                {summary ? summary.critical_count : 3}
              </div>
              <span className="text-[10px] font-bold text-red-600">Immediate Hazard</span>
            </div>

            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 text-center">
              <div className="text-xs text-amber-700 font-mono font-medium">ATM Loiter Detections</div>
              <div className="text-2xl font-black text-amber-700 font-serif mt-0.5">
                {summary ? summary.high_count : 3}
              </div>
              <span className="text-[10px] font-bold text-amber-600">&gt;5m After-Hours Dwell</span>
            </div>

            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3 text-center">
              <div className="text-xs text-blue-700 font-mono font-medium">e-Challans Auto-Issued</div>
              <div className="text-2xl font-black text-[#1E3A8A] font-serif mt-0.5">
                {summary ? summary.medium_count : 2}
              </div>
              <span className="text-[10px] font-bold text-blue-600">RTO VAHAN Synced</span>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
              <div className="text-xs text-emerald-700 font-mono font-medium">Mean Intercept Latency</div>
              <div className="text-2xl font-black text-emerald-700 font-serif mt-0.5">
                {summary ? summary.avg_response_time_seconds : 142}s
              </div>
              <span className="text-[10px] font-bold text-emerald-600">Sub-3 Min Response</span>
            </div>
          </div>
        </div>

        {/* Tactical Action Confirmation Toast */}
        {actionMessage && (
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between text-xs font-mono font-bold animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-emerald-200 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Controls Ribbon */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categoryPills.map((pill) => {
              const isSelected = selectedCategory === pill.id;
              const PillIcon = pill.icon;

              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedCategory(pill.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E3A8A] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <PillIcon className="w-3.5 h-3.5" />
                  <span>{pill.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* City Filter */}
          <div className="flex items-center space-x-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-mono">Jurisdiction:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
            >
              <option value="ALL">All Gujarat</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Surat">Surat</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Gandhinagar">Gandhinagar</option>
            </select>
          </div>
        </div>

        {/* 2-Column Command Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (58%): Anomaly Cards Grid */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700">
                Active Anomaly Detection Queue ({filteredAnomalies.length} Records)
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                Sorted chronologically by alert priority
              </span>
            </div>

            {filteredAnomalies.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No anomalies match current filter</h3>
                <p className="text-xs text-slate-500">
                  Adjust category or city filter above to view historical or pending incident logs.
                </p>
              </div>
            ) : (
              filteredAnomalies.map((a) => {
                const isSelected = selectedAnomaly?.id === a.id;
                const isCritical = a.severity === 'CRITICAL';
                const isHigh = a.severity === 'HIGH';

                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAnomaly(a)}
                    className={`bg-white border rounded-xl p-4 transition-all shadow-sm cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow'
                    }`}
                  >
                    {/* Top Accent Strip */}
                    <div className={`absolute top-0 inset-x-0 h-1 ${
                      a.category === 'WRONG_WAY_DRIVING' ? 'bg-red-600' :
                      a.category === 'ATM_LOITERING' ? 'bg-amber-500' :
                      a.category === 'CROWD_SURGE' ? 'bg-purple-600' : 'bg-blue-600'
                    }`} />

                    {/* Card Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${
                          a.category === 'WRONG_WAY_DRIVING' ? 'bg-red-50 text-red-700 border-red-200' :
                          a.category === 'ATM_LOITERING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          a.category === 'CROWD_SURGE' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {a.category.replace(/_/g, ' ')}
                        </span>

                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                          isCritical ? 'bg-red-100 text-red-700' : isHigh ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {a.severity}
                        </span>

                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                          a.status === 'ACTIVE' ? 'bg-red-600 text-white' :
                          a.status === 'DISPATCHED' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {a.status}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
                      </span>
                    </div>

                    {/* Title & Target */}
                    <div className="mt-2.5">
                      <h3 className="text-sm font-bold text-slate-900 font-serif">
                        {a.title}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-600 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                        <span className="font-semibold text-slate-800">{a.location_name}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 font-mono text-[11px]">{a.city}</span>
                      </div>
                    </div>

                    {/* Category-Specific Forensic Widget */}
                    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold text-slate-700">Target Identifier:</span>
                        <span className="font-black text-[#1E3A8A] bg-white px-2 py-0.5 rounded border border-slate-200">
                          {a.target_identifier}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {a.details}
                      </p>

                      {/* Forensic Highlights */}
                      {a.category === 'WRONG_WAY_DRIVING' && (
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-red-700 font-bold">⚠️ Optical Flow: 180° Direction Mismatch</span>
                          <span className="text-slate-600">Speed: ~58 km/h</span>
                        </div>
                      )}

                      {a.category === 'ATM_LOITERING' && (
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-amber-700 font-bold">⏱️ Dwell Threshold: &gt;5 Mins Exceeded</span>
                          <span className="text-slate-600">Proximity: 1.4m to Dispenser</span>
                        </div>
                      )}

                      {a.category === 'CROWD_SURGE' && (
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-purple-700 font-bold">👥 Velocity Surge: Δv &gt; 3.3 m/s Outward</span>
                          <span className="text-slate-600">Density: 3.8 persons/m²</span>
                        </div>
                      )}

                      {a.category === 'TRAFFIC_VIOLATION' && (
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-blue-700 font-bold">🛵 Violation: Triple Riding + 0/3 Helmets</span>
                          <span className="text-slate-600">e-Challan Fine: ₹1,500</span>
                        </div>
                      )}
                    </div>

                    {/* Action Taken Status Log */}
                    <div className="mt-2.5 text-[11px] font-mono text-slate-600 flex items-center space-x-1.5">
                      <span className="font-bold text-slate-700">Audit Status:</span>
                      <span className="text-slate-500 truncate">{a.action_taken}</span>
                    </div>

                    {/* Tactical Action Buttons */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center space-x-2">
                      {/* Primary 1-Click Action */}
                      {a.category === 'WRONG_WAY_DRIVING' && a.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDispatchAction(a.id, 'VMS_CAUTION');
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono py-1.5 px-3 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Megaphone className="w-3.5 h-3.5" />
                          <span>Trigger Overhead VMS Caution</span>
                        </button>
                      )}

                      {a.category === 'ATM_LOITERING' && a.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDispatchAction(a.id, 'AUDIO_STROBE');
                          }}
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-mono py-1.5 px-3 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Trigger 110dB Audio Strobe</span>
                        </button>
                      )}

                      {a.category === 'CROWD_SURGE' && a.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDispatchAction(a.id, 'QRT_MOBILIZE');
                          }}
                          className="flex-1 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold font-mono py-1.5 px-3 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Mobilize QRT Squad</span>
                        </button>
                      )}

                      {a.category === 'TRAFFIC_VIOLATION' && a.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDispatchAction(a.id, 'ECHALLAN_ISSUE');
                          }}
                          className="flex-1 bg-[#1E3A8A] hover:bg-[#193073] text-white text-xs font-bold font-mono py-1.5 px-3 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Auto-Issue e-Challan (₹1,500)</span>
                        </button>
                      )}

                      {/* PCR Unit Dispatch */}
                      {a.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDispatchAction(a.id, 'PCR_DISPATCH');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-mono py-1.5 px-3 rounded-lg border border-slate-200 flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <Send className="w-3 h-3 text-[#1E3A8A]" />
                          <span>Dispatch PCR</span>
                        </button>
                      )}

                      {/* Mark Resolved */}
                      {a.status !== 'RESOLVED' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveAction(a.id);
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold font-mono py-1.5 px-2.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-xs font-mono font-bold text-emerald-600 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolved</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column (42%): GIS Deployment Map & Detail Terminal */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* GIS Map Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">
                    SITUATIONAL AWARENESS GIS LAYER
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 font-serif">
                    Live Anomaly Map (Gujarat State Grid)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {filteredAnomalies.length} Pins
                </span>
              </div>

              {/* Dynamic Leaflet Map */}
              <div className="h-[360px] w-full rounded-xl overflow-hidden border border-slate-200">
                <DynamicAnomalyMap
                  anomalies={filteredAnomalies}
                  selectedAnomaly={selectedAnomaly}
                  onSelectAnomaly={(a) => setSelectedAnomaly(a)}
                  onQuickDispatch={(id, act) => handleDispatchAction(id, act)}
                />
              </div>

              <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-mono pt-1 text-slate-600">
                <div className="flex items-center justify-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>Wrong-Way</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>ATM Loiter</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>Crowd Surge</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Violations</span>
                </div>
              </div>
            </div>

            {/* Selected Anomaly Inspection Terminal */}
            {selectedAnomaly && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      Selected Target Dossier
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 font-serif">
                      {selectedAnomaly.title}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    selectedAnomaly.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedAnomaly.severity} PRIORITY
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Target:</span>
                    <span className="font-bold text-slate-900">{selectedAnomaly.target_identifier}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Camera Node:</span>
                    <span className="font-bold text-[#1E3A8A]">Node #{selectedAnomaly.camera_id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Location:</span>
                    <span className="text-slate-800 text-right">{selectedAnomaly.location_name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Geo-Coordinates:</span>
                    <span className="text-slate-700">{selectedAnomaly.lat.toFixed(4)}° N, {selectedAnomaly.lng.toFixed(4)}° E</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Timestamp:</span>
                    <span className="text-slate-700">{new Date(selectedAnomaly.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Current Status:</span>
                    <span className={`font-bold ${
                      selectedAnomaly.status === 'ACTIVE' ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {selectedAnomaly.status}
                    </span>
                  </div>
                </div>

                {/* Audit Action Log */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 text-xs font-mono">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Law Enforcement Action Log</span>
                  <p className="text-slate-700 leading-snug">{selectedAnomaly.action_taken}</p>
                </div>

                {/* Direct Action Terminal */}
                <div className="space-y-2 pt-2">
                  {selectedAnomaly.category === 'WRONG_WAY_DRIVING' && selectedAnomaly.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleDispatchAction(selectedAnomaly.id, 'VMS_CAUTION')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono py-2 px-3 rounded-xl shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Megaphone className="w-4 h-4" />
                      <span>Trigger Overhead VMS Caution Display</span>
                    </button>
                  )}

                  {selectedAnomaly.category === 'ATM_LOITERING' && selectedAnomaly.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleDispatchAction(selectedAnomaly.id, 'AUDIO_STROBE')}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-mono py-2 px-3 rounded-xl shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Activate 110dB Audio Siren & Strobe</span>
                    </button>
                  )}

                  {selectedAnomaly.category === 'CROWD_SURGE' && selectedAnomaly.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleDispatchAction(selectedAnomaly.id, 'QRT_MOBILIZE')}
                      className="w-full bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold font-mono py-2 px-3 rounded-xl shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>Mobilize Quick Response Team (QRT)</span>
                    </button>
                  )}

                  {selectedAnomaly.category === 'TRAFFIC_VIOLATION' && selectedAnomaly.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleDispatchAction(selectedAnomaly.id, 'ECHALLAN_ISSUE')}
                      className="w-full bg-[#1E3A8A] hover:bg-[#193073] text-white text-xs font-bold font-mono py-2 px-3 rounded-xl shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Issue e-Challan & Send SMS to Owner</span>
                    </button>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDispatchAction(selectedAnomaly.id, 'PCR_DISPATCH')}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-mono py-2 px-3 rounded-xl border border-slate-200 flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span>Dispatch Patrol</span>
                    </button>

                    {selectedAnomaly.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolveAction(selectedAnomaly.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono py-2 px-4 rounded-xl cursor-pointer"
                      >
                        Close Incident
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AnomaliesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-mono">LOADING ANOMALY RADAR...</div>}>
      <AnomaliesInner />
    </Suspense>
  );
}
