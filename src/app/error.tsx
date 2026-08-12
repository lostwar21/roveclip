"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IconBolt } from "@/components/Icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Bisa dikirim ke layanan tracking error seperti Sentry
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
          <IconBolt size={32} />
        </div>
        
        <h2 className="text-2xl font-black text-white">Waduh, Ada Sistem yang Terputus.</h2>
        
        <p className="text-[#94a3b8] text-sm leading-relaxed">
          Sistem kami gagal memproses halaman ini. Jangan khawatir, views dan data Anda aman. Silakan muat ulang atau kembali ke beranda.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => reset()}
            className="btn-coral px-6 py-2.5 text-sm font-bold shadow-lg shadow-orange-900/20"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="btn-ghost px-6 py-2.5 text-sm font-bold border border-white/10 hover:border-white/20"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
