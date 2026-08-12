import { IconCpu, IconCheck, IconWallet, IconSmartphone } from "@/components/Icons";

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-4 space-y-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <IconCpu size={24} />,
            title: "AI Anti-Fraud",
            desc: "Views diverifikasi otomatis untuk menjaga kualitas campaign dari serangan bot dan kecurangan.",
            color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20"
          },
          {
            icon: <IconCheck size={24} />,
            title: "Verified Views",
            desc: "Performa campaign murni dihitung berdasarkan views nyata yang divalidasi oleh sistem.",
            color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20"
          },
          {
            icon: <IconWallet size={24} />,
            title: "Transparent Earnings",
            desc: "Clipper dapat memantau CPM, gross earnings, komisi 80%, dan penarikan secara transparan.",
            color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20"
          },
          {
            icon: <IconSmartphone size={24} />,
            title: "Multi-Platform",
            desc: "Mendukung distribusi luas lintas algoritma: TikTok, YouTube Shorts, dan Instagram Reels.",
            color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20"
          }
        ].map((f, i) => (
          <div key={i} className="glass-card p-6 border border-white/[0.04] rounded-[18px] hover:border-white/10 transition-colors group">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border mb-5 ${f.bg} ${f.color} group-hover:scale-110 transition-transform`}>
              {f.icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
