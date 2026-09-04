'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OfficialGovBar } from '../../components/OfficialGovBar';
import { Shield, Car, Building2, Landmark, Anchor, ArrowRight, CheckCircle2, Activity, Server, Cpu, HardDrive } from 'lucide-react';

export default function DepartmentsPage() {
  const router = useRouter();

  const departmentFeeds = [
    {
      id: 'police',
      name: 'Gujarat Police (City & Highway Surveillance)',
      nodes: '28,400 Nodes',
      status: 'Active',
      icon: Shield,
      badgeColor: 'bg-blue-100 text-blue-800',
      description: 'Integrated city surveillance mesh, 24x7 ANPR hotlist scanners, traffic junction PTZ cameras, and PCR van dispatch link across 33 districts.',
      coverage: 'Ahmedabad, Gandhinagar, Surat, Vadodara, Rajkot',
    },
    {
      id: 'traffic-rto',
      name: 'Traffic & RTO (Speed & ANPR Corridors)',
      nodes: '19,200 Nodes',
      status: 'Active',
      icon: Car,
      badgeColor: 'bg-amber-100 text-amber-800',
      description: 'National & State Highway automated speed violation detection, FASTag integration, electronic toll nakas, and overload freight enforcement.',
      coverage: 'NE-1 Expressway, NH-48, SG Highway, Ring Roads',
    },
    {
      id: 'civil-supplies',
      name: 'Civil Supplies & Warehousing (PDS Depot Security)',
      nodes: '12,100 Nodes',
      status: 'Active',
      icon: Building2,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      description: 'Food grain warehouses, essential supplies distribution depots, anti-diversion vigilance, and state-backed transport trucks tracking.',
      coverage: 'PDS Supply Depots, State Freight Terminals',
    },
    {
      id: 'smart-cities',
      name: 'Smart Cities / Municipal Corporations (AMC, SMC, VMC)',
      nodes: '14,300 Nodes',
      status: 'Active',
      icon: Landmark,
      badgeColor: 'bg-purple-100 text-purple-800',
      description: 'Unified municipal corporation surveillance, public transport BRTS/Metro corridors, waste management centers, and civic hubs.',
      coverage: 'Ahmedabad (AMC), Surat (SMC), Vadodara (VMC)',
    },
    {
      id: 'border-coastal',
      name: 'Border & Coastal Security (Kutch, Jamnagar, Dwarka)',
      nodes: '6,000 Nodes',
      status: 'Active',
      icon: Anchor,
      badgeColor: 'bg-cyan-100 text-cyan-800',
      description: 'Marine police checkpoints, coastal highway checkpoints, international border security gates, and port peripheral surveillance.',
      coverage: 'Rann of Kutch, Okha, Kandla, Mundra Coastal Belt',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans select-none">
      <OfficialGovBar activeAlertsCount={12} />

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                STATEWIDE FEDERATION
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5 font-serif">
              Statewide Heterogeneous CCTV Integration Status
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Consolidated real-time camera nodes seamlessly streaming from 5 sovereign government departments into the SENTINEL command layer.
            </p>
          </div>

          <button
            onClick={() => router.push('/command-center')}
            className="px-6 py-3 bg-[#1E3A8A] hover:bg-[#193073] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0 self-start md:self-auto"
          >
            <span>Launch Gujarat GIS Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Executive Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">80,000 Nodes</div>
              <div className="text-xs text-slate-500 font-medium">Total Federated Camera Capacity</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">99.8% Uptime</div>
              <div className="text-xs text-slate-500 font-medium">Live High-Availability Mesh SLA</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">95% Savings</div>
              <div className="text-xs text-slate-500 font-medium">Bandwidth Optimized via Edge AI ANPR</div>
            </div>
          </div>
        </div>

        {/* 5 Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departmentFeeds.map((dept) => {
            const Icon = dept.icon;
            return (
              <div
                key={dept.id}
                className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-2xl p-6 shadow-sm transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#1E3A8A]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{dept.status}</span>
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-serif leading-snug">
                      {dept.name}
                    </h2>
                    <div className="text-xl font-black text-[#1E3A8A] font-mono mt-1">
                      {dept.nodes}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Key Coverage:</span>
                  <span className="text-slate-700 truncate block mt-0.5">{dept.coverage}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-8 bg-white border-t border-slate-200 text-center text-xs text-slate-500 font-mono">
        SENTINEL State GIS Gateway • Home Department, Government of Gujarat
      </footer>
    </div>
  );
}
