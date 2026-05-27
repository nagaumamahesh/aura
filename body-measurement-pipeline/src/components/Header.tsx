import React from 'react';
import { Cpu, Layers, Award } from 'lucide-react';

interface HeaderProps {
  isMediaPipeLoading?: boolean;
}

export default function Header({ isMediaPipeLoading }: HeaderProps) {
  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 lg:px-8 bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center text-black font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div>
          <h1 className="text-base lg:text-lg font-black tracking-tight text-white flex items-center gap-2">
            V-FIT <span className="text-cyan-400 font-normal font-mono text-xs">DEPTH ENGINE v2.5</span>
          </h1>
          <p className="text-[10px] text-slate-500 hidden md:block font-light">
            Scale-calibrated monocular posture tracker and precision fitting advisor
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isMediaPipeLoading ? 'bg-amber-500 animate-bounce' : 'bg-emerald-500 animate-pulse'}`} />
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isMediaPipeLoading ? 'text-amber-500' : 'text-emerald-500'}`}>
            {isMediaPipeLoading ? 'MediaPipe Pending' : 'MediaPipe Active'}
          </span>
        </div>
        <div className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] uppercase font-mono tracking-wider text-slate-400">
          Lat: 12ms | WASM + GPU
        </div>
      </div>
    </header>
  );
}

