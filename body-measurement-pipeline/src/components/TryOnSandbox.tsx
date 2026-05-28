import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Sliders, Palette, Download, Heart, Flame, Wind, Sunrise, HelpCircle } from 'lucide-react';

type SeasonAura = "winter" | "autumn" | "spring" | "summer";

interface TryOnGarment {
  id: string;
  name: string;
  url: string;
  colorHex: string;
  colorHsl: { h: number; s: number; l: number };
  colorName: string;
  category: string;
}

const TRY_ON_PRODUCTS: TryOnGarment[] = [
  {
    id: "g-1",
    name: "Sage Green Oversized Shacket",
    url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80",
    colorHex: "#5F7D61",
    colorHsl: { h: 125, s: 0.14, l: 0.43 },
    colorName: "Sage Green",
    category: "upper_body"
  },
  {
    id: "g-2",
    name: "Classic Crimson Trench Coat",
    url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80", // standard trench coat fallback or custom
    colorHex: "#B21E35",
    colorHsl: { h: 351, s: 0.71, l: 0.41 },
    colorName: "Crimson Red",
    category: "full_body"
  },
  {
    id: "g-3",
    name: "Muted Lavender Summer Blouse",
    url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80",
    colorHex: "#C1A2DB",
    colorHsl: { h: 272, s: 0.42, l: 0.75 },
    colorName: "Soft Lavender",
    category: "upper_body"
  },
  {
    id: "g-4",
    name: "Charcoal Cropped Utility Pullover",
    url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=80",
    colorHex: "#353839",
    colorHsl: { h: 195, s: 0.04, l: 0.22 },
    colorName: "Charcoal Grey",
    category: "upper_body"
  }
];

const MODEL_PRESETS = [
  {
    id: "m-1",
    name: "Marcus (Default Profile)",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    season: "autumn" as SeasonAura,
    makeupHsl: { h: 25, s: 0.3, l: 0.6 }
  },
  {
    id: "m-2",
    name: "Elena (Classic Silhouette)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    season: "winter" as SeasonAura,
    makeupHsl: { h: 330, s: 0.5, l: 0.45 }
  },
  {
    id: "m-3",
    name: "Kenji (Summer Palette)",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
    season: "summer" as SeasonAura,
    makeupHsl: { h: 200, s: 0.2, l: 0.7 }
  }
];

export default function TryOnSandbox() {
  const [selectedGarment, setSelectedGarment] = useState<TryOnGarment>(TRY_ON_PRODUCTS[0]);
  const [selectedModel, setSelectedModel] = useState(MODEL_PRESETS[1]); // Elena by default
  const [season, setSeason] = useState<SeasonAura>(MODEL_PRESETS[1].season);

  // Beauty Overlays State
  const [enableLip, setEnableLip] = useState(false);
  const [enableBlush, setEnableBlush] = useState(false);
  const [enableHair, setEnableHair] = useState(false);

  const [lipColor, setLipColor] = useState("#B21E35");
  const [blushColor, setBlushColor] = useState("#D81B60");
  const [hairColor, setHairColor] = useState("#5F7D61");

  // Comparison slider position (percentage)
  const [sliderPos, setSliderPosition] = useState(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const [tryOnImage, setTryOnImage] = useState<string>("");
  const [isProcessing, setIsAnalyzing] = useState(false);

  // Harmony calculation
  const getHarmonyMetrics = () => {
    const { h, s, l } = selectedGarment.colorHsl;
    let score = 55;
    const isWarmHue = h >= 15 && h < 110;
    const isCoolHue = (h >= 170 && h < 310) || (h >= 340 || h < 15);

    if (season === "winter") {
      if (isCoolHue) score += 20;
      else score -= 15;
      if (s > 0.4) score += 15;
      else if (s < 0.15 && (l > 0.8 || l < 0.2)) score += 15;
    } else if (season === "summer") {
      if (isCoolHue) score += 20;
      else score -= 15;
      if (s < 0.45) score += 15;
    } else if (season === "autumn") {
      if (isWarmHue || (h >= 110 && h < 165)) score += 20;
      else score -= 15;
      if (s < 0.6) score += 15;
    } else if (season === "spring") {
      if (isWarmHue || (h >= 165 && h < 195)) score += 20;
      else score -= 15;
      if (s > 0.45) score += 15;
    }

    const finalScore = Math.max(40, Math.min(99, Math.round(score)));

    let verdict = "";
    if (finalScore >= 85) {
      verdict = `Sovereign Fit! This ${selectedGarment.colorName} hue dynamically aligns with your ${season} aura, amplifying your natural skin tones and facial structure.`;
    } else if (finalScore >= 70) {
      verdict = `Harmonious Shade. This color sits beautifully within your ${season} seasonal spectrum, creating a stylish, balanced, and elegant aesthetic.`;
    } else {
      verdict = `Undertone Clash. This garment's tone slightly wash you out. Toggle the customized lipstick/blush cosmetics overlay to restore perfect visual harmony.`;
    }

    return { score: finalScore, verdict };
  };

  const harmony = getHarmonyMetrics();

  // Draw overlay when model, garment, or cosmetics change
  useEffect(() => {
    setIsAnalyzing(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImg = new Image();
    baseImg.crossOrigin = "anonymous";
    baseImg.src = selectedModel.url;

    baseImg.onload = () => {
      canvas.width = baseImg.naturalWidth || baseImg.width || 400;
      canvas.height = baseImg.naturalHeight || baseImg.height || 500;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw base person
      ctx.drawImage(baseImg, 0, 0, w, h);

      // 2. Simulated Clothing Tint Overlay (Blends the garment onto the body with multiply/overlay blend modes)
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = selectedGarment.colorHex;
      // Define clothing torso region
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.45);
      ctx.lineTo(w * 0.65, h * 0.45);
      ctx.lineTo(w * 0.72, h * 0.85);
      ctx.lineTo(w * 0.28, h * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3. Apply blush
      if (enableBlush) {
        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.25;
        // Left Cheek
        const leftBlush = ctx.createRadialGradient(w * 0.44, h * 0.33, 0, w * 0.44, h * 0.33, w * 0.05);
        leftBlush.addColorStop(0, blushColor);
        leftBlush.addColorStop(1, 'transparent');
        ctx.fillStyle = leftBlush;
        ctx.beginPath();
        ctx.arc(w * 0.44, h * 0.33, w * 0.05, 0, 2 * Math.PI);
        ctx.fill();

        // Right Cheek
        const rightBlush = ctx.createRadialGradient(w * 0.56, h * 0.33, 0, w * 0.56, h * 0.33, w * 0.05);
        rightBlush.addColorStop(0, blushColor);
        rightBlush.addColorStop(1, 'transparent');
        ctx.fillStyle = rightBlush;
        ctx.beginPath();
        ctx.arc(w * 0.56, h * 0.33, w * 0.05, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }

      // 4. Apply lipstick
      if (enableLip) {
        ctx.save();
        ctx.globalCompositeOperation = "color";
        ctx.fillStyle = lipColor;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(w * 0.5, h * 0.385, w * 0.04, h * 0.009, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }

      // 5. Apply hair highlighting tint
      if (enableHair) {
        ctx.save();
        ctx.globalCompositeOperation = "color-dodge";
        ctx.fillStyle = hairColor;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.2, w * 0.16, Math.PI, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      setTryOnImage(canvas.toDataURL("image/jpeg", 0.9));
      setIsAnalyzing(false);
    };
  }, [selectedModel, selectedGarment, enableLip, enableBlush, enableHair, lipColor, blushColor, hairColor]);

  // Comparison slider dragging logic
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    handleSliderMove(e.clientX);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Sync default model season on selection
  useEffect(() => {
    setSeason(selectedModel.season);
  }, [selectedModel]);

  const handleDownloadStyleCard = () => {
    const cardCanvas = document.createElement("canvas");
    const ctx = cardCanvas.getContext("2d");
    if (!ctx) return;

    cardCanvas.width = 1080;
    cardCanvas.height = 1350;

    // Draw rich gradient backdrop
    const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
    grad.addColorStop(0, "#09090b");
    grad.addColorStop(0.5, "#18181b");
    grad.addColorStop(1, "#09090b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);

    // Dynamic brand elements
    ctx.fillStyle = "rgba(6,182,212,0.06)";
    ctx.beginPath();
    ctx.arc(540, 675, 450, 0, 2 * Math.PI);
    ctx.fill();

    const beforeImg = new Image();
    beforeImg.crossOrigin = "anonymous";
    beforeImg.src = selectedModel.url;

    beforeImg.onload = () => {
      // Draw Side-by-Side Rounded Images
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(70, 200, 440, 580, 20);
      ctx.clip();
      ctx.drawImage(beforeImg, 70, 200, 440, 580);
      ctx.restore();

      const afterImg = new Image();
      afterImg.crossOrigin = "anonymous";
      afterImg.src = tryOnImage;

      afterImg.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(570, 200, 440, 580, 20);
        ctx.clip();
        ctx.drawImage(afterImg, 570, 200, 440, 580);
        ctx.restore();

        // 3. Render Titles & Overlay Texts
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 42px sans-serif";
        ctx.fillText("AURA COLOR STYLE REPORT", 70, 100);

        ctx.fillStyle = "#22d3ee";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(`Archetype: ${season.toUpperCase()} SPECTRUM`, 70, 140);

        // Score Card
        ctx.fillStyle = "#0c4a6e";
        ctx.beginPath();
        ctx.roundRect(830, 50, 180, 90, 15);
        ctx.fill();

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText("HARMONY SCORE", 850, 85);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px sans-serif";
        ctx.fillText(`${harmony.score}%`, 850, 125);

        // Draw Descriptions
        ctx.fillStyle = "rgba(255,255,255,0.03)";
        ctx.beginPath();
        ctx.roundRect(70, 820, 940, 200, 15);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText(`Garment Analyzed: ${selectedGarment.name}`, 100, 870);

        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "18px sans-serif";
        // Simple manual split line wrapping for short description
        ctx.fillText(harmony.verdict.slice(0, 80), 100, 915);
        ctx.fillText(harmony.verdict.slice(80), 100, 945);

        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("AURA FASHION COGNITIVE AI • POWERED BY PERFECT CORP", 540, 1100);

        const cardUri = cardCanvas.toDataURL("image/jpeg", 0.95);
        const link = document.createElement("a");
        link.download = `Aura_AI_Styling_Card_${season}.jpg`;
        link.href = cardUri;
        link.click();
      };
    };
  };

  const activeSeasonData = {
    winter: { icon: <Flame className="text-blue-400" size={16} />, bg: 'bg-blue-950/20 border-blue-500/20 text-blue-300', tag: 'High-contrast, saturated tones, striking cool base' },
    autumn: { icon: <Sunrise className="text-amber-500" size={16} />, bg: 'bg-amber-950/20 border-amber-500/20 text-amber-300', tag: 'Earthy, rich warm colors, low contrast, muted undertones' },
    summer: { icon: <Wind className="text-teal-400" size={16} />, bg: 'bg-teal-950/20 border-teal-500/20 text-teal-300', tag: 'Pastels, cool muted neutrals, soft silver bases' },
    spring: { icon: <Sparkles className="text-rose-400" size={16} />, bg: 'bg-rose-950/20 border-rose-500/20 text-rose-300', tag: 'Vibrant warm tones, peachy highlights, high brightness' },
  }[season];

  return (
    <div className="min-h-[calc(100vh-6rem)] p-2 grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
      {/* LEFT: Controls, Archetypes and Makeup Overlays */}
      <div className="xl:col-span-5 flex flex-col gap-5 bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md overflow-y-auto max-h-[calc(100vh-7rem)]">
        
        {/* Model Selection */}
        <div>
          <h2 className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-2.5 font-bold">1. Select Target Canvas</h2>
          <div className="grid grid-cols-3 gap-2">
            {MODEL_PRESETS.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                  selectedModel.id === m.id
                    ? 'bg-cyan-500/10 border-cyan-400/80 text-white'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'
                }`}
              >
                <img src={m.url} alt={m.name} className="w-11 h-11 rounded-full object-cover border border-white/10" />
                <span className="text-[10px] text-center truncate w-full font-light">{m.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Garment Selection */}
        <div>
          <h2 className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-2.5 font-bold">2. Select Apparel Colorway</h2>
          <div className="grid grid-cols-2 gap-2">
            {TRY_ON_PRODUCTS.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGarment(g)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all duration-300 cursor-pointer ${
                  selectedGarment.id === g.id
                    ? 'bg-cyan-500/10 border-cyan-400/80 text-white'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'
                }`}
              >
                <span className="w-5 h-5 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: g.colorHex }} />
                <div className="truncate">
                  <h4 className="text-[10px] font-bold truncate">{g.name}</h4>
                  <span className="text-[9px] text-slate-500 font-mono block mt-0.5">{g.colorName}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Seasonal Color Analysis */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold flex items-center gap-1">
              <Palette size={14} className="text-cyan-400" /> 3. Personal Color Archetype
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(['winter', 'autumn', 'summer', 'spring'] as SeasonAura[]).map(s => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className={`px-1.5 py-1.5 rounded-lg border text-[10px] capitalize font-mono font-bold tracking-wider cursor-pointer ${
                  season === s
                    ? 'bg-cyan-500/10 border-cyan-400/80 text-cyan-300'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className={`mt-3 p-3.5 rounded-xl border flex items-start gap-2.5 transition-all duration-300 ${activeSeasonData?.bg}`}>
            <span className="mt-0.5 shrink-0">{activeSeasonData?.icon}</span>
            <div>
              <span className="font-bold text-[9px] uppercase tracking-widest block font-mono mb-0.5">Profile Match Insights</span>
              <p className="text-[11px] font-light leading-snug">{activeSeasonData?.tag}</p>
            </div>
          </div>
        </div>

        {/* Client Cosmetics Overlays */}
        <div>
          <h2 className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-2.5 font-bold flex items-center gap-1">
            <Sliders size={14} className="text-cyan-400" /> 4. AR Cosmetics Layer
          </h2>
          <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
            
            {/* Lipstick */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableLip}
                  onChange={e => setEnableLip(e.target.checked)}
                  className="rounded border-white/10 bg-black text-cyan-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[10px] font-mono tracking-wider font-bold">LIP GLOSS SATURATION</span>
              </label>
              <input
                type="color"
                value={lipColor}
                onChange={e => setLipColor(e.target.value)}
                disabled={!enableLip}
                className="w-5 h-5 rounded cursor-pointer border border-white/10 bg-transparent disabled:opacity-30"
              />
            </div>

            {/* Blush */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableBlush}
                  onChange={e => setEnableBlush(e.target.checked)}
                  className="rounded border-white/10 bg-black text-cyan-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[10px] font-mono tracking-wider font-bold">ROUGE BLUSH HIGHLIGHTS</span>
              </label>
              <input
                type="color"
                value={blushColor}
                onChange={e => setBlushColor(e.target.value)}
                disabled={!enableBlush}
                className="w-5 h-5 rounded cursor-pointer border border-white/10 bg-transparent disabled:opacity-30"
              />
            </div>

            {/* Hair tint */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableHair}
                  onChange={e => setEnableHair(e.target.checked)}
                  className="rounded border-white/10 bg-black text-cyan-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[10px] font-mono tracking-wider font-bold">HAIR GLOW / UNDERTONES</span>
              </label>
              <input
                type="color"
                value={hairColor}
                onChange={e => setHairColor(e.target.value)}
                disabled={!enableHair}
                className="w-5 h-5 rounded cursor-pointer border border-white/10 bg-transparent disabled:opacity-30"
              />
            </div>

          </div>
        </div>

      </div>

      {/* RIGHT: Active Image Slider & Harmony Results */}
      <div className="xl:col-span-7 flex flex-col gap-4 bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
        
        {/* Slider Canvas Frame */}
        <div className="flex-1 min-h-[320px] rounded-xl overflow-hidden relative border border-white/10 bg-zinc-950" ref={sliderContainerRef}>
          {isProcessing ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-mono text-cyan-400">
              <Sparkles className="animate-spin text-cyan-400 mb-2" size={24} /> Processing Canvas...
            </div>
          ) : (
            <>
              {/* BACK layer: Original Model */}
              <div className="absolute inset-0 select-none">
                <img src={selectedModel.url} alt="Before human" className="w-full h-full object-cover" />
              </div>

              {/* FRONT layer: Styled result */}
              <div
                className="absolute inset-0 select-none overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
              >
                <img src={tryOnImage} alt="After human Styled" className="w-full h-full object-cover" />
              </div>

              {/* Slider boundary bar */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-white cursor-ew-resize group hover:w-[4px] hover:bg-cyan-400"
                style={{ left: `${sliderPos}%` }}
                onMouseDown={handleMouseDown}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-cyan-400 text-black border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-2xl cursor-ew-resize">
                  ↔
                </div>
              </div>

              {/* Labels */}
              <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/70 border border-white/10 rounded text-[9px] font-mono uppercase text-slate-300">
                Original
              </span>
              <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-cyan-500 text-black rounded text-[9px] font-mono uppercase font-bold">
                AURA Try-On
              </span>
            </>
          )}
        </div>

        {/* Harmony Panel details */}
        <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-widest font-mono text-cyan-400 flex items-center gap-1.5">
              <Sparkles size={14} /> Color Harmony Analysis
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">MATCH</span>
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 rounded text-xs font-mono font-bold">
                {harmony.score}%
              </span>
            </div>
          </div>
          <p className="text-[11px] font-light leading-relaxed mt-2 text-slate-300">
            {harmony.verdict}
          </p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleDownloadStyleCard}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all text-black py-2.5 px-4 rounded-lg font-mono font-bold text-xs cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.35)]"
            >
              <Download size={14} /> DOWNLOAD SOCIAL REPORT CARD
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
