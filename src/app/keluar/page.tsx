"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconLogOut, IconX } from "@/components/Icons";

export default function SignOutPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-orange-400 shadow-lg shadow-orange-500/30">
              <span className="text-white font-black text-xl leading-none tracking-tighter">R</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">RoveClip</span>
          </Link>
        </div>

        <div className="bg-[#0d1526]/80 backdrop-blur-xl border border-white/[0.08] p-8 md:p-10 rounded-[24px] shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400">
            <IconLogOut size={28} />
          </div>
          
          <h1 className="text-2xl font-black text-white mb-2">Konfirmasi Keluar</h1>
          <p className="text-[#94a3b8] mb-8 text-sm">
            Apakah Anda yakin ingin keluar dari RoveClip? Sesi Anda akan diakhiri.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full py-3.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl border border-red-500/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningOut ? (
                <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
              ) : (
                <>Keluar Sekarang</>
              )}
            </button>
            <button
              onClick={() => router.back()}
              className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/5 transition-all flex justify-center items-center gap-2"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
