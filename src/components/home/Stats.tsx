export default function Stats() {
  return (
    <section className="border-y border-white/[0.04] bg-white/[0.01] py-8">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-center sm:justify-between items-center gap-8 px-4 text-center">
        <div>
          <div className="text-2xl sm:text-3xl font-black text-white">1.000+</div>
          <div className="text-xs text-[#475569] font-medium uppercase tracking-widest mt-1">Brand Aktif</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-white">50.000+</div>
          <div className="text-xs text-[#475569] font-medium uppercase tracking-widest mt-1">Clippers</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-white">10M+</div>
          <div className="text-xs text-[#475569] font-medium uppercase tracking-widest mt-1">Verified Views</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">99.8%</div>
          <div className="text-xs text-[#475569] font-medium uppercase tracking-widest mt-1">Akurasi Audit AI</div>
        </div>
      </div>
    </section>
  );
}
