import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateCampaignModal from "./CreateCampaignModal";
import DepositModal from "./DepositModal";
import { IconMegaphone, IconVideo, IconEye, IconWallet, IconArrowRight, IconLink, IconUsers } from "@/components/Icons";

export default async function BrandDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'BRAND') {
    redirect('/masuk');
  }

  const userId = (session.user as any).id;
  const userName = (session.user as any).name || "Brand";

  const campaigns = await prisma.campaign.findMany({
    where: { brand_id: userId },
    include: { submissions: { include: { clipper: true } } },
    orderBy: { created_at: 'desc' }
  });

  const allSubmissions = campaigns.flatMap(c =>
    c.submissions.map(s => ({ ...s, cpm_rate: Number(c.cpm_rate) }))
  );

  const totalDrivenViews = allSubmissions.reduce((acc, s) => acc + s.validated_views, 0);
  const activeCampaigns  = campaigns.filter(c => c.status === 'ACTIVE').length;

  const userQuery = await prisma.user.findUnique({
    where: { id: userId },
    select: { wallet_balance: true }
  });
  const currentBalance = Number(userQuery?.wallet_balance || 0);

  return (
    <div className="space-y-10 py-2">

      {/* ── Header ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-xs text-[#475569] font-medium mb-1">Dashboard Brand — {userName}</div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Kelola Kampanye</h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Pantau kinerja distribusi video dan performa clipper mitra secara real-time.
          </p>
        </div>
        <CreateCampaignModal />
      </div>

      {/* ── Metrics ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: <IconMegaphone size={17} className="text-[#a78bfa]" />,
            iconBg: "bg-[#8b5cf6]/12 border-[#8b5cf6]/18",
            value: activeCampaigns,
            label: "Kampanye Aktif",
          },
          {
            icon: <IconVideo size={17} className="text-[#94a3b8]" />,
            iconBg: "bg-white/[0.05] border-white/[0.08]",
            value: allSubmissions.length,
            label: "Total Klip",
          },
          {
            icon: <IconEye size={17} className="text-[#a78bfa]" />,
            iconBg: "bg-[#8b5cf6]/12 border-[#8b5cf6]/18",
            value: totalDrivenViews >= 1000 ? (totalDrivenViews / 1000).toFixed(1) + "K" : totalDrivenViews.toLocaleString(),
            label: "Views Dihasilkan",
          },
        ].map((m, i) => (
          <div key={i} className="stat-card">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-3 ${m.iconBg}`}>
              {m.icon}
            </div>
            <div className="text-2xl font-black font-mono text-white">{m.value}</div>
            <div className="text-[11px] text-[#475569] font-semibold mt-1">{m.label}</div>
          </div>
        ))}

        {/* Wallet card */}
        <div className="glass-card p-4 border border-[#f97316]/18">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#f97316]/12 border border-[#f97316]/20 flex items-center justify-center">
              <IconWallet size={16} className="text-[#fb923c]" />
            </div>
            <span className="text-[9px] text-[#475569] font-semibold uppercase tracking-wider">Saldo</span>
          </div>
          <div className="text-2xl font-black font-mono text-[#fb923c]">Rp {currentBalance.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</div>
          <div className="mt-3">
            <DepositModal />
          </div>
        </div>
      </div>

      {/* ── Kampanye Table ─────────────────────────── */}
      <div className="space-y-3">
        <h2 className="section-title">Kampanye Video Saya</h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Link Video</th>
                  <th>Tarif CPM</th>
                  <th>Total Budget</th>
                  <th>Status</th>
                  <th className="text-right">Jumlah Klip</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <a href={c.video_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-[#34d399] hover:underline font-mono text-xs">
                        <IconLink size={11} />
                        <span className="truncate max-w-[200px]">{c.video_url}</span>
                      </a>
                    </td>
                    <td><span className="font-mono font-black text-[#34d399]">Rp {Number(c.cpm_rate).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span></td>
                    <td><span className="font-mono font-semibold text-white">Rp {Number(c.total_budget).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span></td>
                    <td>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'badge-emerald' : 'badge-muted'}`}>
                        {c.status === 'ACTIVE' ? 'Aktif' : c.status}
                      </span>
                    </td>
                    <td className="text-right font-mono font-bold text-white">{c.submissions.length}</td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="py-12 text-center space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto">
                          <IconMegaphone size={20} className="text-[#334155]" />
                        </div>
                        <div className="text-sm text-[#475569]">Belum ada kampanye. Klik "Buat Kampanye" untuk memulai.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Clipper Performance ────────────────────── */}
      <div className="space-y-3">
        <h2 className="section-title flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse inline-block"></span>
          Monitor Performa Clipper
        </h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Clipper</th>
                  <th>Link Video</th>
                  <th>Views</th>
                  <th>Engagement</th>
                  <th>Skor AI</th>
                  <th>Status</th>
                  <th className="text-right">Biaya</th>
                </tr>
              </thead>
              <tbody>
                {allSubmissions.map((sub) => {
                  const totalEng = sub.likes + sub.comments;
                  const er = sub.validated_views > 0 ? (totalEng / sub.validated_views) * 100 : 0;
                  const cost = (sub.validated_views / 1000) * sub.cpm_rate;

                  let erBadge = "badge-muted", erLabel = "—";
                  if (sub.validated_views >= 2000) {
                    erLabel = `${er.toFixed(2)}%`;
                    erBadge = er >= 2 ? "badge-emerald" : er >= 1.5 ? "badge-amber" : "badge-rose";
                  } else if (sub.validated_views > 0) {
                    erLabel = `${er.toFixed(2)}%`;
                  }

                  return (
                    <tr key={sub.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#8b5cf6]/12 border border-[#8b5cf6]/18 flex items-center justify-center text-[11px] font-black text-[#a78bfa] shrink-0">
                            {sub.clipper.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-xs">{sub.clipper.name}</div>
                            {sub.author_name && (
                              <div className="text-[10px] text-[#475569]">{sub.author_name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <a href={sub.social_url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-[#34d399] hover:underline font-mono text-xs">
                          <IconLink size={10} />
                          <span className="truncate max-w-[150px]">{sub.social_url}</span>
                        </a>
                        <span className={`platform-pill mt-1 ${
                          sub.platform === 'TIKTOK' ? 'platform-tiktok' :
                          sub.platform === 'YOUTUBE' ? 'platform-youtube' : 'platform-instagram'
                        }`}>{sub.platform}</span>
                      </td>
                      <td className="font-mono font-bold text-white">{sub.validated_views.toLocaleString()}</td>
                      <td><span className={`badge ${erBadge}`}>{erLabel}</span></td>
                      <td className="font-mono font-bold">
                        {sub.relevance_score > 0
                          ? <span className={sub.relevance_score >= 75 ? 'text-[#34d399]' : 'text-[#f87171]'}>{sub.relevance_score}/100</span>
                          : <span className="text-[#334155]">—</span>
                        }
                      </td>
                      <td>
                        <span className={`badge ${
                          sub.status === 'APPROVED' ? 'badge-emerald' :
                          sub.status === 'MANUAL_REVIEW' ? 'badge-amber' :
                          sub.status === 'REJECTED' ? 'badge-rose' : 'badge-muted'
                        }`}>
                          {sub.status === 'APPROVED' ? 'Disetujui' :
                           sub.status === 'MANUAL_REVIEW' ? 'Review' :
                           sub.status === 'REJECTED' ? 'Ditolak' : sub.status}
                        </span>
                      </td>
                      <td className="text-right font-mono font-black text-[#34d399]">Rp {cost.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  );
                })}
                {allSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="py-12 text-center space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto">
                          <IconUsers size={20} className="text-[#334155]" />
                        </div>
                        <div className="text-sm text-[#475569]">Belum ada clipper yang submit untuk kampanye Anda.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
