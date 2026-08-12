"use client";

import { useState } from "react";

export default function ROICalculator() {
  const [activeTab, setActiveTab] = useState<"CLIPPER" | "BRAND">("CLIPPER");
  const [views, setViews] = useState<number>(50000);
  const [cpm, setCpm] = useState<number>(2000);

  const grossEarnings = (views / 1000) * cpm;
  const netEarnings = grossEarnings * 0.8;
  const brandSpend = (views / 1000) * cpm;
  const platformFee = grossEarnings * 0.2;

  return (
    <div className="bg-[#0d1526]/80 backdrop-blur-xl p-6 md:p-10 border border-white/[0.08] rounded-3xl relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.05)] group">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="relative z-10">
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            Hitung Potensi Penghasilan
          </h3>
          <p className="text-sm text-[#94a3b8] mt-2">
            Simulasi estimasi hasil nyata di RoveClip secara real-time.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-[#0d1526] p-1 rounded-xl border border-white/[0.07] shrink-0">
          <button
            onClick={() => setActiveTab("CLIPPER")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === "CLIPPER"
                ? "bg-white/10 text-white shadow-lg backdrop-blur-md border border-white/10"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            Untuk Clipper
          </button>
          <button
            onClick={() => setActiveTab("BRAND")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === "BRAND"
                ? "bg-white/10 text-white shadow-lg backdrop-blur-md border border-white/10"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            Untuk Brand
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Sliders */}
        <div className="lg:col-span-7 space-y-7">
          {/* Views Slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                Estimasi Total Views
              </label>
              <span className="font-mono text-base font-black text-[#f8fafc] bg-[#0d1526] px-3 py-1 rounded-lg border border-white/[0.07]">
                {views >= 1000000
                  ? (views / 1000000).toFixed(1) + "M"
                  : views >= 1000
                  ? (views / 1000).toFixed(0) + "K"
                  : views}{" "}
                <span className="text-xs text-[#475569] font-sans">views</span>
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="500000"
              step="5000"
              value={views}
              onChange={(e) => setViews(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-400 bg-white/5 border border-white/5"
            />
            <div className="flex justify-between text-[10px] text-[#334155] mt-1.5 font-mono">
              <span>5K</span>
              <span>250K</span>
              <span>500K</span>
            </div>
          </div>

          {/* CPM Slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                Tarif CPM (per 1.000 Views)
              </label>
              <span className="font-mono text-base font-black text-[#fb923c] bg-[#0d1526] px-3 py-1 rounded-lg border border-white/[0.07]">
                Rp {cpm.toLocaleString('id-ID')}
                <span className="text-xs text-[#475569] font-sans ml-1">CPM</span>
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="5000"
              step="500"
              value={cpm}
              onChange={(e) => setCpm(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-orange-400 bg-white/5 border border-white/5"
            />
            <div className="flex justify-between text-[10px] text-[#334155] mt-1.5 font-mono">
              <span>Rp 1K (Standar)</span>
              <span>Rp 3K (Tinggi)</span>
              <span>Rp 5K (Premium)</span>
            </div>
          </div>
        </div>

        {/* Result Card */}
        <div className="lg:col-span-5">
          {activeTab === "CLIPPER" ? (
            <div className="relative overflow-hidden rounded-2xl border border-[#10b981]/30 bg-gradient-to-br from-[#10b981]/10 via-[#0d1526] to-[#070b13] p-6">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#10b981]/5 blur-2xl pointer-events-none"></div>

              <div className="text-xs font-bold text-[#34d399] uppercase tracking-widest mb-3">
                Penghasilan Bersih Clipper (80%)
              </div>
              <div className="text-4xl md:text-5xl font-black font-mono text-[#34d399] leading-none">
                Rp {netEarnings.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-[#475569] mt-2">
                Setelah dipotong komisi platform 20%
              </p>

              <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#94a3b8]">Total Kotor (Gross)</span>
                  <span className="font-mono font-bold text-[#f8fafc]">Rp {grossEarnings.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#94a3b8]">Komisi Platform (20%)</span>
                  <span className="font-mono text-[#475569]">−Rp {platformFee.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-[#10b981] h-full rounded-full"
                    style={{ width: "80%" }}
                  ></div>
                </div>
                <div className="text-[10px] text-[#475569] text-right font-medium mt-1">80% bagianmu</div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-[#f97316]/30 bg-gradient-to-br from-[#f97316]/10 via-[#0d1526] to-[#070b13] p-6">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#f97316]/5 blur-2xl pointer-events-none"></div>

              <div className="text-xs font-bold text-[#fb923c] uppercase tracking-widest mb-3">
                Jangkauan yang Kamu Dapat
              </div>
              <div className="text-4xl md:text-5xl font-black font-mono text-[#fb923c] leading-none">
                {views >= 1000000
                  ? (views / 1000000).toFixed(1) + "M"
                  : (views / 1000).toFixed(0) + "K"}
                <span className="text-lg text-[#94a3b8] font-sans ml-2">Views</span>
              </div>
              <p className="text-xs text-[#475569] mt-2">
                Jangkauan nyata yang diverifikasi AI
              </p>

              <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#94a3b8]">Estimasi Anggaran</span>
                  <span className="font-mono font-bold text-[#f8fafc]">Rp {brandSpend.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#94a3b8]">Cost per View</span>
                  <span className="font-mono font-bold text-[#34d399]">
                    Rp {(brandSpend / views).toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#94a3b8]">Proteksi Anti-Bot</span>
                  <span className="font-semibold text-[#fb923c]">AI Verified ✓</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
