import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SidebarControls, { REFERENCE_OBJECTS } from './components/SidebarControls';
import InteractiveCanvas from './components/InteractiveCanvas';
import ResultsPanel from './components/ResultsPanel';
import CameraCaptureOverlay from './components/CameraCaptureOverlay';
import WardrobeEngine from './components/WardrobeEngine';
import TryOnSandbox from './components/TryOnSandbox';
import ChromeExtensionSimulator from './components/ChromeExtensionSimulator';

import { DEMO_SAMPLES } from './data/demoSamples';
import { usePoseLandmarker } from './hooks/usePoseLandmarker';
import { computeMeasurements, calculateConfidence, evaluateSizing, getDistance2D } from './utils/measurementMath';
import { Landmark, PipelinePath, BodyMeasurements, SegmentConfidence } from './types';
import { ShieldCheck, Info, Cpu, Shirt, Sparkles, Chrome, HelpCircle } from 'lucide-react';

export default function App() {
  const { landmarker, isLoading: isMediaPipeLoading, error: mediaPipeError, detectPose } = usePoseLandmarker();

  // Primary Navigation State
  const [activeModule, setActiveModule] = useState<'fit-depth' | 'wardrobe-rag' | 'tryon-harmony' | 'extension-sim'>('fit-depth');

  // Primary States (Fit Engine)
  const [path, setPath] = useState<PipelinePath>('A');
  const [userHeightCm, setUserHeightCm] = useState<number>(175);
  const [selectedRefObjId, setSelectedRefObjId] = useState<string>('a4');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const [activePresetId, setActivePresetId] = useState<string | null>('male-180');
  const [imageSrc, setImageSrc] = useState<string | null>(DEMO_SAMPLES[0].url);
  const [customLandmarks, setCustomLandmarks] = useState<Landmark[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showWebcam, setShowWebcam] = useState<boolean>(false);
  const [analysisNotice, setAnalysisNotice] = useState<{ type: 'success' | 'warn'; msg: string } | null>(null);

  // Manual Overrides State
  const [overrideMeasurements, setOverrideMeasurements] = useState<BodyMeasurements | null>(null);

  // Path B Adjustable Reference Bounding Box
  const [refBox, setRefBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 42,
    y: 40,
    width: 16,
    height: 20,
  });

  const activePreset = DEMO_SAMPLES.find((s) => s.id === activePresetId) || null;
  const activeLandmarks = activePresetId ? activePreset?.landmarks || null : customLandmarks;

  // Run MediaPipe Pose detector on uploaded image or webcam snapshot
  useEffect(() => {
    if (!imageSrc) return;
    if (activePresetId !== null) {
      setOverrideMeasurements(null);
      setAnalysisNotice(null);
      return;
    }

    let isSubscribed = true;
    setIsAnalyzing(true);
    setAnalysisNotice(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = async () => {
      if (!isSubscribed) return;

      try {
        if (!landmarker) {
          setTimeout(() => {
            if (!isSubscribed) return;
            const genericPreset = DEMO_SAMPLES[gender === 'male' ? 0 : 1].landmarks;
            setCustomLandmarks(genericPreset);
            setAnalysisNotice({
              type: 'warn',
              msg: 'MediaPipe loading is pending. Displaying high-precision scalable structural mock coordinates.',
            });
            setIsAnalyzing(false);
          }, 1000);
          return;
        }

        const result = await detectPose(img);

        if (!isSubscribed) return;

        if (result && result.landmarks && result.landmarks[0]) {
          const poses: Landmark[] = result.landmarks[0].map((lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z || 0,
            visibility: lm.visibility || 0.9,
          }));

          setCustomLandmarks(poses);
          setOverrideMeasurements(null);
          setAnalysisNotice({
            type: 'success',
            msg: 'Pose analysis completed! MediaPipe located 33 distinct landmark nodes.',
          });
        } else {
          const genericPreset = DEMO_SAMPLES[gender === 'male' ? 0 : 1].landmarks;
          setCustomLandmarks(genericPreset);
          setAnalysisNotice({
            type: 'warn',
            msg: "No clear posture boundary detected. Loading adjustable skeletal framework fallback.",
          });
        }
      } catch (err: any) {
        console.error('Pose processing failed:', err);
        const genericPreset = DEMO_SAMPLES[gender === 'male' ? 0 : 1].landmarks;
        setCustomLandmarks(genericPreset);
        setAnalysisNotice({
          type: 'warn',
          msg: `Processor error: ${err.message || err}. Loaded scalable framework overlay.`,
        });
      } finally {
        if (isSubscribed) {
          setIsAnalyzing(false);
        }
      }
    };

    return () => {
      isSubscribed = false;
    };
  }, [imageSrc, activePresetId, landmarker]);

  // CALIBRATE SCALE FACTOR (pixels-per-cm) in 1000x1000 virtual space
  const getScaleFactor = (): number => {
    if (!activeLandmarks || activeLandmarks.length < 29) return 1.0;

    if (path === 'A') {
      const nose = activeLandmarks[0];
      const ankleL = activeLandmarks[27];
      const ankleR = activeLandmarks[28];
      const ankleMid = {
        x: (ankleL.x + ankleR.x) / 2,
        y: (ankleL.y + ankleR.y) / 2,
      };
      const verticalPx = getDistance2D(nose, ankleMid, 1000, 1000);
      const denominator = Math.max(10, userHeightCm - 11.5);
      return verticalPx / denominator;
    }

    if (path === 'B') {
      const refObj = REFERENCE_OBJECTS.find((o) => o.id === selectedRefObjId) || REFERENCE_OBJECTS[0];
      const boxW = (refBox.width / 100) * 1000;
      const boxH = (refBox.height / 100) * 1000;
      const longestPx = Math.max(boxW, boxH);
      return longestPx / refObj.realSizeCm;
    }

    if (path === 'C') {
      const virtualDoorPx = 1000 * 0.84;
      return virtualDoorPx / 200.0;
    }

    return 4.5;
  };

  const pxPerCm = getScaleFactor();

  // COMPUTE MEASUREMENTS
  const computedMeasurements = activePresetId && activePreset
    ? activePreset.presetMeasurements
    : computeMeasurements(activeLandmarks || [], 1000, 1000, pxPerCm);

  useEffect(() => {
    if (activePreset) {
      setGender(activePreset.gender);
    }
  }, [activePresetId]);

  const measurements = overrideMeasurements || computedMeasurements;

  // SYSTEM STORAGE AND WINDOW SYNCHRONIZATION (Integration flow)
  useEffect(() => {
    if (measurements) {
      // Expose measurements JSON globally on the window
      (window as any).AURA_BODY_MEASUREMENTS = measurements;
      // Expose measurements persistently in localStorage for extension scraping
      localStorage.setItem('aura_body_measurements', JSON.stringify(measurements));
    }
  }, [measurements]);

  // COMPUTE CONFIDENCE
  const confidence = activePresetId && activePreset
    ? {
        height: 98,
        shoulderWidth: 97,
        armLength: 95,
        torsoLength: 96,
        inseam: 94,
        hipWidth: 96,
        chestEstimate: 95,
        overall: 96,
      }
    : calculateConfidence(activeLandmarks || []);

  const sizingRecommendation = evaluateSizing(measurements, gender);
  const selectedRefObjectName = REFERENCE_OBJECTS.find((o) => o.id === selectedRefObjId)?.name || 'Reference Object';

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans select-none antialiased">
      <Header isMediaPipeLoading={isMediaPipeLoading} />

      {/* Modern Horizontal Navigation Bar */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveModule('fit-depth')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                activeModule === 'fit-depth'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu size={14} /> FIT DEPTH ENGINE
            </button>
            <button
              onClick={() => setActiveModule('wardrobe-rag')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                activeModule === 'wardrobe-rag'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shirt size={14} /> WARDROBE AI (RAG)
            </button>
            <button
              onClick={() => setActiveModule('tryon-harmony')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                activeModule === 'tryon-harmony'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={14} /> TRY-ON & HARMONY
            </button>
            <button
              onClick={() => setActiveModule('extension-sim')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                activeModule === 'extension-sim'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Chrome size={14} /> EXTENSION SANDBOX
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>Active Server: http://localhost:3000</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Module Content Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col justify-center">
        {activeModule === 'fit-depth' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
            {/* LEFT COLUMN: Controls Panel */}
            <div className="lg:col-span-4 flex flex-col">
              <SidebarControls
                path={path}
                onPathChange={setPath}
                userHeightCm={userHeightCm}
                onUserHeightCmChange={setUserHeightCm}
                selectedRefObjId={selectedRefObjId}
                onSelectRefObjId={setSelectedRefObjId}
                gender={gender}
                onGenderChange={setGender}
                activePresetId={activePresetId}
                onSelectPreset={setActivePresetId}
                onImageUploaded={(src) => {
                  setImageSrc(src);
                  setActivePresetId(null);
                }}
                isMediaPipeLoading={isMediaPipeLoading}
                onLaunchWebcam={() => setShowWebcam(true)}
              />
            </div>

            {/* CENTER COLUMN: Live Interactive Screen */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {analysisNotice && (
                <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs transition-all duration-300 ${
                  analysisNotice.type === 'success'
                    ? 'bg-[#022c22]/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#451a03]/30 border-amber-500/30 text-amber-300'
                }`}>
                  <Info size={15} className="mt-0.5 shrink-0 text-cyan-400" />
                  <div>
                    <span className="font-bold block uppercase tracking-widest text-[9px] font-mono mb-1 text-slate-400">
                      Telemetry Status log
                    </span>
                    <span className="font-light">{analysisNotice.msg}</span>
                  </div>
                </div>
              )}

              <div className="flex-1">
                <InteractiveCanvas
                  imageSrc={imageSrc}
                  landmarks={activeLandmarks}
                  path={path}
                  refBox={refBox}
                  onRefBoxChange={setRefBox}
                  selectedRefObjectName={selectedRefObjectName}
                  selectedMetric={selectedMetric}
                  onSelectMetric={setSelectedMetric}
                  pxPerCm={pxPerCm}
                  isAnalyzing={isAnalyzing}
                />
              </div>

              {/* Secure Private Client Warning */}
              <div className="p-4 bg-black/40 border border-white/10 rounded-xl flex items-center gap-3 text-xs text-slate-400">
                <ShieldCheck className="text-cyan-400 shrink-0" size={16} />
                <span className="font-light leading-snug">
                  <strong className="text-white">Offline Privacy Guarantee:</strong> Coordinates and frames are processed exclusively raw in-browser via WASM. Stored in local JSON properties on the client window.
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Output & JSON Telemetry Block */}
            <div className="lg:col-span-4 flex flex-col">
              <ResultsPanel
                measurements={measurements}
                confidence={confidence}
                recommendation={sizingRecommendation}
                selectedMetric={selectedMetric}
                onSelectMetric={setSelectedMetric}
                onModifyMeasurements={setOverrideMeasurements}
              />
            </div>
          </div>
        )}

        {activeModule === 'wardrobe-rag' && (
          <WardrobeEngine bodyMeasurements={measurements} />
        )}

        {activeModule === 'tryon-harmony' && (
          <TryOnSandbox />
        )}

        {activeModule === 'extension-sim' && (
          <ChromeExtensionSimulator
            syncedMeasurements={measurements}
            onSetMeasurements={(m) => setOverrideMeasurements(m)}
            onNavigateToTab={(t) => {
              if (t === 'fit-depth') setActiveModule('fit-depth');
            }}
          />
        )}
      </main>

      {/* Webcam Snapshot Overlay Portal */}
      {showWebcam && (
        <CameraCaptureOverlay
          onClose={() => setShowWebcam(false)}
          onCapture={(captureSrc) => {
            setImageSrc(captureSrc);
            setActivePresetId(null);
          }}
        />
      )}
    </div>
  );
}
