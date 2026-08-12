"use client";

import { useState } from "react";

interface MarketplaceFilterProps {
  onFilterChange: (platform: string) => void;
}

export default function MarketplaceFilter({ onFilterChange }: MarketplaceFilterProps) {
  const [selected, setSelected] = useState<string>("ALL");

  const handleSelect = (platform: string) => {
    setSelected(platform);
    onFilterChange(platform);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => handleSelect("ALL")}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
          selected === "ALL"
            ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
        }`}
      >
        ✨ Semua Platform
      </button>

      <button
        onClick={() => handleSelect("TIKTOK")}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
          selected === "TIKTOK"
            ? "bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-500/20"
            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
        }`}
      >
        <span>🎵</span> TikTok
      </button>

      <button
        onClick={() => handleSelect("YOUTUBE")}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
          selected === "YOUTUBE"
            ? "bg-red-600 text-white border-red-500 shadow-md shadow-red-500/20"
            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
        }`}
      >
        <span>▶️</span> YouTube Shorts
      </button>

      <button
        onClick={() => handleSelect("INSTAGRAM")}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
          selected === "INSTAGRAM"
            ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850"
        }`}
      >
        <span>📷</span> Instagram Reels
      </button>
    </div>
  );
}
