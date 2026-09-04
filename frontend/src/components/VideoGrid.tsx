'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera as CameraType } from '../types';
import { Video, ShieldAlert, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface VideoGridProps {
  cameras: CameraType[];
  selectedCameraId: number | null;
  onSelectCamera: (cam: CameraType) => void;
  latestAlertCameraId?: number | null;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  cameras,
  selectedCameraId,
  onSelectCamera,
  latestAlertCameraId,
}) => {
  const [page, setPage] = useState(0);
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Filter cameras
  const filteredCameras = cameras.filter((c) => {
    if (departmentFilter === 'ALL') return true;
    return c.department.toUpperCase() === departmentFilter.toUpperCase();
  });

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filteredCameras.length / pageSize));
  const displayCameras = filteredCameras.slice(page * pageSize, (page + 1) * pageSize);

  const nextPage = () => setPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header with Camera Paging & Department Filter for 50+ Cameras */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Video className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-200 font-mono">
            2x2 Live Video Wall ({filteredCameras.length} Feeds)
          </h2>
        </div>

        {/* Filter & Pagination Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] font-mono">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(0);
              }}
              className="bg-transparent text-slate-300 outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Departments</option>
              <option value="POLICE" className="bg-slate-900">Police Only</option>
              <option value="RTO" className="bg-slate-900">RTO Only</option>
              <option value="CIVIL SUPPLIES" className="bg-slate-900">Civil Supplies</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 font-mono text-xs text-slate-400">
            <span>{page + 1}/{totalPages}</span>
            <button
              onClick={prevPage}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 transition-colors"
              title="Previous 4 Feeds"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextPage}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 transition-colors"
              title="Next 4 Feeds"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2 p-2 flex-1 min-h-[360px]">
        {displayCameras.map((cam, idx) => {
          const isSelected = selectedCameraId === cam.id;
          const isAlerted = Boolean(latestAlertCameraId === cam.id || cam.recent_alert);

          return (
            <div
              key={cam.id}
              onClick={() => onSelectCamera(cam)}
              className={`relative rounded-lg overflow-hidden border cursor-pointer transition-all duration-300 group ${
                isAlerted
                  ? 'border-red-500 ring-2 ring-red-500/50 shadow-lg shadow-red-950/60'
                  : isSelected
                  ? 'border-cyan-400 ring-1 ring-cyan-400/40'
                  : 'border-slate-800 hover:border-slate-600'
              }`}
            >
              {/* CCTV Canvas Simulator */}
              <CameraFeedCanvas camera={cam} isAlerted={isAlerted} channelIndex={idx + 1} />

              {/* Overlay Labels: Department & Status Tag */}
              <div className="absolute top-2 left-2 z-10 flex items-center space-x-1.5">
                <DepartmentTag department={cam.department} />
                <span className="text-[10px] font-mono font-bold bg-black/80 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">
                  CAM-{cam.id.toString().padStart(2, '0')}
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  cam.status === 'online' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' : 'bg-red-950 text-red-300 border-red-700'
                }`}>
                  {cam.status.toUpperCase()}
                </span>
              </div>

              {/* Alert Status Banner */}
              {isAlerted && (
                <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 bg-red-600/90 text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded shadow animate-bounce">
                  <ShieldAlert className="w-3 h-3" />
                  <span>ALERT DETECTED</span>
                </div>
              )}

              {/* Overlay Label: Camera Name & Location */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2.5 flex items-end justify-between z-10">
                <div className="truncate max-w-[210px]">
                  <div className="text-xs font-semibold text-white tracking-wide truncate">
                    {cam.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {cam.city || 'Gujarat'} • {cam.lat.toFixed(4)}°N, {cam.lng.toFixed(4)}°E
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>30 FPS</span>
                </div>
              </div>

              {/* Scanline overlay */}
              <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-40" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DepartmentTag: React.FC<{ department: string }> = ({ department }) => {
  const norm = department.toUpperCase();
  if (norm.includes('POLICE')) {
    return (
      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-900/90 text-blue-200 border border-blue-600 shadow">
        Police
      </span>
    );
  }
  if (norm.includes('RTO')) {
    return (
      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-900/90 text-amber-200 border border-amber-600 shadow">
        RTO
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-900/90 text-emerald-200 border border-emerald-600 shadow">
      Civil Supplies
    </span>
  );
};

const CameraFeedCanvas: React.FC<{
  camera: CameraType;
  isAlerted: boolean;
  channelIndex: number;
}> = ({ camera, isAlerted, channelIndex }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let carPos = (channelIndex * 75) % 280;
    let carSpeed = 1.3 + (channelIndex % 3) * 0.4;
    let scanY = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark asphalt backdrop
      ctx.fillStyle = '#111622';
      ctx.fillRect(0, 0, width, height);

      // Perspective road lines
      ctx.strokeStyle = '#222f3e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, height);
      ctx.lineTo(width * 0.4, 40);
      ctx.moveTo(width - 30, height);
      ctx.lineTo(width * 0.6, 40);
      ctx.stroke();

      // Center dashed road markings
      ctx.strokeStyle = '#475569';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(width / 2, height);
      ctx.lineTo(width / 2, 45);
      ctx.stroke();
      ctx.setLineDash([]);

      // Moving Vehicle Simulator
      carPos += carSpeed;
      if (carPos > width + 60) {
        carPos = -60;
      }

      const carY = height * 0.52;
      const carW = 68;
      const carH = 34;

      // Vehicle Shadow & Body
      ctx.fillStyle = isAlerted ? '#3a0c0c' : '#1e293b';
      ctx.fillRect(carPos, carY, carW, carH);
      ctx.strokeStyle = isAlerted ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(carPos, carY, carW, carH);

      // Windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(carPos + 14, carY + 4, 40, 14);

      // AI Bounding Box & License Plate Detection Reticle
      ctx.strokeStyle = isAlerted ? '#ef4444' : '#10b981';
      ctx.lineWidth = 1.2;
      const boxPad = 6;
      ctx.strokeRect(carPos - boxPad, carY - boxPad, carW + boxPad * 2, carH + boxPad * 2);

      // Plate reticle
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(carPos + 18, carY + 22, 32, 8);
      ctx.fillStyle = '#000000';
      ctx.font = '6px monospace';
      ctx.fillText(isAlerted ? 'GJ01AB1234' : 'GJ01TR9876', carPos + 19, carY + 28);

      // ANPR Label Tag
      ctx.fillStyle = isAlerted ? '#ef4444' : '#10b981';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(
        isAlerted ? 'HOTLIST [MATCH]' : 'ANPR SCAN: OK',
        carPos - boxPad,
        carY - boxPad - 4
      );

      // Optical Laser Scan Line
      scanY = (scanY + 1.5) % height;
      ctx.strokeStyle = isAlerted ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.stroke();

      // Top-right optical crosshair
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width - 20, 20, 10, 0, Math.PI * 2);
      ctx.moveTo(width - 20, 5);
      ctx.lineTo(width - 20, 35);
      ctx.moveTo(width - 35, 20);
      ctx.lineTo(width - 5, 20);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [channelIndex, isAlerted]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={220}
      className="w-full h-full object-cover block"
    />
  );
};
