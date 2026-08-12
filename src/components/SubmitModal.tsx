"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitModal({ campaignId }: { campaignId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("TIKTOK");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const campaignTag = `#Rove${campaignId.substring(0, 6)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaignId,
          social_url: url,
          platform: platform,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsOpen(false);
        alert("Berhasil! Video kamu sudah terdaftar dan sedang diaudit oleh AI.");
        router.push("/clipper/dashboard");
      } else {
        alert(data.error || "Gagal submit. Pastikan link benar dan kamu sudah login.");
      }
    } catch {
      alert("Terjadi kesalahan saat submit.");
    } finally {
      setLoading(false);
    }
  };

  const platformOptions = [
    { value: "TIKTOK", label: "TikTok", icon: "📱" },
    { value: "INSTAGRAM", label: "Instagram Reels", icon: "📸" },
    { value: "YOUTUBE", label: "YouTube Shorts", icon: "▶️" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-coral w-full py-3 text-sm font-bold"
      >
        🎬 Ambil Job Ini
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#070b13]/80 backdrop-blur-md p-4 animate-fade"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="glass-card p-6 md:p-7 w-full max-w-md shadow-2xl border border-white/[0.10] animate-modal">

            {/* Modal Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg font-black text-[#f8fafc]">Submit Link Video</h2>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  Daftarkan kontenmu untuk audit AI & tracking views otomatis.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/[0.09] transition-all flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Platform Selection */}
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                  Platform Upload
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {platformOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPlatform(opt.value)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        platform === opt.value
                          ? "border-[#f97316]/50 bg-[#f97316]/15 text-[#fb923c]"
                          : "border-white/[0.07] bg-white/[0.03] text-[#475569] hover:border-white/[0.12] hover:text-[#94a3b8]"
                      }`}
                    >
                      <div className="text-lg mb-0.5">{opt.icon}</div>
                      <div>{opt.label.split(" ")[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mandatory Tag Warning */}
              <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#f59e0b] uppercase tracking-wide">
                  🛡️ Tag Wajib di Caption Video
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Pastikan caption videomu{" "}
                  <strong className="text-[#f8fafc]">mengandung tag berikut</strong> agar kepemilikan klip bisa diverifikasi secara otomatis:
                </p>
                <div
                  className="bg-[#070b13] border border-[#f59e0b]/40 p-2.5 rounded-lg text-center font-mono text-base font-black text-[#f59e0b] cursor-pointer select-all hover:bg-[#0d1526] transition-colors"
                  title="Klik untuk select semua"
                >
                  {campaignTag}
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                  Link Video Publik
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@username/video/..."
                  className="form-input"
                />
                <p className="text-[10px] text-[#475569] mt-1.5">
                  Pastikan video bisa diakses publik (bukan privat)
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-ghost flex-1 py-3 text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-coral flex-1 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      AI Sedang Memverifikasi...
                    </span>
                  ) : (
                    "✓ Konfirmasi & Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
