import React, { useState, useRef } from 'react';
import { PipelinePath, ReferenceObject } from '../types';
import { DEMO_SAMPLES } from '../data/demoSamples';
import {
  Sparkles,
  Upload,
  Camera,
  Layers,
  HelpCircle,
  Hash,
  Scale,
  Settings,
  Image as ImageIcon,
} from 'lucide-react';

interface SidebarControlsProps {
  path: PipelinePath;
  onPathChange: (path: PipelinePath) => void;
  userHeightCm: number;
  onUserHeightCmChange: (height: number) => void;
  selectedRefObjId: string;
  onSelectRefObjId: (id: string) => void;
  gender: 'male' | 'female';
  onGenderChange: (gender: 'male' | 'female') => void;
  activePresetId: string | null;
  onSelectPreset: (presetId: string | null) => void;
  onImageUploaded: (src: string, isPreset: boolean) => void;
  isMediaPipeLoading: boolean;
  onLaunchWebcam: () => void;
}

export const REFERENCE_OBJECTS: ReferenceObject[] = [
  { id: 'a4', name: 'A4 Sheet (Portrait)', realSizeCm: 29.7, description: 'Standard ISO document page length (29.7 cm)' },
  { id: 'credit-card', name: 'Credit Card (Horizontal)', realSizeCm: 8.56, description: 'ISO/IEC 7810 standard dimensions (8.56 cm width)' },
  { id: 'door', name: 'Door Frame Backdrop', realSizeCm: 200.0, description: 'Standard door frame height (200.0 cm)' },
  { id: 'ruler', name: 'Standard Ruler', realSizeCm: 30.0, description: 'A transparent academic ruler (30.0 cm)' },
];

export default function SidebarControls({
  path,
  onPathChange,
  userHeightCm,
  onUserHeightCmChange,
  selectedRefObjId,
  onSelectRefObjId,
  gender,
  onGenderChange,
  activePresetId,
  onSelectPreset,
  onImageUploaded,
  isMediaPipeLoading,
  onLaunchWebcam,
}: SidebarControlsProps) {
  const [ftVal, setFtVal] = useState(5);
  const [inVal, setInVal] = useState(9);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImperialChange = (feet: number, inches: number) => {
    setFtVal(feet);
    setInVal(inches);
    const cm = Math.round((feet * 30.48) + (inches * 2.54));
    onUserHeightCmChange(cm);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onImageUploaded(reader.result, false);
          onSelectPreset(null); // Clear active preset tag since it's a manual upload
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl h-full overflow-y-auto">
      {/* SECTION 1: Select Scaling Path */}
      <div>
        <h3 className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase mb-3 flex items-center gap-1.5">
          <Layers size={13} className="text-cyan-400" />
          01. Select Calibration Path
        </h3>
        <p className="text-xs text-slate-400 mb-4 font-light leading-relaxed">
          Monocular posing requires a physical anchor. Select your calibration path to calculate dynamic depths:
        </p>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Path A */}
          <button
            onClick={() => onPathChange('A')}
            className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
              path === 'A'
                ? 'bg-cyan-950/20 border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'bg-white/5 border-white/5 hover:border-white/15'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`h-1.5 w-1.5 rounded-full ${path === 'A' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs font-semibold text-white">PATH A: KNOWN USER HEIGHT</span>
            </div>
            <span className="text-[11px] text-slate-400 font-light leading-relaxed pl-3.5">
              Scale entire skeletal model using your vertical head-to-toe pixel height as calibration frame.
            </span>
          </button>

          {/* Path B */}
          <button
            onClick={() => onPathChange('B')}
            className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
              path === 'B'
                ? 'bg-emerald-950/20 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-white/5 border-white/5 hover:border-white/15'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`h-1.5 w-1.5 rounded-full ${path === 'B' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs font-semibold text-white">PATH B: PHYSICAL REFERENCE</span>
            </div>
            <span className="text-[11px] text-slate-400 font-light leading-relaxed pl-3.5">
              Align a bounding guide over standard on-body elements like A4 sheet paper, rules, or smartcards.
            </span>
          </button>

          {/* Path C */}
          <button
            onClick={() => onPathChange('C')}
            className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
              path === 'C'
                ? 'bg-amber-950/25 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-white/5 border-white/5 hover:border-white/15'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`h-1.5 w-1.5 rounded-full ${path === 'C' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs font-semibold text-white">PATH C: BACKDROP GEOMETRY</span>
            </div>
            <span className="text-[11px] text-slate-400 font-light leading-relaxed pl-3.5">
              Calibrate with structural elements by aligning perspective with standard 200cm door frame panels.
            </span>
          </button>
        </div>
      </div>

      {/* SECTION 2: Calibration Settings based on path */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
        <h4 className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase mb-3 flex items-center gap-1.5">
          <Settings size={13} className="text-cyan-400" />
          Calibration Settings
        </h4>

        {path === 'A' && (
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span>Metric Height</span>
                <span className="text-cyan-400 font-bold">{userHeightCm} cm</span>
              </div>
              <input
                type="range"
                min="130"
                max="220"
                value={userHeightCm}
                onChange={(e) => onUserHeightCmChange(parseInt(e.target.value))}
                className="w-full h-1 accent-cyan-500 bg-black rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1 border-t border-white/10 pt-2">
              <div>
                <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Feet</label>
                <select
                  value={ftVal}
                  onChange={(e) => handleImperialChange(parseInt(e.target.value), inVal)}
                  className="w-full bg-black/80 border border-white/10 text-xs text-white p-1.5 rounded focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                >
                  {[4, 5, 6, 7].map((f) => (
                    <option key={f} value={f}>
                      {f} ft
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Inches</label>
                <select
                  value={inVal}
                  onChange={(e) => handleImperialChange(ftVal, parseInt(e.target.value))}
                  className="w-full bg-black/80 border border-white/10 text-xs text-white p-1.5 rounded focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => i).map((i) => (
                    <option key={i} value={i}>
                      {i} in
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {path === 'B' && (
          <div className="flex flex-col gap-2">
            <label className="text-[9px] text-slate-500 font-mono uppercase block mb-1">Reference Guide Specifications</label>
            <div className="flex flex-col gap-1.5">
              {REFERENCE_OBJECTS.slice(0, 2).concat(REFERENCE_OBJECTS.slice(3)).map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => onSelectRefObjId(obj.id)}
                  className={`w-full flex justify-between items-center text-left p-2 rounded border text-xs cursor-pointer transition-colors ${
                    selectedRefObjId === obj.id
                      ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-black/60 border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <span>{obj.name}</span>
                  <span className="text-[10px] font-mono opacity-80">{obj.realSizeCm} cm</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 font-light mt-1 pl-1 leading-relaxed">
              * Align the canvas overlay target over selected reference anchor carefully to set the monocular depth baseline.
            </p>
          </div>
        )}

        {path === 'C' && (
          <div>
            <div className="bg-black/80 border border-white/10 p-2.5 rounded flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono uppercase">Standard Frame Standard</span>
              <span className="text-amber-400 font-bold font-mono">200.0 cm</span>
            </div>
            <p className="text-[10px] text-slate-500 font-light mt-2 pl-1 leading-relaxed">
              Matches standard modern interior building clearance vectors. Position subject in-plane with the door borders.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 3: Fitting Profile Gender */}
      <div>
        <h3 className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase mb-3 flex items-center gap-1.5">
          <Scale size={13} className="text-cyan-400" />
          02. Select Fitting Profile
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onGenderChange('male')}
            className={`py-2 rounded border text-xs tracking-wider uppercase font-bold cursor-pointer transition-all ${
              gender === 'male'
                ? 'bg-cyan-950/30 border-cyan-500 text-cyan-400 scale-[0.98]'
                : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-400'
            }`}
          >
            MALE CUTS
          </button>
          <button
            onClick={() => onGenderChange('female')}
            className={`py-2 rounded border text-xs tracking-wider uppercase font-bold cursor-pointer transition-all ${
              gender === 'female'
                ? 'bg-cyan-950/30 border-cyan-500 text-cyan-400 scale-[0.98]'
                : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-400'
            }`}
          >
            FEMALE CUTS
          </button>
        </div>
      </div>

      {/* SECTION 4: Try Preset Demos */}
      <div>
        <h3 className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase mb-3 flex items-center gap-1.5">
          <Sparkles size={13} className="text-cyan-400 animate-pulse" />
          03. Load Blueprint Presets
        </h3>
        <p className="text-[11px] text-slate-500 mb-2.5 font-light">
          Trigger pre-compiled computer posture landmarks immediately to verify the sizing equations:
        </p>

        <div className="flex flex-col gap-2">
          {DEMO_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                onSelectPreset(sample.id);
                onImageUploaded(sample.url, true);
              }}
              className={`flex items-center gap-3 w-full p-2.5 rounded border text-left cursor-pointer transition-all ${
                activePresetId === sample.id
                  ? 'bg-cyan-950/25 border-cyan-500/50 shadow-md text-white'
                  : 'bg-white/5 border-white/5 hover:border-white/15 text-slate-300'
              }`}
            >
              <div className="h-9 w-9 rounded overflow-hidden border border-white/10 shrink-0">
                <img src={sample.url} alt={sample.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate leading-none mb-1 text-white">{sample.name}</p>
                <p className="text-[10px] text-slate-400 truncate font-light">{sample.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 5: Input Trigger controls */}
      <div className="pt-4 border-t border-white/10 mt-auto flex flex-col gap-2.5">
        <div className="flex gap-2">
          {/* File Upload Trigger */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isMediaPipeLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 text-xs font-black uppercase tracking-wider rounded transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload size={14} className="text-cyan-400" />
            Upload File
          </button>

          {/* Device Camera Launch Trigger */}
          <button
            onClick={onLaunchWebcam}
            disabled={isMediaPipeLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-black uppercase tracking-wider rounded shadow-lg transition-all cursor-pointer disabled:opacity-50 shadow-cyan-500/10"
          >
            <Camera size={14} />
            Live Video
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        {isMediaPipeLoading && (
          <div className="flex items-center gap-2 justify-center py-2.5 bg-cyan-950/20 border border-cyan-500/25 rounded text-[9px] font-mono text-cyan-400 uppercase tracking-widest animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            Initializing Neural Network WASM...
          </div>
        )}
      </div>
    </div>
  );
}
