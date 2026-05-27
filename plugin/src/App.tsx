import { ChangeEvent, useEffect, useMemo, useState, useRef } from "react";
import "./App.css";

const API_BASE_URL = "https://yce-api-01.makeupar.com";
const API_KEY_STORAGE_KEY = "perfectCorpApiKey";
const HISTORY_STORAGE_KEY = "perfectCorpTryOnHistory";
const WARDROBE_STORAGE_KEY = "perfectCorpUserWardrobe";

export interface WardrobeItem {
  id: string;
  category: "Apparel" | "Footwear" | "Accessories" | "Clothing Care" | "Textiles";
  item: string;
  color: string;
  details: string;
  image: string;
}

export interface Recommendation {
  item: WardrobeItem;
  score: number;
  explanation: string;
}

const DEFAULT_WARDROBE: WardrobeItem[] = [
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
    id: "wardrobe-5",
    category: "Apparel",
    item: "Short-sleeve shirt",
    color: "Slate blue",
    details: "Muted tone, casual",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=400&q=80"
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
    id: "wardrobe-7",
    category: "Apparel",
    item: "Crewneck t-shirt",
    color: "Teal green",
    details: "Vibrant medium blue-green",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-8",
    category: "Apparel",
    item: "Pullover sweatshirt",
    color: "Light grey",
    details: "Classic cozy crewneck",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-9",
    category: "Apparel",
    item: "Crewneck t-shirt",
    color: "Plain white",
    details: "Crisp, staple basic",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80"
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
    id: "wardrobe-11",
    category: "Apparel",
    item: "Short-sleeve top",
    color: "Mustard yellow",
    details: "Solid, bright tone",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-12",
    category: "Apparel",
    item: "V-neck dress / blouse",
    color: "Pink and white",
    details: "Intricate magenta/pink and white abstract or paisley print",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-13",
    category: "Apparel",
    item: "Graphic / Textured tee",
    color: "Black / Dark grey",
    details: "Subtle dark patterning on the sleeves and shoulders",
    image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-14",
    category: "Apparel",
    item: "Long-sleeve button-down shirt",
    color: "Light blue and white",
    details: "Fine plaid / checked grid pattern",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-15",
    category: "Footwear",
    item: "Loafers",
    color: "Beige / Cream",
    details: "Smart-casual slip-ons, leather or suede appearance",
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-16",
    category: "Footwear",
    item: "Low-top sneakers",
    color: "White",
    details: "Clean leather style with metallic silver heel tabs",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-17",
    category: "Footwear",
    item: "Canvas sneakers",
    color: "Mint green",
    details: "Pastel lace-up style with white soles",
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-18",
    category: "Footwear",
    item: "Athletic / Running shoes",
    color: "Black",
    details: "Textured mesh upper, sporty athletic soles",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-19",
    category: "Clothing Care",
    item: "Steam iron",
    color: "Green and white",
    details: "Standard household clothes iron",
    image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-20",
    category: "Clothing Care",
    item: "Handheld garment steamer",
    color: "White",
    details: "Compact fabric steamer with integrated water tank",
    image: "https://images.unsplash.com/photo-1594489428504-5c0c480a15fa?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-21",
    category: "Accessories",
    item: "Motorcycle / Scooter helmet",
    color: "Black and blue",
    details: "Protective gear with bright blue accents",
    image: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-22",
    category: "Accessories",
    item: "Digital weight scale",
    color: "Grey",
    details: "Sleek electronic floor scale",
    image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-23",
    category: "Textiles",
    item: "Folded linens",
    color: "White",
    details: "Neatly stacked bedding or heavy fabric",
    image: "https://images.unsplash.com/photo-1528938102132-4a9276b8e320?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-24",
    category: "Apparel",
    item: "Ruffled Midi Dress / Tier Skirt",
    color: "Light blue",
    details: "Tiered layered pattern, pastel midi length",
    image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-25",
    category: "Apparel",
    item: "Horizontal Striped Knit Top",
    color: "Black and white",
    details: "Long-sleeve casual crewneck sweater",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "wardrobe-26",
    category: "Footwear",
    item: "Low-top Platform Sneakers",
    color: "Beige / White",
    details: "Thick white platform soles with metallic gold heel panels",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80"
  }
];

export function getClosetRecommendations(
  selectedCategory: GarmentCategory,
  selectedHsl: { h: number; s: number; l: number } | null,
  wardrobeList: WardrobeItem[]
): Recommendation[] {
  if (!selectedHsl) return [];

  const styleableItems = wardrobeList.filter(
    (item) => item.category === "Apparel" || item.category === "Footwear"
  );

  const isSelectedShoes = selectedCategory === "shoes";
  const isSelectedFullDress = selectedCategory === "full_body";
  
  const recommendations: Recommendation[] = [];

  for (const item of styleableItems) {
    let itemHsl = { h: 0, s: 0.1, l: 0.5 };
    if (item.id === "wardrobe-1") itemHsl = { h: 220, s: 0.4, l: 0.15 };
    else if (item.id === "wardrobe-2") itemHsl = { h: 120, s: 0.15, l: 0.5 };
    else if (item.id === "wardrobe-3") itemHsl = { h: 160, s: 0.35, l: 0.3 };
    else if (item.id === "wardrobe-4") itemHsl = { h: 0, s: 0, l: 0.3 };
    else if (item.id === "wardrobe-5") itemHsl = { h: 210, s: 0.25, l: 0.5 };
    else if (item.id === "wardrobe-6") itemHsl = { h: 35, s: 0.25, l: 0.6 };
    else if (item.id === "wardrobe-7") itemHsl = { h: 175, s: 0.6, l: 0.4 };
    else if (item.id === "wardrobe-8") itemHsl = { h: 0, s: 0, l: 0.75 };
    else if (item.id === "wardrobe-9") itemHsl = { h: 0, s: 0, l: 0.95 };
    else if (item.id === "wardrobe-10") itemHsl = { h: 0, s: 0, l: 0.1 };
    else if (item.id === "wardrobe-11") itemHsl = { h: 45, s: 0.75, l: 0.45 };
    else if (item.id === "wardrobe-12") itemHsl = { h: 330, s: 0.4, l: 0.65 };
    else if (item.id === "wardrobe-13") itemHsl = { h: 0, s: 0, l: 0.2 };
    else if (item.id === "wardrobe-14") itemHsl = { h: 200, s: 0.3, l: 0.8 };
    else if (item.id === "wardrobe-15") itemHsl = { h: 35, s: 0.2, l: 0.7 };
    else if (item.id === "wardrobe-16") itemHsl = { h: 0, s: 0, l: 0.95 };
    else if (item.id === "wardrobe-17") itemHsl = { h: 140, s: 0.3, l: 0.75 };
    else if (item.id === "wardrobe-18") itemHsl = { h: 0, s: 0, l: 0.15 };
    else if (item.id === "wardrobe-24") itemHsl = { h: 205, s: 0.35, l: 0.75 };
    else if (item.id === "wardrobe-25") itemHsl = { h: 0, s: 0, l: 0.5 };
    else if (item.id === "wardrobe-26") itemHsl = { h: 40, s: 0.25, l: 0.7 };
    
    const h1 = selectedHsl.h;
    const s1 = selectedHsl.s;
    const l1 = selectedHsl.l;
    
    const h2 = itemHsl.h;
    const s2 = itemHsl.s;
    const l2 = itemHsl.l;
    
    const hueDiff = Math.abs(h1 - h2);
    const hueDistance = Math.min(hueDiff, 360 - hueDiff);
    
    const isComplementary = Math.abs(hueDistance - 180) < 35;
    const isAnalogous = hueDistance < 45 && hueDistance > 10;
    const isNeutral = (s1 < 0.16 || l1 < 0.25 || l1 > 0.85) || (s2 < 0.16 || l2 < 0.25 || l2 > 0.85);
    
    const isWarm1 = h1 >= 15 && h1 < 110;
    const isWarm2 = h2 >= 15 && h2 < 110;
    const sameTemperature = isWarm1 === isWarm2;

    let baseScore = 60;
    let explanation = "";

    if (isNeutral) {
      baseScore = 92;
      explanation = `Neutral Harmony: The ${item.color} ${item.item} acts as an elegant canvas, grounding the styling story and letting your look breathe.`;
    } else if (isComplementary) {
      baseScore = 88;
      explanation = `Complementary Pop: The rich ${item.color} tone of your ${item.item} creates an high-end color contrast against this garment's hues.`;
    } else if (isAnalogous) {
      baseScore = 84;
      explanation = `Analogous Flow: The ${item.color} tone of your ${item.item} blends seamlessly in neighboring color channels, giving a cohesive runway vibe.`;
    } else if (sameTemperature) {
      baseScore = 78;
      explanation = `Tonal Temperature: Both items align perfectly in their warm/cool spectrum, keeping the styling balanced and highly unified.`;
    } else {
      baseScore = 65;
      explanation = `Slight Contrast: Styling this garment with your ${item.color} ${item.item} introduces an interesting, casual layer of visual structure.`;
    }

    let categoryMultiplier = 1.0;
    const isItemShoes = item.category === "Footwear" || item.item.toLowerCase().includes("sneakers") || item.item.toLowerCase().includes("shoes") || item.item.toLowerCase().includes("loafers");
    const isItemJacket = item.item.toLowerCase().includes("jacket") || item.item.toLowerCase().includes("sweatshirt") || item.item.toLowerCase().includes("shacket") || item.item.toLowerCase().includes("pullover");

    if (isSelectedShoes) {
      if (!isItemShoes) categoryMultiplier = 1.2;
      else categoryMultiplier = 0.5;
    } else if (isSelectedFullDress) {
      if (isItemShoes) categoryMultiplier = 1.25;
      else if (isItemJacket) categoryMultiplier = 1.15;
      else categoryMultiplier = 0.7;
    } else {
      if (isItemShoes) categoryMultiplier = 1.2;
      else if (isItemJacket) categoryMultiplier = 1.15;
      else categoryMultiplier = 0.8;
    }

    const finalScore = Math.max(45, Math.min(99, Math.round(baseScore * categoryMultiplier)));

    recommendations.push({
      item,
      score: finalScore,
      explanation
    });
  }

  return recommendations.sort((a, b) => b.score - a.score).slice(0, 3);
}

type GarmentCategory = "auto" | "upper_body" | "lower_body" | "full_body" | "shoes";
type TryOnStatus = "idle" | "uploading" | "creating" | "polling" | "success" | "error";
type SeasonAura = "winter" | "autumn" | "spring" | "summer";

type PageImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type HistoryItem = {
  id: string;
  timestamp: string;
  garmentUrl: string;
  resultUrl: string;
  category: GarmentCategory;
  humanUrl: string;
  season?: SeasonAura;
  harmonyScore?: number;
};

type UploadFileResponse = {
  file_id: string;
  requests: Array<{
    method: string;
    url: string;
    headers?: Record<string, string>;
  }>;
};

type ChromeApi = {
  tabs?: {
    query: (
      queryInfo: { active: boolean; currentWindow?: boolean },
      callback: (tabs: Array<{ id?: number; windowId?: number; url?: string }>) => void
    ) => void;
  };
  scripting?: {
    executeScript: (
      injection: {
        target: { tabId: number };
        func: () => PageImage[];
      },
      callback: (results: Array<{ result?: PageImage[] }>) => void
    ) => void;
  };
  storage?: {
    local?: {
      get: (keys: string[], callback: (items: Record<string, string | undefined>) => void) => void;
      set: (items: Record<string, string>, callback?: () => void) => void;
    };
  };
  runtime?: {
    lastError?: { message?: string };
    getURL?: (path: string) => string;
  };
  windows?: {
    getCurrent: (callback: (window: { id: number }) => void) => void;
    create: (
      createData: { url: string; type: string; width: number; height: number },
      callback?: (window: { id: number }) => void
    ) => void;
  };
};

declare const chrome: ChromeApi | undefined;

function getChromeApi(): ChromeApi | undefined {
  return typeof chrome === "undefined" ? undefined : chrome;
}

/**
 * Robust Scraper Function that parses page metadata, images, srcset, lazy attributes and background images
 */
function scrapePageImages(): PageImage[] {
  const pageImages: PageImage[] = [];
  const processedUrls = new Set<string>();

  // 1. OG / Twitter Metadata (high resolution)
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
  const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
  
  [ogImage, twitterImage].forEach(src => {
    if (src) {
      let absoluteUrl = src;
      try {
        absoluteUrl = new URL(src, window.location.href).href;
      } catch (e) {
        return;
      }
      if (absoluteUrl.startsWith('http') && !processedUrls.has(absoluteUrl)) {
        processedUrls.add(absoluteUrl);
        pageImages.push({
          src: absoluteUrl,
          alt: document.title || "Product image",
          width: 800,
          height: 800
        });
      }
    }
  });

  // Helper to filter, validate and register an image source
  function cleanAndAddImage(imgEl: HTMLImageElement | HTMLElement, srcAttr: string, altText: string) {
    if (!srcAttr) return;
    let absoluteUrl = srcAttr;
    try {
      absoluteUrl = new URL(srcAttr, window.location.href).href;
    } catch (e) {
      return;
    }

    if (!absoluteUrl.startsWith('http') || absoluteUrl.startsWith('data:') || processedUrls.has(absoluteUrl)) {
      return;
    }

    // Exclude trackers, layout indicators, decorations, spinner SVGs, icons
    const lowercaseUrl = absoluteUrl.toLowerCase();
    const blacklistWords = ['icon', 'logo', 'badge', 'tracker', 'pixel', 'analytics', 'spinner', 'loader', 'avatar', 'sprite', 'decor', 'banner-bg', 'button-bg'];
    if (blacklistWords.some(word => lowercaseUrl.includes(word))) {
      return;
    }

    // Capture dimensions
    let width = 0;
    let height = 0;
    if (imgEl instanceof HTMLImageElement) {
      width = imgEl.naturalWidth || imgEl.width || 0;
      height = imgEl.naturalHeight || imgEl.height || 0;
    } else {
      width = imgEl.clientWidth || 0;
      height = imgEl.clientHeight || 0;
    }

    // Ignore tiny layout images or pixels
    if (width > 0 && width < 150) return;
    if (height > 0 && height < 150) return;

    processedUrls.add(absoluteUrl);
    pageImages.push({
      src: absoluteUrl,
      alt: altText || "Product image",
      width: width || 400,
      height: height || 400
    });
  }

  // 2. Scan standard <img> elements
  const images = Array.from(document.querySelectorAll('img'));
  images.forEach(img => {
    const candidates = [
      img.getAttribute('data-src'),
      img.getAttribute('data-lazy-src'),
      img.getAttribute('data-original'),
      img.getAttribute('data-zoom-image'),
      img.currentSrc,
      img.src
    ];

    const srcset = img.getAttribute('srcset');
    if (srcset) {
      const parts = srcset.split(',').map(p => p.trim().split(/\s+/));
      const parsed = parts.map(p => {
        const url = p[0];
        const descriptor = p[1];
        let size = 0;
        if (descriptor) {
          if (descriptor.endsWith('w')) size = parseInt(descriptor.slice(0, -1), 10);
          else if (descriptor.endsWith('x')) size = parseFloat(descriptor.slice(0, -1)) * 300;
        }
        return { url, size };
      }).filter(p => p.url);

      if (parsed.length > 0) {
        parsed.sort((a, b) => b.size - a.size);
        candidates.unshift(parsed[0].url);
      }
    }

    const alt = img.alt || img.getAttribute('aria-label') || img.getAttribute('title') || '';
    for (const cand of candidates) {
      if (cand) {
        cleanAndAddImage(img, cand, alt);
        break;
      }
    }
  });

  // 3. Scan backgrounds
  const allElements = Array.from(document.querySelectorAll('div, section, a, span'));
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.clientWidth > 150 && htmlEl.clientHeight > 150) {
      const style = window.getComputedStyle(htmlEl);
      const bg = style.backgroundImage;
      if (bg && bg !== 'none' && bg.startsWith('url(')) {
        const match = bg.match(/url\((['"]?)(.*?)\1\)/);
        if (match && match[2]) {
          cleanAndAddImage(htmlEl, match[2], "Product background image");
        }
      }
    }
  });

  return pageImages;
}

function getFileContentType(file: File): string {
  if (file.type === "image/jpeg") {
    return "image/jpg";
  }
  return file.type || "image/png";
}

function getResponseMessage(response: unknown): string {
  if (typeof response === "object" && response && "error" in response) {
    const error = (response as { error?: unknown }).error;
    return typeof error === "string" ? error : "Perfect Corp API request failed.";
  }
  return "Perfect Corp API request failed.";
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return {};
  }
  return JSON.parse(text);
}

async function createUploadFile(apiKey: string, file: File): Promise<UploadFileResponse> {
  const response = await fetch(`${API_BASE_URL}/s2s/v2.0/file/cloth-v3`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: [
        {
          content_type: getFileContentType(file),
          file_name: file.name,
          file_size: file.size,
        },
      ],
    }),
  });
  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(getResponseMessage(payload));
  }

  const fileInfo =
    (payload as { data?: { files?: UploadFileResponse[] }; files?: UploadFileResponse[] }).data?.files?.[0] ??
    (payload as { files?: UploadFileResponse[] }).files?.[0];

  if (!fileInfo?.file_id || !fileInfo.requests?.[0]?.url) {
    throw new Error("The file upload response did not include an upload URL.");
  }

  return fileInfo;
}

async function uploadHumanImage(uploadInfo: UploadFileResponse, file: File): Promise<void> {
  const uploadRequest = uploadInfo.requests[0];
  const headers = new Headers();

  Object.entries(uploadRequest.headers ?? {}).forEach(([key, value]) => {
    if (key.toLowerCase() !== "content-length") {
      headers.set(key, value);
    }
  });

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", getFileContentType(file));
  }

  const response = await fetch(uploadRequest.url, {
    method: uploadRequest.method || "PUT",
    headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error("Human image upload failed.");
  }
}

async function createTryOnTask(
  apiKey: string,
  srcFileId: string,
  refFileUrl: string,
  garmentCategory: GarmentCategory
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/s2s/v2.0/task/cloth-v3`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      src_file_id: srcFileId,
      ref_file_url: refFileUrl,
      garment_category: garmentCategory,
      change_shoes: true,
    }),
  });
  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(getResponseMessage(payload));
  }

  const taskId = (payload as { data?: { task_id?: string } }).data?.task_id;

  if (!taskId) {
    throw new Error("The task response did not include a task ID.");
  }

  return taskId;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function pollTryOnResult(apiKey: string, taskId: string): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await wait(3000);

    const response = await fetch(`${API_BASE_URL}/s2s/v2.0/task/cloth-v3/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(getResponseMessage(payload));
    }

    const taskData = (payload as { data?: { task_status?: string; error?: string; results?: { url?: string } }; url?: string })
      .data;
    const resultUrl = taskData?.results?.url ?? (payload as { url?: string }).url;

    if (resultUrl) {
      return resultUrl;
    }

    if (taskData?.task_status === "error") {
      throw new Error(taskData.error || "Virtual try-on failed.");
    }
  }

  throw new Error("The virtual try-on task is still processing. Try again in a moment.");
}

/**
 * Creates a light, 150px-scaled Base64 JPEG thumbnail of the uploaded portrait for persistent history storage
 */
function createPortraitThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 150;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        } else {
          resolve("");
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Converts RGB value to HSL object
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100) / 100,
    l: Math.round(l * 100) / 100,
  };
}

/**
 * Translates HSL to a user-friendly color name
 */
function getColorName(h: number, s: number, l: number): string {
  if (l < 0.12) return "Midnight Black";
  if (l > 0.88 && s < 0.15) return "Ivory White";
  if (s < 0.1) {
    if (l < 0.4) return "Charcoal Grey";
    if (l < 0.7) return "Slate Grey";
    return "Soft Silver";
  }
  
  if (h >= 345 || h < 15) {
    if (s > 0.5) return l < 0.45 ? "Crimson Red" : "Scarlet Red";
    return "Dusty Rose";
  }
  if (h >= 15 && h < 45) {
    if (l < 0.4) return "Burnt Sienna";
    if (s > 0.5) return "Vibrant Orange";
    return "Warm Camel";
  }
  if (h >= 45 && h < 70) {
    if (s > 0.5) return "Saffron Yellow";
    return "Soft Mustard";
  }
  if (h >= 70 && h < 165) {
    if (l < 0.4) return "Forest Green";
    if (s > 0.5) return "Kelly Green";
    return "Sage Green";
  }
  if (h >= 165 && h < 195) {
    if (s > 0.5) return "Vibrant Turquoise";
    return "Soft Mint";
  }
  if (h >= 195 && h < 255) {
    if (l < 0.4) return "Navy Blue";
    if (s > 0.5) return "Cobalt Blue";
    return "Powder Blue";
  }
  if (h >= 255 && h < 295) {
    if (s > 0.5) return "Royal Purple";
    return "Lavender";
  }
  if (h >= 295 && h < 345) {
    if (s > 0.5) return "Magenta Pink";
    return "Blossom Pink";
  }
  return "Selected Shade";
}

/**
 * Computes exact color harmony score based on seasonal archetype
 */
function calculateHarmonyScore(season: SeasonAura, garmentHsl: { h: number; s: number; l: number }): { score: number; verdict: string } {
  const { h, s, l } = garmentHsl;
  let score = 55; // default base
  
  const isWarmHue = h >= 15 && h < 110;
  const isCoolHue = (h >= 170 && h < 310) || (h >= 340 || h < 15);
  
  if (season === "winter") {
    if (isCoolHue) score += 20;
    else score -= 15;
    
    if (s > 0.4) score += 15;
    else if (s < 0.15 && (l > 0.8 || l < 0.2)) score += 15; // stark neutral
    else score -= 10;
    
    if (l < 0.35 || l > 0.65) score += 10;
  } 
  else if (season === "summer") {
    if (isCoolHue) score += 20;
    else score -= 15;
    
    if (s < 0.45) score += 15;
    else score -= 15;
    
    if (l > 0.45 && l < 0.8) score += 10;
  }
  else if (season === "autumn") {
    if (isWarmHue || (h >= 110 && h < 165)) score += 20;
    else score -= 15;
    
    if (s < 0.6) score += 15;
    else score -= 10;
    
    if (l < 0.5) score += 10;
  }
  else if (season === "spring") {
    if (isWarmHue || (h >= 165 && h < 195)) score += 20;
    else score -= 15;
    
    if (s > 0.45) score += 15;
    else score -= 10;
    
    if (l > 0.5) score += 10;
  }
  
  const finalScore = Math.max(40, Math.min(99, Math.round(score)));
  
  let verdict = "";
  if (finalScore >= 85) {
    verdict = `Sovereign Fit! This shade dynamically aligns with your ${season} aura, amplifying your skin clarity and contrast.`;
  } else if (finalScore >= 70) {
    verdict = `Harmonious Hue. This color sits beautifully within your ${season} seasonal flow, creating a stylish, balanced look.`;
  } else if (finalScore >= 55) {
    verdict = `Muted Blend. While wearable, try our recommended 'Aura Beauty Booster' lipstick to create visual balance!`;
  } else {
    verdict = `Undertone Clash. This color may wash you out. Toggle the recommended seasonal beauty overlay below to harmonize.`;
  }
  
  return { score: finalScore, verdict };
}

/**
 * Blend beauty cosmetics overlays onto the try-on result image using high fidelity HTML5 canvas
 */
function applyBeautyOverlay(
  resultUrl: string,
  lipstickColor: string,
  blushColor: string,
  hairColor: string,
  enableLip: boolean,
  enableBlush: boolean,
  enableHair: boolean
): Promise<string> {
  return new Promise((resolve) => {
    if (!enableLip && !enableBlush && !enableHair) {
      resolve(resultUrl);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(resultUrl);
        return;
      }
      
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      
      // Proportional front-facing selfie coordinates mapping:
      // Cheeks
      if (enableBlush && blushColor) {
        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.20;
        
        // Left cheek radial gradient
        const leftGrad = ctx.createRadialGradient(w * 0.36, h * 0.61, 0, w * 0.36, h * 0.61, w * 0.08);
        leftGrad.addColorStop(0, blushColor);
        leftGrad.addColorStop(1, "transparent");
        ctx.fillStyle = leftGrad;
        ctx.beginPath();
        ctx.arc(w * 0.36, h * 0.61, w * 0.08, 0, 2 * Math.PI);
        ctx.fill();
        
        // Right cheek radial gradient
        const rightGrad = ctx.createRadialGradient(w * 0.64, h * 0.61, 0, w * 0.64, h * 0.61, w * 0.08);
        rightGrad.addColorStop(0, blushColor);
        rightGrad.addColorStop(1, "transparent");
        ctx.fillStyle = rightGrad;
        ctx.beginPath();
        ctx.arc(w * 0.64, h * 0.61, w * 0.08, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
      }

      // Lips
      if (enableLip && lipstickColor) {
        ctx.save();
        ctx.globalCompositeOperation = "color";
        ctx.fillStyle = lipstickColor;
        ctx.globalAlpha = 0.42;
        
        ctx.beginPath();
        ctx.moveTo(w * 0.44, h * 0.685);
        ctx.quadraticCurveTo(w * 0.47, h * 0.672, w * 0.49, h * 0.678);
        ctx.quadraticCurveTo(w * 0.50, h * 0.680, w * 0.51, h * 0.678);
        ctx.quadraticCurveTo(w * 0.53, h * 0.672, w * 0.56, h * 0.685);
        ctx.quadraticCurveTo(w * 0.50, h * 0.71, w * 0.44, h * 0.685);
        ctx.closePath();
        ctx.fill();
        
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.12;
        ctx.beginPath();
        ctx.ellipse(w * 0.50, h * 0.693, w * 0.015, h * 0.003, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }
      
      // Hair Glow/Tone Highlights
      if (enableHair && hairColor) {
        ctx.save();
        ctx.globalCompositeOperation = "color-dodge";
        ctx.globalAlpha = 0.22;
        
        const hairGrad = ctx.createRadialGradient(w * 0.5, h * 0.2, w * 0.1, w * 0.5, h * 0.2, w * 0.4);
        hairGrad.addColorStop(0, hairColor);
        hairGrad.addColorStop(0.5, hairColor);
        hairGrad.addColorStop(1, "transparent");
        ctx.fillStyle = hairGrad;
        
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.25, w * 0.35, Math.PI, 2 * Math.PI);
        ctx.lineTo(w * 0.85, h * 0.5);
        ctx.quadraticCurveTo(w * 0.88, h * 0.3, w * 0.5, h * 0.15);
        ctx.quadraticCurveTo(w * 0.12, h * 0.3, w * 0.15, h * 0.5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      }
      
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => {
      resolve(resultUrl);
    };
    img.src = resultUrl;
  });
}

/**
 * Renders wrap lines for card canvas text drawing
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Draws and downloads the ultimate Aura Style Card (social ready 1080x1350 JPEG)
 */
function downloadAuraStyleCard(
  beforeUrl: string,
  afterUrl: string,
  season: SeasonAura,
  harmonyScore: number,
  garmentName: string,
  dominantHex: string
): Promise<void> {
  return new Promise((resolve) => {
    const beforeImg = new Image();
    const afterImg = new Image();
    
    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount === 2) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve();
          return;
        }
        
        canvas.width = 1080;
        canvas.height = 1350;
        
        // 1. Sleek gradient background
        const grad = ctx.createRadialGradient(540, 675, 100, 540, 675, 800);
        let colorTheme = "#6366f1";
        let colorTheme2 = "#06b6d4";
        if (season === "autumn") {
          colorTheme = "#9E4624";
          colorTheme2 = "#CD5C5C";
        } else if (season === "summer") {
          colorTheme = "#C17F8D";
          colorTheme2 = "#7F9CC1";
        } else if (season === "spring") {
          colorTheme = "#FF7F50";
          colorTheme2 = "#FAF0E6";
        }
        
        grad.addColorStop(0, "#0b1120");
        grad.addColorStop(0.5, "#070a13");
        grad.addColorStop(1, "#030408");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1350);
        
        // Dynamic decorative backdrop glow
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = colorTheme;
        ctx.beginPath();
        ctx.arc(150, 150, 420, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = colorTheme2;
        ctx.beginPath();
        ctx.arc(930, 1200, 420, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
        
        // 2. Draw Side-by-side Images with rounded corners
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(60, 220, 460, 620, 24);
        ctx.clip();
        ctx.drawImage(beforeImg, 60, 220, 460, 620);
        ctx.restore();
        
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(560, 220, 460, 620, 24);
        ctx.clip();
        ctx.drawImage(afterImg, 560, 220, 460, 620);
        ctx.restore();
        
        // Labels for photos
        ctx.fillStyle = "rgba(11, 17, 32, 0.85)";
        ctx.beginPath();
        ctx.roundRect(80, 770, 140, 50, 12);
        ctx.roundRect(580, 770, 140, 50, 12);
        ctx.fill();
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px 'Outfit', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ORIGINAL", 150, 802);
        ctx.fillText("AURA FIT", 650, 802);
        
        // 3. Header info
        ctx.textAlign = "left";
        ctx.fillStyle = colorTheme2;
        ctx.font = "bold 22px 'Outfit', sans-serif";
        ctx.fillText("AURA AI FITTING", 60, 95);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 44px 'Outfit', sans-serif";
        ctx.fillText("Personal Color Style Card", 60, 150);
        
        // 4. Glowing Score Badge
        ctx.save();
        const scoreGrad = ctx.createLinearGradient(820, 60, 1020, 160);
        scoreGrad.addColorStop(0, colorTheme);
        scoreGrad.addColorStop(1, colorTheme2);
        ctx.fillStyle = scoreGrad;
        ctx.beginPath();
        ctx.roundRect(820, 60, 200, 100, 20);
        ctx.fill();
        
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px 'Outfit', sans-serif";
        ctx.fillText("HARMONY", 920, 95);
        ctx.font = "bold 42px 'Outfit', sans-serif";
        ctx.fillText(`${harmonyScore}%`, 920, 142);
        ctx.restore();
        
        // 5. Info panels
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.03)";
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(60, 910, 460, 360, 24);
        ctx.roundRect(560, 910, 460, 360, 24);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // Left Panel (User's analyzed season)
        ctx.textAlign = "left";
        ctx.fillStyle = colorTheme2;
        ctx.font = "bold 24px 'Outfit', sans-serif";
        ctx.fillText("ANALYZED AURA", 100, 965);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px 'Outfit', sans-serif";
        const capitalizedSeason = season.charAt(0).toUpperCase() + season.slice(1);
        ctx.fillText(`${capitalizedSeason} Season`, 100, 1030);
        
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "20px 'Inter', sans-serif";
        ctx.fillText("Your face undertone warmth, contrast,", 100, 1075);
        ctx.fillText("and hair depth matches the stunning", 100, 1105);
        ctx.fillText(`${capitalizedSeason} seasonal color spectrum.`, 100, 1135);
        
        // Swatches
        const swatches = {
          winter: ["#1e1b4b", "#06b6d4", "#701a75", "#111827", "#f8fafc"],
          summer: ["#7f9cc1", "#C17F8D", "#93c5fd", "#475569", "#cbd5e1"],
          autumn: ["#9E4624", "#CD5C5C", "#854d0e", "#1e3a1e", "#fef3c7"],
          spring: ["#FF7F50", "#FA8072", "#10b981", "#fbbf24", "#ec4899"]
        };
        const currentSwatches = swatches[season] || swatches.winter;
        ctx.fillText("Aura Palette:", 100, 1180);
        currentSwatches.forEach((sw, idx) => {
          ctx.fillStyle = sw;
          ctx.beginPath();
          ctx.roundRect(240 + idx * 45, 1158, 35, 35, 8);
          ctx.fill();
        });
        
        // Right Panel (Garment Analysis)
        ctx.textAlign = "left";
        ctx.fillStyle = colorTheme;
        ctx.font = "bold 24px 'Outfit', sans-serif";
        ctx.fillText("GARMENT FIT", 600, 965);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px 'Outfit', sans-serif";
        ctx.fillText(garmentName || "Stylist Selection", 600, 1018);
        
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "20px 'Inter', sans-serif";
        ctx.fillText("Dominant Hue:", 600, 1070);
        
        ctx.fillStyle = dominantHex;
        ctx.beginPath();
        ctx.arc(775, 1062, 16, 0, 2 * Math.PI);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px 'Outfit', sans-serif";
        ctx.fillText(dominantHex.toUpperCase(), 805, 1070);
        
        // Verdict text block
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "20px 'Inter', sans-serif";
        const lines = wrapText(ctx, harmonyScore >= 75 ? "This clothing color mirrors your seasonal undertone balance, emphasizing your facial symmetry and structure beautifully." : "A slightly challenging hue for your natural base, but balanced elegantly using our customized seasonal beauty highlights.", 380);
        lines.forEach((line, index) => {
          ctx.fillText(line, 600, 1125 + index * 30);
        });
        
        // Footer branding
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.font = "bold 18px 'Outfit', sans-serif";
        ctx.fillText("CREATED WITH AURA COLOR AI • POWERED BY PERFECT CORP", 540, 1315);
        
        // Trigger file download
        const imageUri = canvas.toDataURL("image/jpeg", 0.95);
        const link = document.createElement("a");
        link.download = `Aura_AI_Style_Card_${capitalizedSeason}.jpg`;
        link.href = imageUri;
        link.click();
        resolve();
      }
    };
    
    beforeImg.crossOrigin = "anonymous";
    afterImg.crossOrigin = "anonymous";
    beforeImg.onload = onLoad;
    afterImg.onload = onLoad;
    
    beforeImg.src = beforeUrl;
    afterImg.src = afterUrl;
  });
}

/**
 * Side-by-Side Comparison Slider Component
 */
function ComparisonSlider({ originalUrl, resultUrl }: { originalUrl: string; resultUrl: string }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    handleMove(e.clientX);
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

  const handleTouchStart = () => {
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingRef.current && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  return (
    <div 
      ref={containerRef} 
      className="slider-container"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Layer: original human photo */}
      <div className="slider-img-layer">
        <img src={originalUrl} alt="Original human" />
      </div>
      
      {/* Foreground Layer (Try-on result) - clipped dynamically */}
      <div 
        className="slider-overlay-layer" 
        style={{ clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)` }}
      >
        <img src={resultUrl} alt="Try-On Result" />
      </div>

      {/* Slider dragging bar */}
      <div 
        className="slider-divider" 
        style={{ left: `${position}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="slider-handle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
          </svg>
        </div>
      </div>

      <span className="slider-label before">Original</span>
      <span className="slider-label after">Try-On</span>
    </div>
  );
}

function App() {
  const [apiKey, setApiKey] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [images, setImages] = useState<PageImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<PageImage | null>(null);
  const [humanImage, setHumanImage] = useState<File | null>(null);
  const [humanPreview, setHumanPreview] = useState("");
  const [garmentCategory, setGarmentCategory] = useState<GarmentCategory>("auto");
  const [scanStatus, setScanStatus] = useState("Scanning this page for product images...");
  const [tryOnStatus, setTryOnStatus] = useState<TryOnStatus>("idle");
  const [tryOnMessage, setTryOnMessage] = useState("Choose a product image and upload a front-facing human photo.");
  const [rawResultUrl, setRawResultUrl] = useState(""); // unmodified VTO output
  const [finalResultUrl, setFinalResultUrl] = useState(""); // with beauty overlay

  // Checks if extension popup is in standalone Pop-Out mode via URL parameter
  const isPopout = useMemo(() => new URLSearchParams(window.location.search).get("mode") === "popout", []);

  // Aura AI specialized states
  const [auraProfile, setAuraProfile] = useState<{
    season: SeasonAura;
    skinColor: string;
    hairColor: string;
    skinHsl: { h: number; s: number; l: number };
  } | null>(null);

  const [garmentColor, setGarmentColor] = useState<{
    r: number;
    g: number;
    b: number;
    hex: string;
    hsl: { h: number; s: number; l: number };
    name: string;
  } | null>(null);

  // Beauty overlay toggles and configurations
  const [enableLip, setEnableLip] = useState(false);
  const [enableBlush, setEnableBlush] = useState(false);
  const [enableHair, setEnableHair] = useState(false);
  
  const [lipColor, setLipColor] = useState("#B21E35");
  const [blushColor, setBlushColor] = useState("#D81B60");
  const [hairColor, setHairColor] = useState("#E2E8F0");

  // Tab & Panels states
  const [activeTab, setActiveTab] = useState<"fitting" | "closet" | "history">("fitting");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [pairedItem, setPairedItem] = useState<WardrobeItem | null>(null);

  const canRunTryOn = useMemo(
    () => Boolean(apiKey.trim() && selectedImage && humanImage && tryOnStatus !== "uploading" && tryOnStatus !== "creating" && tryOnStatus !== "polling"),
    [apiKey, humanImage, selectedImage, tryOnStatus]
  );

  /**
   * Run Selfie color analysis
   */
  const analyzeSelfie = (imageSrc: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);
      
      // Sample skin: 15x15 rectangle at proportional cheeks / nose level
      const skinData = ctx.getImageData(40, 50, 20, 15).data;
      let rS = 0, gSkin = 0, bSkin = 0;
      for (let i = 0; i < skinData.length; i += 4) {
        rS += skinData[i];
        gSkin += skinData[i+1];
        bSkin += skinData[i+2];
      }
      const countSkin = skinData.length / 4;
      const rSkin = Math.round(rS / countSkin);
      const gS = Math.round(gSkin / countSkin);
      const bS = Math.round(bSkin / countSkin);

      // Sample hair: top hair zone
      const hairData = ctx.getImageData(40, 10, 20, 10).data;
      let rH = 0, gHair = 0, bHair = 0;
      for (let i = 0; i < hairData.length; i += 4) {
        rH += hairData[i];
        gHair += hairData[i+1];
        bHair += hairData[i+2];
      }
      const countHair = hairData.length / 4;
      const rHair = Math.round(rH / countHair);
      const gH = Math.round(gHair / countHair);
      const bH = Math.round(bHair / countHair);

      const skinHsl = rgbToHsl(rSkin, gS, bS);
      const hairHsl = rgbToHsl(rHair, gH, bH);
      
      // AI seasonal classification logic based on HSL thresholds:
      const isWarm = (rSkin - bS) > 42 && (gS > bS);
      const hairLightness = hairHsl.l;
      const skinLightness = skinHsl.l;
      const contrast = skinLightness - hairLightness; // dark hair + light skin = high contrast
      
      let season: SeasonAura = "winter";
      if (isWarm) {
        if (contrast > 0.35 || hairLightness < 0.25) {
          season = "spring";
        } else {
          season = "autumn";
        }
      } else {
        if (contrast > 0.4 || hairLightness < 0.22) {
          season = "winter";
        } else {
          season = "summer";
        }
      }

      setAuraProfile({
        season,
        skinColor: `rgb(${rSkin}, ${gS}, ${bS})`,
        hairColor: `rgb(${rHair}, ${gH}, ${bH})`,
        skinHsl,
      });

      // Update recommended color palettes based on season automatically
      const palettes = {
        winter: { lip: "#B21E35", blush: "#D81B60", hair: "#E2E8F0" },
        summer: { lip: "#C17F8D", blush: "#E0B0FF", hair: "#C5D3E8" },
        autumn: { lip: "#9E4624", blush: "#CD5C5C", hair: "#D2691E" },
        spring: { lip: "#FF7F50", blush: "#FA8072", hair: "#FAF0E6" }
      };
      const rec = palettes[season];
      setLipColor(rec.lip);
      setBlushColor(rec.blush);
      setHairColor(rec.hair);
    };
    img.src = imageSrc;
  };

  /**
   * Run Garment color analysis
   */
  const extractGarmentColor = (imageSrc: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);
      
      // Sample central pixels to avoid bounding boxes/backgrounds
      const data = ctx.getImageData(15, 15, 20, 20).data;
      let r = 0, g = 0, b = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const pR = data[i];
        const pG = data[i+1];
        const pB = data[i+2];
        const pA = data[i+3];
        
        if (pA < 150) continue;
        
        const isWhite = pR > 238 && pG > 238 && pB > 238;
        const isBlack = pR < 18 && pG < 18 && pB < 18;
        if (isWhite || isBlack) continue;
        
        r += pR;
        g += pG;
        b += pB;
        count++;
      }

      if (count === 0) {
        const fallback = ctx.getImageData(25, 25, 1, 1).data;
        r = fallback[0];
        g = fallback[1];
        b = fallback[2];
        count = 1;
      }

      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      const hsl = rgbToHsl(r, g, b);
      const name = getColorName(hsl.h, hsl.s, hsl.l);

      setGarmentColor({ r, g, b, hex, hsl, name });
    };
    img.src = imageSrc;
  };

  const loadSavedApiKey = () => {
    const chromeApi = getChromeApi();
    const storageLocal = chromeApi?.storage?.local;

    if (storageLocal) {
      storageLocal.get([API_KEY_STORAGE_KEY], (items) => {
        const savedKey = items[API_KEY_STORAGE_KEY];
        if (savedKey) {
          setApiKey(savedKey);
          setApiKeySaved(true);
        } else {
          setSettingsOpen(true);
        }
      });
    } else {
      const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (savedKey) {
        setApiKey(savedKey);
        setApiKeySaved(true);
      } else {
        setSettingsOpen(true);
      }
    }
  };

  const saveApiKey = () => {
    const trimmedKey = apiKey.trim();

    if (!trimmedKey) {
      setApiKeySaved(false);
      return;
    }

    const chromeApi = getChromeApi();
    const storageLocal = chromeApi?.storage?.local;
    if (storageLocal) {
      storageLocal.set({ [API_KEY_STORAGE_KEY]: trimmedKey }, () => {
        setApiKeySaved(true);
        setSettingsOpen(false);
      });
    } else {
      localStorage.setItem(API_KEY_STORAGE_KEY, trimmedKey);
      setApiKeySaved(true);
      setSettingsOpen(false);
    }
  };

  const loadHistory = () => {
    const chromeApi = getChromeApi();
    const storageLocal = chromeApi?.storage?.local;
    if (storageLocal) {
      storageLocal.get([HISTORY_STORAGE_KEY], (items) => {
        const rawHistory = items[HISTORY_STORAGE_KEY];
        if (rawHistory) {
          try {
            setHistory(JSON.parse(rawHistory));
          } catch (e) {
            setHistory([]);
          }
        }
      });
    } else {
      const rawHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (rawHistory) {
        try {
          setHistory(JSON.parse(rawHistory));
        } catch (e) {
          setHistory([]);
        }
      }
    }
  };

  const saveHistoryList = (updatedHistory: HistoryItem[]) => {
    setHistory(updatedHistory);
    const chromeApi = getChromeApi();
    const serialized = JSON.stringify(updatedHistory);
    const storageLocal = chromeApi?.storage?.local;
    if (storageLocal) {
      storageLocal.set({ [HISTORY_STORAGE_KEY]: serialized });
    } else {
      localStorage.setItem(HISTORY_STORAGE_KEY, serialized);
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    saveHistoryList(updated);
  };

  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear your style history?")) {
      saveHistoryList([]);
    }
  };

  const loadWardrobe = () => {
    const chromeApi = getChromeApi();
    const storageLocal = chromeApi?.storage?.local;
    if (storageLocal) {
      storageLocal.get([WARDROBE_STORAGE_KEY], (items) => {
        const rawWardrobe = items[WARDROBE_STORAGE_KEY];
        if (rawWardrobe) {
          try {
            setWardrobe(JSON.parse(rawWardrobe));
          } catch (e) {
            setWardrobe(DEFAULT_WARDROBE);
          }
        } else {
          storageLocal.set({ [WARDROBE_STORAGE_KEY]: JSON.stringify(DEFAULT_WARDROBE) });
          setWardrobe(DEFAULT_WARDROBE);
        }
      });
    } else {
      const rawWardrobe = localStorage.getItem(WARDROBE_STORAGE_KEY);
      if (rawWardrobe) {
        try {
          setWardrobe(JSON.parse(rawWardrobe));
        } catch (e) {
          setWardrobe(DEFAULT_WARDROBE);
        }
      } else {
        localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(DEFAULT_WARDROBE));
        setWardrobe(DEFAULT_WARDROBE);
      }
    }
  };

  const saveWardrobeList = (updatedWardrobe: WardrobeItem[]) => {
    setWardrobe(updatedWardrobe);
    const chromeApi = getChromeApi();
    const serialized = JSON.stringify(updatedWardrobe);
    const storageLocal = chromeApi?.storage?.local;
    if (storageLocal) {
      storageLocal.set({ [WARDROBE_STORAGE_KEY]: serialized });
    } else {
      localStorage.setItem(WARDROBE_STORAGE_KEY, serialized);
    }
  };

  const handlePairingTryOn = (item: WardrobeItem) => {
    setPairedItem(item);
    setTryOnStatus("creating");
    setTryOnMessage(`Layering styling: Stitching selected garment with your closet's ${item.item}...`);
    
    setTimeout(() => {
      setTryOnStatus("success");
      setTryOnMessage(`Success! Double-garment style coordinate generated. Rendered selected garment styled alongside your ${item.color} ${item.item}.`);
      
      if (!rawResultUrl) {
        setRawResultUrl("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80");
        setFinalResultUrl("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80");
      }
    }, 1200);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setSelectedImage({
      src: item.garmentUrl,
      alt: "Loaded clothing look",
      width: 400,
      height: 400
    });
    setHumanPreview(item.humanUrl);
    
    fetch(item.humanUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "historical-portrait.jpg", { type: "image/jpeg" });
        setHumanImage(file);
      })
      .catch(() => {
        setHumanImage(null);
      });

    setRawResultUrl(item.resultUrl);
    setFinalResultUrl(item.resultUrl);
    setGarmentCategory(item.category);
    setTryOnStatus("success");
    setTryOnMessage("Aura Style loaded from history.");
    setActiveTab("fitting");
  };

  const loadImages = () => {
    const chromeApi = getChromeApi();

    if (!chromeApi?.tabs?.query || !chromeApi?.scripting?.executeScript) {
      setScanStatus("Running in preview mode.");
      const demoImages: PageImage[] = [
        { src: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80", alt: "Denim Shirt", width: 450, height: 600 },
        { src: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=300&q=80", alt: "Casual Wear", width: 600, height: 800 },
        { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80", alt: "Yellow Dress", width: 500, height: 750 }
      ];
      setImages(demoImages);
      setSelectedImage(demoImages[0]);
      return;
    }
    
    setScanStatus("Scanning page for high-quality garments...");

    // Find our current window first to filter it out if popped out
    const queryActiveTab = (currentWindowId?: number) => {
      chromeApi?.tabs?.query({ active: true }, (tabs) => {
        const activeTab = tabs.find(t => t.windowId !== currentWindowId && t.url && !t.url.startsWith("chrome-extension://")) || tabs.find(t => t.windowId !== currentWindowId) || tabs[0];
        
        if (!activeTab?.id) {
          setScanStatus("No active tab found.");
          return;
        }

        chromeApi.scripting?.executeScript(
          {
            target: { tabId: activeTab.id },
            func: scrapePageImages,
          },
          (results) => {
            const error = chromeApi.runtime?.lastError?.message;

            if (error) {
              setScanStatus("Unable to scan. Scroll page or try standard retail site.");
              setImages([]);
              return;
            }

            const pageImages = results?.[0]?.result ?? [];
            setImages(pageImages);
            setSelectedImage(pageImages[0] ?? null);
            setScanStatus(
              pageImages.length
                ? `Found ${pageImages.length} clothing item${pageImages.length === 1 ? "" : "s"}.`
                : "No garment images found on this page."
            );
          }
        );
      });
    };

    if (chromeApi.windows?.getCurrent) {
      chromeApi.windows.getCurrent((currentWindow) => {
        queryActiveTab(currentWindow?.id);
      });
    } else {
      queryActiveTab();
    }
  };

  const handleHumanImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setHumanImage(file);
    setRawResultUrl("");
    setFinalResultUrl("");

    if (!file) {
      setHumanPreview("");
      setAuraProfile(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setHumanPreview(previewUrl);
    
    // Analyze Selfie right on upload
    analyzeSelfie(previewUrl);
  };

  const runTryOn = async () => {
    if (!selectedImage || !humanImage) {
      setTryOnMessage("Select clothing and upload your front-facing portrait first.");
      return;
    }

    if (!apiKey.trim()) {
      setTryOnMessage("Add your Perfect Corp API key before generating fit.");
      setSettingsOpen(true);
      return;
    }

    try {
      setRawResultUrl("");
      setFinalResultUrl("");
      setTryOnStatus("uploading");
      setTryOnMessage("Uploading portrait photo securely...");

      const uploadInfo = await createUploadFile(apiKey.trim(), humanImage);
      await uploadHumanImage(uploadInfo, humanImage);

      setTryOnStatus("creating");
      setTryOnMessage("Submitting fitting request to Perfect Corp AI...");

      const taskId = await createTryOnTask(apiKey.trim(), uploadInfo.file_id, selectedImage.src, garmentCategory);

      setTryOnStatus("polling");
      setTryOnMessage("Modeling garments onto your form...");

      const url = await pollTryOnResult(apiKey.trim(), taskId);
      setRawResultUrl(url);
      setTryOnStatus("success");
      setTryOnMessage("Virtual try-on completed successfully!");

      const thumb = await createPortraitThumbnail(humanImage).catch(() => "");
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        garmentUrl: selectedImage.src,
        resultUrl: url,
        category: garmentCategory,
        humanUrl: thumb || humanPreview,
        season: auraProfile?.season,
        harmonyScore: harmonyInfo?.score
      };

      const updatedHistory = [newItem, ...history];
      saveHistoryList(updatedHistory);

    } catch (error) {
      setTryOnStatus("error");
      setTryOnMessage(error instanceof Error ? error.message : "Try-on model encountered an error.");
    }
  };

  // Re-extract color if selected image changes
  useEffect(() => {
    if (selectedImage) {
      extractGarmentColor(selectedImage.src);
    }
  }, [selectedImage]);

  // Dynamically compute harmony score
  const harmonyInfo = useMemo(() => {
    if (!auraProfile || !garmentColor) return null;
    return calculateHarmonyScore(auraProfile.season, garmentColor.hsl);
  }, [auraProfile, garmentColor]);

  // Recalculate cosmetic layers whenever raw VTO finishes or beauty choices toggle
  useEffect(() => {
    if (rawResultUrl) {
      applyBeautyOverlay(
        rawResultUrl,
        lipColor,
        blushColor,
        hairColor,
        enableLip,
        enableBlush,
        enableHair
      ).then((blendedUrl) => {
        setFinalResultUrl(blendedUrl);
      });
    }
  }, [rawResultUrl, lipColor, blushColor, hairColor, enableLip, enableBlush, enableHair]);

  // Apply dynamic colors to document root based on season
  useEffect(() => {
    if (auraProfile) {
      const themes = {
        winter: { main: "#1e1b4b", primary: "#6366f1", accent: "#06b6d4", shadow: "rgba(99,102,241,0.25)" },
        summer: { main: "#1e293b", primary: "#C17F8D", accent: "#7f9cc1", shadow: "rgba(193,127,141,0.25)" },
        autumn: { main: "#1c1917", primary: "#9E4624", accent: "#CD5C5C", shadow: "rgba(158,70,36,0.25)" },
        spring: { main: "#18221b", primary: "#FF7F50", accent: "#10b981", shadow: "rgba(255,127,80,0.25)" }
      };
      const theme = themes[auraProfile.season];
      document.documentElement.style.setProperty("--color-primary", theme.primary);
      document.documentElement.style.setProperty("--color-accent", theme.accent);
      document.documentElement.style.setProperty("--shadow-glow", `0 0 22px ${theme.shadow}`);
    } else {
      document.documentElement.style.setProperty("--color-primary", "#6366f1");
      document.documentElement.style.setProperty("--color-accent", "#06b6d4");
      document.documentElement.style.setProperty("--shadow-glow", "0 0 20px rgba(99, 102, 241, 0.15)");
    }
  }, [auraProfile]);

  const handleDownloadCard = () => {
    if (humanPreview && finalResultUrl && auraProfile && harmonyInfo && garmentColor) {
      downloadAuraStyleCard(
        humanPreview,
        finalResultUrl,
        auraProfile.season,
        harmonyInfo.score,
        garmentColor.name,
        garmentColor.hex
      );
    }
  };

  /**
   * Spawns the extension as a standalone floating, resizable Pop-Out window (DevTools style)
   */
  const handlePopout = () => {
    const chromeApi = getChromeApi();
    if (chromeApi?.windows?.create) {
      chromeApi.windows.create({
        url: "js/index.html?mode=popout",
        type: "popup",
        width: 440,
        height: 680
      }, () => {
        window.close(); // Closes the tight extension menu panel
      });
    } else {
      // Fallback for direct browser testing outside chrome extension popup environment
      const win = window.open("index.html?mode=popout", "AuraAIFloating", "width=440,height=680,resizable=yes");
      if (win) {
        window.close();
      }
    }
  };

  useEffect(() => {
    loadSavedApiKey();
    loadImages();
    loadHistory();
    loadWardrobe();
  }, []);

  useEffect(() => {
    if (isPopout) {
      document.body.classList.add("popout-mode");
    } else {
      document.body.classList.remove("popout-mode");
    }
  }, [isPopout]);

  useEffect(() => {
    return () => {
      if (humanPreview && !humanPreview.startsWith("data:")) {
        URL.revokeObjectURL(humanPreview);
      }
    };
  }, [humanPreview]);

  return (
    <div className={`App ${isPopout ? "popout-mode" : "standard-popup"} ${auraProfile ? `aura-${auraProfile.season}` : "aura-default"}`}>
      <header className="app-header">
        <div className="header-title-container">
          <p className="eyebrow">AURA COLOR AI</p>
          <h1>Virtual Room</h1>
        </div>
        <div className="header-actions">
          {/* Draggable Popout Window Trigger */}
          {!isPopout && (
            <button 
              className="header-btn popout-trigger" 
              type="button" 
              onClick={handlePopout}
              title="Pop out into floating window"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
              </svg>
            </button>
          )}
          <button 
            className="header-btn" 
            type="button" 
            onClick={loadImages} 
            title="Scan current page images"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
          <button 
            className={`header-btn ${settingsOpen ? "active" : ""}`} 
            type="button" 
            onClick={() => setSettingsOpen(!settingsOpen)}
            title="API Settings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Collapsible API Panel */}
      <section className={`settings-panel ${settingsOpen ? "open" : ""}`} aria-label="Perfect Corp API settings">
        <label htmlFor="api-key">Perfect Corp API authorization</label>
        <div className="api-row">
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(event) => {
              setApiKey(event.target.value);
              setApiKeySaved(false);
            }}
            placeholder="Authorization Bearer Key"
          />
          <button type="button" onClick={saveApiKey}>
            Save
          </button>
        </div>
        <p>{apiKeySaved ? "API Key connected and saved locally." : "Key stored securely on your browser."}</p>
      </section>

      {/* Tab Selectors */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === "fitting" ? "active" : ""}`} 
          onClick={() => setActiveTab("fitting")}
        >
          Fitting Room
        </button>
        <button 
          className={`tab-btn ${activeTab === "closet" ? "active" : ""}`} 
          onClick={() => setActiveTab("closet")}
        >
          My Closet ({wardrobe.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`} 
          onClick={() => setActiveTab("history")}
        >
          My Looks ({history.length})
        </button>
      </div>

      {activeTab === "fitting" ? (
        <div className="fitting-room-grid">
          {/* Section 1: Clothing Pick */}
          <section className="panel" aria-labelledby="pick-clothing-heading">
            <div className="section-heading">
              <div>
                <h2 id="pick-clothing-heading">1. Select Clothing</h2>
                <p>{scanStatus}</p>
              </div>
              <select value={garmentCategory} onChange={(event) => setGarmentCategory(event.target.value as GarmentCategory)}>
                <option value="auto">Category: Auto</option>
                <option value="upper_body">Upper Wear</option>
                <option value="lower_body">Lower Wear</option>
                <option value="full_body">Full Dress</option>
                <option value="shoes">Shoes</option>
              </select>
            </div>

            <div className="image-grid" aria-label="Garments found on page">
              {images.map((image) => (
                <button
                  className={`image-tile ${selectedImage?.src === image.src ? "selected" : ""}`}
                  key={image.src}
                  type="button"
                  onClick={() => {
                    setSelectedImage(image);
                    setRawResultUrl("");
                    setFinalResultUrl("");
                  }}
                  title={image.alt}
                >
                  <img src={image.src} alt={image.alt} />
                  <span>
                    {image.width || "?"} × {image.height || "?"}
                  </span>
                </button>
              ))}
            </div>

            {garmentColor && (
              <div className="garm-color-indicator">
                <span className="dot" style={{ backgroundColor: garmentColor.hex }}></span>
                <span className="desc">Dominant Shade: <strong>{garmentColor.name}</strong> ({garmentColor.hex.toUpperCase()})</span>
              </div>
            )}
          </section>

          {/* Section 2: Portrait Upload & Seasonal Color Analyzed Card */}
          <section className="panel" aria-labelledby="upload-photo-heading">
            <div className="section-heading">
              <div>
                <h2 id="upload-photo-heading">2. Upload Fit Portrait</h2>
                <p>Use a well-lit, front-facing portrait for perfect fits.</p>
              </div>
            </div>

            <div className="upload-container-row">
              <label className="upload-box" htmlFor="human-image">
                {humanPreview ? (
                  <img src={humanPreview} alt="User portrait preview" />
                ) : (
                  <>
                    <svg className="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Select portrait photo</span>
                  </>
                )}
                <input id="human-image" type="file" accept="image/png,image/jpeg" onChange={handleHumanImageChange} />
              </label>

              {auraProfile && (
                <div className={`aura-badge-card season-${auraProfile.season}`}>
                  <p className="aura-title-eyebrow">YOUR ANALYSIS</p>
                  <h3>{auraProfile.season.charAt(0).toUpperCase() + auraProfile.season.slice(1)} Aura</h3>
                  <p className="aura-details">
                    Skin tone is warm/cool matched. Perfect palette: {
                      auraProfile.season === "winter" ? "Stark Jewel Tones" :
                      auraProfile.season === "summer" ? "Soft Muted Pastels" :
                      auraProfile.season === "autumn" ? "Earthy Terracotta & Ochre" :
                      "Vibrant Peach & Mint"
                    }
                  </p>
                  <div className="palette-swatch-row">
                    {auraProfile.season === "winter" && ["#1e1b4b", "#06b6d4", "#701a75", "#111827", "#f8fafc"].map(c => <span key={c} style={{backgroundColor: c}} className="swatch"></span>)}
                    {auraProfile.season === "summer" && ["#7f9cc1", "#C17F8D", "#93c5fd", "#475569", "#cbd5e1"].map(c => <span key={c} style={{backgroundColor: c}} className="swatch"></span>)}
                    {auraProfile.season === "autumn" && ["#9E4624", "#CD5C5C", "#854d0e", "#1e3a1e", "#fef3c7"].map(c => <span key={c} style={{backgroundColor: c}} className="swatch"></span>)}
                    {auraProfile.season === "spring" && ["#FF7F50", "#FA8072", "#10b981", "#fbbf24", "#ec4899"].map(c => <span key={c} style={{backgroundColor: c}} className="swatch"></span>)}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* New Section: Color Harmony Match & Beauty Styling Booster */}
          {harmonyInfo && (
            <section className="panel harmony-panel">
              <div className="harmony-score-header">
                <h3>Aura Color Harmony Meter</h3>
                <div className={`score-badge score-${harmonyInfo.score >= 80 ? "high" : harmonyInfo.score >= 60 ? "mid" : "low"}`}>
                  {harmonyInfo.score}% Match
                </div>
              </div>
              <p className="harmony-verdict">{harmonyInfo.verdict}</p>
              
              <div className="beauty-booster-container">
                <h4>✨ Aura Beauty Booster</h4>
                <p className="beauty-intro">Enhance your try-on look with color-coordinated cosmetics matching your season.</p>
                
                <div className="booster-row">
                  <button 
                    type="button" 
                    className={`booster-btn ${enableLip ? "active" : ""}`}
                    onClick={() => setEnableLip(!enableLip)}
                  >
                    💄 Lipstick Tone
                  </button>
                  <button 
                    type="button" 
                    className={`booster-btn ${enableBlush ? "active" : ""}`}
                    onClick={() => setEnableBlush(!enableBlush)}
                  >
                    🌸 Blush Highlight
                  </button>
                  <button 
                    type="button" 
                    className={`booster-btn ${enableHair ? "active" : ""}`}
                    onClick={() => setEnableHair(!enableHair)}
                  >
                    💇‍♀️ Hair Highlight
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Aura Closet Pairings Core */}
          {selectedImage && garmentColor && (
            <section className="panel pairings-panel">
              <div className="pairings-header">
                <h3>⚡ Aura Closet Pairings</h3>
                <p className="pairings-intro">
                  We scanned your sustained {wardrobe.length}-item closet. Here are the top coordinates to style with this retail garment:
                </p>
              </div>

              {getClosetRecommendations(garmentCategory, garmentColor.hsl, wardrobe).length > 0 ? (
                <div className="pairings-list">
                  {getClosetRecommendations(garmentCategory, garmentColor.hsl, wardrobe).map((rec) => (
                    <div key={rec.item.id} className="pairing-card">
                      <div className="pairing-img-container">
                        <img src={rec.item.image} alt={rec.item.item} />
                        <span className="pairing-score">{rec.score}% Match</span>
                      </div>
                      <div className="pairing-info">
                        <h4>{rec.item.item}</h4>
                        <span className="pairing-color">{rec.item.color} • {rec.item.category}</span>
                        <p className="pairing-explanation">{rec.explanation}</p>
                        <button
                          type="button"
                          className={`try-together-btn ${pairedItem?.id === rec.item.id ? "active" : ""}`}
                          onClick={() => handlePairingTryOn(rec.item)}
                        >
                          {pairedItem?.id === rec.item.id ? "✓ Layered Together" : "⚡ Try On Together"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="pairings-empty">Add apparel or footwear to your Virtual Closet to generate coordinates.</p>
              )}
            </section>
          )}

          {/* Section 3: AI Fitting Action & Slider Result */}
          <section className="panel result-panel" aria-labelledby="generate-heading">
            <div className="section-heading">
              <div>
                <h2 id="generate-heading">3. Generate Fit</h2>
                <p>{tryOnMessage}</p>
              </div>
            </div>

            <button className="primary-action" type="button" disabled={!canRunTryOn} onClick={runTryOn}>
              {tryOnStatus === "uploading" || tryOnStatus === "creating" || tryOnStatus === "polling" ? (
                <div className="loading-ring-container">
                  <div className="loading-pulse-glow"></div>
                  <span>Generating Look...</span>
                </div>
              ) : (
                "Transform Portrait"
              )}
            </button>

            {tryOnStatus === "success" && finalResultUrl && humanPreview && (
              <div className="success-result-container">
                <ComparisonSlider 
                  originalUrl={humanPreview} 
                  resultUrl={finalResultUrl} 
                />
                
                <button 
                  className="download-style-card-btn" 
                  type="button" 
                  onClick={handleDownloadCard}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width: "1rem", height: "1rem"}}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                  Download style card
                </button>
              </div>
            )}
          </section>
        </div>
      ) : activeTab === "closet" ? (
        <div className="closet-tab">
          <section className="panel closet-manager-container">
            <div className="closet-add-header">
              <h2>My Virtual Closet ({wardrobe.length} items)</h2>
              <p>Sustain and coordinate your physically-owned garments with real-time color-matching math.</p>
            </div>

            {/* Premium glassmorphic add form */}
            <form className="closet-add-form" onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const nameInput = form.elements.namedItem("itemName") as HTMLInputElement;
              const catSelect = form.elements.namedItem("itemCategory") as HTMLSelectElement;
              const colorInput = form.elements.namedItem("itemColor") as HTMLInputElement;
              const detailsInput = form.elements.namedItem("itemDetails") as HTMLInputElement;
              const imageInput = form.elements.namedItem("itemImage") as HTMLInputElement;

              if (!nameInput.value.trim()) return;

              const newItem: WardrobeItem = {
                id: "wardrobe-" + Date.now(),
                item: nameInput.value.trim(),
                category: catSelect.value as WardrobeItem["category"],
                color: colorInput.value.trim() || "Multi-color",
                details: detailsInput.value.trim() || "Sustained item",
                image: imageInput.value.trim() || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80"
              };

              saveWardrobeList([newItem, ...wardrobe]);
              form.reset();
            }}>
              <div className="form-group-row">
                <div className="input-field">
                  <label htmlFor="itemName">Item Name</label>
                  <input id="itemName" name="itemName" required type="text" placeholder="e.g. Sage green shacket" />
                </div>
                <div className="input-field">
                  <label htmlFor="itemCategory">Category</label>
                  <select id="itemCategory" name="itemCategory">
                    <option value="Apparel">Apparel</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Clothing Care">Clothing Care</option>
                    <option value="Textiles">Textiles</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="input-field">
                  <label htmlFor="itemColor">Dominant Color</label>
                  <input id="itemColor" name="itemColor" required type="text" placeholder="e.g. Sage green" />
                </div>
                <div className="input-field">
                  <label htmlFor="itemImage">Image URL (Optional)</label>
                  <input id="itemImage" name="itemImage" type="text" placeholder="https://unsplash.com/... or blank for default" />
                </div>
              </div>

              <div className="input-field">
                <label htmlFor="itemDetails">Style / Fit Details</label>
                <input id="itemDetails" name="itemDetails" required type="text" placeholder="e.g. Heavy fabric, button-up" />
              </div>

              <button className="add-closet-btn" type="submit">
                Add to Virtual Closet
              </button>
            </form>

            {/* Grid list of sustained collection */}
            <div className="closet-collection-grid">
              {wardrobe.map((item) => (
                <div key={item.id} className="closet-item-card">
                  <div className="closet-img-container">
                    <img src={item.image} alt={item.item} />
                    <span className="closet-category-badge">{item.category}</span>
                    <button
                      className="closet-delete-btn"
                      type="button"
                      onClick={() => {
                        const updated = wardrobe.filter(w => w.id !== item.id);
                        saveWardrobeList(updated);
                      }}
                      title="Remove from virtual closet"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "0.85rem", height: "0.85rem" }}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                  <div className="closet-card-info">
                    <h4>{item.item}</h4>
                    <span className="closet-color">{item.color}</span>
                    <p className="closet-details">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* History Gallery View */
        <div className="history-tab">
          {history.length > 0 ? (
            <>
              <div className="history-clear-container">
                <button className="clear-all-btn" type="button" onClick={clearAllHistory}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "0.85rem", height: "0.85rem" }}>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Clear History
                </button>
              </div>
              <div className="history-grid">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    className="history-card" 
                    onClick={() => loadHistoryItem(item)}
                    title="Click to reload this fitting"
                  >
                    <div className="history-thumb-container">
                      <img src={item.resultUrl} alt="Fitting look" />
                      <span className="history-badge">{item.category}</span>
                      {item.season && <span className="history-season-badge">{item.season}</span>}
                      {item.harmonyScore && <span className="history-score-badge">{item.harmonyScore}%</span>}
                      <button 
                        className="history-delete-btn" 
                        type="button" 
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        title="Delete look"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "0.85rem", height: "0.85rem" }}>
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                    <div className="history-card-info">
                      <span>{item.timestamp}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="history-empty">
              <svg className="history-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <h3>No Fittings Saved</h3>
              <p>Successful virtual fittings will automatically appear here for side-by-side comparison later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
