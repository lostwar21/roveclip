"use client";

import { useState } from "react";
import { IconBag, IconGrid, IconLogOut, IconLogin, IconX, IconMenu } from "@/components/Icons";

export default function Navbar({ user, walletBalance, dashboardUrl }: { user: any; walletBalance: number; dashboardUrl: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070b13]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            {/* Logo Mark */}
            <a href="/" className="flex items-center group hover:scale-105 transition-transform">
              <img src="/logo.png" alt="RoveClip Logo" className="h-9 sm:h-10 w-auto object-contain rounded-sm border border-white/20 shadow-lg shadow-orange-900/20 bg-[#0a0f1c] p-1" />
            </a>

            {/* Desktop Main Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#94a3b8]">
              <a href="/" className="hover:text-white transition-colors">Beranda</a>
              <a href="/register?role=clipper" className="hover:text-white transition-colors">Untuk Clipper</a>
              <a href="/register?role=brand" className="hover:text-white transition-colors">Untuk Brand</a>
              <a href="/clipper/marketplace" className="hover:text-white transition-colors">Campaign</a>
              <a href="#" className="hover:text-white transition-colors">Harga</a>
              <a href="#" className="hover:text-white transition-colors">Blog</a>
            </nav>
          </div>

          {/* Desktop Right Nav */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Wallet */}
                <div className="flex items-center gap-1.5 bg-[#0d1526] px-3 py-1.5 rounded-lg border border-white/[0.07] hover:border-[#10b981]/30 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0"></span>
                  <span className="font-mono text-xs font-bold text-[#34d399]">
                    Rp {walletBalance.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* User info */}
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-xs font-semibold text-[#f8fafc]">{user.name}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 badge ${
                    user.role === 'ADMIN'   ? 'badge-amber' :
                    user.role === 'BRAND'   ? 'badge-violet' :
                    'badge-emerald'
                  }`}>
                    {user.role === 'ADMIN' ? 'Admin' : user.role === 'BRAND' ? 'Brand' : 'Clipper'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pl-3 border-l border-white/[0.07]">
                  <a href={dashboardUrl} className="btn-coral px-4 py-2 text-xs">
                    <IconGrid size={13} />
                    Dashboard
                  </a>
                  <Link href="/keluar" className="btn-ghost px-3 py-2 text-xs text-[#94a3b8] hover:text-white">
                    Logout
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a href="/masuk" className="text-sm font-semibold text-[#94a3b8] hover:text-white px-3 py-2 transition-colors">
                  Masuk
                </a>
                <a href="/register" className="btn-coral px-5 py-2.5 text-sm font-bold shadow-lg shadow-orange-900/20 hover:shadow-orange-900/40">
                  Daftar Gratis
                </a>
              </div>
            )}
          </div>

          {/* Mobile Toggle & Wallet */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-1.5 bg-[#0d1526] px-2.5 py-1.5 rounded-md border border-white/[0.07]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shrink-0"></span>
                <span className="font-mono text-[10px] font-bold text-[#34d399]">
                  Rp {walletBalance.toLocaleString('id-ID')}
                </span>
              </div>
            )}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? <IconX size={20} /> : <IconMenu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[64px] sm:top-[72px] z-40 bg-[#070b13]/98 backdrop-blur-2xl border-t border-white/[0.05] overflow-y-auto">
          <div className="flex flex-col p-4 gap-2">
            <a href="/" className="px-4 py-3 text-sm font-medium text-white hover:bg-white/5 rounded-lg">Beranda</a>
            <a href="/register?role=clipper" className="px-4 py-3 text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-lg">Untuk Clipper</a>
            <a href="/register?role=brand" className="px-4 py-3 text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-lg">Untuk Brand</a>
            <a href="/clipper/marketplace" className="px-4 py-3 text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-lg">Campaign Marketplace</a>
            <a href="#" className="px-4 py-3 text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-lg">Harga</a>
            
            <div className="h-px w-full bg-white/[0.05] my-2"></div>
            
            {user ? (
              <>
                <a href={dashboardUrl} className="px-4 py-3 text-sm font-bold text-white bg-white/5 rounded-lg flex items-center gap-2">
                  <IconGrid size={16} /> Buka Dashboard
                </a>
                <Link href="/keluar" className="px-4 py-3 text-sm font-medium text-rose-400 hover:bg-white/5 rounded-lg flex items-center gap-2">
                  <IconLogOut size={20} />
                  Logout
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                <a href="/masuk" className="w-full btn-ghost py-3 text-sm text-center border border-white/10">Masuk ke Akun</a>
                <a href="/register" className="w-full btn-coral py-3 text-sm text-center shadow-lg shadow-orange-900/20">Daftar Gratis</a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
