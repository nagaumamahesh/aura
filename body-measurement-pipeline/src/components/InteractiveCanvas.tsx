import React, { useState } from 'react';
import { Landmark, PipelinePath } from '../types';
import { getDistance2D } from '../utils/measurementMath';
import { HelpCircle, Crosshair } from 'lucide-react';

interface InteractiveCanvasProps {
  imageSrc: string | null;
  landmarks: Landmark[] | null;
  path: PipelinePath;
  refBox: { x: number; y: number; width: number; height: number };
  onRefBoxChange: (box: { x: number; y: number; width: number; height: number }) => void;
  selectedMetric: string | null;
  onSelectMetric: (metric: string | null) => void;
  pxPerCm: number;
  isAnalyzing: boolean;
  selectedRefObjectName: string;
}

export default function InteractiveCanvas({
  imageSrc,
  landmarks,
  path,
  refBox,
  onRefBoxChange,
  selectedMetric,
  onSelectMetric,
  pxPerCm,
  isAnalyzing,
  selectedRefObjectName,
}: InteractiveCanvasProps) {
  const [hoveredSegment, setHoveredSegment] = useState<{ name: string; val: string } | null>(null);

  // Connection list mapping:
  const connections = [
    { id: 'shoulderWidth', name: 'Shoulder Width', p1: 11, p2: 12, stroke: '#3b82f6' }, // Blue
    { id: 'leftArm', name: 'Left Upper Arm', p1: 11, p2: 13, stroke: '#ec4899' }, // Pink
    { id: 'leftArmDetail', name: 'Left Lower Arm', p1: 13, p2: 15, stroke: '#f43f5e' }, // Ruby
    { id: 'rightArm', name: 'Right Upper Arm', p1: 12, p2: 14, stroke: '#22c55e' }, // Green
    { id: 'rightArmDetail', name: 'Right Lower Arm', p1: 14, p2: 16, stroke: '#10b981' }, // Jade
    { id: 'torsoLeft', name: 'Left Trunk', p1: 11, p2: 23, stroke: '#eab308' }, // Amber
    { id: 'torsoRight', name: 'Right Trunk', p1: 12, p2: 24, stroke: '#f59e0b' }, // Gold
    { id: 'hipWidth', name: 'Hip Width', p1: 23, p2: 24, stroke: '#a855f7' }, // Purple
    { id: 'leftThigh', name: 'Left Thigh', p1: 23, p2: 25, stroke: '#ec4899' },
    { id: 'leftCalf', name: 'Left Calf / Inseam leg', p1: 25, p2: 27, stroke: '#f43f5e' },
    { id: 'rightThigh', name: 'Right Thigh', p1: 24, p2: 26, stroke: '#22c55e' },
    { id: 'rightCalf', name: 'Right Calf / Inseam leg', p1: 26, p2: 28, stroke: '#10b981' },
  ];

  const calculateSegmentLength = (p1Idx: number, p2Idx: number): string => {
    if (!landmarks || landmarks[p1Idx] === undefined || landmarks[p2Idx] === undefined) return '';
    const dPx = getDistance2D(landmarks[p1Idx], landmarks[p2Idx], 1000, 1000); // normalized coordinates scale uniformly
    const lenCm = dPx / pxPerCm;
    return `${Math.round(lenCm * 10) / 10} cm`;
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Subtle Dot Grid Backdrop */}
      <div 
        className="absolute inset-x-0 top-14 bottom-0 opacity-[0.06] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1.5px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Bar Indicators */}
      <div className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/10 z-10">
        <div className="flex items-center gap-2">
          <Crosshair size={15} className="text-cyan-400 animate-spin-slow" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">02. Skeletal Viewport</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
          {hoveredSegment && (
            <div className="px-2 py-0.5 bg-cyan-950/30 text-cyan-400 rounded border border-cyan-800/20 max-w-xs truncate animate-pulse font-bold">
              {hoveredSegment.name}: {hoveredSegment.val}
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 bg-[#050505] min-h-[460px] max-h-[640px] flex items-center justify-center overflow-hidden p-6 group">
        {!imageSrc ? (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm z-10">
            <div className="p-4 bg-white/5 rounded-full text-slate-500 mb-4 border border-white/10">
              <Crosshair size={32} className="text-cyan-400 animate-pulse" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">No posturing frames</h3>
            <p className="text-[11px] text-slate-400 font-light">
              Load a preset model below or upload a custom posturing frame to calibrate WASM depth nodes.
            </p>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center z-10">
            {/* The Backing Image */}
            <img
              src={imageSrc}
              alt="Subject frame"
              className="max-w-full max-h-full object-contain rounded border border-white/10 transition-all duration-300 group-hover:brightness-90 select-none"
              id="measurement-target-image"
              referrerPolicy="no-referrer"
            />

            {/* SVG HUD Overlay */}
            {landmarks && landmarks.length > 0 && (
              <svg
                viewBox="0 0 1 1"
                className="absolute inset-0 w-full h-full object-contain pointer-events-auto"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* SVG definitions for medical-grade scanline glowing filter effects */}
                <defs>
                  <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="0.008" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glowing-node" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="0.005" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Draw Skeleton Connections */}
                {connections.map((conn) => {
                  const p1 = landmarks[conn.p1];
                  const p2 = landmarks[conn.p2];
                  if (!p1 || !p2) return null;

                  const lenStr = calculateSegmentLength(conn.p1, conn.p2);
                  const isHighlighted = selectedMetric === conn.id;

                  return (
                    <line
                      key={conn.id}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={isHighlighted ? '#22d3ee' : '#00e5ff'}
                      strokeWidth={isHighlighted ? '0.010' : '0.0035'}
                      strokeOpacity={isHighlighted ? '0.95' : '0.45'}
                      strokeLinecap="round"
                      className="cursor-pointer transition-all duration-200 hover:stroke-cyan-300 hover:stroke-8"
                      style={{
                        transformOrigin: 'center',
                        filter: isHighlighted ? 'url(#neon-glow)' : undefined,
                      }}
                      onMouseEnter={() => setHoveredSegment({ name: conn.name, val: lenStr })}
                      onMouseLeave={() => setHoveredSegment(null)}
                      onClick={() => onSelectMetric(isHighlighted ? null : conn.id)}
                    />
                  );
                })}

                {/* Draw Landmark Nodes */}
                {landmarks.slice(0, 32).map((pt, idx) => {
                  if (idx > 0 && idx < 11 && idx !== 7 && idx !== 8) return null; // keep visual overlay clean
                  const isHeadNode = idx === 0;

                  return (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r={isHeadNode ? '0.006' : '0.0045'}
                      fill="#ffffff"
                      stroke="#06b6d4"
                      strokeWidth="0.0015"
                      style={{ filter: 'url(#glowing-node)' }}
                      className="transition-all hover:scale-150 cursor-pointer"
                    />
                  );
                })}
              </svg>
            )}

            {/* Path B: Manual Drag-Adjustment Bounding Box Visualizer */}
            {path === 'B' && (
              <div
                className="absolute pointer-events-none border-2 border-dashed border-emerald-400 bg-emerald-500/5 rounded-md transition-all duration-100 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                style={{
                  left: `${refBox.x}%`,
                  top: `${refBox.y}%`,
                  width: `${refBox.width}%`,
                  height: `${refBox.height}%`,
                }}
              >
                {/* Visual Anchor corners */}
                <div className="absolute top-0 left-0 -translate-x-1 -translate-y-1 w-2 h-2 bg-emerald-400 border border-white" />
                <div className="absolute top-0 right-0 translate-x-1 -translate-y-1 w-2 h-2 bg-emerald-400 border border-white" />
                <div className="absolute bottom-0 left-0 -translate-x-1 translate-y-1 w-2 h-2 bg-emerald-400 border border-white" />
                <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 w-2 h-2 bg-emerald-400 border border-white" />

                {/* Bounding Label */}
                <span className="absolute bottom-1.5 left-1.5 bg-black/90 text-emerald-400 text-[8px] font-mono leading-none px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest font-black">
                  REF: {selectedRefObjectName}
                </span>
              </div>
            )}

            {/* HUD Overlay inside Canvas Area (bottom) */}
            {imageSrc && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-2 pointer-events-none select-none z-20">
                <div className="px-3 py-1.5 bg-black/65 backdrop-blur-md border border-white/10 rounded">
                  <div className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-black mb-0.5">Detection Status</div>
                  <div className={`text-[10px] font-mono font-bold uppercase ${landmarks ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isAnalyzing ? 'BUFFER_READING' : landmarks ? 'STABLE_LOCK [33_NODES]' : 'PENDING_NODES'}
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-black/65 backdrop-blur-md border border-white/10 rounded">
                  <div className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-black mb-0.5">Scaling Matrix</div>
                  <div className="text-[10px] text-white font-mono uppercase font-bold">
                    {pxPerCm > 0 ? `${pxPerCm.toFixed(2)} px/cm` : 'UNCalibrated'} :: MONO_GRID
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Loading overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-[#050505]/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-15">
                <div className="relative flex items-center justify-center mb-4">
                  <div className="h-10 w-10 rounded-full border border-cyan-500/30 border-t-cyan-400 animate-spin" />
                  <Crosshair className="absolute text-cyan-400 animate-pulse" size={16} />
                </div>
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-1 font-mono">Aligning Depth Grids</h4>
                <p className="text-[11px] text-slate-400 max-w-xs font-light">
                  Executing monocular neural geometry transforms in-browser web assemblies...
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Fine-Tuning Bounding Box Sliders for Path B */}
      {imageSrc && path === 'B' && (
        <div className="bg-black/40 border-t border-white/10 p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <HelpCircle size={13} className="text-emerald-400" />
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Align Scaling Reference Target
            </h5>
          </div>
          <p className="text-[11px] text-slate-400 mb-3 font-light leading-snug">
            Align the outline carefully over the {selectedRefObjectName} positioned inside your camera viewport.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="flex justify-between text-[10px] font-mono text-slate-500 uppercase mb-0.5">
                <span>Offset X</span>
                <span className="text-emerald-400 font-bold">{refBox.x}%</span>
              </label>
              <input
                type="range"
                min="0"
                max={Math.max(1, 100 - refBox.width)}
                value={refBox.x}
                onChange={(e) => onRefBoxChange({ ...refBox, x: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 bg-black h-1 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="flex justify-between text-[10px] font-mono text-slate-500 uppercase mb-0.5">
                <span>Offset Y</span>
                <span className="text-emerald-400 font-bold">{refBox.y}%</span>
              </label>
              <input
                type="range"
                min="0"
                max={Math.max(1, 100 - refBox.height)}
                value={refBox.y}
                onChange={(e) => onRefBoxChange({ ...refBox, y: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 bg-black h-1 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="flex justify-between text-[10px] font-mono text-slate-500 uppercase mb-0.5">
                <span>Width</span>
                <span className="text-emerald-400 font-bold">{refBox.width}%</span>
              </label>
              <input
                type="range"
                min="2"
                max="80"
                value={refBox.width}
                onChange={(e) => onRefBoxChange({ ...refBox, width: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 bg-black h-1 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="flex justify-between text-[10px] font-mono text-slate-500 uppercase mb-0.5">
                <span>Height</span>
                <span className="text-emerald-400 font-bold">{refBox.height}%</span>
              </label>
              <input
                type="range"
                min="2"
                max="80"
                value={refBox.height}
                onChange={(e) => onRefBoxChange({ ...refBox, height: parseInt(e.target.value) })}
                className="w-full accent-emerald-500 bg-black h-1 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
