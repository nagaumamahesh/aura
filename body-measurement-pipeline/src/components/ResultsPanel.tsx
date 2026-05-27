import React, { useState } from 'react';
import { BodyMeasurements, SegmentConfidence, SizingRecommendation } from '../types';
import {
  Ruler,
  CheckCircle2,
  AlertTriangle,
  FolderLock,
  Copy,
  Download,
  Flame,
  User,
  ExternalLink,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface ResultsPanelProps {
  measurements: BodyMeasurements;
  confidence: SegmentConfidence;
  recommendation: SizingRecommendation;
  selectedMetric: string | null;
  onSelectMetric: (metric: string | null) => void;
  onModifyMeasurements: (newMeasurements: BodyMeasurements) => void;
}

export default function ResultsPanel({
  measurements,
  confidence,
  recommendation,
  selectedMetric,
  onSelectMetric,
  onModifyMeasurements,
}: ResultsPanelProps) {
  const [copied, setCopied] = useState(false);
  const [showOverridePanel, setShowOverridePanel] = useState(false);

  const entries = [
    { id: 'height', label: 'Overall Height', value: measurements.height, conf: confidence.height, detail: 'Floor to top crown estimate', ref: '0' },
    { id: 'shoulderWidth', label: 'Shoulder Width', value: measurements.shoulderWidth, conf: confidence.shoulderWidth, detail: 'Bone-to-bone shoulder span', ref: '11 ↔ 12' },
    { id: 'chestEstimate', label: 'Chest Circumference', value: measurements.chestEstimate, conf: confidence.chestEstimate, detail: 'Calculated 3D garment wrap envelope', ref: 'Derived' },
    { id: 'armLength', label: 'Arm Length', value: measurements.armLength, conf: confidence.armLength, detail: 'Shoulder corner to wrist line total', ref: '11 → 13 → 15' },
    { id: 'torsoLength', label: 'Torso Length', value: measurements.torsoLength, conf: confidence.torsoLength, detail: 'Shoulder mid-point down to pelvic center', ref: 'Mid 11/12 → Mid 23/24' },
    { id: 'inseam', label: 'Inseam leg', value: measurements.inseam, conf: confidence.inseam, detail: 'Crotch fork to heel minus shoe estimate', ref: '23 → 25 → 27' },
    { id: 'hipWidth', label: 'Hip Width', value: measurements.hipWidth, conf: confidence.hipWidth, detail: 'Horizontal bone-to-bone pelvis', ref: '23 ↔ 24' },
  ];

  const jsonOutput = JSON.stringify(
    {
      source: 'Monocular Depth + Pose Estimator API',
      timestamp: new Date().toISOString(),
      status: 'CALIBRATED',
      calibration_path: 'Path A/B MultiScale',
      confidence_overall: `${confidence.overall}%`,
      dimensions_cm: {
        height_cm: measurements.height,
        shoulder_width_cm: measurements.shoulderWidth,
        chest_envelope_cm: measurements.chestEstimate,
        arm_span_cm: measurements.armLength,
        torso_spine_cm: measurements.torsoLength,
        inseam_cm: measurements.inseam,
        hip_caps_cm: measurements.hipWidth,
      },
      sizing_engine: {
        envelope: recommendation.size,
        fit_confidence: `${recommendation.matchPercent}%`,
        proportions: recommendation.details,
      },
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'body-measurements-pipeline.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOverride = (key: keyof BodyMeasurements, val: number) => {
    onModifyMeasurements({
      ...measurements,
      [key]: val,
    });
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* CARD 1: Sizing Engine recommendations */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        {/* Decorative corner ring */}
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-20 h-20 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-cyan-400 animate-pulse" size={15} />
          <h3 className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">03. Calibration Profile Recommendations</h3>
        </div>

        {measurements.height === 0 ? (
          <div className="text-xs text-slate-500 py-3 font-light leading-relaxed">
            No live telemetry detected. Select calibration samples or snap photo to test dynamic profile matches.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* LARGE SIZE DISPLAY TACTICAL BADGE */}
            <div className="flex flex-col items-center justify-center h-20 w-20 bg-cyan-950/25 border border-cyan-500/40 rounded shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <span className="text-2xl font-black text-cyan-400 font-sans tracking-tight">
                {recommendation.size}
              </span>
              <span className="text-[9px] font-mono font-black tracking-widest text-white uppercase mt-1 leading-none">
                Optimal
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  FIT RATING: {recommendation.matchPercent}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-light leading-snug mb-3">
                Calculated optimal garment cuts from posture envelope parameters.
              </p>

              {/* Segmented breakdown bubbles */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] font-mono uppercase font-bold">
                <div className="bg-white/5 border border-white/10 rounded py-1">
                  <span className="text-slate-500 block text-[7px] mb-0.5 font-bold">Chest Wrap</span>
                  <span className="text-white font-bold text-[10px]">{recommendation.details.chest}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded py-1">
                  <span className="text-slate-500 block text-[7px] mb-0.5 font-bold">Shoulders</span>
                  <span className="text-white font-bold text-[10px]">{recommendation.details.shoulders}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded py-1">
                  <span className="text-slate-500 block text-[7px] mb-0.5 font-bold">Sleeve Fit</span>
                  <span className="text-white font-bold text-[10px]">{recommendation.details.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CARD 2: Anthropometric Table */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Ruler className="text-cyan-400" size={15} />
            <h3 className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">04. Anthropometric Metrics</h3>
          </div>

          {/* Quick Override Toggle Link */}
          {measurements.height > 0 && (
            <button
              onClick={() => setShowOverridePanel(!showOverridePanel)}
              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-all text-left uppercase font-bold cursor-pointer"
            >
              <Sliders size={12} className="stroke-[2.5]" />
              {showOverridePanel ? 'Lock Output' : 'Fine Tune'}
            </button>
          )}
        </div>

        {measurements.height === 0 ? (
          <div className="text-[10px] text-slate-500 text-center py-8 font-mono border border-dashed border-white/10 rounded-lg uppercase tracking-wider">
            Waiting for posture landmarks...
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Visual table list */}
            <div className="flex flex-col gap-1.5">
              {entries.map((entry) => {
                const isSelected = selectedMetric === entry.id;
                // Determine confidence color text
                const confColor =
                  entry.conf > 85 ? 'text-emerald-400 bg-emerald-950/25 border-emerald-900/30' :
                  entry.conf > 60 ? 'text-amber-400 bg-amber-950/25 border-amber-900/30' :
                  'text-red-400 bg-red-950/25 border-red-900/30';

                return (
                  <div key={entry.id} className="flex flex-col">
                    <div
                      onClick={() => onSelectMetric(isSelected ? null : entry.id)}
                      className={`flex items-center justify-between p-2.5 rounded border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/20 border-cyan-500 text-white'
                          : 'bg-white/5 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-transparent'}`} />
                          <span className="text-xs font-bold text-slate-300 font-sans">{entry.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-light block leading-none mt-1">
                          {entry.detail}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* Real-time value display */}
                        <span className="text-[14px] font-mono font-bold text-white text-right">
                          {entry.value.toFixed(1)}<span className="text-[10px] font-normal text-slate-400 ml-0.5">cm</span>
                        </span>

                        {/* Individual element accuracy */}
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-widest ${confColor}`}>
                          {entry.conf}%
                        </span>
                      </div>
                    </div>

                    {/* Collapsible Manual Correction Override Sliders */}
                    {showOverridePanel && (
                      <div className="bg-black/40 p-3 rounded-b border-x border-b border-white/10 flex flex-col gap-1.5 mb-1">
                        <div className="flex justify-between text-[9px] font-mono uppercase text-slate-400">
                          <span>Manual Calibration Override</span>
                          <span className="text-cyan-400 font-mono font-bold">{entry.value.toFixed(1)} cm</span>
                        </div>
                        <input
                          type="range"
                          min={Math.max(10, Math.round(entry.value * 0.7))}
                          max={Math.round(entry.value * 1.3)}
                          step="0.1"
                          value={entry.value}
                          onChange={(e) => handleOverride(entry.id as keyof BodyMeasurements, parseFloat(e.target.value))}
                          className="w-full h-1 accent-cyan-500 bg-black rounded cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Overall Accuracy Alert Badge */}
            <div className="flex items-start gap-2 p-3 bg-white/5 border border-white/10 rounded-lg text-[11px] text-slate-400 leading-snug font-light">
              <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-200 block font-mono text-[10px] uppercase tracking-wider">Calibration Score: {confidence.overall}%</span>
                Confidence margins dynamically calculated from 33 tracking nodes. All manually adjusted offsets will persist in raw exports.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CARD 3: Professional JSON Output */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl flex-1 flex flex-col min-h-[380px]">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <FolderLock className="text-cyan-400" size={15} />
            <h3 className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">05. Calibration Logs (JSON)</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              disabled={measurements.height === 0}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 hover:border-white/20 text-[10px] font-mono text-slate-300 flex items-center gap-1 transition-all select-none cursor-pointer disabled:opacity-50"
            >
              <Copy size={11} className="text-cyan-400" />
              {copied ? 'Copied' : 'Copy'}
            </button>

            {/* Export file button */}
            <button
              onClick={handleDownload}
              disabled={measurements.height === 0}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 hover:border-white/20 text-[10px] font-mono text-slate-300 flex items-center gap-1 transition-all select-none cursor-pointer disabled:opacity-50"
            >
              <Download size={11} className="text-cyan-400" />
              Export
            </button>
          </div>
        </div>

        {/* JSON Preview Box */}
        <div className="relative flex-1 bg-black border border-white/10 rounded overflow-hidden min-h-[220px]">
          <pre className="absolute inset-0 overflow-auto p-4 text-[10px] font-mono leading-relaxed text-slate-400 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <code>{measurements.height === 0 ? '// Press preset sample or capture live framework to view telemetry data...' : jsonOutput}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
