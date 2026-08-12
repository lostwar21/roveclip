"use client";

import toast from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIPPER"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Pendaftaran berhasil! Silakan masuk dengan akun baru kamu.");
        router.push("/masuk");
      } else {
        toast.error(data.error || "Gagal mendaftar");
      }
    } catch {
      toast.error("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center mb-6 hover:scale-105 transition-transform">
            <img src="/logo.png" alt="RoveClip Logo" className="h-16 w-auto object-contain rounded-md border border-white/20 shadow-lg shadow-orange-900/20 bg-[#0a0f1c] p-1.5" />
          </Link>
          <h1 className="text-2xl font-black text-white">Buat Akun Baru</h1>
          <p className="text-sm text-[#94a3b8]">
            Bergabung dengan ribuan clipper dan brand di Indonesia
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 md:p-8 border border-white/[0.09] space-y-5">

          {/* Error */}
          {error && (
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#fca5a5] text-sm font-semibold rounded-xl p-3.5 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Role Picker */}
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2.5">
              Daftar Sebagai
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`cursor-pointer rounded-xl p-4 text-center border transition-all select-none ${
                formData.role === 'CLIPPER'
                  ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#34d399]'
                  : 'border-white/[0.07] text-[#475569] hover:border-white/[0.14] hover:text-[#94a3b8]'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="CLIPPER"
                  checked={formData.role === "CLIPPER"}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="hidden"
                />
                <div className="text-2xl mb-1.5">⚡</div>
                <div className="font-bold text-sm">Clipper</div>
                <div className="text-xs opacity-70 mt-0.5 leading-tight">Buat konten & cari penghasilan</div>
              </label>

              <label className={`cursor-pointer rounded-xl p-4 text-center border transition-all select-none ${
                formData.role === 'BRAND'
                  ? 'bg-[#f97316]/10 border-[#f97316]/40 text-[#fb923c]'
                  : 'border-white/[0.07] text-[#475569] hover:border-white/[0.14] hover:text-[#94a3b8]'
              }`}>
                <input
                  type="radio"
                  name="role"
                  value="BRAND"
                  checked={formData.role === "BRAND"}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="hidden"
                />
                <div className="text-2xl mb-1.5">🏢</div>
                <div className="font-bold text-sm">Brand</div>
                <div className="text-xs opacity-70 mt-0.5 leading-tight">Promosikan video bisnismu</div>
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="Nama kamu"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                placeholder="email@kamu.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="form-input"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-coral w-full py-3.5 text-sm font-bold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Membuat Akun...
                </span>
              ) : "Daftar Sekarang →"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#475569]">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="font-bold text-[#fb923c] hover:text-[#f97316] transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
