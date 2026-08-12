import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReviewModal from "./ReviewModal";
import LiveCheckButton from "./LiveCheckButton";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/api/auth/signin');
  }

  const totalUsers = await prisma.user.count({ where: { role: { in: ['BRAND', 'CLIPPER'] } } });
  const totalCampaigns = await prisma.campaign.count();

  const platformFees = await prisma.transactionLedger.aggregate({
    where: { type: 'FEE' },
    _sum: { amount: true }
  });
  const totalRevenue = Math.abs(Number(platformFees._sum.amount || 0));

  const pendingSubmissions = await prisma.submission.findMany({
    where: { status: 'MANUAL_REVIEW' },
    include: {
      campaign: { include: { brand: true } },
      clipper: true
    },
    orderBy: { updated_at: 'desc' }
  });

  const allSubmissions = await prisma.submission.findMany({
    include: {
      campaign: { include: { brand: true } },
      clipper: true
    },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="space-y-10 py-2">

      {/* ── Header ────────────────────────────────── */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-amber text-xs">🛡️ Admin</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#f8fafc]">
          Pusat Komando{" "}
          <span className="text-gradient-gold">RoveClip</span>
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1">
          Pengawasan sistem global, pendapatan platform, dan audit keamanan klip.
        </p>
      </div>

      {/* ── Analytics Cards ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Revenue */}
        <div className="glass-card p-6 border border-[#f59e0b]/25 bg-gradient-to-br from-[#f59e0b]/10 to-transparent animate-fade-up-1">
          <div className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider mb-2">
            Total Pendapatan Platform
          </div>
          <div className="text-4xl font-black font-mono text-[#f8fafc]">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="text-xs text-[#d97706] mt-1.5">Komisi bersih 20% dari semua klaim</div>
        </div>

        {/* Users */}
        <div className="stat-card animate-fade-up-2">
          <div className="text-xl mb-2">👥</div>
          <div className="text-3xl font-black font-mono text-[#f8fafc]">{totalUsers}</div>
          <div className="text-xs text-[#475569] font-semibold uppercase tracking-wider mt-1">Pengguna Terdaftar</div>
          <div className="text-[10px] text-[#334155] mt-0.5">(Brand + Clipper)</div>
        </div>

        {/* Campaigns */}
        <div className="stat-card animate-fade-up-3">
          <div className="text-xl mb-2">📢</div>
          <div className="text-3xl font-black font-mono text-[#f8fafc]">{totalCampaigns}</div>
          <div className="text-xs text-[#475569] font-semibold uppercase tracking-wider mt-1">Total Kampanye</div>
          <div className="text-[10px] text-[#334155] mt-0.5">(Semua status)</div>
        </div>
      </div>

      {/* ── Pending Manual Review ─────────────────── */}
      <div className="space-y-4 animate-fade-up-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">
            <span className="dot-warning"></span>
            Antrean Review Manual
            {pendingSubmissions.length > 0 && (
              <span className="badge badge-amber ml-2">{pendingSubmissions.length} menunggu</span>
            )}
          </h2>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Clipper</th>
                  <th>Link & Catatan AI</th>
                  <th>CPM Kampanye</th>
                  <th>Status</th>
                  <th className="text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody>
                {pendingSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/20 flex items-center justify-center text-xs font-black text-[#f59e0b] shrink-0">
                          {sub.clipper.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#f8fafc] text-xs">{sub.clipper.name}</div>
                          {sub.author_name && (
                            <div className="text-[10px] text-[#475569]">
                              {sub.author_url ? (
                                <a href={sub.author_url} target="_blank" rel="noreferrer" className="text-[#34d399] hover:underline">
                                  {sub.author_name}
                                </a>
                              ) : sub.author_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[280px]">
                      <a href={sub.social_url} target="_blank" rel="noreferrer"
                        className="text-[#34d399] hover:underline font-mono text-xs block truncate">
                        {sub.social_url}
                      </a>
                      {sub.ai_notes && (
                        <div className="text-[11px] text-[#f59e0b] mt-1 font-semibold leading-tight">
                          💬 {sub.ai_notes}
                        </div>
                      )}
                      {sub.relevance_score > 0 && (
                        <div className="text-[11px] text-[#34d399] mt-0.5 font-mono font-bold">
                          🎯 Skor AI: {sub.relevance_score}/100
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="font-mono font-black text-[#f59e0b]">
                        Rp {Number(sub.campaign.cpm_rate).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-amber">Review Manual</span>
                    </td>
                    <td className="text-right">
                      <ReviewModal
                        submissionId={sub.id}
                        cpmRate={Number(sub.campaign.cpm_rate)}
                        initialUrl={sub.social_url}
                        platform={sub.platform}
                      />
                    </td>
                  </tr>
                ))}
                {pendingSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="text-3xl mb-2">✅</div>
                      <div className="text-[#94a3b8] font-semibold">Semua bersih!</div>
                      <div className="text-xs text-[#475569] mt-1">Tidak ada klaim yang perlu direview.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Global Submissions Monitor ─────────────── */}
      <div className="space-y-4">
        <h2 className="section-title">
          <span className="dot-live"></span>
          Monitor Global Semua Klip
        </h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Clipper</th>
                  <th>Brand</th>
                  <th>Video Link</th>
                  <th>Platform</th>
                  <th>Views DB</th>
                  <th className="text-center">Cek Live</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {allSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="font-bold text-[#f8fafc] text-xs">{sub.clipper.name}</td>
                    <td className="text-xs text-[#94a3b8]">{sub.campaign.brand.name}</td>
                    <td>
                      <a href={sub.social_url} target="_blank" rel="noreferrer"
                        className="text-[#34d399] hover:underline font-mono text-xs block truncate max-w-[180px]">
                        {sub.social_url}
                      </a>
                    </td>
                    <td>
                      <span className={`platform-pill ${
                        sub.platform === 'TIKTOK' ? 'platform-tiktok' :
                        sub.platform === 'YOUTUBE' ? 'platform-youtube' : 'platform-instagram'
                      }`}>
                        {sub.platform}
                      </span>
                    </td>
                    <td className="font-mono font-bold text-[#f8fafc] text-sm">
                      {sub.validated_views.toLocaleString()}
                    </td>
                    <td className="text-center">
                      <LiveCheckButton url={sub.social_url} platform={sub.platform} />
                    </td>
                    <td className="text-right">
                      <span className={`badge ${
                        sub.status === 'APPROVED'      ? 'badge-emerald' :
                        sub.status === 'MANUAL_REVIEW' ? 'badge-amber' :
                        sub.status === 'REJECTED'      ? 'badge-rose' :
                        'badge-muted'
                      }`}>
                        {sub.status === 'APPROVED'      ? 'Disetujui' :
                         sub.status === 'MANUAL_REVIEW' ? 'Review' :
                         sub.status === 'REJECTED'      ? 'Ditolak' :
                         sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {allSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#475569]">
                      Belum ada data pengajuan klip di database.
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
