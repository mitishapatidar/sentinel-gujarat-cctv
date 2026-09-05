'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Lock, Radio, Clock, UserCheck, AlertTriangle, LogOut, Layers, LayoutDashboard, FileText, Bell, Route, Cpu } from 'lucide-react';

interface OfficialGovBarProps {
  activeAlertsCount?: number;
}

export const OfficialGovBar: React.FC<OfficialGovBarProps> = ({ activeAlertsCount = 12 }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [time, setTime] = useState<string>('');
  const [officerName, setOfficerName] = useState<string>('Insp. M. Patidar');
  const [badgeId, setBadgeId] = useState<string>('GP-CID-7809');
  const [role, setRole] = useState<string>('Cyber Crime & Tactical Pursuit Cell');

  useEffect(() => {
    const saved = localStorage.getItem('sentinel_officer');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setOfficerName(parsed.name.includes('Mitisha') ? 'Insp. M. Patidar' : parsed.name);
        if (parsed.badgeId) setBadgeId(parsed.badgeId);
        if (parsed.role) setRole(parsed.role);
      } catch {}
    }

    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sentinel_officer');
    router.push('/login');
  };

  const navLinks = [
    { href: '/departments', label: 'Integration Status', icon: Layers },
    { href: '/command-center', label: 'Command & Control', icon: LayoutDashboard },
    { href: '/anomalies', label: 'Behavioral Anomalies', icon: AlertTriangle },
    { href: '/trail', label: 'Trail Forensic', icon: Route },
    { href: '/edge-triage', label: '80K Edge Triage Proof', icon: Cpu },
    { href: '/cases', label: 'Crime Hotlist', icon: FileText },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 text-slate-800 z-50 sticky top-0 shadow-sm">
      {/* 1. Official Indian Tricolor Hairline Stripe */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* 2. Main Executive Header */}
      <div className="px-6 py-2.5 flex items-center justify-between border-b border-slate-100 bg-white">
        <div className="flex items-center space-x-4">
          {/* Emblem & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#1E3A8A] flex items-center justify-center shadow-md text-amber-300">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black tracking-widest text-[#1E3A8A] uppercase font-sans">
                  GOVERNMENT OF GUJARAT
                </span>
                <span className="text-[10px] bg-blue-50 text-[#1E3A8A] font-mono px-2 py-0.5 rounded border border-blue-200 font-bold uppercase">
                  HOME DEPARTMENT
                </span>
              </div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
                SENTINEL — Gujarat State Unified CCTV Grid
              </h1>
            </div>
          </div>
        </div>

        {/* Right Officer Pill & Telemetry */}
        <div className="flex items-center space-x-4">
          {/* Active Officer Pill */}
          <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1 text-xs">
            <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white font-bold text-[10px] flex items-center justify-center">
              MP
            </div>
            <div className="font-mono">
              <span className="font-bold text-slate-900">{officerName}</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="text-[#1E3A8A] font-semibold">{badgeId}</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" title="Session Active" />
          </div>

          {/* Emergency Alert Badge Counter */}
          <div className="flex items-center space-x-1.5 bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-full text-xs font-mono font-bold">
            <Bell className="w-3.5 h-3.5 text-red-600 animate-bounce" />
            <span>{activeAlertsCount} Live Hits</span>
          </div>

          {/* Real-time IST Digital Clock */}
          <div className="hidden sm:flex items-center space-x-1.5 text-slate-600 font-mono text-xs bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{time || '--:--:-- IST'}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Terminate Authorized Session"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Navigation Bar */}
      <div className="px-6 py-1 bg-slate-50 flex items-center justify-between text-xs font-medium border-b border-slate-200">
        <div className="flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md transition-all font-semibold ${
                  isActive
                    ? 'bg-white text-[#1E3A8A] shadow-sm border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1E3A8A]' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500">
          <span className="flex items-center space-x-1">
            <Radio className="w-3 h-3 text-emerald-600" />
            <span>eGujCop & CCTNS Link: <strong className="text-emerald-700">ONLINE (80,000 NODES)</strong></span>
          </span>
        </div>
      </div>
    </header>
  );
};
