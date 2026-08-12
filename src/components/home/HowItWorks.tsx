import { IconBolt, IconBuilding } from "@/components/Icons";

export default function HowItWorks() {
  return (
    <section className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-black text-white">Cara Kerja RoveClip</h2>
        <p className="text-[#94a3b8] max-w-lg mx-auto">
          Sederhana untuk clipper. Terukur untuk brand. Semua transparan dalam satu sistem otomatis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timeline Clipper */}
        <div className="glass-card p-6 md:p-8 border border-white/5 rounded-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <IconBolt size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Untuk Clipper</h3>
          </div>
          
          <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[15px] before:w-px before:bg-white/10">
            {[
              { title: "Pilih Campaign", desc: "Cari lowongan brand yang cocok dengan style kontenmu di marketplace." },
              { title: "Upload & Share", desc: "Buat video sesuai brief, lalu sebarkan ke TikTok, Shorts, atau Reels." },
              { title: "Submit Link", desc: "Tempel URL video ke sistem kami untuk diaudit oleh AI." },
              { title: "Terima Penghasilan", desc: "Dapatkan 80% dari total nilai CPM views yang sah. Cair ke dompet instan." }
            ].map((step, i) => (
              <div key={i} className="relative pl-10 group/step">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-[#111d35] border-2 border-white/10 flex items-center justify-center text-xs font-bold text-[#94a3b8] group-hover/step:border-emerald-500 group-hover/step:text-emerald-400 transition-colors z-10">
                  {i + 1}
                </div>
                <h4 className="text-base font-bold text-[#f8fafc] mb-1">{step.title}</h4>
                <p className="text-sm text-[#475569] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Brand */}
        <div className="glass-card p-6 md:p-8 border border-white/5 rounded-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <IconBuilding size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Untuk Brand</h3>
          </div>
          
          <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[15px] before:w-px before:bg-white/10">
            {[
              { title: "Buat Campaign", desc: "Tentukan brief konten, target audiens, dan referensi material video." },
              { title: "Tentukan Budget & CPM", desc: "Set anggaran total dan tarif per 1000 views (CPM) sesuai kemampuanmu." },
              { title: "Skalakan Distribusi", desc: "Ribuan clipper siap mengedit dan mengupload kodemu ke penjuru internet." },
              { title: "Bayar Sesuai Performa", desc: "Kamu hanya membayar untuk views yang terbukti asli oleh AI kami." }
            ].map((step, i) => (
              <div key={i} className="relative pl-10 group/step">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-[#111d35] border-2 border-white/10 flex items-center justify-center text-xs font-bold text-[#94a3b8] group-hover/step:border-orange-500 group-hover/step:text-orange-400 transition-colors z-10">
                  {i + 1}
                </div>
                <h4 className="text-base font-bold text-[#f8fafc] mb-1">{step.title}</h4>
                <p className="text-sm text-[#475569] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
