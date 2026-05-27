import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';

interface CameraCaptureOverlayProps {
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
}

export default function CameraCaptureOverlay({ onClose, onCapture }: CameraCaptureOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [flashOn, setFlashOn] = useState(false);

  // Initialize camera streams
  useEffect(() => {
    async function setupCamera() {
      try {
        const initialStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: false,
        });

        // Query available video devices
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
        setDevices(videoDevices);

        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }

        streamRef.current = initialStream;
        if (videoRef.current) {
          videoRef.current.srcObject = initialStream;
        }
        setPermissionState('granted');
      } catch (err) {
        console.error('Webcam permission error:', err);
        setPermissionState('denied');
      }
    }

    setupCamera();

    // Clean up video tracks on exit
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Hot reload device switch
  useEffect(() => {
    if (!selectedDeviceId) return;

    async function switchCamera() {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const nextStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } },
          audio: false,
        });

        streamRef.current = nextStream;
        if (videoRef.current) {
          videoRef.current.srcObject = nextStream;
        }
      } catch (err) {
        console.error('Failed to switch video devices:', err);
      }
    }

    switchCamera();
  }, [selectedDeviceId]);

  const triggerCapture = () => {
    if (!videoRef.current) return;

    // Trigger visual shutter flash
    setFlashOn(true);
    setTimeout(() => setFlashOn(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw frame to canvas mirroring if user camera
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Extract image payload
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onCapture(dataUrl);
      onClose(); // Cleanly exit camera interface
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/90 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Shutter flash screen overlay */}
        {flashOn && (
          <div className="absolute inset-0 bg-white z-40 animate-fade-out" />
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-gray-900/60">
          <div className="flex items-center gap-2">
            <Camera className="text-emerald-400" size={18} />
            <span className="text-sm font-semibold text-white font-sans">
              Monocular Alignment Portal
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-400 hover:text-white transition-all select-none cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Camera Stage */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[380px]">
          {permissionState === 'pending' && (
            <div className="flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <RefreshCw className="animate-spin text-emerald-400 mb-3" size={24} />
              <p className="text-xs font-mono">Initializing device lenses...</p>
            </div>
          )}

          {permissionState === 'denied' && (
            <div className="flex flex-col items-center justify-center text-center p-8 max-w-md text-gray-400">
              <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-full text-red-400 mb-4">
                <X size={24} />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Webcam Access Denied</h4>
              <p className="text-xs text-gray-500 mb-4">
                We couldn&apos;t connect to your video tracks. Check browser settings to allow camera access, or
                conveniently try our loaded presets without sharing video.
              </p>
              <button
                onClick={onClose}
                className="py-1.5 px-4 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded-lg transition-all cursor-pointer"
              >
                Go back
              </button>
            </div>
          )}

          {permissionState === 'granted' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]" // mirror view
              />

              {/* Connected Silhouette overlay guideline to guarantee landmark quality */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* SVG Human Blueprint Silhouette wireframe */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-emerald-400/25 opacity-70"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Dotted scale boundaries */}
                  <ellipse cx="50" cy="20" rx="6" ry="7" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 1" />
                  <line x1="50" y1="27" x2="50" y2="55" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 1" />
                  {/* Shoulders */}
                  <line x1="38" y1="33" x2="62" y2="33" stroke="currentColor" strokeWidth="0.6" />
                  {/* Arms */}
                  <line x1="38" y1="33" x2="34" y2="48" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 1" />
                  <line x1="34" y1="48" x2="31" y2="60" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 1" />
                  <line x1="62" y1="33" x2="66" y2="48" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 1" />
                  <line x1="66" y1="48" x2="69" y2="60" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 1" />
                  {/* Torso */}
                  <line x1="41" y1="55" x2="59" y2="55" stroke="currentColor" strokeWidth="0.6" />
                  <line x1="38" y1="33" x2="41" y2="55" stroke="currentColor" strokeWidth="0.4" />
                  <line x1="62" y1="33" x2="59" y2="55" stroke="currentColor" strokeWidth="0.4" />
                  {/* Legs */}
                  <line x1="41" y1="55" x2="41" y2="73" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 1" />
                  <line x1="41" y1="73" x2="42" y2="92" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 1" />
                  <line x1="59" y1="55" x2="59" y2="73" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 1" />
                  <line x1="59" y1="73" x2="58" y2="92" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 1" />

                  {/* Positioning Text indicators */}
                  <text x="50" y="8" textAnchor="middle" fill="currentColor" fontSize="2.5" fontFamily="monospace" letterSpacing="0.2">
                    ALIGN HEAD WITH TARGET EARS
                  </text>
                  <text x="50" y="96" textAnchor="middle" fill="currentColor" fontSize="2.5" fontFamily="monospace" letterSpacing="0.2">
                    STAND FULLY IN FRAME (FEET AT BOTTOM)
                  </text>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Modal Controls footer */}
        {permissionState === 'granted' && (
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-6 py-5 border-t border-gray-800/80 bg-gray-900/60">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <Sparkles size={14} className="text-emerald-400" />
              <span>Step back 2-3 meters and keep shoulders flat.</span>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Camera Switch dropdown */}
              {devices.length > 1 && (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="bg-gray-950 border border-gray-800 text-xs text-gray-300 p-2 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.slice(0, 4)}`}
                    </option>
                  ))}
                </select>
              )}

              {/* Shutter Button */}
              <button
                onClick={triggerCapture}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                <Camera size={15} />
                Capture Snapshot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
