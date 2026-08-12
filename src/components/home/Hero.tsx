import { IconEye, IconShield } from "@/components/Icons";

export default function Hero() {
  return (
    <section className="relative pt-10 md:pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* Left: Copy & CTA */}
        <div className="space-y-6 md:pr-8 text-center lg:text-left z-10 relative">
          <div className="absolute -top-32 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
            Platform distribusi video berbasis performa
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Ubah Views<br />
            <span className="text-[#f97316] drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">Menjadi Penghasilan.</span>
          </h1>

          <p className="text-base md:text-lg text-[#94a3b8] leading-relaxed max-w-xl mx-auto lg:mx-0">
            Hubungkan brand dengan clipper profesional untuk mendistribusikan video pendek dan menghasilkan uang berdasarkan views yang <strong className="text-white font-semibold">terverifikasi AI</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 pt-4 justify-center lg:justify-start">
            <a href="/register?role=clipper" className="btn-coral w-full sm:w-auto px-7 py-3.5 text-sm font-bold shadow-lg shadow-orange-900/20 hover:shadow-orange-900/40">
              Daftar sebagai Clipper
            </a>
            <a href="/register?role=brand" className="btn-ghost w-full sm:w-auto px-7 py-3.5 text-sm font-bold border border-white/10 hover:border-white/20">
              Daftar sebagai Brand
            </a>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-3 pt-6 opacity-70">
            <span className="text-xs font-medium text-[#475569] uppercase tracking-wider">Mendukung:</span>
            <span className="text-xs font-semibold text-[#f8fafc]">TikTok</span>
            <span className="text-[#475569]">•</span>
            <span className="text-xs font-semibold text-[#f8fafc]">YT Shorts</span>
            <span className="text-[#475569]">•</span>
            <span className="text-xs font-semibold text-[#f8fafc]">Reels</span>
          </div>
        </div>

        {/* Right: Dashboard Mockup */}
        <div className="relative w-full max-w-lg mx-auto lg:max-w-none lg:ml-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-emerald-500/10 blur-3xl rounded-[3rem]"></div>
          
          <div className="relative bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl overflow-hidden group">
            <div className="h-8 bg-[#111d35] border-b border-white/5 flex items-center px-4 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
              <div className="mx-auto text-[10px] text-[#475569] font-mono">dashboard.roveclip.com</div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-[#94a3b8] mb-1">Hari Ini (Estimasi)</div>
                  <div className="text-3xl font-black text-white font-mono">Rp 845.000</div>
                </div>
                <div className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">+12.4%</div>
              </div>
              
              <div className="h-32 w-full flex items-end gap-2 pt-4">
                {[40, 70, 45, 90, 65, 110, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-orange-500/20 to-orange-500/60 rounded-t-sm group-hover:to-orange-400 transition-colors" style={{ height: `${h}%` }}></div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#94a3b8] mb-1">
                    <IconEye size={12} className="text-emerald-400" /> AI Verified Views
                  </div>
                  <div className="text-lg font-bold text-white">422.5K</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#94a3b8] mb-1">
                    <IconShield size={12} className="text-emerald-400" /> Fraud Detected
                  </div>
                  <div className="text-lg font-bold text-[#f8fafc]">0.2%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
