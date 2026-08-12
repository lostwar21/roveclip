export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] mt-24 py-12 bg-[#070b13]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          
          <div className="col-span-2 lg:col-span-2 space-y-4 pr-4">
            <a href="/" className="inline-block">
              <img src="/logo.png" alt="RoveClip Logo" className="h-8 w-auto object-contain rounded-sm opacity-90" />
            </a>
            <p className="text-sm text-[#94a3b8] leading-relaxed max-w-xs">
              Platform distribusi konten video pendek berbasis performa untuk brand dan clipper profesional. 
              Bayar hanya untuk views yang terverifikasi AI.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Platform</h4>
            <div className="flex flex-col gap-2.5">
              <a href="/clipper/marketplace" className="text-sm text-[#94a3b8] hover:text-[#f97316] transition-colors">Campaign Marketplace</a>
              <a href="#" className="text-sm text-[#94a3b8] hover:text-[#f97316] transition-colors">Cara Kerja AI Audit</a>
              <a href="#" className="text-sm text-[#94a3b8] hover:text-[#f97316] transition-colors">Harga & Layanan</a>
              <a href="#" className="text-sm text-[#94a3b8] hover:text-[#f97316] transition-colors">Blog & Edukasi</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Untuk Pengguna</h4>
            <div className="flex flex-col gap-2.5">
              <a href="/register?role=clipper" className="text-sm text-[#94a3b8] hover:text-[#34d399] transition-colors">Gabung sebagai Clipper</a>
              <a href="/register?role=brand" className="text-sm text-[#94a3b8] hover:text-[#f97316] transition-colors">Gabung sebagai Brand</a>
              <a href="/masuk" className="text-sm text-[#94a3b8] hover:text-white transition-colors">Masuk ke Dashboard</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Bantuan & Legal</h4>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-sm text-[#94a3b8] hover:text-white transition-colors">Pusat Bantuan</a>
              <a href="#" className="text-sm text-[#94a3b8] hover:text-white transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="text-sm text-[#94a3b8] hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="#" className="text-sm text-[#94a3b8] hover:text-white transition-colors">Kontak Kami</a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#475569] text-xs font-medium">
            © {new Date().getFullYear()} RoveClip. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-[#475569]">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span> Sistem Berjalan Normal</span>
            <span>Made in Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
