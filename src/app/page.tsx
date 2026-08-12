import ROICalculator from "@/components/ROICalculator";
import prisma from "@/lib/prisma";
import {
  IconEye, IconWallet, IconShield,
  IconUser, IconCheck
} from "@/components/Icons";

import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";

export default async function Home() {
  const totalCampaigns = await prisma.campaign.count({ where: { status: 'ACTIVE' } });
  
  const totalViewsAgg = await prisma.submission.aggregate({ _sum: { validated_views: true } });
  const totalViews = Number(totalViewsAgg._sum.validated_views || 0);

  const platformFees = await prisma.transactionLedger.aggregate({
    where: { type: 'PAYOUT', amount: { gt: 0 } },
    _sum: { amount: true }
  });
  const totalClipperPayouts = Number(platformFees._sum.amount || 0);

  return (
    <div className="space-y-32 pb-20">
      
      {/* ══════════════════════════════════════════
          1. HERO SECTION (2-COL)
      ══════════════════════════════════════════ */}
      <Hero />

      {/* ══════════════════════════════════════════
          2. SOCIAL PROOF
      ══════════════════════════════════════════ */}
      <Stats />

      {/* ══════════════════════════════════════════
          3. HOW IT WORKS (STEPPER)
      ══════════════════════════════════════════ */}
      <HowItWorks />

      {/* ══════════════════════════════════════════
          4. PRODUCT SHOWCASE
      ══════════════════════════════════════════ */}
      <section className="relative py-12">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white">Semua Performa dalam Satu Dashboard</h2>
          <p className="text-[#94a3b8] max-w-lg mx-auto">
            Pantau pertumbuhan views, earning, dan statistik anti-fraud secara real-time.
          </p>
        </div>

        <div className="max-w-6xl mx-auto relative px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent blur-3xl pointer-events-none"></div>
          
          <div className="relative bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl shadow-emerald-900/10 overflow-hidden">
            {/* Header Mockup */}
            <div className="h-14 bg-[#111d35] border-b border-white/5 flex items-center justify-between px-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-20 bg-white/5 rounded-md"></div>
                <div className="h-6 w-8 bg-white/5 rounded-full"></div>
              </div>
            </div>

            {/* Content Mockup */}
            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8">
              
              <div className="md:col-span-8 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                    <div className="text-xs text-[#94a3b8] mb-1">Total Views</div>
                    <div className="text-xl md:text-2xl font-bold text-white">12.4M</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                    <div className="text-xs text-emerald-400 mb-1">Earning (Net)</div>
                    <div className="text-xl md:text-2xl font-bold text-emerald-400">Rp 4.2M</div>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                    <div className="text-xs text-[#94a3b8] mb-1">Avg CPM</div>
                    <div className="text-xl md:text-2xl font-bold text-white">Rp 2.5K</div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 p-6 rounded-xl h-64 flex flex-col justify-end gap-2 relative">
                  <div className="absolute top-4 left-6 text-sm font-bold text-[#f8fafc]">Grafik Performa 30 Hari</div>
                  <div className="flex items-end justify-between h-32 gap-1 md:gap-2">
                    {[3,5,4,6,8,7,12,14,10,15,18,22,20,25].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm hover:bg-emerald-400/50 transition-colors" style={{ height: `${(h/25)*100}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 space-y-6">
                <div className="bg-[#111d35] border border-white/5 p-5 rounded-xl space-y-4">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <IconShield size={16} className="text-orange-400" /> AI Audit Log
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { status: "Verified", val: "+4,500 views", col: "text-emerald-400", bg: "bg-emerald-400/10" },
                      { status: "Verified", val: "+12,100 views", col: "text-emerald-400", bg: "bg-emerald-400/10" },
                      { status: "Spam Blocked", val: "-850 bot views", col: "text-rose-400", bg: "bg-rose-400/10" },
                    ].map((l, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className={`px-2 py-1 rounded ${l.bg} ${l.col} font-medium`}>{l.status}</span>
                        <span className="text-[#94a3b8] font-mono">{l.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-orange-400 uppercase tracking-widest">Active Campaign</div>
                  <div className="text-base font-bold text-white">Promo Skincare Serum X</div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-orange-400 w-[65%] h-full rounded-full"></div>
                  </div>
                  <div className="text-[10px] text-[#94a3b8] text-right mt-1">65% Target Terpenuhi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. FEATURES
      ══════════════════════════════════════════ */}
      <Features />

      {/* ══════════════════════════════════════════
          6. EARNING CALCULATOR
      ══════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4">
        <ROICalculator />
      </section>

      {/* ══════════════════════════════════════════
          7. CREATOR / COMMUNITY
      ══════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-[#111d35] rounded-3xl border border-white/[0.06] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 md:p-12 flex flex-col justify-center space-y-6">
              <h2 className="text-3xl font-black text-white leading-tight">
                Bangun Penghasilan dari Kreativitasmu.
              </h2>
              <p className="text-[#94a3b8] leading-relaxed">
                Bergabunglah dengan puluhan ribu editor, affiliate, dan content creator yang menjadikan RoveClip sebagai sumber pendapatan utama mereka. Cukup ambil materi, edit sesukamu, dan upload.
              </p>
              <div className="pt-2">
                <a href="/register?role=clipper" className="inline-flex btn-emerald px-6 py-3 font-bold text-sm">
                  Gabung sebagai Clipper
                </a>
              </div>
            </div>
            
            <div className="bg-[#0a0f1c] p-10 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]"></div>
              
              <div className="relative z-10 w-full max-w-sm">
                <div className="flex -space-x-4 justify-center mb-6">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-14 h-14 rounded-full border-2 border-[#0a0f1c] bg-white/10 flex items-center justify-center overflow-hidden">
                      <IconUser size={24} className="text-[#475569]" />
                    </div>
                  ))}
                  <div className="w-14 h-14 rounded-full border-2 border-[#0a0f1c] bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                    +1K
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/10 text-center animate-bounce duration-[3000ms]">
                  <div className="text-xs text-[#94a3b8]">Rata-rata pendapatan aktif clipper</div>
                  <div className="text-xl font-bold text-white mt-1">Rp 2.450.000 / bln</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. TESTIMONIALS (3 Cards)
      ══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-black text-white">Apa Kata Mereka?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Rizky Firmansyah", role: "Clipper Profesional", quote: "Dulu pusing cari endorse, sekarang tinggal masuk marketplace RoveClip, pilih brand, edit, dan views auto jadi duit." },
            { name: "PT. Skincare Indo", role: "Advertiser Brand", quote: "ROI campaign meningkat drastis. AI verifikasinya benar-benar memfilter bot, jadi budget marketing kami tidak terbuang sia-sia." },
            { name: "Sarah Amelia", role: "Content Creator", quote: "Dashboardnya sangat rapi. Penarikan dana selalu tepat waktu. Platform SaaS terbaik buat pejuang views." },
          ].map((t, i) => (
            <div key={i} className="glass-card p-6 border border-white/[0.05] rounded-2xl flex flex-col justify-between">
              <p className="text-sm text-[#94a3b8] leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50">
                  <IconUser size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-[11px] text-[#475569]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. FAQ (ACCORDION - HTML5 DETAILS)
      ══════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-4 space-y-8 pt-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white">Pertanyaan Umum</h2>
        </div>
        
        <div className="space-y-4">
          {[
            { q: "Bagaimana cara menjadi clipper?", a: "Sangat mudah. Daftar akun gratis sebagai Clipper, lengkapi profil, dan Anda sudah bisa mulai mengambil campaign di Marketplace." },
            { q: "Bagaimana sistem pembayaran di RoveClip?", a: "Penghasilan dihitung berdasarkan views valid x CPM. Komisi 80% akan masuk ke dompet Anda, dan bisa ditarik langsung ke rekening bank atau e-wallet lokal." },
            { q: "Apa itu verified views dan AI Anti-Fraud?", a: "Tidak semua views bernilai. AI kami mendeteksi anomali, bot, dan click-farm. Hanya tayangan organik manusia yang dihitung untuk pembayaran." },
            { q: "Apakah ada biaya pendaftaran?", a: "Pendaftaran Clipper 100% GRATIS. Untuk Brand, pembuatan akun gratis, Anda hanya top-up saldo untuk menjalankan campaign." }
          ].map((faq, i) => (
            <details key={i} className="group glass-card rounded-xl border border-white/[0.05] [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-semibold text-white">
                {faq.q}
                <span className="text-[#475569] group-open:-rotate-180 transition-transform duration-300">
                  ▼
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm text-[#94a3b8] leading-relaxed border-t border-white/5 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          10. FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 pt-16">
        <div className="relative rounded-[2rem] overflow-hidden bg-[#111d35] border border-orange-500/20 text-center p-12 md:p-16 z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-[#070b13] pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Siap Mengubah Konten<br/>Menjadi Penghasilan?
            </h2>
            <p className="text-[#94a3b8] max-w-lg mx-auto pb-4">
              Mulai membuat campaign pertamamu atau temukan lowongan tugas pertamamu hari ini.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="/register?role=clipper" className="btn-emerald px-8 py-4 text-sm font-bold shadow-lg shadow-emerald-900/20">
                Daftar sebagai Clipper
              </a>
              <a href="/register?role=brand" className="btn-coral px-8 py-4 text-sm font-bold shadow-lg shadow-orange-900/20">
                Daftar sebagai Brand
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
