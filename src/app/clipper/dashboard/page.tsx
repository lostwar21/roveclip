import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import WithdrawButton from "./WithdrawButton";
import ClaimButton from "./ClaimButton";
import SocialConnectionsCard from "./SocialConnectionsCard";
import {
  IconEye, IconWallet, IconVideo,
  IconBolt, IconArrowRight, IconLink
} from "@/components/Icons";

export default async function ClipperDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'CLIPPER') {
    redirect('/masuk');
  }

  const userId = (session.user as any).id;
  const userName = (session.user as any).name || "Clipper";

  const submissions = await prisma.submission.findMany({
    where: { clipper_id: userId },
    include: {
      campaign: { include: { brand: { select: { name: true } } } }
    },
    orderBy: { created_at: 'desc' }
  });

  const walletQuery = await prisma.user.findUnique({
    where: { id: userId },
    select: { wallet_balance: true }
  });

  const currentBalance = Number(walletQuery?.wallet_balance || 0);
  const totalViews = submissions.reduce((acc, s) => acc + s.validated_views, 0);
  const approvedCount = submissions.filter(s => s.status === 'APPROVED').length;
  const pendingCount  = submissions.filter(s => s.status === 'PENDING' || s.status === 'MANUAL_REVIEW').length;

  const statusMap: Record<string, { label: string; cls: string }> = {
    PENDING:       { label: "Menunggu Audit",  cls: "badge-amber" },
    MANUAL_REVIEW: { label: "Review Manual",   cls: "badge-amber" },
    APPROVED:      { label: "Disetujui",       cls: "badge-emerald" },
    REJECTED:      { label: "Ditolak",         cls: "badge-rose" },
  };

  const platformLabel: Record<string, string> = {
    TIKTOK: "TikTok", YOUTUBE: "YouTube", INSTAGRAM: "Instagram"
  };

  return (
    <div className="space-y-10 py-2">

      {/* ── Header ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-xs text-[#475569] font-medium mb-1">Halo, {userName}</div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Dashboard Clipper
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Pantau video klip dan penghasilanmu secara real-time.
          </p>
        </div>
        <a href="/clipper/marketplace" className="btn-emerald px-5 py-2.5 text-sm flex items-center gap-1.5">
          <IconBolt size={15} />
          Cari Job Baru
        </a>
      </div>

      {/* ── Metric Cards ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Wallet — full width on mobile */}
        <div className="col-span-2 glass-card p-5 border border-[#10b981]/20">
          <div className="flex justify-between items-start mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#10b981]/12 border border-[#10b981]/20 flex items-center justify-center">
              <IconWallet size={18} className="text-[#34d399]" />
            </div>
            <span className="text-[10px] text-[#475569] font-semibold uppercase tracking-wider">Saldo Dompet</span>
          </div>
          <div className="text-4xl font-black font-mono text-[#34d399] leading-none">
            Rp {currentBalance.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-[#475569] mt-1 mb-4">Siap dicairkan kapan saja</div>
          <WithdrawButton balance={currentBalance} />
        </div>

        {/* Views */}
        <div className="stat-card">
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center mb-3">
            <IconEye size={16} className="text-[#94a3b8]" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + "K" : totalViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#475569] font-semibold mt-1">Views Tervalidasi</div>
        </div>

        {/* Klip */}
        <div className="stat-card">
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center mb-3">
            <IconVideo size={16} className="text-[#a78bfa]" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{submissions.length}</div>
          <div className="text-[11px] text-[#475569] font-semibold mt-1">Klip Terdaftar</div>
          {(approvedCount > 0 || pendingCount > 0) && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {approvedCount > 0 && <span className="badge badge-emerald">{approvedCount} ✓</span>}
              {pendingCount  > 0 && <span className="badge badge-amber">{pendingCount} pending</span>}
            </div>
          )}
        </div>
      </div>

      {/* ── Social Connections ──────────────────────── */}
      <SocialConnectionsCard />

      {/* ── Submission Table ────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse inline-block"></span>
            Daftar Video Klipmu
          </h2>
          {submissions.length > 0 && (
            <span className="text-xs text-[#475569]">{submissions.length} video</span>
          )}
        </div>

        <div className="glass-card overflow-hidden">
          {submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>Link Video</th>
                    <th>Platform</th>
                    <th>Views</th>
                    <th>Status</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => {
                    const st = statusMap[sub.status] || { label: sub.status, cls: "badge-muted" };
                    return (
                      <tr key={sub.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#f97316]/12 border border-[#f97316]/18 flex items-center justify-center text-[11px] font-black text-[#fb923c] shrink-0">
                              {sub.campaign.brand.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-white text-xs">{sub.campaign.brand.name}</span>
                          </div>
                        </td>
                        <td>
                          <a href={sub.social_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-[#34d399] hover:text-[#10b981] font-mono text-xs hover:underline">
                            <IconLink size={11} />
                            <span className="truncate max-w-[160px]">{sub.social_url}</span>
                          </a>
                        </td>
                        <td>
                          <span className={`platform-pill ${
                            sub.platform === 'TIKTOK' ? 'platform-tiktok' :
                            sub.platform === 'YOUTUBE' ? 'platform-youtube' : 'platform-instagram'
                          }`}>
                            {platformLabel[sub.platform] || sub.platform}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono font-bold text-white text-sm">
                            {sub.validated_views.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${st.cls}`}>{st.label}</span>
                        </td>
                        <td className="text-right">
                          <ClaimButton submissionId={sub.id} status={sub.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto">
                <IconVideo size={24} className="text-[#334155]" />
              </div>
              <div className="font-semibold text-[#94a3b8]">Belum ada video yang terdaftar</div>
              <p className="text-sm text-[#475569]">
                Buka Marketplace dan ambil job pertamamu sekarang!
              </p>
              <a href="/clipper/marketplace" className="btn-emerald px-5 py-2.5 text-sm inline-flex items-center gap-1.5">
                Lihat Lowongan <IconArrowRight size={14} />
              </a>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
