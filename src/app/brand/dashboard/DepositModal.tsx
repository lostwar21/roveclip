"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DepositModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const quickAmounts = [50, 100, 250, 500];

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Top up berhasil!");
        setIsOpen(false);
        setAmount("");
        router.refresh();
      } else {
        alert(data.error || "Gagal melakukan top up.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-emerald w-full py-2.5 text-xs"
      >
        💳 Top Up Saldo
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#070b13]/80 backdrop-blur-md p-4 animate-fade"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="glass-card p-6 md:p-7 w-full max-w-sm shadow-2xl border border-white/[0.10] animate-modal">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg font-black text-[#f8fafc]">Top Up Saldo</h2>
                <p className="text-xs text-[#94a3b8] mt-0.5">Tambah saldo dompet kampanye kamu.</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[#94a3b8] hover:text-[#f8fafc] transition-all flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                  Pilih Nominal Cepat
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(String(q))}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                        amount === String(q)
                          ? "border-[#10b981]/50 bg-[#10b981]/15 text-[#34d399]"
                          : "border-white/[0.07] bg-white/[0.03] text-[#475569] hover:border-white/[0.12] hover:text-[#94a3b8]"
                      }`}
                    >
                      Rp{q / 1000}K
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                  Atau Masukkan Nominal ($)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input"
                  placeholder="Contoh: 250"
                />
              </div>

              <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl p-3 text-xs text-[#34d399]">
                ⚡ Simulasi pembayaran — saldo langsung masuk setelah konfirmasi.
              </div>

              <div className="flex gap-3">
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
                  className="btn-emerald flex-1 py-3 text-sm disabled:opacity-50"
                >
                  {loading ? "Memproses..." : "✓ Konfirmasi Bayar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
