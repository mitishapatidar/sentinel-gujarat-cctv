'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  CheckCircle2
} from 'lucide-react';

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 12;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans flex flex-col items-center">
      {/* Top Floating Controls Bar */}
      <header className="no-print sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center text-white font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">SENTINEL Presentation Deck</h1>
            <span className="text-[11px] text-[#D97706] font-bold font-mono">Team: Rajasthan Warriorz</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(1, prev - 1))}
            disabled={currentSlide === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-700">
            Slide {currentSlide} of {totalSlides}
          </span>
          <button
            onClick={() => setCurrentSlide((prev) => Math.min(totalSlides, prev + 1))}
            disabled={currentSlide === totalSlides}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="ml-4 px-3.5 py-1.5 bg-[#1E3A8A] hover:bg-[#193073] text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Save as PDF / Print</span>
          </button>

          <Link
            href="/command-center"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
          >
            Back to Command Center
          </Link>
        </div>
      </header>

      {/* Main Slides Canvas Container */}
      <main className="w-full max-w-6xl py-8 px-4 flex flex-col items-center space-y-12 print:p-0 print:max-w-none">
        
        {/* SLIDE 1: COVER SLIDE */}
        <section className={`slide-page ${currentSlide === 1 ? 'block' : 'hidden print:block'}`}>
          <div className="w-[1000px] h-[562px] bg-white border border-slate-200 rounded-2xl shadow-md p-10 flex flex-col justify-between relative overflow-hidden print:border-0 print:shadow-none print:m-0 print:rounded-none">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-white to-emerald-600" />
            
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-[10px] font-mono font-bold text-[#1E3A8A] bg-blue-50 px-2.5 py-1 rounded border border-blue-200 tracking-wider">
                  OFFICIAL SUBMISSION • HOME DEPARTMENT • GUJARAT POLICE
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-serif mt-2">
                SENTINEL
              </h1>
              <h2 className="text-xl font-bold text-[#1E3A8A] mt-1">
                Unified Law Enforcement CCTV & AI ANPR Command Grid
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl mt-3 leading-relaxed">
                A state-scale platform federating 80,000+ heterogeneous cameras across Police, RTO, and Civil Supplies with automated AI license plate recognition, linear spatial trajectory tracking, and automated toll interception.
              </p>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 mt-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider block">Submitted By Team</span>
                <span className="text-lg font-black text-slate-900 tracking-tight font-serif">Rajasthan Warriorz</span>
                <div className="text-[11px] text-slate-600 mt-1 space-x-2">
                  <span className="font-bold">Sagar Patidar (TL)</span>
                  <span>• Mitisha Patidar</span>
                  <span>• Nidhi Patidar</span>
                  <span>• Himanshu Patidar</span>
                  <span>• Manav Patidar</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">Technology Stack</span>
                <span className="text-xs font-mono font-bold text-slate-700">FastAPI • YOLOv8 • Next.js 16 • OpenStreetMap</span>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 2: TEAM PROFILE */}
        <section className={`slide-page ${currentSlide === 2 ? 'block' : 'hidden print:block'}`}>
          <div className="w-[1000px] h-[562px] bg-white border border-slate-200 rounded-2xl shadow-md p-8 flex flex-col justify-between relative overflow-hidden print:border-0 print:shadow-none">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#1E3A8A]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">Team Introduction</span>
              <h2 className="text-2xl font-black text-slate-900 font-serif">Team Rajasthan Warriorz</h2>
              <p className="text-xs text-slate-500">Core engineering team specialized in Computer Vision, High-Performance Systems, and GIS</p>
            </div>

            <div className="grid grid-cols-3 gap-3 my-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">TEAM LEADER</span>
                <h3 className="text-sm font-bold text-slate-900">Sagar Patidar</h3>
                <p className="text-[10px] text-[#1E3A8A] font-semibold">System Architect & Backend Lead</p>
                <p className="text-[11px] text-slate-500 leading-tight">FastAPI microservices, RTSP/MJPEG streaming engine, and multi-origin sharding.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">MEMBER</span>
                <h3 className="text-sm font-bold text-slate-900">Mitisha Patidar</h3>
                <p className="text-[10px] text-[#1E3A8A] font-semibold">AI & Computer Vision Engineer</p>
                <p className="text-[11px] text-slate-500 leading-tight">YOLOv8 plate localization, OpenCV preprocessing, and Levenshtein fuzzy matcher.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">MEMBER</span>
                <h3 className="text-sm font-bold text-slate-900">Nidhi Patidar</h3>
                <p className="text-[10px] text-[#1E3A8A] font-semibold">Frontend & GIS Developer</p>
                <p className="text-[11px] text-slate-500 leading-tight">Next.js 16 command center, OpenStreetMap Leaflet layer, and tactical case directory.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 col-span-1.5">
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">MEMBER</span>
                <h3 className="text-sm font-bold text-slate-900">Himanshu Patidar</h3>
                <p className="text-[10px] text-[#1E3A8A] font-semibold">Database & Performance Lead</p>
                <p className="text-[11px] text-slate-500 leading-tight">SQLite/PostgreSQL schema, WebSocket real-time pub/sub, and connection pool scaling.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 col-span-1.5">
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">MEMBER</span>
                <h3 className="text-sm font-bold text-slate-900">Manav Patidar</h3>
                <p className="text-[10px] text-[#1E3A8A] font-semibold">Security & Operations Lead</p>
                <p className="text-[11px] text-slate-500 leading-tight">Law-enforcement RBAC, 2FA police badge clearance, and eGujCop compliance testing.</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-right">Slide 02 • Team Profile</div>
          </div>
        </section>

        {/* SLIDE 3: THE CHALLENGE */}
        <section className={`slide-page ${currentSlide === 3 ? 'block' : 'hidden print:block'}`}>
          <div className="w-[1000px] h-[562px] bg-white border border-slate-200 rounded-2xl shadow-md p-8 flex flex-col justify-between relative overflow-hidden print:border-0 print:shadow-none">
            <div className="absolute top-0 inset-x-0 h-1 bg-red-600" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Problem Statement</span>
              <h2 className="text-2xl font-black text-slate-900 font-serif">The Challenge: Fragmented CCTV Silos</h2>
              <p className="text-xs text-slate-500">Critical delays in tracking fleeing suspects across Gujarat's highway corridors</p>
            </div>

            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="bg-red-50/40 border-l-4 border-l-red-600 border border-slate-200 rounded-xl p-4 space-y-1">
                <h3 className="text-sm font-bold text-slate-900">1. Disconnected Agency Silos</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gujarat Police (28,400 cameras), Traffic & RTO (19,200 cameras), and Civil Supplies (12,100 cameras) operate on separate, isolated networks with no inter-agency data sharing.
                </p>
              </div>

              <div className="bg-red-50/40 border-l-4 border-l-red-600 border border-slate-200 rounded-xl p-4 space-y-1">
                <h3 className="text-sm font-bold text-slate-900">2. Fatal Manual Pursuit Latency</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Checking recordings across multiple stations takes 45–90 minutes per checkpoint. A fugitive vehicle travels 60+ km on NH-48 or NE-1 before a statewide alert is circulated.
                </p>
              </div>

              <div className="bg-amber-50/40 border-l-4 border-l-amber-600 border border-slate-200 rounded-xl p-4 space-y-1">
                <h3 className="text-sm font-bold text-slate-900">3. ANPR Failure in Indian Conditions</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bent, dirty, or non-standard Indian registration plates cause standard commercial OCR to fail. Missing characters lead to missed hotlist sightings.
                </p>
              </div>

              <div className="bg-blue-50/40 border-l-4 border-l-[#1E3A8A] border border-slate-200 rounded-xl p-4 space-y-1">
                <h3 className="text-sm font-bold text-slate-900">4. Foreign Cloud & Privacy Risks</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Commercial off-the-shelf software sends law-enforcement camera footage to proprietary third-party clouds, violating state data sovereignty protocols.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-right">Slide 03 • The Challenge</div>
          </div>
        </section>

        {/* SLIDE 4: THE SOLUTION */}
        <section className={`slide-page ${currentSlide === 4 ? 'block' : 'hidden print:block'}`}>
          <div className="w-[1000px] h-[562px] bg-white border border-slate-200 rounded-2xl shadow-md p-8 flex flex-col justify-between relative overflow-hidden print:border-0 print:shadow-none">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#1E3A8A]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">Executive Solution</span>
              <h2 className="text-2xl font-black text-slate-900 font-serif">The Solution: SENTINEL Unified Grid</h2>
              <p className="text-xs text-slate-500">Real-time camera federation, AI-driven ANPR, and predictive toll interdiction</p>
            </div>

            <div className="grid grid-cols-4 gap-3 my-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#1E3A8A] block mb-1">PILLAR 01</span>
                  <h3 className="text-xs font-bold text-slate-900">Unified Ingestion</h3>
                  <p className="text-[11px] text-slate-500 mt-2 leading-tight">
                    Ingests RTSP, WebRTC, and HLS across 80,000+ cameras statewide under a single glass pane.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-[#1E3A8A] font-bold mt-4">80,000+ Nodes</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 block mb-1">PILLAR 02</span>
                  <h3 className="text-xs font-bold text-slate-900">Sub-50ms AI ANPR</h3>
                  <p className="text-[11px] text-slate-500 mt-2 leading-tight">
                    Continuous plate extraction with Levenshtein fuzzy matching against eGujCop & SCRB hotlists.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-emerald-700 font-bold mt-4">&gt;98% Accuracy</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 block mb-1">PILLAR 03</span>
                  <h3 className="text-xs font-bold text-slate-900">GIS Trajectory</h3>
                  <p className="text-[11px] text-slate-500 mt-2 leading-tight">
                    Chronological route reconstruction on OpenStreetMap with zero watermarks or external APIs.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-amber-700 font-bold mt-4">100% Sovereign</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 block mb-1">PILLAR 04</span>
                  <h3 className="text-xs font-bold text-slate-900">Tactical Toll Lock</h3>
                  <p className="text-[11px] text-slate-500 mt-2 leading-tight">
                    Projects vehicle ETA to next toll naka; 1-click FASTag barrier lock and PCR dispatch.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-blue-700 font-bold mt-4">Instant Intercept</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-right">Slide 04 • The Solution</div>
          </div>
        </section>

        {/* SLIDE 5: SYSTEM ARCHITECTURE */}
        <section className={`slide-page ${currentSlide === 5 ? 'block' : 'hidden print:block'}`}>
          <div className="w-[1000px] h-[562px] bg-white border border-slate-200 rounded-2xl shadow-md p-8 flex flex-col justify-between relative overflow-hidden print:border-0 print:shadow-none">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#1E3A8A]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">System Architecture</span>
              <h2 className="text-2xl font-black text-slate-900 font-serif">4-Tier High-Performance Architecture</h2>
              <p className="text-xs text-slate-500">Decoupled microservice architecture engineered for high concurrency and sub-50ms latency</p>
            </div>

            <div className="grid grid-cols-4 gap-3 my-2">
              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3 space-y-1.5">
                <div className="text-xs font-bold text-[#1E3A8A]">1. Ingestion Layer</div>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• RTSP/RTP (Port 8554)</li>
                  <li>• WebRTC WHEP (Port 8889)</li>
                  <li>• 30 FPS MJPEG Engine</li>
                  <li>• Protocol Transcoder</li>
                </ul>
              </div>

              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 space-y-1.5">
                <div className="text-xs font-bold text-amber-800">2. AI & ANPR Engine</div>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• YOLOv8 Plate Detector</li>
                  <li>• CLAHE & Bilateral Filter</li>
                  <li>• OCR Character Engine</li>
                  <li>• Fuzzy Levenshtein Lock</li>
                </ul>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3 space-y-1.5">
                <div className="text-xs font-bold text-emerald-800">3. Core Services</div>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• FastAPI Microservices</li>
                  <li>• WebSocket Pub/Sub</li>
                  <li>• Origin Sharding Gateway</li>
                  <li>• SQLite / PostgreSQL DB</li>
                </ul>
              </div>

              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3 space-y-1.5">
                <div className="text-xs font-bold text-[#1E3A8A]">4. Tactical UI Layer</div>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• Next.js 16 + React 19</li>
                  <li>• 2x2 Live Video Wall</li>
                  <li>• Gujarat OpenStreetMap</li>
                  <li>• Intervention Dock</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center text-xs font-bold text-[#1E3A8A]">
              DATA PIPELINE: Camera Stream ➔ Optical ANPR (&lt;30ms) ➔ Hotlist Match ➔ WebSocket Push (&lt;10ms) ➔ Map Trajectory ➔ PCR & Toll Barricade
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-right">Slide 05 • System Architecture</div>
          </div>
        </section>

        {/* SLIDE 6: AI & VISION PIPELINE */}
        <section className={`slide-page ${currentSlide === 6 ? 'block' : 'hidden print:block'}`}>
          <div className="w-[1000px] h-[562px] bg-white border border-slate-200 rounded-2xl shadow-md p-8 flex flex-col justify-between relative overflow-hidden print:border-0 print:shadow-none">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#1E3A8A]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">AI Computer Vision</span>
              <h2 className="text-2xl font-black text-slate-900 font-serif">Robust ANPR Optical Pipeline</h2>
              <p className="text-xs text-slate-500">Specially tuned for heterogeneous Indian traffic, non-standard fonts, and night glare</p>
            </div>

            <div className="space-y-2.5 my-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center space-x-4">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#1E3A8A] font-bold flex items-center justify-center text-xs shrink-0">01</div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">YOLOv8 Deep Learning Plate Bounding Box</h3>
                  <p className="text-[11px] text-slate-500">Isolates high-resolution registration plates from moving vehicles in &lt;18ms with 98.4% detection confidence.</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center space-x-4">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">02</div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Adaptive Bilateral Filtering & CLAHE Equalization</h3>
                  <p className="text-[11px] text-slate-500">Removes high-speed motion blur, neutralizes headlights/streetlamp glare, and enhances contrast on dusty plates.</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center space-x-4">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">03</div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Indian State Syntax Normalization (OCR)</h3>
                  <p className="text-[11px] text-slate-500">Rule-based character disambiguation ('O' vs '0', 'I' vs '1') validated against RTO state formats (GJ, MH, RJ).</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center space-x-4">
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs shrink-0">04</div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Fuzzy Levenshtein Hotlist Matching</h3>
                  <p className="text-[11px] text-slate-500">Matches plates against active SCRB hotlists even with 1–2 occluded digits, triggering real-time Amber Alerts instantly.</p>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-right">Slide 06 • AI & Vision Pipeline</div>
          </div>
        </section>

        {/* SLIDE 7: LIVE 2X2 CCTV VIDEO WALL */}
        <section className={`slide-page ${currentSlide === 7 ? 'block' : 'hidden print:block'}`}>
          <div className="w-[1000px] h-[562px] bg-white border border-slate-200 rounded-2xl shadow-md p-8 flex flex-col justify-between relative overflow-hidden print:border-0 print:shadow-none">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#1E3A8A]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">Video Wall</span>
              <h2 className="text-2xl font-black text-slate-900 font-serif">Live CCTV Video Wall Matrix (2x2)</h2>
              <p className="text-xs text-slate-500">Continuous 30-FPS low-latency surveillance with multi-origin socket sharding</p>
            </div>

            <div className="grid grid-cols-2 gap-3 my-2">
              <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-slate-700 space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="bg-blue-600 px-1.5 py-0.5 rounded font-bold">POLICE</span>
                  <span className="text-emerald-400 font-bold">30 FPS LIVE</span>
                </div>
                <h3 className="text-xs font-bold">CAM-01: SG Highway Overpass</h3>
                <p className="text-[11px] text-slate-300">Live surveillance feed on northern artery. Target plate DA07CLX (Mazda 3) and EY09VWS identified.</p>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-red-500 ring-1 ring-red-400 space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="bg-blue-600 px-1.5 py-0.5 rounded font-bold">POLICE</span>
                  <span className="bg-red-600 px-1.5 py-0.5 rounded font-bold animate-pulse">HOTLIST HIT</span>
                </div>
                <h3 className="text-xs font-bold">CAM-02: SG Highway - Pakwan Cross</h3>
                <p className="text-[11px] text-slate-300">High-density crossroad ANPR tracking. Confirmed hit on Hit-and-Run Suspect (MH04EE1980).</p>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-slate-700 space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="bg-amber-600 px-1.5 py-0.5 rounded font-bold">RTO</span>
                  <span className="text-emerald-400 font-bold">30 FPS LIVE</span>
                </div>
                <h3 className="text-xs font-bold">CAM-03: Ashram Road Metro Flyover</h3>
                <p className="text-[11px] text-slate-300">Transit corridor surveillance stream. Identified Missing Inter-State Ertiga Taxi (MH46T7527).</p>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-red-500 ring-1 ring-red-400 space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="bg-blue-600 px-1.5 py-0.5 rounded font-bold">POLICE</span>
                  <span className="bg-red-600 px-1.5 py-0.5 rounded font-bold animate-pulse">HOTLIST HIT</span>
                </div>
                <h3 className="text-xs font-bold">CAM-04: SP Ring Road - Vaishnodevi</h3>
                <p className="text-[11px] text-slate-300">Strategic Gandhinagar exit checkpoint. Vector reconstruction locked onto Amber Alert target.</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-right">Slide 07 • Video Wall Matrix</div>
          </div>
        </section>

        {/* SLIDE 8: TACTICAL ENFORCEMENT */}
        <section className={`slide-page ${currentSlide === 8 ? 'block' : 'hidden print:block'}`}>
          <div className="w-[1000px] h-[562px] bg-white border border-slate-200 rounded-2xl shadow-md p-8 flex flex-col justify-between relative overflow-hidden print:border-0 print:shadow-none">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#1E3A8A]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">Tactical Action</span>
              <h2 className="text-2xl font-black text-slate-900 font-serif">Predictive Toll Interception & Dispatch</h2>
              <p className="text-xs text-slate-500">Transforming passive CCTV observation into proactive police apprehension</p>
            </div>

            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Predictive Tracking</span>
                <h3 className="text-sm font-bold text-slate-900">ETA & Downstream Checkpoint Projection</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  SENTINEL calculates vehicle velocity between checkpoints and projects arrival ETA at the next highway naka (e.g., "CH-0 Toll: ETA ~6m").
                </p>
              </div>

              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-[#1E3A8A] uppercase">Automated Toll Barricade</span>
                <h3 className="text-sm font-bold text-slate-900">FASTag Boom Barrier Remote Signaling</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  1-click electronic toll lock triggers highway barriers (e.g. Chharodi Toll NH-48) to safely trap escaping suspect vehicles prior to arrival.
                </p>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Field Interception</span>
                <h3 className="text-sm font-bold text-slate-900">Mobile PCR Patrol Unit Dispatch</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instantly transmits GPS coordinates, vehicle color, model, and suspect photograph to the nearest patrol vehicle (PCR-08) via encrypted link.
                </p>
              </div>

              <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase">Legal Compliance</span>
                <h3 className="text-sm font-bold text-slate-900">Certified Digital Evidence Dossier (PDF)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Exports a tamper-proof incident dossier with monotonic timestamps, camera coordinates, and chain-of-custody verification admissible in court.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-right">Slide 08 • Tactical Enforcement</div>
          </div>
        </section>

        {/* SLIDE 9: INTER-AGENCY INTEGRATION */}
        <section className={`slide-page ${currentSlide === 9 ? 'block' : 'hidden print:block'}`}>
          <div className="w-[1000px] h-[562px] bg-white border border-slate-200 rounded-2xl shadow-md p-8 flex flex-col justify-between relative overflow-hidden print:border-0 print:shadow-none">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#1E3A8A]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">Inter-Agency Federation</span>
              <h2 className="text-2xl font-black text-slate-900 font-serif">Statewide Multi-Agency Federation</h2>
              <p className="text-xs text-slate-500">Unifying fragmented departments under a single interoperable command standard</p>
            </div>

            <div className="grid grid-cols-3 gap-3 my-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1E3A8A] block">GUJARAT STATE POLICE</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">28,400</div>
                  <span className="text-[10px] text-slate-400 font-mono">Active Nodes Statewide</span>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    Direct synchronization with eGujCop FIR records, Amber Alerts, and State Crime Records Bureau (SCRB).
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#1E3A8A] mt-4">✓ eGujCop Synchronized</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-700 block">TRAFFIC & RTO DEPARTMENT</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">19,200</div>
                  <span className="text-[10px] text-slate-400 font-mono">Highway & Urban Sensors</span>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    Integrated with VAHAN national registry, highway FASTag toll barriers, and speed violation nakas.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-amber-700 mt-4">✓ VAHAN & FASTag Connected</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700 block">CIVIL SUPPLIES & ULBs</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">12,100</div>
                  <span className="text-[10px] text-slate-400 font-mono">Warehouse & Municipal Cams</span>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    Warehouse surveillance, bus terminals, and smart city intersection cameras feeding perimeter alerts.
                  </p>
                </div>
                <div className="text-[10px] font-bold text-emerald-700 mt-4">✓ Smart City Interlinked</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-right">Slide 09 • Inter-Agency Federation</div>
          </div>
        </section>

        {/* SLIDE 10: SECURITY & DATA SOVEREIGNTY */}
        <section className={`slide-page ${currentSlide === 10 ? 'block' : 'hidden print:block'}`}>
          <div className="w-[1000px] h-[562px] bg-white border border-slate-200 rounded-2xl shadow-md p-8 flex flex-col justify-between relative overflow-hidden print:border-0 print:shadow-none">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#1E3A8A]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">Data Sovereignty</span>
              <h2 className="text-2xl font-black text-slate-900 font-serif">Security, Privacy & Sovereign Law Enforcement</h2>
              <p className="text-xs text-slate-500">Engineered to meet Indian national data security protocols and police IT standards</p>
            </div>

            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-[#1E3A8A] uppercase">Access Control</span>
                <h3 className="text-sm font-bold text-slate-900">Role-Based Police 2FA Clearance</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Requires valid Police Badge ID (e.g. GP-CID-7809), officer clearance level (Inspector, SP, DIG), and cryptographic session tokens.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Data Sovereignty</span>
                <h3 className="text-sm font-bold text-slate-900">Watermark-Free Self-Hosted GIS</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  100% self-hosted OpenStreetMap Gujarat vector tile engine with zero reliance on foreign commercial map APIs (Google Maps/Mapbox).
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Legal Audit Trail</span>
                <h3 className="text-sm font-bold text-slate-900">Cryptographic Monotonic Logging</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every query, camera access, and intervention command is permanently audited with non-repudiation timestamps for court compliance.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase">Infrastructure Hardening</span>
                <h3 className="text-sm font-bold text-slate-900">OWASP Hardened Perimeter</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Strict CSP policies, X-Frame-Options DENY, X-Content-Type-Options nosniff, and SQL-injection immune parameterized queries.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-right">Slide 10 • Security & Sovereignty</div>
          </div>
        </section>

        {/* SLIDE 11: SCALABILITY */}
        <section className={`slide-page ${currentSlide === 11 ? 'block' : 'hidden print:block'}`}>
          <div className="w-[1000px] h-[562px] bg-white border border-slate-200 rounded-2xl shadow-md p-8 flex flex-col justify-between relative overflow-hidden print:border-0 print:shadow-none">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#1E3A8A]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">Scalability</span>
              <h2 className="text-2xl font-black text-slate-900 font-serif">Statewide Rollout & Performance Benchmarks</h2>
              <p className="text-xs text-slate-500">Engineered to scale seamlessly across all 33 districts of Gujarat State</p>
            </div>

            <div className="grid grid-cols-4 gap-3 my-2">
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-emerald-700 font-mono">&lt;50ms</div>
                <div className="text-[10px] font-bold text-slate-700 mt-1">ANPR Inference Latency</div>
              </div>

              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-[#1E3A8A] font-mono">30 FPS</div>
                <div className="text-[10px] font-bold text-slate-700 mt-1">MJPEG Surveillance Stream</div>
              </div>

              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-amber-700 font-mono">80,000+</div>
                <div className="text-[10px] font-bold text-slate-700 mt-1">Camera Grid Capacity</div>
              </div>

              <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-purple-700 font-mono">98.4%</div>
                <div className="text-[10px] font-bold text-slate-700 mt-1">Plate Match Accuracy</div>
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 space-y-1 text-xs">
              <span className="font-bold text-[#1E3A8A] uppercase tracking-wider block text-[10px]">Phased Deployment Plan</span>
              <p className="text-slate-700">• <strong>Phase 1 (Live Pilot - Complete):</strong> Ahmedabad & Gandhinagar SG Highway (52 Active Nodes, 4 Live Video Feeds, 8 Active Hotlist Cases).</p>
              <p className="text-slate-700">• <strong>Phase 2 (Metropolitan - Q3 2026):</strong> Surat Municipal Corp, Vadodara Smart City, and NE-1 National Expressway Toll Plazas.</p>
              <p className="text-slate-700">• <strong>Phase 3 (Statewide - Q1 2027):</strong> Saurashtra (Rajkot, Bhavnagar) and Kutch border security checkpoints (80,000+ nodes).</p>
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-right">Slide 11 • Scalability & Rollout</div>
          </div>
        </section>

        {/* SLIDE 12: SUMMARY & CONCLUSION */}
        <section className={`slide-page ${currentSlide === 12 ? 'block' : 'hidden print:block'}`}>
          <div className="w-[1000px] h-[562px] bg-white border border-slate-200 rounded-2xl shadow-md p-8 flex flex-col justify-between relative overflow-hidden print:border-0 print:shadow-none">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-white to-emerald-600" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">Conclusion</span>
              <h2 className="text-2xl font-black text-slate-900 font-serif">SENTINEL: Ready for Deployment</h2>
              <p className="text-xs text-slate-500">Transforming Gujarat Police CCTV infrastructure into an active, predictive law-enforcement grid</p>
            </div>

            <div className="space-y-2 my-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Real-World Tested:</strong> Live 2x2 CCTV video wall streaming continuous 30-FPS video with zero socket starvation.</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Full Investigation Lifecycle:</strong> Automated from frame ingestion to AI plate recognition, GIS trajectory, and 1-click toll lock.</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Sovereign & Cloud-Independent:</strong> 100% self-hosted OpenStreetMap engine with zero external data dependencies.</span>
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider block">Submitted By Team</span>
                <span className="text-sm font-bold text-slate-900">Rajasthan Warriorz</span>
                <span className="text-xs text-slate-600 block">Sagar Patidar (TL) • Mitisha Patidar • Nidhi Patidar • Himanshu Patidar • Manav Patidar</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">GitHub Repository</span>
                <span className="text-xs font-mono font-bold text-[#1E3A8A]">github.com/mitishapatidar/sentinel-gujarat-cctv</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-right">Slide 12 • Summary & Conclusion</div>
          </div>
        </section>

      </main>

      {/* Global CSS for Print Mode */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .slide-page {
            display: block !important;
            page-break-after: always !important;
            break-after: page !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
