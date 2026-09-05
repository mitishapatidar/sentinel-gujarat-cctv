'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { OfficialGovBar } from '../../components/OfficialGovBar';
import { DetectionAttribute, PlausibilityResult, PlausibilitySegment } from '../../types';
import { 
  Route, Shield, Search, AlertTriangle, CheckCircle2, Car, Compass, 
  MapPin, Clock, Gauge, ArrowRight, Siren, FileText, Download, 
  RefreshCw, Filter, AlertOctagon, Sparkles, Check, ChevronRight, X
} from 'lucide-react';

// SSR-safe dynamic import for Trail Leaflet Map
const DynamicTrailPlausibilityMap = dynamic(
  () => import('../../components/TrailPlausibilityMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full min-h-[380px] bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 font-sans text-xs">
        <div className="w-8 h-8 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mb-2" />
        <span className="font-semibold text-slate-700 font-mono">LOADING KINEMATIC ROAD-GRAPH GIS LAYER...</span>
      </div>
    ),
  }
);

const API_BASE = 'http://localhost:8000';

function TrailInner() {
  // Multi-Attribute Filter State
  const [searchColor, setSearchColor] = useState<string>('ALL');
  const [searchType, setSearchType] = useState<string>('ALL');
  const [searchMake, setSearchMake] = useState<string>('ALL');
  const [searchPlate, setSearchPlate] = useState<string>('');
  const [searchCity, setSearchCity] = useState<string>('ALL');

  // Search Results & Plausibility State
  const [searchResults, setSearchResults] = useState<DetectionAttribute[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [selectedPlate, setSelectedPlate] = useState<string>('GJ01AB1234');
  const [plausibility, setPlausibility] = useState<PlausibilityResult | null>(null);
  const [loadingPlausibility, setLoadingPlausibility] = useState<boolean>(false);

  // Tactical Actions State
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [clonedFlagged, setClonedFlagged] = useState<boolean>(false);
  const [dispatchNotice, setDispatchNotice] = useState<boolean>(false);
  const [pdfCompiling, setPdfCompiling] = useState<boolean>(false);

  // Execute Forensic Attribute Search
  const handleSearch = useCallback(async () => {
    setLoadingSearch(true);
    try {
      const params = new URLSearchParams();
      if (searchColor !== 'ALL') params.append('color', searchColor);
      if (searchType !== 'ALL') params.append('vehicle_type', searchType);
      if (searchMake !== 'ALL') params.append('make_model', searchMake);
      if (searchPlate.trim()) params.append('plate_pattern', searchPlate.trim());
      if (searchCity !== 'ALL') params.append('city', searchCity);
      params.append('limit', '50');

      const res = await fetch(`${API_BASE}/api/trail/search?${params.toString()}`);
      if (res.ok) {
        const data: DetectionAttribute[] = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error('Trail search error:', err);
    } finally {
      setLoadingSearch(false);
    }
  }, [searchColor, searchType, searchMake, searchPlate, searchCity]);

  // Execute Road-Graph Physical Plausibility Analysis for a specific plate
  const analyzePlatePlausibility = useCallback(async (plate: string) => {
    const clean = plate.trim().toUpperCase();
    if (!clean) return;
    setSelectedPlate(clean);
    setLoadingPlausibility(true);
    setClonedFlagged(false);

    try {
      const res = await fetch(`${API_BASE}/api/trail/plausibility/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data: PlausibilityResult = await res.json();
        setPlausibility(data);
      } else {
        setPlausibility(null);
      }
    } catch (err) {
      console.error('Plausibility analysis error:', err);
      setPlausibility(null);
    } finally {
      setLoadingPlausibility(false);
    }
  }, []);

  // Quick preset loading for evaluators
  const loadPresetCase = (plate: string, color: string, type: string, make: string) => {
    setSearchColor(color);
    setSearchType(type);
    setSearchMake(make);
    setSearchPlate(plate);
    setSearchCity('ALL');
    analyzePlatePlausibility(plate);
  };

  // Flag Cloned Plate in Watchlist
  const handleFlagCloned = async () => {
    if (!selectedPlate) return;
    try {
      const res = await fetch(`${API_BASE}/api/trail/flag-cloned`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plate_number: selectedPlate,
          reason: plausibility?.primary_anomaly_reason || 'Impossible multi-city teleportation detected by Trail Plausibility Engine',
        }),
      });
      if (res.ok) {
        setClonedFlagged(true);
        setActionNotice(`Target plate ${selectedPlate} officially registered in Gujarat Police CCTNS Hotlist as CLONED FRAUD.`);
        setTimeout(() => setActionNotice(null), 6000);
      }
    } catch (err) {
      console.error('Flag cloned notice:', err);
    }
  };

  // Dual Dispatch PCR Units
  const handleDualCityDispatch = () => {
    setDispatchNotice(true);
    setActionNotice(`High-Priority Intercept Order dispatched: Both Ahmedabad SG Highway PCR & Surat Ring Road PCR deployed to verify physical chassis VIN numbers.`);
    setTimeout(() => setActionNotice(null), 6000);
  };

  // Export PDF Dossier
  const handleExportForensicDossier = () => {
    setPdfCompiling(true);
    setTimeout(() => {
      setPdfCompiling(false);
      setActionNotice(`Forensic Kinematic Teleportation Affidavit compiled and digitally signed with SHA-256 hash for High Court of Gujarat.`);
      setTimeout(() => setActionNotice(null), 6000);
    }, 1400);
  };

  // Initial mount: load search results and analyze default case (GJ01AB1234)
  useEffect(() => {
    handleSearch();
    analyzePlatePlausibility('GJ01AB1234');
  }, [handleSearch, analyzePlatePlausibility]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans select-none">
      <OfficialGovBar activeAlertsCount={14} />

      {/* Forensic Module Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-xs">
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shadow-md">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#1E3A8A] tracking-wider">
                  IDEA 2 • &quot;TRAIL&quot; FORENSIC ENGINE
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Gujarat State Police CCTNS & SCRB Criminal Trajectory Triage
                </span>
              </div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Vehicle Multi-Attribute Search & Road-Graph Physical Plausibility Engine
              </h1>
            </div>
          </div>

          {/* Quick Preset Selector for Hackathon Jury */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-500 font-bold text-[11px] mr-1 hidden lg:inline">DEMO SCENARIOS:</span>
            <button
              onClick={() => loadPresetCase('GJ01AB1234', 'White', 'Hatchback', 'Maruti Swift')}
              className={`px-3 py-1.5 rounded-lg border font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                selectedPlate === 'GJ01AB1234'
                  ? 'bg-red-600 text-white border-red-700 shadow-sm'
                  : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-current animate-pulse" />
              <span>🚨 Cloned Plate Teleportation (GJ01AB1234)</span>
            </button>

            <button
              onClick={() => loadPresetCase('GJ06XX9999', 'Red', 'SUV', 'Hyundai Creta')}
              className={`px-3 py-1.5 rounded-lg border font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                selectedPlate === 'GJ06XX9999'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-current" />
              <span>✅ Plausible Pursuit Route (GJ06XX9999)</span>
            </button>

            <button
              onClick={() => loadPresetCase('MH04EE1980', 'Red', 'Hatchback', 'Hyundai i20')}
              className={`px-3 py-1.5 rounded-lg border font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                selectedPlate === 'MH04EE1980'
                  ? 'bg-blue-700 text-white border-blue-800 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-current" />
              <span>🔍 Hit-and-Run Partial Search (MH04EE1980)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Notice Banner */}
      {actionNotice && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2.5 text-xs font-mono text-[#1E3A8A] flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <strong>POLICE ACTION LOGGED:</strong>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Multi-Attribute Forensic Filter Dock */}
      <div className="px-6 py-3.5 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-[1920px] mx-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Color Filter Chips */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Vehicle Color:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'ALL', label: 'All', bg: 'bg-slate-200 text-slate-800' },
                  { id: 'White', label: 'White', bg: 'bg-white text-slate-900 border border-slate-300' },
                  { id: 'Black', label: 'Black', bg: 'bg-slate-900 text-white' },
                  { id: 'Red', label: 'Red', bg: 'bg-red-600 text-white' },
                  { id: 'Silver', label: 'Silver', bg: 'bg-slate-400 text-white' },
                  { id: 'Blue', label: 'Blue', bg: 'bg-blue-600 text-white' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSearchColor(c.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-mono transition-all cursor-pointer flex items-center space-x-1 ${
                      searchColor === c.id
                        ? 'ring-2 ring-[#1E3A8A] scale-105 shadow-xs font-black'
                        : 'opacity-80 hover:opacity-100'
                    } ${c.bg}`}
                  >
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body Type Pills */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Body Type:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {['ALL', 'SUV', 'Sedan', 'Hatchback', 'Truck', 'Motorcycle'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSearchType(t)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      searchType === t
                        ? 'bg-[#1E3A8A] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t === 'ALL' ? 'All Types' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Make / Model Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Make / Model:</span>
              <select
                value={searchMake}
                onChange={(e) => setSearchMake(e.target.value)}
                className="bg-slate-50 border border-slate-300 px-2.5 py-1 rounded-md text-slate-800 text-xs font-mono font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Models</option>
                <option value="Hyundai Creta">Hyundai Creta</option>
                <option value="Maruti Swift">Maruti Swift</option>
                <option value="Mahindra Scorpio">Mahindra Scorpio</option>
                <option value="Maruti Ertiga">Maruti Ertiga</option>
                <option value="Toyota Fortuner">Toyota Fortuner</option>
                <option value="Mazda 3">Mazda 3</option>
                <option value="Nissan Primastar">Nissan Primastar</option>
                <option value="Hyundai i20">Hyundai i20</option>
                <option value="Honda City">Honda City</option>
                <option value="Ashok Leyland">Ashok Leyland Truck</option>
              </select>
            </div>
          </div>

          {/* Bottom Filter Row: Wildcard Plate + City + Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              {/* Partial Plate Wildcard Input */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">
                  Partial Plate Pattern:
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchPlate}
                    onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                    placeholder="e.g. GJ01*, *9999, *AB1234"
                    className="pl-3 pr-3 py-1 bg-slate-50 border border-slate-300 rounded-md text-xs font-mono font-bold text-slate-900 outline-none w-48 uppercase focus:bg-white focus:border-[#1E3A8A]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  (* = wildcard)
                </span>
              </div>

              {/* Jurisdiction City */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Jurisdiction:</span>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="bg-slate-50 border border-slate-300 px-2.5 py-1 rounded-md text-slate-800 text-xs font-mono font-bold outline-none cursor-pointer"
                >
                  <option value="ALL">All Gujarat Corridors</option>
                  <option value="Ahmedabad">Ahmedabad Metro</option>
                  <option value="Gandhinagar">Gandhinagar Capital / GIFT City</option>
                  <option value="Surat">Surat Municipal</option>
                  <option value="Vadodara">Vadodara Region</option>
                  <option value="Rajkot">Rajkot Saurashtra</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSearchColor('ALL');
                  setSearchType('ALL');
                  setSearchMake('ALL');
                  setSearchPlate('');
                  setSearchCity('ALL');
                }}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-mono font-semibold rounded-md cursor-pointer transition-all"
              >
                Reset Filters
              </button>
              <button
                onClick={handleSearch}
                disabled={loadingSearch}
                className="px-4 py-1.5 bg-[#1E3A8A] hover:bg-[#193073] text-white text-xs font-mono font-bold rounded-md shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Search className={`w-3.5 h-3.5 ${loadingSearch ? 'animate-spin' : ''}`} />
                <span>Execute Attribute Triage ({searchResults.length} Hits)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Forensic Workspace (Split View) */}
      <main className="flex-1 p-5 max-w-[1920px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN (38% -> lg:col-span-5): Matched Forensic Sightings Feed */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col space-y-3 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Car className="w-4 h-4 text-[#1E3A8A]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  Statewide ANPR Sighting Feed ({searchResults.length} Records)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Sorted: Chronological
              </span>
            </div>

            {/* Sighting Cards List */}
            <div className="space-y-2.5 overflow-y-auto max-h-[720px] pr-1">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  No camera sightings match the specified vehicle attributes.
                </div>
              ) : (
                searchResults.map((item) => {
                  const isCurrentTarget = selectedPlate === item.plate_number;
                  return (
                    <div
                      key={item.id}
                      onClick={() => analyzePlatePlausibility(item.plate_number)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isCurrentTarget
                          ? 'bg-blue-50/80 border-[#1E3A8A] ring-2 ring-blue-300 shadow-sm'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Header: Plate & Confidence */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 tracking-wider">
                            {item.plate_number}
                          </span>
                          {item.is_alert && (
                            <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 animate-pulse">
                              HOTLIST
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                        </span>
                      </div>

                      {/* Middle Attributes: Color, Make, Type */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 font-bold">
                          {item.vehicle_color} {item.vehicle_make}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 text-[10px]">
                          {item.vehicle_type}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 text-[10px]">
                          {item.speed_kmh} km/h
                        </span>
                      </div>

                      {/* Bottom Camera Location & Action */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 text-slate-600">
                        <div className="flex items-center space-x-1 truncate max-w-[70%] text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.camera_name} ({item.city})</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#1E3A8A] flex items-center space-x-0.5 font-mono">
                          <span>Verify Plausibility</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (62% -> lg:col-span-7): Road-Graph Plausibility Engine */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {plausibility ? (
            <>
              {/* 1. Top Plausibility Gauge Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                        plausibility.is_cloned_plate_anomaly
                          ? 'bg-red-600 animate-pulse ring-4 ring-red-100'
                          : 'bg-emerald-600 ring-4 ring-emerald-100'
                      }`}
                    >
                      {plausibility.is_cloned_plate_anomaly ? (
                        <AlertTriangle className="w-6 h-6" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          {plausibility.plate_number}
                        </span>
                        <span className="text-xs text-slate-600 font-mono">
                          ({plausibility.vehicle_color} {plausibility.vehicle_make})
                        </span>
                      </div>
                      <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                        {plausibility.is_cloned_plate_anomaly ? (
                          <span className="text-red-600">CRITICAL: CLONED PLATE / MULTI-VEHICLE ANOMALY</span>
                        ) : (
                          <span className="text-emerald-700">KINEMATICALLY PLAUSIBLE TRANSIT TRAJECTORY</span>
                        )}
                      </h2>
                    </div>
                  </div>

                  {/* Plausibility Score Pill */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">
                        PLAUSIBILITY SCORE
                      </div>
                      <div
                        className={`text-2xl font-black font-mono ${
                          plausibility.plausibility_score < 50 ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        {plausibility.plausibility_score}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cloned Plate Forensic Teleportation Warning Box (rendered on anomaly) */}
                {plausibility.is_cloned_plate_anomaly && (
                  <div className="bg-red-50 border border-red-300 rounded-xl p-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-red-900 font-mono">
                          PHYSICALLY IMPOSSIBLE MULTI-CITY TELEPORTATION DETECTED
                        </div>
                        <p className="text-xs text-red-800 leading-relaxed font-sans">
                          {plausibility.primary_anomaly_reason}
                        </p>
                        <div className="text-[11px] text-red-700 font-mono font-medium pt-1">
                          <strong>Forensic Determination:</strong> Two distinct physical chassis are actively operating simultaneously in Ahmedabad and Surat using cloned registration plates.
                        </div>
                      </div>
                    </div>

                    {/* Quick Tactical Actions for Cloned Anomaly */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-red-200 text-xs font-mono">
                      <button
                        onClick={handleFlagCloned}
                        disabled={clonedFlagged}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                          clonedFlagged
                            ? 'bg-emerald-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{clonedFlagged ? '✓ Flagged in eGujCop' : 'Flag Cloned Plate in eGujCop'}</span>
                      </button>

                      <button
                        onClick={handleDualCityDispatch}
                        disabled={dispatchNotice}
                        className={`px-3 py-1.5 rounded-lg font-bold border transition-all flex items-center space-x-1.5 cursor-pointer ${
                          dispatchNotice
                            ? 'bg-amber-100 border-amber-400 text-amber-900'
                            : 'bg-white border-red-300 text-red-800 hover:bg-red-50'
                        }`}
                      >
                        <Siren className="w-3.5 h-3.5 text-current" />
                        <span>{dispatchNotice ? '✓ Units Deployed' : 'Dispatch Ahmedabad & Surat PCRs'}</span>
                      </button>

                      <button
                        onClick={handleExportForensicDossier}
                        disabled={pdfCompiling}
                        className="px-3 py-1.5 rounded-lg font-bold bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Download className={`w-3.5 h-3.5 ${pdfCompiling ? 'animate-bounce' : ''}`} />
                        <span>{pdfCompiling ? 'Compiling Affidavit...' : 'Export Court Affidavit (PDF)'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Transit Physics Segments Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-600 font-bold">
                    <span>ROAD-GRAPH TRANSIT KINEMATICS ({plausibility.segments.length} Legs Analyzed)</span>
                    <span className="text-slate-400 text-[11px]">Haversine Distance / \Delta t</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[11px] font-bold">
                        <tr>
                          <th className="p-2.5">Leg</th>
                          <th className="p-2.5">Origin Checkpoint</th>
                          <th className="p-2.5">Destination Checkpoint</th>
                          <th className="p-2.5">Distance</th>
                          <th className="p-2.5">Time Delta</th>
                          <th className="p-2.5">Implied Velocity</th>
                          <th className="p-2.5">Plausibility Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {plausibility.segments.map((seg, idx) => {
                          const isAnomalous = seg.is_physically_impossible;
                          return (
                            <tr key={idx} className={isAnomalous ? 'bg-red-50/70' : 'hover:bg-slate-50'}>
                              <td className="p-2.5 font-bold">#{idx + 1}</td>
                              <td className="p-2.5">
                                <div className="font-semibold text-slate-900">{seg.from_city}</div>
                                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{seg.from_camera_name}</div>
                              </td>
                              <td className="p-2.5">
                                <div className="font-semibold text-slate-900">{seg.to_city}</div>
                                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{seg.to_camera_name}</div>
                              </td>
                              <td className="p-2.5 font-bold">{seg.distance_km} km</td>
                              <td className="p-2.5">{seg.duration_minutes} mins</td>
                              <td className="p-2.5">
                                <span className={`font-black ${isAnomalous ? 'text-red-700 text-sm' : 'text-slate-900'}`}>
                                  {seg.calculated_speed_kmh} km/h
                                </span>
                              </td>
                              <td className="p-2.5">
                                {isAnomalous ? (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                                    <span>IMPOSSIBLE</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                    <span>PLAUSIBLE</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 2. Interactive Road-Graph Kinematic Vector GIS Map */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm h-[400px] flex flex-col space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-xs">
                  <div className="flex items-center space-x-2 font-mono font-bold text-slate-900">
                    <Compass className="w-4 h-4 text-[#1E3A8A]" />
                    <span>Road-Graph Kinematic Vector Visualization</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {plausibility.sightings.length} Sequential Checkpoints
                  </span>
                </div>

                <div className="flex-1 w-full h-full relative rounded-xl overflow-hidden border border-slate-200">
                  <DynamicTrailPlausibilityMap plausibility={plausibility} />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs font-mono flex flex-col items-center justify-center space-y-3 min-h-[400px]">
              <div className="w-10 h-10 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
              <span>SELECT A VEHICLE REGISTRATION TO EXECUTE ROAD-GRAPH PLAUSIBILITY ANALYSIS</span>
            </div>
          )}
        </div>
      </main>

      {/* Official Government Footer */}
      <footer className="py-3 px-8 bg-white border-t border-slate-200 text-center text-xs text-slate-500 font-mono flex flex-wrap items-center justify-between">
        <span>SENTINEL Forensic Trail Engine • State Crime Records Bureau (SCRB), Gujarat Police</span>
        <span className="text-slate-400">Court-Admissible Evidence Pipeline • Encrypted Network</span>
      </footer>
    </div>
  );
}

export default function TrailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-mono text-xs text-slate-600">
          <div className="w-8 h-8 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mb-3" />
          <span>INITIALIZING TRAIL FORENSIC ENGINE...</span>
        </div>
      }
    >
      <TrailInner />
    </Suspense>
  );
}
