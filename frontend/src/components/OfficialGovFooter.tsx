'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Phone, Mail, ExternalLink, CheckCircle2, FileText, Globe } from 'lucide-react';

export const OfficialGovFooter: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 font-sans mt-auto border-t border-slate-800">
      {/* 1. Official Indian Tricolor Hairline Stripe */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* 2. Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          
          {/* Col 1: Government Authority & Address */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center text-amber-400 font-bold border border-blue-400/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                  GUJARAT STATE POLICE
                </div>
                <div className="text-sm font-black text-white font-serif tracking-tight">
                  गृह विभाग • HOME DEPARTMENT
                </div>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              Office of the Director General of Police (DGP), Police Bhavan, Sector 18, Gandhinagar, Gujarat 382018.
            </p>

            <div className="space-y-1 text-[11px] font-mono text-slate-300">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Emergency Control: <strong>Dial 112 / 100</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>National Cyber Helpline: <strong>1930</strong></span>
              </div>
            </div>
          </div>

          {/* Col 2: Inter-Agency Integrated Portals */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>Interlinked State Portals</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>
                <a href="https://police.gujarat.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1 transition-colors">
                  <span>• eGujCop CCTNS FIR Registry</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-600" />
                </a>
              </li>
              <li>
                <a href="https://vahan.parivahan.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1 transition-colors">
                  <span>• MoRTH VAHAN 4.0 Vehicle Portal</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-600" />
                </a>
              </li>
              <li>
                <span className="text-slate-300">• NHAI FASTag Electronic Toll Intercept</span>
              </li>
              <li>
                <span className="text-slate-300">• Gujarat State Crime Records Bureau (SCRB)</span>
              </li>
              <li>
                <span className="text-slate-300">• Smart City ULB Surveillance Interconnect</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Security & Data Sovereignty Standards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security & Sovereignty</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>100% Self-Hosted OpenStreetMap Vector GIS</span>
              </li>
              <li className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>Zero Foreign Commercial Cloud Dependencies</span>
              </li>
              <li className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>GSWAN (Gujarat State WAN) Encrypted Egress</span>
              </li>
              <li className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>Non-Repudiation Monotonic Audit Logging</span>
              </li>
              <li className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>OWASP Top 10 Hardened CSP & SQLi Immunity</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Innovation Challenge Submission Badge */}
          <div className="space-y-2.5 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              OFFICIAL HACKATHON ENTRY
            </div>
            <div className="text-xs font-bold text-white">
              Gujarat Police Innovation Challenge 2026
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Organized under DGP G.S. Malik, connecting 80,000 heterogeneous cameras across Gujarat.
            </p>
            <div className="pt-2 border-t border-slate-700/80">
              <span className="text-[10px] font-mono text-slate-400 block">Submitted By Team</span>
              <strong className="text-white text-xs block">Rajasthan Warriorz</strong>
              <div className="text-[10px] text-slate-400 mt-1">
                Sagar Patidar (TL) • Mitisha • Nidhi • Himanshu • Manav
              </div>
            </div>
          </div>

        </div>

        {/* Bottom NIC Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <div>
            Website Designed &amp; Developed for <strong>Gujarat Police Home Department</strong> following 
            <strong> National Informatics Centre (NIC)</strong> Guidelines for Indian Government Websites (GIGW 3.0).
          </div>

          <div className="flex items-center space-x-4 shrink-0 font-mono text-[10px]">
            <span>STQC Certified</span>
            <span>•</span>
            <span>ISO 27001 Compliant</span>
            <span>•</span>
            <span>Last Updated: 05 Sep 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default OfficialGovFooter;
