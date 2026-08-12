"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MasukPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Email atau kata sandi salah. Coba lagi.");
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
          <h1 className="text-2xl font-black text-white">Selamat Datang Kembali</h1>
          <p className="text-sm text-[#94a3b8]">Masuk ke akun RoveClip kamu</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 md:p-8 border border-white/[0.09] space-y-5">

          {error && (
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#fca5a5] text-sm font-semibold rounded-xl p-3.5 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Kata sandi kamu"
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
                  Masuk...
                </span>
              ) : "Masuk ke Akun →"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="divider"></div>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0d1526] px-3 text-[11px] text-[#475569] font-semibold">
              ATAU
            </span>
          </div>

          {/* Hint boxes */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-[#10b981]/8 border border-[#10b981]/15 p-3">
              <div className="text-lg mb-0.5">⚡</div>
              <div className="text-[11px] font-bold text-[#34d399]">Clipper</div>
              <div className="text-[10px] text-[#475569]">Cari job & hasilkan uang</div>
            </div>
            <div className="rounded-xl bg-[#f97316]/8 border border-[#f97316]/15 p-3">
              <div className="text-lg mb-0.5">🏢</div>
              <div className="text-[11px] font-bold text-[#fb923c]">Brand</div>
              <div className="text-[10px] text-[#475569]">Distribusikan video</div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-[#475569]">
          Belum punya akun?{" "}
          <Link href="/register" className="font-bold text-[#fb923c] hover:text-[#f97316] transition-colors">
            Daftar gratis sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
