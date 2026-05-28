import React, { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag, Eye, RefreshCw, AlertCircle, CheckCircle, Info, ExternalLink, ArrowRight } from 'lucide-react';
import { BodyMeasurements } from '../types';

interface ShopProduct {
  id: string;
  name: string;
  category: "Apparel" | "Footwear";
  subCategory: "upper_body" | "lower_body" | "full_body" | "shoes";
  price: string;
  image: string;
  colorHex: string;
  colorName: string;
  description: string;
  // Garment standard sizings for size M
  sizingM: {
    shoulderWidth: number;
    chestEstimate: number;
    torsoLength: number;
    hipWidth: number;
    inseam: number;
  };
}

const SHOP_CATALOG: ShopProduct[] = [
  {
    id: "p-1",
    name: "Classic Sage Green Shacket",
    category: "Apparel",
    subCategory: "upper_body",
    price: "$89.00",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80",
    colorHex: "#5F7D61",
    colorName: "Sage Green",
    description: "Relaxed-fit shirt jacket in soft, heavyweight cotton fabric. Features a structured button-down front, dual utility chest pockets, and button cuffs.",
    sizingM: {
      shoulderWidth: 41.5,
      chestEstimate: 98.0,
      torsoLength: 68.0,
      hipWidth: 38.0,
      inseam: 0
    }
  },
  {
    id: "p-2",
    name: "Crimson Trench Overcoat",
    category: "Apparel",
    subCategory: "full_body",
    price: "$149.00",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80", // Using stylish model image
    colorHex: "#B21E35",
    colorName: "Crimson Red",
    description: "Classic double-breasted trench coat crafted from a premium water-resistant blend. Detailed with adjustable waist belt, tortoise buckles, and rear split vents.",
    sizingM: {
      shoulderWidth: 40.0,
      chestEstimate: 94.0,
      torsoLength: 105.0,
      hipWidth: 42.0,
      inseam: 72.0
    }
  },
  {
    id: "p-3",
    name: "Utility Charcoal Pullover",
    category: "Apparel",
    subCategory: "upper_body",
    price: "$65.00",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=80",
    colorHex: "#353839",
    colorName: "Charcoal Grey",
    description: "Sporty, slouchy pullover in high-density loopback terry. Featuring custom zip neck collars, toggle-adjustable waistlines, and reflective tech sleeve accents.",
    sizingM: {
      shoulderWidth: 45.0,
      chestEstimate: 110.0,
      torsoLength: 64.0,
      hipWidth: 36.0,
      inseam: 0
    }
  }
];

interface ChromeExtensionSimulatorProps {
  syncedMeasurements: BodyMeasurements | null;
  onSetMeasurements: (m: BodyMeasurements) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function ChromeExtensionSimulator({
  syncedMeasurements,
  onSetMeasurements,
  onNavigateToTab
}: ChromeExtensionSimulatorProps) {
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct>(SHOP_CATALOG[0]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Manual Sizing Input fields in extension (initially matches the product standard size M)
  const [garmentShoulder, setGarmentShoulder] = useState(selectedProduct.sizingM.shoulderWidth);
  const [garmentChest, setGarmentChest] = useState(selectedProduct.sizingM.chestEstimate);
  const [garmentTorso, setGarmentTorso] = useState(selectedProduct.sizingM.torsoLength);
  const [garmentHip, setGarmentHip] = useState(selectedProduct.sizingM.hipWidth);

  // Fallback body measurements if not synced from localhost:3000
  const [fallbackBody, setFallbackBody] = useState<BodyMeasurements>({
    height: 170,
    shoulderWidth: 39.0,
    armLength: 72.0,
    torsoLength: 62.0,
    inseam: 76.0,
    hipWidth: 37.0,
    chestEstimate: 94.0
  });

  // Keep garment settings synchronized when selected product changes
  useEffect(() => {
    setGarmentShoulder(selectedProduct.sizingM.shoulderWidth);
    setGarmentChest(selectedProduct.sizingM.chestEstimate);
    setGarmentTorso(selectedProduct.sizingM.torsoLength);
    setGarmentHip(selectedProduct.sizingM.hipWidth);
  }, [selectedProduct]);

  // AI-Powered Wardrobe Compatibility report State
  const [aiMatchReason, setAiMatchReason] = useState("Click 'Query Wardrobe AI' to analyze closet harmony with Gemini...");
  const [isQueryingAI, setIsQueryingAI] = useState(false);

  const activeBody = syncedMeasurements || fallbackBody;

  // COMPUTE FIT CONFIDENCE ALGORITHM
  const calculateFitConfidence = () => {
    // Shoulder calculation (differential tolerance ~ 4cm)
    const shDiff = Math.abs(garmentShoulder - activeBody.shoulderWidth);
    const shScore = Math.max(0, 100 - (shDiff * 25)); // 4cm difference = 0% fit

    // Chest calculation (garment chest must be larger than body chest for ease)
    const chDiff = garmentChest - activeBody.chestEstimate;
    let chScore = 100;
    if (chDiff < 0) {
      chScore = Math.max(0, 100 - (Math.abs(chDiff) * 15)); // tight/small
    } else if (chDiff > 12) {
      chScore = Math.max(50, 100 - ((chDiff - 12) * 5)); // oversized ease
    }

    // Torso length suitability
    const tDiff = Math.abs(garmentTorso - activeBody.torsoLength);
    let tScore = 100;
    // For shirts/jackets (upper_body) vs coats/full_body
    if (selectedProduct.subCategory === "upper_body") {
      tScore = Math.max(0, 100 - (Math.abs(tDiff - 6) * 8)); // expect shirt length to be ~6cm longer than body trunk
    }

    const overall = Math.round((shScore * 0.45) + (chScore * 0.40) + (tScore * 0.15));
    return Math.max(35, Math.min(99, overall));
  };

  const fitScore = calculateFitConfidence();

  const getFitFeedback = () => {
    const shDiff = garmentShoulder - activeBody.shoulderWidth;
    const chDiff = garmentChest - activeBody.chestEstimate;

    let shoulderMsg = "";
    let shoulderStatus: 'success' | 'warn' | 'danger' = 'success';
    if (Math.abs(shDiff) <= 1.5) {
      shoulderMsg = `Tailored contour match (${shDiff >= 0 ? '+' : ''}${shDiff.toFixed(1)}cm ease). Minimal tension.`;
    } else if (shDiff > 1.5) {
      shoulderMsg = `Relaxed drop-shoulder comfort (${shDiff.toFixed(1)}cm extra breadth).`;
    } else {
      shoulderStatus = 'danger';
      shoulderMsg = `Critical restriction! Shoulders are ${Math.abs(shDiff).toFixed(1)}cm narrower than skeletal span.`;
    }

    let chestMsg = "";
    let chestStatus: 'success' | 'warn' | 'danger' = 'success';
    if (chDiff >= 4 && chDiff <= 10) {
      chestMsg = `Optimal breathing volume (${chDiff.toFixed(1)}cm ease room).`;
    } else if (chDiff > 10) {
      chestStatus = 'warn';
      chestMsg = `Voluminous, baggy aesthetic (${chDiff.toFixed(1)}cm chest space).`;
    } else if (chDiff >= 0) {
      chestStatus = 'warn';
      chestMsg = `Form-fitting skin fit (${chDiff.toFixed(1)}cm breathing ease).`;
    } else {
      chestStatus = 'danger';
      chestMsg = `Compression boundary! Seams will stretch by ${Math.abs(chDiff).toFixed(1)}cm.`;
    }

    return {
      shoulder: { text: shoulderMsg, status: shoulderStatus },
      chest: { text: chestMsg, status: chestStatus }
    };
  };

  const feedback = getFitFeedback();

  // Run live Gemini RAG analysis on selected product against user closet
  const handleQueryWardrobeAI = async () => {
    setIsQueryingAI(true);
    setAiMatchReason("Consulting Wardrobe Context...");

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        throw new Error("API Key missing");
      }

      // Read current closet from storage
      const savedCloset = localStorage.getItem('aura_wardrobe') || '[]';
      const parsedCloset = JSON.parse(savedCloset);

      const prompt = `You are AURA Fashion Intelligence Agent.
The user is browsing this product in an e-commerce shop:
Garment: ${selectedProduct.name}
Details: Category: ${selectedProduct.category}, Primary color: ${selectedProduct.colorName}

User's Wardrobe:
${JSON.stringify(parsedCloset, null, 2)}

Provide a concise, 2-line color-matching review. Identify 1 or 2 specific items they already own that would create a matching outfit, and give a harmony recommendation.
Keep your response extremely brief, inspiring, and professional (under 60 words).`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 120,
          }
        })
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      const modelText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Excellent tonal blend with your items.";
      setAiMatchReason(modelText);
    } catch (err) {
      // Fallback
      setAiMatchReason(`Harmonious color contrast! The ${selectedProduct.colorName} pairs elegantly with your casual slip-ons or oversized shirt jackets for a balanced tonal palette.`);
    } finally {
      setIsQueryingAI(false);
    }
  };

  const triggerLocalhostSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // Simulate reading and syncing measurements from Elena preset
      const mockElena: BodyMeasurements = {
        height: 165.4,
        shoulderWidth: 38.1,
        armLength: 69.8,
        torsoLength: 61.2,
        inseam: 75.1,
        hipWidth: 35.8,
        chestEstimate: 92.2
      };
      onSetMeasurements(mockElena);
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch p-2">
      
      {/* LEFT PANEL: Mock E-Commerce Window (Zara style) */}
      <div className="lg:col-span-7 flex flex-col bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden relative shadow-inner">
        {/* Shop Header */}
        <div className="bg-black/60 border-b border-white/10 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">Secure Shopping Browser • mock-shop.com</span>
          <div className="w-12" />
        </div>

        <div className="flex-1 p-5 overflow-y-auto flex flex-col md:flex-row gap-6">
          {/* Main Visual */}
          <div className="md:w-1/2 flex flex-col gap-3">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-black relative group border border-white/5 shadow-2xl">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-between items-end">
                <span className="text-xl font-bold font-mono tracking-tight text-cyan-400">{selectedProduct.price}</span>
                <span className="text-[10px] bg-white/10 border border-white/10 px-2 py-0.5 rounded text-slate-300 font-mono">Size: M (Standard)</span>
              </div>
            </div>
            
            {/* Thumbnails to Switch products */}
            <div className="flex gap-2">
              {SHOP_CATALOG.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    setAiMatchReason("Click 'Query Wardrobe AI' to analyze closet harmony with Gemini...");
                  }}
                  className={`w-14 h-14 rounded-lg overflow-hidden border transition-all duration-300 cursor-pointer ${
                    selectedProduct.id === p.id ? 'border-cyan-400 ring-2 ring-cyan-400/20' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="md:w-1/2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 rounded text-[9px] font-mono tracking-widest uppercase font-bold">
                  {selectedProduct.category}
                </span>
                <span className="w-2 h-2 rounded-full border border-white/10" style={{ backgroundColor: selectedProduct.colorHex }} />
                <span className="text-[10px] text-slate-400 font-mono">{selectedProduct.colorName}</span>
              </div>
              <h1 className="text-lg lg:text-xl font-black text-white tracking-tight uppercase leading-snug">{selectedProduct.name}</h1>
              <p className="text-xs text-slate-400 font-light mt-3 leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Mock Sizes */}
              <div className="mt-5">
                <h3 className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold mb-2">Selected sizing</h3>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map(sz => (
                    <button
                      key={sz}
                      className={`w-9 h-9 border text-xs font-mono rounded-lg transition-all flex items-center justify-center font-bold ${
                        sz === 'M'
                          ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                          : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Shopping Layer */}
            <div className="mt-8 border-t border-white/5 pt-4 space-y-3">
              <div className="p-3.5 bg-black/40 border border-cyan-400/30 rounded-xl relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full filter blur-xl" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400 block mb-0.5 animate-pulse">
                      AURA Active Scraper detected
                    </span>
                    <h4 className="text-xs font-bold text-white">Universal Overlay Loaded</h4>
                  </div>
                  <div className="text-xs bg-cyan-400 text-black px-2 py-1 rounded font-mono font-black shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-pulse">
                    ACTIVE
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-white hover:bg-slate-100 transition-colors text-black py-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl">
                <ShoppingBag size={14} /> ADD TO CATALOG CART
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT PANEL: AURA Chrome Extension Sidebar Overlay */}
      <div className="lg:col-span-5 flex flex-col bg-[#0b0c10]/95 border-l border-white/10 relative shadow-2xl overflow-hidden rounded-2xl">
        {/* Extension Header */}
        <div className="bg-zinc-950/80 border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-500 rounded-sm flex items-center justify-center text-black font-extrabold text-[10px] shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              A
            </div>
            <div>
              <h3 className="text-xs font-black text-white tracking-widest font-mono uppercase">AURA SHIELD</h3>
              <p className="text-[8px] text-cyan-400/80 font-mono tracking-widest uppercase">v1.2.5 Browser Copilot</p>
            </div>
          </div>
          <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-mono text-[9px] text-slate-500">
            SECURE SANDBOX
          </div>
        </div>

        {/* Sync/Referral Notice */}
        <div className="bg-cyan-500/10 border-b border-cyan-400/20 p-3 flex items-start gap-2.5 text-[11px] leading-snug">
          <Info className="text-cyan-400 mt-0.5 shrink-0" size={14} />
          <div>
            <p className="text-slate-200">
              To discover your exact skeletal body proportions in-browser:
            </p>
            <button
              onClick={() => onNavigateToTab('fit-depth')}
              className="text-cyan-400 hover:text-cyan-300 font-mono font-bold uppercase text-[9px] tracking-widest mt-1.5 flex items-center gap-1 cursor-pointer"
            >
              Click Here to Measure on AURA Depth Engine <ExternalLink size={10} />
            </button>
          </div>
        </div>

        {/* Extension Scroll Area */}
        <div className="flex-1 p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-14rem)]">
          
          {/* Synchronized Body Profile Status */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">User Body Profile</h4>
              {syncedMeasurements ? (
                <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle size={10} /> SYNCED FROM PORTAL
                </span>
              ) : (
                <button
                  onClick={triggerLocalhostSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1 text-[9px] font-mono text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
                >
                  {isSyncing ? <RefreshCw className="animate-spin" size={10} /> : <RefreshCw size={10} />} SYNC PORTAL DATA
                </button>
              )}
            </div>

            {syncedMeasurements ? (
              <div className="text-xs space-y-1 text-slate-200">
                <p className="font-light">
                  Skeletal Span Detected: <span className="font-mono text-cyan-300">Elena Profile</span>
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5 mt-1">
                  <span>Height: {activeBody.height}cm</span>
                  <span>Shoulder: {activeBody.shoulderWidth}cm</span>
                  <span>Chest: {activeBody.chestEstimate}cm</span>
                  <span>Torso: {activeBody.torsoLength}cm</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-start gap-1.5 p-2 bg-amber-500/5 border border-amber-500/10 rounded text-[10px] text-amber-300 leading-snug">
                  <AlertCircle className="shrink-0 mt-0.5" size={12} />
                  <span>No active point profile found on localhost:3000. Displaying custom sandbox fallback. Feel free to adjust below:</span>
                </div>
                {/* Fallback Inputs */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-0.5">Body Shoulder (cm)</label>
                    <input
                      type="number"
                      value={fallbackBody.shoulderWidth}
                      onChange={e => setFallbackBody({ ...fallbackBody, shoulderWidth: parseFloat(e.target.value) || 39 })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-0.5 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-0.5">Body Chest (cm)</label>
                    <input
                      type="number"
                      value={fallbackBody.chestEstimate}
                      onChange={e => setFallbackBody({ ...fallbackBody, chestEstimate: parseFloat(e.target.value) || 94 })}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-0.5 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Garment Dress Sizings (Manual Sizing parameters in the plugin) */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-3">
            <h4 className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">Dress Sizing Dimensions</h4>
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div>
                <label className="text-[9px] text-slate-500 block mb-1">Garment Shoulder (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={garmentShoulder}
                  onChange={e => setGarmentShoulder(parseFloat(e.target.value) || selectedProduct.sizingM.shoulderWidth)}
                  className="w-full bg-black/40 border border-white/10 focus:border-cyan-400 rounded px-2.5 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 block mb-1">Garment Chest (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={garmentChest}
                  onChange={e => setGarmentChest(parseFloat(e.target.value) || selectedProduct.sizingM.chestEstimate)}
                  className="w-full bg-black/40 border border-white/10 focus:border-cyan-400 rounded px-2.5 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 block mb-1">Garment Torso Length (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={garmentTorso}
                  onChange={e => setGarmentTorso(parseFloat(e.target.value) || selectedProduct.sizingM.torsoLength)}
                  className="w-full bg-black/40 border border-white/10 focus:border-cyan-400 rounded px-2.5 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 block mb-1">Garment Hip (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={garmentHip}
                  onChange={e => setGarmentHip(parseFloat(e.target.value) || selectedProduct.sizingM.hipWidth)}
                  className="w-full bg-black/40 border border-white/10 focus:border-cyan-400 rounded px-2.5 py-1 text-white text-xs"
                />
              </div>
            </div>
            <p className="text-[9px] text-slate-500 font-light italic leading-relaxed">
              *Adjust values manually to evaluate custom sizing bounds, tolerances, and fit boundaries.
            </p>
          </div>

          {/* Sizing Telemetry & Fit Confidence */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">Sizing Telemetry Analysis</h4>
              <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/20">
                {fitScore}% MATCH
              </span>
            </div>

            <div className="space-y-2 text-[10px]">
              {/* Shoulder analysis */}
              <div className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                  feedback.shoulder.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
                <div>
                  <span className="font-bold text-slate-300 block">Shoulder Alignment Facts</span>
                  <span className="text-slate-400 leading-normal">{feedback.shoulder.text}</span>
                </div>
              </div>

              {/* Chest analysis */}
              <div className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                  feedback.chest.status === 'success' ? 'bg-emerald-500' : feedback.chest.status === 'warn' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <div>
                  <span className="font-bold text-slate-300 block">Chest Expansion Facts</span>
                  <span className="text-slate-400 leading-normal">{feedback.chest.text}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI-Powered Wardrobe Harmony */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">Wardrobe Compatibility Report</h4>
              <button
                onClick={handleQueryWardrobeAI}
                disabled={isQueryingAI}
                className="text-[9px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/20 hover:bg-cyan-500 hover:text-black transition-all cursor-pointer"
              >
                {isQueryingAI ? <RefreshCw className="animate-spin" size={10} /> : "QUERY CLOSET AI"}
              </button>
            </div>
            <div className="text-[11px] leading-relaxed font-light text-slate-300 whitespace-pre-line">
              {aiMatchReason}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
