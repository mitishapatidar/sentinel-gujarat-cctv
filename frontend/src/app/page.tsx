'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const officer = localStorage.getItem('sentinel_officer');
    if (officer) {
      router.replace('/command-center');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans text-xs text-slate-500">
      <div className="w-8 h-8 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mb-3" />
      <span className="font-semibold text-slate-700">INITIALIZING SENTINEL GUJARAT STATE UNIFIED GRID...</span>
    </div>
  );
}
