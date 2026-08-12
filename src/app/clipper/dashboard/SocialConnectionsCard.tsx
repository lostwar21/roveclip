"use client";

import { useState, useEffect } from "react";
import { IconBolt, IconCheck } from "@/components/Icons"; // assuming IconBolt exists, or just use normal SVG

interface Connection {
  platform: string;
  username: string;
  created_at: string;
}

export default function SocialConnectionsCard() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/social/connections")
      .then((res) => res.json())
      .then((data) => {
        if (data.connections) {
          setConnections(data.connections);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const isInstagramConnected = connections.some((c) => c.platform === "INSTAGRAM");
  const igConnection = connections.find((c) => c.platform === "INSTAGRAM");

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Apakah Anda yakin ingin memutuskan koneksi ${platform}?`)) return;
    try {
      const res = await fetch(`/api/social/${platform.toLowerCase()}/disconnect`, { method: "POST" });
      if (res.ok) {
        setConnections((prev) => prev.filter((c) => c.platform !== platform));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="glass-card p-5 border border-white/10 mb-8">
      <h2 className="text-lg font-bold text-white mb-1">Integrasi Akun</h2>
      <p className="text-sm text-[#94a3b8] mb-4">
        Hubungkan akun sosial media Anda untuk verifikasi otomatis (views real-time) dan pencairan saldo instan.
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Instagram Card */}
        <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isInstagramConnected ? 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]' : 'bg-gray-800'}`}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </div>
            <div>
              <div className="font-semibold text-white">Instagram</div>
              <div className="text-xs text-[#94a3b8]">
                {loading ? "Memeriksa..." : isInstagramConnected ? `@${igConnection?.username}` : "Belum terhubung"}
              </div>
            </div>
          </div>
          
          <div>
            {!loading && (
              isInstagramConnected ? (
                <div className="flex items-center gap-2">
                  <span className="badge badge-emerald text-[10px] hidden sm:inline-flex">Terhubung</span>
                  <button 
                    onClick={() => handleDisconnect("INSTAGRAM")}
                    className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
                  >
                    Putuskan
                  </button>
                </div>
              ) : (
                <a 
                  href="/api/social/instagram/connect" 
                  className="btn-emerald px-3 py-1.5 text-xs inline-flex items-center gap-1"
                >
                  Hubungkan
                </a>
              )
            )}
          </div>
        </div>

        {/* Other platforms coming soon */}
        <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-xl p-4 flex items-center justify-between opacity-50 grayscale">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-[#000] border border-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 002.5 15.68 6.3 6.3 0 008.81 22a6.32 6.32 0 006.27-5.92V11.2a8.3 8.3 0 005.12 1.74v-3.41a5.1 5.1 0 01-1.61-.17z"/></svg>
             </div>
             <div>
               <div className="font-semibold text-white">TikTok</div>
               <div className="text-xs text-[#94a3b8]">Segera Hadir</div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
