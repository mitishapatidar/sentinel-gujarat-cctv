'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Shield, 
  Phone, 
  Clock, 
  LogOut, 
  LayoutDashboard, 
  AlertTriangle, 
  Route, 
  Cpu, 
  Layers, 
  FileText, 
  Presentation,
  Bell,
  Globe,
  Sliders
} from 'lucide-react';

interface OfficialGovBarProps {
  activeAlertsCount?: number;
}

export const OfficialGovBar: React.FC<OfficialGovBarProps> = ({ activeAlertsCount = 12 }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [time, setTime] = useState<string>('');
  const [officerName, setOfficerName] = useState<string>('Insp. M. Patidar');
  const [badgeId, setBadgeId] = useState<string>('GP-CID-7809');
  const [currentLang, setCurrentLang] = useState<'EN' | 'GU' | 'HI'>('EN');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'small'>('normal');

  useEffect(() => {
    const saved = localStorage.getItem('sentinel_officer');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setOfficerName(parsed.name.includes('Mitisha') ? 'Insp. M. Patidar' : parsed.name);
        if (parsed.badgeId) setBadgeId(parsed.badgeId);
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
    { href: '/command-center', label: 'Live Video Wall', icon: LayoutDashboard },
    { href: '/anomalies', label: 'Behavioral Anomalies', icon: AlertTriangle, badge: 'New' },
    { href: '/trail', label: 'Vehicle Forensic Trail', icon: Route },
    { href: '/edge-triage', label: '80K Bandwidth Proof', icon: Cpu },
    { href: '/departments', label: 'Agency Integration', icon: Layers },
    { href: '/cases', label: 'Crime Hotlist', icon: FileText },
    { href: '/presentation', label: 'Presentation Deck', icon: Presentation },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 text-slate-800 z-50 sticky top-0 shadow-sm">
      {/* 1. Official Indian Tricolor Hairline Stripe */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* 2. Authentic Indian Government Utility & Accessibility Strip */}
      <div className="bg-slate-100 border-b border-slate-200 px-6 py-1 text-[11px] font-sans flex items-center justify-between text-slate-600">
        <div className="flex items-center space-x-3 divide-x divide-slate-300">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
            <span>🇮🇳</span>
            <span>ગુજરાત સરકાર • GOVERNMENT OF GUJARAT</span>
          </div>
          <div className="pl-3 hidden md:flex items-center space-x-1.5 text-slate-500">
            <span>गृह विभाग • HOME DEPARTMENT</span>
          </div>
          <div className="pl-3 hidden lg:flex items-center space-x-1 text-red-700 font-semibold font-mono">
            <Phone className="w-3 h-3 text-red-600" />
            <span>Emergency Police Control: <strong>112 / 100</strong></span>
          </div>
        </div>

        {/* Right Accessibility Utilities */}
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          {/* Font Size Adjuster */}
          <div className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-slate-200">
            <span className="text-slate-400">Size:</span>
            <button 
              onClick={() => setFontSize('small')} 
              className={`px-1 hover:text-[#1E3A8A] font-bold ${fontSize === 'small' ? 'text-[#1E3A8A]' : 'text-slate-600'}`}
            >
              A-
            </button>
            <button 
              onClick={() => setFontSize('normal')} 
              className={`px-1 hover:text-[#1E3A8A] font-bold ${fontSize === 'normal' ? 'text-[#1E3A8A]' : 'text-slate-600'}`}
            >
              A
            </button>
            <button 
              onClick={() => setFontSize('large')} 
              className={`px-1 hover:text-[#1E3A8A] font-bold ${fontSize === 'large' ? 'text-[#1E3A8A]' : 'text-slate-600'}`}
            >
              A+
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
            <Globe className="w-3 h-3 text-slate-400" />
            <button 
              onClick={() => setCurrentLang('EN')}
              className={`px-1 rounded ${currentLang === 'EN' ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              English
            </button>
            <span>|</span>
            <button 
              onClick={() => setCurrentLang('GU')}
              className={`px-1 rounded ${currentLang === 'GU' ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              ગુજરાતી
            </button>
            <span>|</span>
            <button 
              onClick={() => setCurrentLang('HI')}
              className={`px-1 rounded ${currentLang === 'HI' ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Government Header with Ashok Stambh & Seal */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center space-x-4">
          
          {/* Official Emblem & State Crest */}
          <div className="flex items-center space-x-3">
            {/* National Ashok Stambh Crest Symbol */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] flex flex-col items-center justify-center shadow-md text-amber-400 p-1 border border-blue-200">
              <Shield className="w-6 h-6 text-amber-300" />
              <span className="text-[7px] font-black uppercase tracking-tighter text-amber-200 font-mono mt-0.5">
                सत्यमेव जयते
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black tracking-wider text-[#1E3A8A] uppercase font-sans">
                  ગુજરાત પોલીસ • GUJARAT POLICE
                </span>
                <span className="text-[9px] bg-amber-50 text-amber-800 font-mono px-2 py-0.5 rounded border border-amber-200 font-bold uppercase">
                  eGujCop CCTNS GRID
                </span>
              </div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight font-serif">
                SENTINEL — Unified CCTV &amp; AI ANPR Command Grid
              </h1>
              <p className="text-[10px] text-slate-500 font-mono hidden sm:block">
                Connecting 80,000 Heterogeneous Cameras across Municipal Corporations, Smart Cities, RTOs &amp; Police
              </p>
            </div>
          </div>
        </div>

        {/* Right Officer Session & Telemetry */}
        <div className="flex items-center space-x-3">
          {/* Officer Clearance Pill */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-xs shadow-xs">
            <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white font-bold text-[10px] flex items-center justify-center">
              GP
            </div>
            <div className="font-mono text-left">
              <span className="font-bold text-slate-900 block leading-tight">{officerName}</span>
              <span className="text-[10px] text-slate-500 font-semibold">{badgeId} • Zone 1</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" title="Security Clearance Active" />
          </div>

          {/* Emergency Alert Counter Badge */}
          <div className="hidden md:flex items-center space-x-1.5 bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-full text-xs font-mono font-bold shadow-xs">
            <Bell className="w-3.5 h-3.5 text-red-600 animate-bounce" />
            <span>{activeAlertsCount} Live Alerts</span>
          </div>

          {/* Real-time IST Digital Clock */}
          <div className="hidden lg:flex items-center space-x-1.5 text-slate-700 font-mono text-xs bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{time || '--:--:-- IST'}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Terminate Official Session"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Official Clean Government Navigation Strip */}
      <nav className="px-6 bg-slate-50 border-b border-slate-200 flex items-center space-x-1 overflow-x-auto scrollbar-none">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-2.5 text-xs font-mono font-bold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-[#1E3A8A] text-[#1E3A8A] bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#1E3A8A]' : 'text-slate-400'}`} />
              <span>{link.label}</span>
              {link.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 border border-red-200">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};

export default OfficialGovBar;
