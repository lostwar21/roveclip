"use client";

import toast from "react-hot-toast";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCampaignModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    video_url: "",
    cpm_rate: "",
    total_budget: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Kampanye berhasil dibuat!");
        setIsOpen(false);
        setFormData({ video_url: "", cpm_rate: "", total_budget: "" });
        router.refresh();
      } else {
        toast.error(data.error || "Terjadi kesalahan.");
      }
    } catch {
      toast.error("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-coral px-5 py-3 text-sm"
      >
        + Buat Kampanye Baru
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#070b13]/80 backdrop-blur-md p-4 animate-fade"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="glass-card p-6 md:p-7 w-full max-w-md shadow-2xl border border-white/[0.10] animate-modal">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg font-black text-[#f8fafc]">Buat Kampanye Baru</h2>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  Tentukan video, tarif CPM, dan anggaran kampanye.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[#94a3b8] hover:text-[#f8fafc] transition-all flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                  Link Video (G-Drive / YouTube)
                </label>
                <input
                  type="url"
                  required
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="form-input"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                  Tarif CPM (Rp per 1.000 Views)
                </label>
                <input
                  type="number"
                  step="500"
                  min="1000"
                  max="5000"
                  required
                  value={formData.cpm_rate}
                  onChange={(e) => setFormData({ ...formData, cpm_rate: e.target.value })}
                  className="form-input"
                  placeholder="Contoh: 3000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                  Total Anggaran (Rp)
                </label>
                <input
                  type="number"
                  min="10000"
                  step="1000"
                  required
                  value={formData.total_budget}
                  onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                  className="form-input"
                  placeholder="Contoh: 150000"
                />
                <p className="text-[10px] text-[#475569] mt-1.5">
                  Pastikan saldo dompet mencukupi anggaran kampanye.
                </p>
              </div>

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
                  className="btn-coral flex-1 py-3 text-sm disabled:opacity-50"
                >
                  {loading ? "Membuat..." : "🚀 Luncurkan Kampanye"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
