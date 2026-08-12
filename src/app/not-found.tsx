import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-emerald-400 drop-shadow-sm">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-white">Halaman Tidak Ditemukan.</h2>
        
        <p className="text-[#94a3b8] text-sm leading-relaxed">
          Campaign yang Anda cari mungkin sudah kedaluwarsa atau ditarik oleh pengiklan. Pastikan URL yang dimasukkan sudah benar.
        </p>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-block btn-emerald px-8 py-3 text-sm font-bold shadow-lg shadow-emerald-900/20"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
