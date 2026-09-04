'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, KeyRound, ShieldAlert, CheckCircle2, ArrowRight, Key } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [badgeId, setBadgeId] = useState('GP-CID-7809');
  const [password, setPassword] = useState('••••••••••••');
  const [clearanceRole, setClearanceRole] = useState('CID Crime');
  const [twoFactorToken, setTwoFactorToken] = useState('891240');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const officerProfile = {
      name: 'Insp. M. Patidar',
      badgeId: badgeId.toUpperCase(),
      role: `${clearanceRole} & Tactical Pursuit Cell`,
      department: clearanceRole.includes('Traffic') ? 'State Traffic Directorate' : 'Gujarat Police CID',
      sessionToken: `SEC-TOK-${Math.floor(10000 + Math.random() * 90000)}`,
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem('sentinel_officer', JSON.stringify(officerProfile));

    setTimeout(() => {
      router.push('/departments');
    }, 450);
  };

  const autoFillDemo = () => {
    setBadgeId('GP-CID-7809');
    setPassword('Superintendent@2026');
    setClearanceRole('CID Crime');
    setTwoFactorToken('891240');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans select-none">
      {/* Official Indian Tricolor Top Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* Top Header */}
      <header className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#1E3A8A] flex items-center justify-center text-amber-300 shadow">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black tracking-widest text-[#1E3A8A] uppercase">
              GOVERNMENT OF GUJARAT • HOME DEPARTMENT
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Gujarat State Unified CCTV Grid ("SENTINEL")
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md text-slate-600">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>CLASSIFICATION: <strong className="text-slate-800">OFFICIAL LAW ENFORCEMENT ONLY</strong></span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Card Header */}
          <div className="p-8 pb-5 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-[#1E3A8A] mb-3 shadow-sm">
              <Shield className="w-8 h-8 text-[#1E3A8A]" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight font-serif">
              RESTRICTED LAW-ENFORCEMENT ACCESS
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Officer Single Sign-On • State Emergency CCTV Surveillance
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-4">
            {/* Police Badge/Officer ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Police Badge / Officer ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value.toUpperCase())}
                  placeholder="e.g. GP-CID-7809"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] rounded-xl text-sm font-mono font-bold text-slate-900 tracking-wider outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter authorized password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] rounded-xl text-sm text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Department clearance dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Department Clearance
              </label>
              <select
                value={clearanceRole}
                onChange={(e) => setClearanceRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] rounded-xl text-sm font-medium text-slate-900 outline-none cursor-pointer transition-all"
              >
                <option value="CID Crime">CID Crime Branch (Criminal Pursuit & ANPR)</option>
                <option value="Traffic Directorate">State Traffic Directorate (Speed & Highway Tolls)</option>
                <option value="SIB">State Intelligence Bureau (SIB Gujarat)</option>
                <option value="RTO Vigilance">RTO Vigilance & Commercial Transport</option>
              </select>
            </div>

            {/* 2FA Security Token */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Two-Factor Security Token / OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value)}
                  placeholder="6-digit security token"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] rounded-xl text-sm font-mono font-bold tracking-widest text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#1E3A8A] hover:bg-[#1e3470] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-3"
            >
              <span>{isLoading ? 'VERIFYING CREDENTIALS...' : 'Secure Access to Statewide Grid'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Demo autofill shortcut */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={autoFillDemo}
                className="text-xs font-semibold text-[#1E3A8A] hover:underline"
              >
                Auto-fill Officer Mitisha Patidar (Badge #GP-CID-7809)
              </button>
            </div>
          </form>

          {/* Official Legal Notice Badge */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
              ⚖️ <strong className="text-slate-800">LEGAL NOTICE:</strong> Restricted to authorized enforcement personnel under IT Act 2000. All terminal interactions and telemetry lookups are digitally watermarked.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-8 bg-white border-t border-slate-200 text-center text-xs text-slate-500 font-mono">
        © 2026 Home Department, Government of Gujarat. SENTINEL Unified Platform.
      </footer>
    </div>
  );
}
