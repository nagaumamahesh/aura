import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SidebarControls, { REFERENCE_OBJECTS } from './components/SidebarControls';
import InteractiveCanvas from './components/InteractiveCanvas';
import ResultsPanel from './components/ResultsPanel';
import CameraCaptureOverlay from './components/CameraCaptureOverlay';
import { DEMO_SAMPLES } from './data/demoSamples';
import { usePoseLandmarker } from './hooks/usePoseLandmarker';
import { computeMeasurements, calculateConfidence, evaluateSizing, getDistance2D } from './utils/measurementMath';
import { Landmark, PipelinePath, BodyMeasurements, SegmentConfidence } from './types';
import { ShieldCheck, Info, Camera, RefreshCw } from 'lucide-react';

export default function App() {
  const { landmarker, isLoading: isMediaPipeLoading, error: mediaPipeError, detectPose } = usePoseLandmarker();

  // Primary States
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

  // Manual Overrides State (resets whenever a new preset or image is parsed)
  const [overrideMeasurements, setOverrideMeasurements] = useState<BodyMeasurements | null>(null);

  // Path B Adjustable Reference Bounding Box (represented in percentage 0 - 100 of container)
  const [refBox, setRefBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 42,
    y: 40,
    width: 16,
    height: 20,
  });

  // Load preset sample automatically on startup
  const activePreset = DEMO_SAMPLES.find((s) => s.id === activePresetId) || null;

  // Track active landmarks feed (presets vs custom uploads)
  const activeLandmarks = activePresetId ? activePreset?.landmarks || null : customLandmarks;

  // Run MediaPipe Pose detector on uploaded image or webcam snapshot
  useEffect(() => {
    if (!imageSrc) return;
    if (activePresetId !== null) {
      // Clear overrides & any notices when switching preset examples
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
          // If MediaPipe is still loading or failed, fallback to smart humanoid coordinates fitting their current path
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
          setOverrideMeasurements(null); // Fresh tracking
          setAnalysisNotice({
            type: 'success',
            msg: 'Pose analysis completed! MediaPipe located 33 distinct landmark nodes.',
          });
        } else {
          // Fallback if no person detected in photo
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
      // Distance nose 0 to ankles 27,28. Represents user height minus standard 11.5cm crown to nose proportion.
      const verticalPx = getDistance2D(nose, ankleMid, 1000, 1000);
      const denominator = Math.max(10, userHeightCm - 11.5);
      return verticalPx / denominator;
    }

    if (path === 'B') {
      const refObj = REFERENCE_OBJECTS.find((o) => o.id === selectedRefObjId) || REFERENCE_OBJECTS[0];
      // Map longest percentage dimension to virtual coordinates
      const boxW = (refBox.width / 100) * 1000;
      const boxH = (refBox.height / 100) * 1000;
      const longestPx = Math.max(boxW, boxH);
      return longestPx / refObj.realSizeCm;
    }

    if (path === 'C') {
      // Path C Backdrop door standards (200.0cm frame taking 84% vertical resolution)
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

  // Sync gender profile selection on presets switch
  useEffect(() => {
    if (activePreset) {
      setGender(activePreset.gender);
    }
  }, [activePresetId]);

  // Handle active measurements (allow overriting manually)
  const measurements = overrideMeasurements || computedMeasurements;

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

  // COMPUTE CLOTHING RECS
  const sizingRecommendation = evaluateSizing(measurements, gender);

  const selectedRefObjectName = REFERENCE_OBJECTS.find((o) => o.id === selectedRefObjId)?.name || 'Reference Object';

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans select-none antialiased">
      <Header />

      {/* Main Sandbox Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
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
          
          {/* Real-time ML Pipeline Notice / Banner */}
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
              <strong className="text-white">Offline Privacy Guarantee:</strong> Coordinates and frames are processed exclusively raw in-browser via WASM. No video feeds or images are uploaded to any analytics servers.
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
      </main>

      {/* Webcam Snapshot Overlay Portal */}
      {showWebcam && (
        <CameraCaptureOverlay
          onClose={() => setShowWebcam(false)}
          onCapture={(captureSrc) => {
            setImageSrc(captureSrc);
            setActivePresetId(null); // Switch to custom upload stream
          }}
        />
      )}
    </div>
  );
}
