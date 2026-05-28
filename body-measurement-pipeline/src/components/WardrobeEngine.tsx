import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Plus, Trash2, Shirt, FolderHeart, MessageSquareCode, ArrowRight } from 'lucide-react';
import { BodyMeasurements } from '../types';

export interface WardrobeItem {
  id: string;
  category: "Apparel" | "Footwear" | "Accessories" | "Clothing Care" | "Textiles";
  item: string;
  color: string;
  details: string;
  image: string;
}

const INITIAL_WARDROBE: WardrobeItem[] = [
  {
    id: "wardrobe-1",
    category: "Footwear",
    item: "Casual slip-on shoes",
    color: "Dark navy / Black",
    details: "Canvas style, thick white rubber soles",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-2",
    category: "Apparel",
    item: "Oversized shirt jacket",
    color: "Sage green",
    details: "Heavy fabric, button-up",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-3",
    category: "Apparel",
    item: "Hoodie / Pullover",
    color: "Dark green / Teal",
    details: "Slouchy, casual fit",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-4",
    category: "Apparel",
    item: "Crewneck t-shirt",
    color: "Charcoal grey",
    details: "Solid color, classic fit",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-6",
    category: "Apparel",
    item: "Button-down shirt",
    color: "Beige / Tan",
    details: "Structured, neutral tone",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-10",
    category: "Apparel",
    item: "Crewneck t-shirt",
    color: "Plain black",
    details: "Solid, staple basic",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-16",
    category: "Footwear",
    item: "Low-top platform sneakers",
    color: "White / Suede",
    details: "Clean leather style, thick platform soles",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-24",
    category: "Apparel",
    item: "Ruffled Midi Dress / Tier Skirt",
    color: "Light blue",
    details: "Tiered layered pattern, pastel midi length",
    image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=400&q=80"
  }
];

const QUICK_SUGGESTIONS = [
  "What outfits can I create?",
  "How can I style my Sage green jacket?",
  "Will a Crimson Red sweater match my items?",
  "Analyze matching shoes for my light blue midi dress."
];

interface WardrobeEngineProps {
  bodyMeasurements: BodyMeasurements | null;
}

export default function WardrobeEngine({ bodyMeasurements }: WardrobeEngineProps) {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(() => {
    const saved = localStorage.getItem('aura_wardrobe');
    return saved ? JSON.parse(saved) : INITIAL_WARDROBE;
  });

  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model', text: string }>>([
    {
      role: 'model',
      text: "Hello! I am your AURA Wardrobe AI Stylist. I have synchronized with your digital closet. Ask me about wardrobe styling, matching suggestions, or outfit predictions based on what you already own!"
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsAnalyzing] = useState(false);

  // Form State
  const [newItem, setNewItem] = useState({
    item: '',
    category: 'Apparel' as WardrobeItem['category'],
    color: '',
    details: '',
    image: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('aura_wardrobe', JSON.stringify(wardrobe));
  }, [wardrobe]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.item || !newItem.color) return;

    const imgUrl = newItem.image.trim() || "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=80";
    const itemToAdd: WardrobeItem = {
      id: `custom-${Date.now()}`,
      category: newItem.category,
      item: newItem.item,
      color: newItem.color,
      details: newItem.details,
      image: imgUrl
    };

    setWardrobe([itemToAdd, ...wardrobe]);
    setNewItem({ item: '', category: 'Apparel', color: '', details: '', image: '' });
    setShowAddForm(false);
  };

  const handleRemoveItem = (id: string) => {
    setWardrobe(wardrobe.filter(item => item.id !== id));
  };

  const handleSendMessage = async (msgText: string) => {
    if (!msgText.trim() || isSending) return;

    const userMsg = { role: 'user' as const, text: msgText };
    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsAnalyzing(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        throw new Error("Gemini API key is not configured in .env.local");
      }

      // Build context prompt
      const prompt = `You are AURA Stylist AI, an expert high-fashion advisor, color psychologist, and personal styling consultant.
You have complete real-time access to the user's digital wardrobe (represented in JSON below).

User's Digital Wardrobe:
${JSON.stringify(wardrobe, null, 2)}

User's Body Measurements (if analyzed):
${JSON.stringify(bodyMeasurements, null, 2)}

Your Goal:
Provide helpful, chic, detailed, and professional styling recommendations. When asked if an item matches, do a color-harmony and category checklist analysis against their wardrobe. Highlight specific pieces they own (e.g. "your Sage Green shirt jacket" or "your low-top platform sneakers") to construct perfect, trendy outfit formulas.
Keep your response concise, elegant, inspiring, and direct. Use bullet points and bold styling for readability. Do not mention JSON structures directly, write as if speaking to a client in a high-end fitting room.

User Question: "${msgText}"`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const modelText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I am unable to analyze that request right now. Please try again.";
      
      setChatHistory(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (err: any) {
      console.error(err);
      setChatHistory(prev => [...prev, {
        role: 'model',
        text: `⚠️ Styling Engine offline: ${err.message || "Failed to make styling request"}. Please verify your VITE_GEMINI_API_KEY is configured correctly.`
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch p-2">
      {/* LEFT: Wardrobe Drawer */}
      <div className="xl:col-span-5 flex flex-col bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2">
            <Shirt className="text-cyan-400" size={20} />
            <h2 className="font-bold text-sm uppercase tracking-wider font-mono">Digital Closet ({wardrobe.length})</h2>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 transition-colors text-black px-2.5 py-1 rounded-lg text-xs font-mono font-bold"
          >
            <Plus size={14} /> ADD ITEM
          </button>
        </div>

        {/* Add Item form */}
        {showAddForm && (
          <form onSubmit={handleAddItem} className="p-4 bg-white/5 border-b border-white/10 text-xs flex flex-col gap-2.5 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Linen Blouse"
                  value={newItem.item}
                  onChange={e => setNewItem({ ...newItem, item: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value as WardrobeItem['category'] })}
                  className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Apparel">Apparel</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Clothing Care">Clothing Care</option>
                  <option value="Textiles">Textiles</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Dominant Color</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Salmon Pink"
                  value={newItem.color}
                  onChange={e => setNewItem({ ...newItem, color: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Details/Style</label>
                <input
                  type="text"
                  placeholder="e.g. Slim fit, knit fabric"
                  value={newItem.details}
                  onChange={e => setNewItem({ ...newItem, details: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Image URL (Optional)</label>
              <input
                type="text"
                placeholder="Paste Unsplash image URL"
                value={newItem.image}
                onChange={e => setNewItem({ ...newItem, image: e.target.value })}
                className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400 font-mono text-[10px]"
              />
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300 text-[10px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-emerald-500 text-black font-bold text-[10px]"
              >
                Save to Closet
              </button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {wardrobe.map(item => (
            <div
              key={item.id}
              className="group relative bg-black/40 border border-white/5 hover:border-white/10 rounded-xl overflow-hidden flex flex-col transition-all duration-300"
            >
              <div className="h-28 overflow-hidden bg-zinc-900 relative">
                <img
                  src={item.image}
                  alt={item.item}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="absolute top-2 right-2 p-1 rounded bg-black/70 border border-white/10 text-rose-400 hover:bg-rose-500 hover:text-black transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
                <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 rounded text-[9px] font-mono tracking-widest uppercase">
                  {item.category}
                </span>
              </div>
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-bold text-xs truncate">{item.item}</h3>
                  <p className="text-[10px] text-cyan-300 font-mono mt-0.5 truncate">{item.color}</p>
                </div>
                <p className="text-[9px] text-slate-500 font-light mt-1.5 leading-tight truncate">
                  {item.details || "No details provided"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: RAG Chat Assistant */}
      <div className="xl:col-span-7 flex flex-col bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2">
            <MessageSquareCode className="text-cyan-400 animate-pulse" size={20} />
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider font-mono flex items-center gap-1.5">
                AI Wardrobe Advisor <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-400/20 font-mono tracking-widest animate-pulse">RAG DIRECT</span>
              </h2>
            </div>
          </div>
          {bodyMeasurements && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded font-mono">
              Body Profile Sync: Active
            </span>
          )}
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((chat, idx) => (
            <div
              key={idx}
              className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 text-xs font-light leading-relaxed shadow-lg ${
                chat.role === 'user'
                  ? 'bg-gradient-to-br from-cyan-600/30 to-blue-600/20 border border-cyan-400/20 text-white rounded-br-none'
                  : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-none'
              }`}>
                {chat.role === 'model' && (
                  <div className="flex items-center gap-1 text-[9px] font-mono tracking-widest text-cyan-400 uppercase font-bold mb-2">
                    <Sparkles size={11} /> AURA STYLIST AGENT
                  </div>
                )}
                <div className="whitespace-pre-line leading-relaxed pr-1">{chat.text}</div>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none p-4 max-w-[85%] text-xs text-slate-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                <span className="font-mono text-[10px] uppercase text-cyan-400/60 ml-1.5">Querying Closet Context...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-white/10 flex flex-wrap gap-2 bg-black/10">
          {QUICK_SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              disabled={isSending}
              onClick={() => handleSendMessage(s)}
              className="text-[10px] bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 transition-all text-slate-400 hover:text-cyan-300 px-2.5 py-1 rounded-full text-left"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex gap-2">
          <input
            type="text"
            placeholder={isSending ? "Query is running..." : "Ask your wardrobe: 'Will a khaki jacket fit my shirts?'..."}
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(inputMessage); }}
            disabled={isSending}
            className="flex-1 bg-black/60 border border-white/10 hover:border-white/15 focus:border-cyan-400/60 transition-colors focus:outline-none rounded-xl px-4 py-3 text-xs text-white"
          />
          <button
            onClick={() => handleSendMessage(inputMessage)}
            disabled={isSending || !inputMessage.trim()}
            className="w-11 h-11 bg-cyan-500 hover:bg-cyan-600 disabled:bg-white/5 disabled:text-slate-600 text-black flex items-center justify-center rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
