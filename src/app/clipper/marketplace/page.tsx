import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SubmitModal from "@/components/SubmitModal";
import { IconMegaphone, IconWallet, IconArrowRight, IconBolt } from "@/components/Icons";

export default async function ClipperMarketplace() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: 'ACTIVE' },
    include: {
      brand: { select: { name: true } },
      submissions: { select: { validated_views: true } }
    },
    orderBy: { cpm_rate: 'desc' }
  });

  const totalCapital = campaigns.reduce((acc, c) => acc + Number(c.total_budget), 0);

  return (
    <div className="space-y-8 py-2">

      {/* ── Header ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse inline-block"></span>
            <span className="text-xs font-semibold text-[#34d399] uppercase tracking-wider">Lowongan Aktif</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Marketplace Kampanye
          </h1>
          <p className="text-sm text-[#94a3b8] max-w-lg leading-relaxed">
            Pilih kampanye brand, distribusikan video di media sosialmu, dan dapatkan komisi 80% dari setiap 1.000 views terverifikasi.
          </p>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <div className="text-center">
            <div className="text-2xl font-black font-mono text-white">{campaigns.length}</div>
            <div className="text-[10px] text-[#475569] uppercase tracking-wider font-semibold mt-0.5">Kampanye</div>
          </div>
          <div className="w-px h-8 bg-white/[0.07]"></div>
          <div className="text-center">
            <div className="text-2xl font-black font-mono text-[#34d399]">Rp {totalCapital.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</div>
            <div className="text-[10px] text-[#475569] uppercase tracking-wider font-semibold mt-0.5">Total Budget</div>
          </div>
        </div>
      </div>

      {/* ── Cards ─────────────────────────────────── */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((c) => {
            const campaignViews = c.submissions.reduce((acc, s) => acc + s.validated_views, 0);
            const claimed = (campaignViews / 1000) * Number(c.cpm_rate);
            const pct = Math.min(100, (claimed / Number(c.total_budget)) * 100);
            const remaining = Number(c.total_budget) - claimed;
            const est100k = ((100000 / 1000) * Number(c.cpm_rate) * 0.8).toFixed(0);

            return (
              <div key={c.id} className="campaign-card flex flex-col p-5 gap-4">
                {/* Top row */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    {/* Brand avatar */}
                    <div className="w-9 h-9 rounded-xl bg-[#f97316]/12 border border-[#f97316]/20 flex items-center justify-center font-black text-[#fb923c] text-sm shrink-0">
                      {c.brand.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm leading-tight">{c.brand.name}</div>
                      <div className="text-[10px] text-[#34d399] font-semibold mt-0.5">✓ Terverifikasi</div>
                    </div>
                  </div>
                  {/* CPM */}
                  <div className="text-right">
                    <div className="font-mono font-black text-[#34d399] text-lg leading-none">
                      Rp {Number(c.cpm_rate).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-[9px] text-[#475569] font-semibold uppercase tracking-wider mt-0.5">per 1K views</div>
                  </div>
                </div>

                {/* Video URL */}
                <div className="flex items-center gap-1.5 bg-[#070b13]/60 rounded-lg px-2.5 py-2 border border-white/[0.05]">
                  <IconBolt size={11} className="text-[#475569] shrink-0" />
                  <span className="font-mono text-[10px] text-[#475569] truncate">{c.video_url}</span>
                </div>

                {/* Budget progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94a3b8]">Budget terpakai</span>
                    <span className="font-mono font-semibold text-white">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill progress-fill-emerald" style={{ width: `${Math.max(3, pct)}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#475569]">Total Rp {Number(c.total_budget).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                    <span className="text-[#34d399] font-mono">Sisa Rp {remaining.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                {/* Earning estimate */}
                <div className="flex items-center justify-between bg-[#10b981]/6 border border-[#10b981]/15 rounded-lg px-3 py-2">
                  <span className="text-xs text-[#94a3b8]">Estimasi per 100K views</span>
                  <span className="font-mono font-black text-[#34d399] text-sm">Rp {Number(est100k).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                </div>

                {/* CTA */}
                <div className="mt-auto">
                  <SubmitModal campaignId={c.id} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto">
            <IconMegaphone size={24} className="text-[#334155]" />
          </div>
          <p className="font-semibold text-[#94a3b8]">Belum ada kampanye aktif saat ini</p>
          <p className="text-xs text-[#475569]">Cek kembali nanti untuk lowongan baru dari brand.</p>
        </div>
      )}
    </div>
  );
}
